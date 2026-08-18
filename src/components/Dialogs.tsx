import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, ExternalLink, FileImage, LoaderCircle, Search, Star, X } from 'lucide-react';
import { formatBytes, relativeDate, typeLabel } from '../lib/format';
import { listItems, toggleFavorite } from '../lib/api';
import type { ArchiveItem, ArchiveType } from '../types';

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
