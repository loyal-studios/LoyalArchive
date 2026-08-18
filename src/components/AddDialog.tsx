import { useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, LoaderCircle, Pencil, Trash2, Upload, X } from 'lucide-react';
import { ASSET_USES, IDEA_STATUSES, PROMPT_STATUSES, SECTIONS, SECTION_MAP, TRY_STATUSES } from '../config';
import { formatBytes } from '../lib/format';
import { saveAssetBatch, saveItem, type AssetBatchEntry } from '../lib/api';
import type { ArchiveItem, ArchiveType } from '../types';

const MAX_ASSET_FILES = 20;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ASSET_STYLES = ['Vintage', 'Bootleg', 'Airbrush', 'Y2K', 'Punk / Grunge', 'Luxury / Editorial', 'Sports', 'Workwear', 'Gothic', 'Minimal', 'Lainnya'];

interface AssetMetadata {
  title: string;
  category: string;
  tags: string;
  style: string;
  uses: string[];
  sourceUrl: string;
  summary: string;
}

interface PendingAsset {
  id: string;
  file: File;
  previewUrl: string;
  custom: AssetMetadata | null;
}

interface SaveOptions {
  close?: boolean;
  message?: string;
}

const parseTags = (value: string) => value.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean);
const fileStem = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'Referensi tanpa nama';
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

function isSupportedImage(file: File) {
  const type = file.type.toLowerCase();
  return /^image\/(jpeg|jpg|png|webp|gif|heic|heif|avif)$/.test(type)
    || (!type && /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name));
}

function AssetMetadataEditor({
  asset,
  categories,
  onChange,
  onToggleUse,
  onUseShared,
}: {
  asset: PendingAsset;
  categories: string[];
  onChange: (field: keyof AssetMetadata, value: string) => void;
  onToggleUse: (value: string) => void;
  onUseShared: () => void;
}) {
  const metadata = asset.custom;
  if (!metadata) return null;

  return <div className="asset-metadata-editor">
    <div className="asset-editor-heading">
      <div><strong>Metadata khusus gambar ini</strong><span>Menggantikan metadata umum hanya untuk file ini.</span></div>
      <button type="button" onClick={onUseShared}>Gunakan metadata umum</button>
    </div>
    <div className="asset-editor-grid">
      <label className="field"><span>Judul</span><input value={metadata.title} onChange={(event) => onChange('title', event.target.value)} /></label>
      <label className="field"><span>Kategori *</span><select required value={metadata.category} onChange={(event) => onChange('category', event.target.value)}>{categories.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label className="field"><span>Tag * <small>pisahkan dengan koma</small></span><input required value={metadata.tags} onChange={(event) => onChange('tags', event.target.value)} /></label>
      <label className="field"><span>Style *</span><select required value={metadata.style} onChange={(event) => onChange('style', event.target.value)}>{ASSET_STYLES.map((option) => <option key={option}>{option}</option>)}</select></label>
      <fieldset className="field full"><legend>Kegunaan *</legend><div className="chip-picker">{ASSET_USES.map((value) => <button type="button" key={value} className={metadata.uses.includes(value) ? 'active' : ''} onClick={() => onToggleUse(value)}>{metadata.uses.includes(value) && <Check size={13}/>} {value}</button>)}</div></fieldset>
      <label className="field full"><span>Link sumber <small>opsional</small></span><input type="url" value={metadata.sourceUrl} onChange={(event) => onChange('sourceUrl', event.target.value)} placeholder="https://..." /></label>
      <label className="field full"><span>Yang Gue Suka / kegunaan *</span><textarea required rows={3} value={metadata.summary} onChange={(event) => onChange('summary', event.target.value)} /></label>
    </div>
  </div>;
}

export function AddDialog({
  initialType,
  onClose,
  onSaved,
}: {
  initialType?: ArchiveType;
  onClose: () => void;
  onSaved: (items: ArchiveItem[], options?: SaveOptions) => void;
}) {
  const [type, setType] = useState<ArchiveType>(initialType || 'ide');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
  const [sourceUrl, setSourceUrl] = useState('');
  const [uses, setUses] = useState<string[]>([]);
  const [style, setStyle] = useState('Vintage');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('ChatGPT');
  const [noteType, setNoteType] = useState('Cara / How-To');
  const [usedFor, setUsedFor] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [assets, setAssets] = useState<PendingAsset[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, fileName: '' });
  const [error, setError] = useState('');
  const assetsRef = useRef<PendingAsset[]>([]);
  const section = SECTION_MAP[type];

  useEffect(() => {
    setCategory(section.categories[0]);
    setStatus(type === 'ide' ? 'Masuk' : type === 'prompt' ? 'Draft' : type === 'percobaan' ? 'Belum Dicoba' : '');
  }, [type, section]);
  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => () => { assetsRef.current.forEach((asset) => URL.revokeObjectURL(asset.previewUrl)); }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  function sharedAssetMetadata(): AssetMetadata {
    return { title: '', category, tags, style, uses: [...uses], sourceUrl, summary };
  }

  function changeType(next: ArchiveType) {
    if (type === 'asset' && next !== 'asset') {
      assets.forEach((asset) => URL.revokeObjectURL(asset.previewUrl));
      setAssets([]);
    }
    setError('');
    setType(next);
  }

  function pickFiles(selected: File[]) {
    setError('');
    if (!selected.length) return;
    const existing = new Set(assets.map((asset) => fileKey(asset.file)));
    const accepted: PendingAsset[] = [];
    const issues: string[] = [];
    let available = Math.max(0, MAX_ASSET_FILES - assets.length);

    for (const file of selected) {
      if (available < 1) { issues.push(`Maksimal ${MAX_ASSET_FILES} gambar per batch.`); break; }
      if (existing.has(fileKey(file))) { issues.push(`${file.name} sudah dipilih.`); continue; }
      if (!isSupportedImage(file)) { issues.push(`${file.name} bukan format gambar yang didukung.`); continue; }
      if (file.size > MAX_UPLOAD_BYTES) { issues.push(`${file.name} lebih besar dari 25 MB.`); continue; }
      accepted.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file), custom: null });
      existing.add(fileKey(file));
      available -= 1;
    }

    if (accepted.length) setAssets((current) => [...current, ...accepted]);
    if (issues.length) setError(issues.slice(0, 4).join(' '));
  }

  function removeAsset(id: string) {
    setAssets((current) => {
      const removed = current.find((asset) => asset.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((asset) => asset.id !== id);
    });
  }

  function toggleCustomMetadata(id: string) {
    setAssets((current) => current.map((asset) => asset.id === id
      ? { ...asset, custom: asset.custom ? null : { ...sharedAssetMetadata(), title: fileStem(asset.file.name) } }
      : asset));
  }

  function updateCustomMetadata(id: string, field: keyof AssetMetadata, value: string) {
    setAssets((current) => current.map((asset) => asset.id === id && asset.custom
      ? { ...asset, custom: { ...asset.custom, [field]: value } }
      : asset));
  }

  function toggleCustomUse(id: string, value: string) {
    setAssets((current) => current.map((asset) => {
      if (asset.id !== id || !asset.custom) return asset;
      const nextUses = asset.custom.uses.includes(value) ? asset.custom.uses.filter((entry) => entry !== value) : [...asset.custom.uses, value];
      return { ...asset, custom: { ...asset.custom, uses: nextUses } };
    }));
  }

  async function submitAssets() {
    if (!assets.length) { setError('Pilih minimal satu gambar.'); return; }
    const batchId = crypto.randomUUID();
    const entries: AssetBatchEntry[] = [];
    const invalid: string[] = [];

    assets.forEach((asset, index) => {
      const metadata = asset.custom || sharedAssetMetadata();
      const tagList = parseTags(metadata.tags);
      if (!metadata.category || !tagList.length || !metadata.style || !metadata.uses.length || !metadata.summary.trim()) {
        invalid.push(asset.file.name);
        return;
      }
      const defaultTitle = title.trim()
        ? assets.length > 1 ? `${title.trim()} ${String(index + 1).padStart(2, '0')}` : title.trim()
        : fileStem(asset.file.name);
      entries.push({
        clientId: asset.id,
        image: asset.file,
        item: {
          type: 'asset',
          title: metadata.title.trim() || defaultTitle,
          category: metadata.category,
          tags: tagList,
          style: metadata.style,
          uses: metadata.uses,
          sourceUrl: metadata.sourceUrl.trim(),
          summary: metadata.summary.trim(),
          data: { batchUpload: { id: batchId, index: index + 1, total: assets.length, originalFileName: asset.file.name } },
        },
      });
    });

    if (invalid.length) {
      setError(`Lengkapi kategori, tag, style, kegunaan, dan catatan untuk: ${invalid.slice(0, 4).join(', ')}${invalid.length > 4 ? '…' : ''}`);
      return;
    }

    setSaving(true);
    setProgress({ completed: 0, total: entries.length, fileName: '' });
    const result = await saveAssetBatch(entries, (completed, total, fileName) => setProgress({ completed, total, fileName }));
    const failedIds = new Set(result.failed.map((failure) => failure.clientId));

    if (result.failed.length) {
      setAssets((current) => current.filter((asset) => {
        if (failedIds.has(asset.id)) return true;
        URL.revokeObjectURL(asset.previewUrl);
        return false;
      }));
      if (result.saved.length) onSaved(result.saved, { close: false, message: `${result.saved.length} referensi tersimpan; ${result.failed.length} perlu dicoba lagi.` });
      setError(`${result.failed.length} gambar gagal: ${result.failed.slice(0, 3).map((failure) => `${failure.fileName} — ${failure.message}`).join(' · ')}`);
      setSaving(false);
      return;
    }

    onSaved(result.saved, { message: `${result.saved.length} referensi berhasil disimpan.` });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (type === 'asset') { await submitAssets(); return; }

    const tagList = parseTags(tags);
    const resolvedUses = type === 'link' ? usedFor.split(',').map((value) => value.trim()).filter(Boolean) : uses;
    if (type !== 'link' && tagList.length < 1) { setError('Tambahkan minimal satu tag.'); return; }
    if (type === 'prompt' && !content.trim()) { setError('Prompt siap salin wajib diisi.'); return; }
    if (type === 'link' && resolvedUses.length < 1) { setError('Dipakai untuk wajib diisi.'); return; }
    setSaving(true);
    try {
      const item = await saveItem({
        type, title, category, tags: tagList, summary, status,
        priority: type === 'ide' ? priority : undefined,
        sourceUrl, uses: resolvedUses,
        content: type === 'prompt' || type === 'catatan' ? content : undefined,
        platform: type === 'prompt' ? platform : undefined,
        data: type === 'catatan' ? { noteType } : type === 'ditinggalkan' ? { canRetry } : undefined,
      });
      onSaved([item]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Item gagal disimpan.'); }
    finally { setSaving(false); }
  }

  const statuses = type === 'ide' ? IDEA_STATUSES : type === 'prompt' ? PROMPT_STATUSES : type === 'percobaan' ? TRY_STATUSES : [];
  const titleLabel = type === 'bagaimana' ? 'Pertanyaan' : type === 'percobaan' ? 'Yang mau dicoba' : type === 'ditinggalkan' ? 'Nama / ide' : type === 'prompt' ? 'Nama prompt' : type === 'catatan' ? 'Judul catatan' : type === 'link' ? 'Nama link' : type === 'asset' ? 'Judul dasar (opsional)' : section.singular;
  const assetButtonLabel = saving
    ? `Menyimpan ${progress.completed}/${progress.total}`
    : `Simpan ${assets.length} Referensi`;

  return <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <div className="add-dialog" role="dialog" aria-modal="true" aria-labelledby="add-title">
      <header className="dialog-header"><div><div className="eyebrow">TAMBAH KE LOYAL ARCHIVE</div><h2 id="add-title">Sekali input, langsung rapi.</h2></div><button className="icon-button" disabled={saving} onClick={onClose}><X/></button></header>
      <div className="type-picker">{SECTIONS.map(({ type: option, shortLabel, icon: Icon }) => <button disabled={saving} type="button" className={type === option ? 'active' : ''} key={option} onClick={() => changeType(option)}><Icon size={18}/><span>{shortLabel}</span></button>)}</div>
      <form onSubmit={submit} onPaste={(event) => {
        if (type !== 'asset') return;
        const images = [...event.clipboardData.files].filter(isSupportedImage);
        if (images.length) { event.preventDefault(); pickFiles(images); }
      }}>
        {type === 'asset' && <>
          <label htmlFor="asset-image-input" className={`upload-zone bulk-upload-zone ${assets.length ? 'has-files' : ''}`}>
            <input id="asset-image-input" disabled={saving} type="file" accept="image/*" multiple onChange={(event) => {
              pickFiles(Array.from(event.currentTarget.files || []));
              event.currentTarget.value = '';
            }} />
            <ImagePlus size={28}/>
            <strong>{assets.length ? 'Tambah gambar lagi' : 'Pilih beberapa gambar sekaligus'}</strong>
            <span>Photos atau Files · original full resolution · satu gambar = satu record</span>
            <small>JPG, PNG, WEBP, GIF, HEIC, AVIF · maksimal 25 MB/file · maksimal {MAX_ASSET_FILES} file</small>
          </label>
          {assets.length > 0 && <section className="asset-preview-section">
            <header><div><strong>{assets.length} gambar dipilih</strong><span>Metadata umum berlaku ke semua gambar kecuali yang disesuaikan.</span></div><span>{formatBytes(assets.reduce((total, asset) => total + asset.file.size, 0))} total</span></header>
            <div className="asset-preview-grid">{assets.map((asset, index) => <article className={`asset-preview-card ${asset.custom ? 'is-editing' : ''}`} key={asset.id}>
              <div className="asset-preview-image">
                <img src={asset.previewUrl} alt={`Preview ${asset.file.name}`} />
                <span>{index + 1}</span>
                <button disabled={saving} type="button" aria-label={`Hapus ${asset.file.name}`} onClick={() => removeAsset(asset.id)}><Trash2 size={15}/></button>
              </div>
              <div className="asset-preview-info"><strong>{asset.file.name}</strong><span>{formatBytes(asset.file.size)}{asset.custom ? ' · metadata khusus' : ' · metadata umum'}</span></div>
              <button disabled={saving} type="button" className="asset-edit-toggle" onClick={() => toggleCustomMetadata(asset.id)}><Pencil size={13}/>{asset.custom ? 'Tutup metadata khusus' : 'Edit metadata gambar'}</button>
              <AssetMetadataEditor
                asset={asset}
                categories={section.categories}
                onChange={(field, value) => updateCustomMetadata(asset.id, field, value)}
                onToggleUse={(value) => toggleCustomUse(asset.id, value)}
                onUseShared={() => toggleCustomMetadata(asset.id)}
              />
            </article>)}</div>
          </section>}
          <div className="shared-metadata-heading"><span className="eyebrow">METADATA UMUM</span><strong>Diterapkan ke semua gambar</strong></div>
        </>}
        <div className="form-grid">
          <label className="field full"><span>{titleLabel}{type !== 'asset' && ' *'} {type === 'asset' && <small>kosong = nama file; judul dasar akan diberi nomor otomatis</small>}</span><input autoFocus={type !== 'asset'} required={type !== 'asset'} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === 'bagaimana' ? 'Bagaimana kalau...' : type === 'asset' ? 'Contoh: Referensi Jersey Vintage' : 'Tulis dengan jelas...'} /></label>
          <label className="field"><span>Kategori *</span><select required value={category} onChange={(event) => setCategory(event.target.value)}>{section.categories.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="field"><span>Tag {type !== 'link' && '*'} <small>{type === 'link' ? 'opsional' : 'pisahkan dengan koma'}</small></span><input required={type !== 'link'} value={tags} onChange={(event) => setTags(event.target.value)} placeholder={type === 'link' ? 'opsional' : 'vintage, sports, gothic'} /></label>
          {type === 'asset' && <label className="field"><span>Style *</span><select required value={style} onChange={(event) => setStyle(event.target.value)}>{ASSET_STYLES.map((option) => <option key={option}>{option}</option>)}</select></label>}
          {type === 'ide' && <fieldset className="field full"><legend>Prioritas *</legend><div className="segmented">{(['Tinggi', 'Sedang', 'Rendah'] as const).map((value) => <button type="button" key={value} className={priority === value ? 'active' : ''} onClick={() => setPriority(value)}>{value}</button>)}</div></fieldset>}
          {statuses.length > 0 && <label className="field"><span>Status *</span><select required value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((option) => <option key={option}>{option}</option>)}</select></label>}
          {type === 'prompt' && <label className="field"><span>Dipakai di *</span><select required value={platform} onChange={(event) => setPlatform(event.target.value)}>{['ChatGPT', 'Gemini', 'Midjourney', 'Photoshop AI', 'Lainnya'].map((option) => <option key={option}>{option}</option>)}</select></label>}
          {type === 'catatan' && <label className="field"><span>Bentuk catatan *</span><select required value={noteType} onChange={(event) => setNoteType(event.target.value)}>{['Cara / How-To', 'Setting', 'Tips', 'Checklist', 'Pelajaran', 'Rumus / Formula', 'Catatan Singkat'].map((option) => <option key={option}>{option}</option>)}</select></label>}
          {type === 'asset' && <fieldset className="field full"><legend>Kegunaan *</legend><div className="chip-picker">{ASSET_USES.map((value) => <button type="button" key={value} className={uses.includes(value) ? 'active' : ''} onClick={() => setUses((current) => current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value])}>{uses.includes(value) && <Check size={13}/>} {value}</button>)}</div></fieldset>}
          {(type === 'asset' || type === 'link') && <label className="field full"><span>{type === 'asset' ? 'Link sumber' : 'URL'} {type === 'asset' ? '(opsional)' : '*'}</span><input type="url" required={type === 'link'} value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://..." /></label>}
          {type === 'link' && <label className="field full"><span>Dipakai untuk * <small>pisahkan dengan koma</small></span><input required value={usedFor} onChange={(event) => setUsedFor(event.target.value)} placeholder="inspirasi, asset, produksi" /></label>}
          {type === 'prompt' && <label className="field full"><span>Prompt siap salin *</span><textarea required value={content} onChange={(event) => setContent(event.target.value)} rows={7} placeholder="Tempel prompt lengkap di sini..." /></label>}
          {type === 'catatan' && <label className="field full"><span>Isi catatan lengkap</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={7} placeholder="Langkah, setting, checklist, atau pengetahuan lengkap..." /></label>}
          <label className="field full"><span>{type === 'asset' ? 'Yang Gue Suka / kegunaan *' : type === 'ditinggalkan' ? 'Kenapa ditinggalkan *' : 'Catatan / ringkasan'}</span><textarea required={type === 'asset' || type === 'ditinggalkan'} value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} placeholder="Tulis secukupnya supaya nanti masih paham alasan menyimpannya..." /></label>
          {type === 'ditinggalkan' && <label className="check-row full"><input type="checkbox" checked={canRetry} onChange={(event) => setCanRetry(event.target.checked)} /><span className="fake-check"><Check size={13}/></span><span>Bisa dicoba lagi suatu hari</span></label>}
        </div>
        {saving && type === 'asset' && <div className="batch-progress" aria-live="polite"><span><i style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }}/></span><strong>{progress.completed}/{progress.total} diproses</strong><small>{progress.fileName}</small></div>}
        {error && <p className="form-error">{error}</p>}
        <footer className="dialog-footer"><button className="button" type="button" disabled={saving} onClick={onClose}>Batal</button><button className="button primary" disabled={saving || (type === 'asset' && assets.length === 0)}>{saving ? <LoaderCircle className="spin" size={18}/> : <Upload size={17}/>} {type === 'asset' ? assetButtonLabel : `Simpan ${section.singular}`}</button></footer>
      </form>
    </div>
  </div>;
}
