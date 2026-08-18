import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileImage,
  Heart,
  ImagePlus,
  LoaderCircle,
  Search,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { ASSET_USES, IDEA_STATUSES, PROMPT_STATUSES, SECTIONS, SECTION_MAP, TRY_STATUSES } from '../config';
import { formatBytes, relativeDate, typeLabel } from '../lib/format';
import { listItems, saveItem, toggleFavorite } from '../lib/api';
import type { ArchiveItem, ArchiveType } from '../types';

export function AddDialog({ initialType, onClose, onSaved }: { initialType?: ArchiveType; onClose: () => void; onSaved: (item: ArchiveItem) => void }) {
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const section = SECTION_MAP[type];

  useEffect(() => { setCategory(section.categories[0]); setStatus(type === 'ide' ? 'Masuk' : type === 'prompt' ? 'Draft' : type === 'percobaan' ? 'Belum Dicoba' : ''); }, [type, section]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function pickFile(next: File | null) {
    setError('');
    if (!next) return;
    if (!next.type.startsWith('image/')) { setError('File harus berupa gambar.'); return; }
    if (next.size > 25 * 1024 * 1024) { setError('Ukuran maksimal upload web saat ini 25 MB.'); return; }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const tagList = tags.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean);
    const resolvedUses = type === 'link' ? usedFor.split(',').map((value) => value.trim()).filter(Boolean) : uses;
    if (type !== 'link' && tagList.length < 1) { setError('Tambahkan minimal satu tag.'); return; }
    if (type === 'asset' && !file) { setError('Gambar wajib dipilih.'); return; }
    if (type === 'asset' && resolvedUses.length < 1) { setError('Pilih minimal satu kegunaan.'); return; }
    if (type === 'prompt' && !content.trim()) { setError('Prompt siap salin wajib diisi.'); return; }
    if (type === 'link' && resolvedUses.length < 1) { setError('Dipakai untuk wajib diisi.'); return; }
    setSaving(true);
    try {
      const item = await saveItem({
        type, title, category, tags: tagList, summary, status,
        priority: type === 'ide' ? priority : undefined,
        sourceUrl, uses: resolvedUses,
        style: type === 'asset' ? style : undefined,
        content: type === 'prompt' || type === 'catatan' ? content : undefined,
        platform: type === 'prompt' ? platform : undefined,
        data: type === 'catatan' ? { noteType } : type === 'ditinggalkan' ? { canRetry } : undefined,
      }, file || undefined);
      onSaved(item);
    } catch (err) { setError(err instanceof Error ? err.message : 'Item gagal disimpan.'); }
    finally { setSaving(false); }
  }

  const statuses = type === 'ide' ? IDEA_STATUSES : type === 'prompt' ? PROMPT_STATUSES : type === 'percobaan' ? TRY_STATUSES : [];
  const titleLabel = type === 'bagaimana' ? 'Pertanyaan' : type === 'percobaan' ? 'Yang mau dicoba' : type === 'ditinggalkan' ? 'Nama / ide' : type === 'prompt' ? 'Nama prompt' : type === 'catatan' ? 'Judul catatan' : type === 'link' ? 'Nama link' : type === 'asset' ? 'Nama referensi (opsional)' : section.singular;

  return <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="add-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="add-title">
      <header className="dialog-header"><div><div className="eyebrow">TAMBAH KE LOYAL ARCHIVE</div><h2 id="add-title">Sekali input, langsung rapi.</h2></div><button className="icon-button" onClick={onClose}><X/></button></header>
      <div className="type-picker">{SECTIONS.map(({ type: option, shortLabel, icon: Icon }) => <button type="button" className={type === option ? 'active' : ''} key={option} onClick={() => setType(option)}><Icon size={18}/><span>{shortLabel}</span></button>)}</div>
      <form onSubmit={submit} onPaste={(event) => { const image = [...event.clipboardData.files].find((entry) => entry.type.startsWith('image/')); if (image) { event.preventDefault(); pickFile(image); } }}>
        {type === 'asset' && <label className={`upload-zone ${preview ? 'has-preview' : ''}`}>
          <input type="file" accept="image/*" onChange={(event) => pickFile(event.target.files?.[0] || null)} />
          {preview ? <><img src={preview} alt="Preview upload"/><button type="button" className="remove-preview" onClick={(event) => { event.preventDefault(); setFile(null); setPreview(''); }}><X size={16}/></button></> : <><ImagePlus size={28}/><strong>Upload atau paste gambar</strong><span>Original tetap full resolution · thumbnail otomatis</span><small>JPG, PNG, WEBP · maksimal 25 MB</small></>}
        </label>}
        <div className="form-grid">
          <label className="field full"><span>{titleLabel}{type !== 'asset' && ' *'}</span><input autoFocus={type !== 'asset'} required={type !== 'asset'} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={type === 'bagaimana' ? 'Bagaimana kalau...' : 'Tulis dengan jelas...'} /></label>
          <label className="field"><span>Kategori *</span><select required value={category} onChange={(event) => setCategory(event.target.value)}>{section.categories.map((option) => <option key={option}>{option}</option>)}</select></label>
          <label className="field"><span>Tag {type !== 'link' && '*'} <small>{type === 'link' ? 'opsional' : 'pisahkan dengan koma'}</small></span><input required={type !== 'link'} value={tags} onChange={(event) => setTags(event.target.value)} placeholder={type === 'link' ? 'opsional' : 'vintage, sports, gothic'} /></label>
          {type === 'asset' && <label className="field"><span>Style *</span><select required value={style} onChange={(event) => setStyle(event.target.value)}>{['Vintage', 'Bootleg', 'Airbrush', 'Y2K', 'Punk / Grunge', 'Luxury / Editorial', 'Sports', 'Workwear', 'Gothic', 'Minimal', 'Lainnya'].map((option) => <option key={option}>{option}</option>)}</select></label>}
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
        {error && <p className="form-error">{error}</p>}
        <footer className="dialog-footer"><button className="button" type="button" onClick={onClose}>Batal</button><button className="button primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={18}/> : <><Upload size={17}/>Simpan {section.singular}</>}</button></footer>
      </form>
    </div>
  </div>;
}

export function DetailDrawer({ item: initialItem, onClose, onChanged, notify }: { item: ArchiveItem; onClose: () => void; onChanged: (item: ArchiveItem) => void; notify: (message: string) => void }) {
  const [item, setItem] = useState(initialItem);
  const attachment = item.attachments[0];
  async function favorite() {
    const next = await toggleFavorite(item.id, !item.favorite);
    setItem(next); onChanged(next);
  }
  return <div className="drawer-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className={`detail-drawer ${item.type === 'asset' ? 'asset-detail' : ''}`}>
      <header className="drawer-top"><button className="back-button" onClick={onClose}><ArrowLeft size={18}/>Kembali</button><div><button className={item.favorite ? 'active' : ''} onClick={favorite}><Star size={19} fill={item.favorite ? 'currentColor' : 'none'}/></button><button onClick={onClose}><X size={21}/></button></div></header>
      {item.type === 'asset' && <div className="detail-preview"><img src={attachment?.thumbnailUrl} alt={item.title}/><button className="preview-nav prev"><ChevronLeft/></button><button className="preview-nav next"><ChevronRight/></button></div>}
      <div className="drawer-content">
        <span className="type-badge">{typeLabel(item.type)}</span>
        <h2>{item.title || 'Tanpa nama'}</h2>
        <p className="detail-summary">{item.summary}</p>
        <dl className="detail-list">
          <div><dt>Kategori</dt><dd>{item.category}</dd></div>
          {item.style && <div><dt>Style</dt><dd>{item.style}</dd></div>}
          {item.priority && <div><dt>Prioritas</dt><dd>{item.priority}</dd></div>}
          {item.status && <div><dt>Status</dt><dd>{item.status}</dd></div>}
          {item.platform && <div><dt>Dipakai di</dt><dd>{item.platform}</dd></div>}
          <div><dt>Ditambahkan</dt><dd>{relativeDate(item.createdAt)}</dd></div>
        </dl>
        <section className="detail-section"><h3>Tag</h3><div className="detail-tags">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></section>
        {item.uses?.length ? <section className="detail-section"><h3>Kegunaan</h3><div className="detail-tags">{item.uses.map((use) => <span key={use}>{use}</span>)}</div></section> : null}
        {item.type === 'prompt' && <section className="prompt-full"><div className="eyebrow">PROMPT SIAP SALIN</div><p>{item.content}</p><button className="button inverted" onClick={() => { navigator.clipboard.writeText(item.content || ''); notify('Prompt disalin.'); }}><Copy size={17}/>Salin Prompt</button></section>}
        {attachment && <section className="file-info"><div><FileImage/><span><strong>File asli</strong><small>{attachment.mimeType.replace('image/', '').toUpperCase()} · {attachment.width} × {attachment.height} · {formatBytes(attachment.size)}</small></span></div>{attachment.originalUrl && <a className="button inverted" href={attachment.originalUrl} target="_blank" rel="noreferrer"><ExternalLink size={17}/>Buka File Asli</a>}</section>}
        {item.sourceUrl && <section className="detail-section"><h3>Sumber</h3><a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceUrl}<ExternalLink size={15}/></a></section>}
      </div>
    </aside>
  </div>;
}

export function SearchDialog({ onClose, onOpen }: { onClose: () => void; onOpen: (item: ArchiveItem) => void }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!query.trim()) { setItems([]); return; }
    setLoading(true);
    const timer = window.setTimeout(() => listItems({ page: 1, pageSize: 20, query, sort: 'terbaru' }).then((result) => setItems(result.items)).finally(() => setLoading(false)), 240);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const grouped = items.reduce<Record<string, ArchiveItem[]>>((result, item) => { (result[item.type] ||= []).push(item); return result; }, {});
  return <div className="search-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="search-dialog">
    <label className="command-input"><Search/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ide, tag, prompt, asset, catatan..."/><kbd>ESC</kbd></label>
    <div className="search-results">{!query ? <div className="search-hint"><Search/><h3>Pencarian Universal</h3><p>Coba “airbrush”, “vintage racing”, atau “halftone”.</p></div> : loading ? <div className="page-loader"><LoaderCircle className="spin"/></div> : items.length === 0 ? <div className="search-hint"><p>Tidak ada hasil untuk “{query}”.</p></div> : Object.entries(grouped).map(([type, entries]) => <section key={type}><header><strong>{typeLabel(type as ArchiveType)}</strong><span>{entries.length} hasil</span></header>{entries.map((item) => <button key={item.id} onClick={() => { onOpen(item); onClose(); }}><span className="result-icon">{item.attachments[0]?.thumbnailUrl ? <img src={item.attachments[0].thumbnailUrl} alt=""/> : typeLabel(item.type).charAt(0)}</span><span><strong>{item.title}</strong><small>{item.category} · {item.tags.slice(0, 3).join(' · ')}</small></span><ChevronRight/></button>)}</section>)}</div>
    <footer className="search-footer"><span>↑↓ navigasi</span><span>↵ buka</span><span>Semua hasil dicari di server</span></footer>
  </div></div>;
}
