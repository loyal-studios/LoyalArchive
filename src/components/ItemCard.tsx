import { Copy, ExternalLink, FileText, MoreHorizontal, Star } from 'lucide-react';
import type { ArchiveItem } from '../types';
import { relativeDate, typeLabel } from '../lib/format';

interface Props {
  item: ArchiveItem;
  variant?: 'default' | 'compact';
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onFavorite: () => void;
  onCopied?: () => void;
}

export function ItemCard({ item, variant = 'default', selectable, selected, onSelect, onOpen, onFavorite, onCopied }: Props) {
  const image = item.attachments[0]?.thumbnailUrl;
  if (variant === 'compact') return <button className="compact-item" onClick={onOpen}>
    <span className="type-badge">{typeLabel(item.type)}</span>
    <strong>{item.title}</strong>
    <span>{relativeDate(item.updatedAt)}</span>
  </button>;

  if (item.type === 'asset') return <article className={`asset-card ${selected ? 'selected' : ''}`}>
    <button className="asset-image" onClick={selectable ? onSelect : onOpen} aria-label={`Buka ${item.title}`}>
      {image ? <img src={image} alt={item.title} loading="lazy" /> : <div className="image-placeholder"><FileText/></div>}
      {selectable && <span className="select-check">{selected ? '✓' : ''}</span>}
      <span className="asset-overlay"><strong>{item.title}</strong><small>{item.category}</small></span>
    </button>
    <button className={`floating-favorite ${item.favorite ? 'active' : ''}`} onClick={onFavorite} aria-label="Favorit"><Star size={17} fill={item.favorite ? 'currentColor' : 'none'}/></button>
  </article>;

  return <article className={`item-card item-${item.type}`} onClick={onOpen}>
    <header>
      <span className="type-badge">{typeLabel(item.type)}</span>
      <div className="card-actions">
        <button className={item.favorite ? 'active' : ''} onClick={(event) => { event.stopPropagation(); onFavorite(); }} aria-label="Favorit"><Star size={17} fill={item.favorite ? 'currentColor' : 'none'}/></button>
        <button aria-label="Menu"><MoreHorizontal size={18}/></button>
      </div>
    </header>
    <h3>{item.title}</h3>
    {item.type === 'prompt' && <blockquote>“{item.content}”</blockquote>}
    {item.summary && item.type !== 'prompt' && <p>{item.summary}</p>}
    <div className="tag-row">{item.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <footer>
      <div><span>{item.category}</span>{item.status && <span>· {item.status}</span>}{item.priority && <span>· {item.priority}</span>}</div>
      {item.type === 'prompt' ? <button className="card-utility" onClick={(event) => { event.stopPropagation(); navigator.clipboard.writeText(item.content || ''); onCopied?.(); }}><Copy size={15}/>Salin Prompt</button> : item.type === 'link' ? <button className="card-utility" onClick={(event) => { event.stopPropagation(); window.open(item.sourceUrl, '_blank', 'noopener'); }}><ExternalLink size={15}/>Buka</button> : <time>{relativeDate(item.updatedAt)}</time>}
    </footer>
  </article>;
}
