import { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Filter, Grid3X3, LoaderCircle, Search, SlidersHorizontal, Square, X } from 'lucide-react';
import { SECTION_MAP } from '../config';
import { listItems, toggleFavorite } from '../lib/api';
import type { ArchiveItem, ArchiveType, PageResult } from '../types';
import { ItemCard } from './ItemCard';
import { Pagination } from './Pagination';

interface Props {
  type: ArchiveType | 'favorit';
  onOpen: (item: ArchiveItem) => void;
  onAdd: (type?: ArchiveType) => void;
  notify: (message: string) => void;
  refreshKey: number;
}

export function Library({ type, onOpen, onAdd, notify, refreshKey }: Props) {
  const isFavorite = type === 'favorit';
  const section = isFavorite ? null : SECTION_MAP[type];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(type === 'asset' ? 12 : 12);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'terbaru' | 'terlama' | 'az'>('terbaru');
  const [result, setResult] = useState<PageResult<ArchiveItem> | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [moodboard, setMoodboard] = useState<ArchiveItem[] | null>(null);

  useEffect(() => { setPage(1); setCategory(''); setQuery(''); setSelected([]); setSelectMode(false); }, [type]);
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      listItems({ type, page, pageSize, query, category, sort }).then((value) => { if (alive) setResult(value); });
    }, query ? 220 : 0);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [type, page, pageSize, query, category, sort, refreshKey]);

  const selectedItems = useMemo(() => result?.items.filter((item) => selected.includes(item.id)) || [], [result, selected]);

  async function favorite(item: ArchiveItem) {
    await toggleFavorite(item.id, !item.favorite);
    setResult((current) => current ? { ...current, items: current.items.map((entry) => entry.id === item.id ? { ...entry, favorite: !entry.favorite } : entry) } : current);
    notify(item.favorite ? 'Dihapus dari Favorit.' : 'Ditambahkan ke Favorit.');
  }

  const title = isFavorite ? 'Favorit' : section!.label;
  const description = isFavorite ? 'Pilihan terbaik dari seluruh Loyal Archive.' : section!.description;
  const isAsset = type === 'asset';

  return <main className="page library-page">
    <header className="page-heading">
      <div><div className="eyebrow">LOYAL ARCHIVE / {title.toUpperCase()}</div><h1>{title}</h1><p>{description}</p></div>
      {!isFavorite && <button className="button primary" onClick={() => onAdd(type)}><span>＋</span>Tambah {section!.singular}</button>}
    </header>
    <section className="library-toolbar">
      <label className="library-search"><Search size={18}/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Cari ${title.toLowerCase()}...`} />{query && <button onClick={() => setQuery('')}><X size={16}/></button>}</label>
      {!isFavorite && <label className="select-control"><Filter size={16}/><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">Semua kategori</option>{section!.categories.map((option) => <option key={option}>{option}</option>)}</select></label>}
      <label className="select-control"><SlidersHorizontal size={16}/><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="terbaru">Terbaru</option><option value="terlama">Terlama</option><option value="az">A–Z</option></select></label>
      {isAsset && <button className={`button select-mode-button ${selectMode ? 'active' : ''}`} onClick={() => { setSelectMode((value) => !value); setSelected([]); }}>{selectMode ? <CheckSquare size={17}/> : <Square size={17}/>}Pilih</button>}
    </section>
    <div className="result-meta"><span>{result ? `${result.total.toLocaleString('id-ID')} item` : 'Menghitung...'}</span>{(query || category) && <span>· hasil filter aktif</span>}<span className="view-indicator"><Grid3X3 size={15}/>Grid</span></div>
    {!result ? <div className="page-loader"><LoaderCircle className="spin"/><span>Mengambil data halaman {page}...</span></div> : result.items.length === 0 ? <div className="empty-state"><Search size={29}/><h2>Belum ada hasil</h2><p>Coba kata kunci atau kategori lain.</p></div> : <>
      <div className={isAsset ? 'masonry-grid' : 'cards-grid'}>{result.items.map((item) => <ItemCard key={item.id} item={item} selectable={isAsset && selectMode} selected={selected.includes(item.id)} onSelect={() => setSelected((values) => values.includes(item.id) ? values.filter((id) => id !== item.id) : [...values, item.id])} onOpen={() => onOpen(item)} onFavorite={() => favorite(item)} onCopied={() => notify('Prompt disalin.')} />)}</div>
      <div className="pagination-row"><Pagination page={result.page} totalPages={result.totalPages} onChange={(value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /><label>Per halaman <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option>12</option><option>24</option><option>48</option></select></label></div>
    </>}
    {selectMode && selected.length > 0 && <div className="selection-bar"><strong>{selected.length} dipilih</strong><button className="button inverted" disabled={selected.length < 2} onClick={() => setMoodboard(selectedItems)}>Buat Moodboard</button><button className="button ghost-on-light" onClick={() => setSelected([])}>Hapus Pilihan</button></div>}
    {moodboard && <div className="modal-layer" role="dialog" aria-modal="true"><div className="moodboard-dialog"><header><div><span className="eyebrow">MOODBOARD SEMENTARA</span><h2>{moodboard.length} referensi terpilih</h2></div><button className="icon-button" onClick={() => setMoodboard(null)}><X/></button></header><div className="moodboard-grid">{moodboard.map((item) => <figure key={item.id}><img src={item.attachments[0]?.thumbnailUrl} alt={item.title}/><figcaption>{item.title}</figcaption></figure>)}</div></div></div>}
  </main>;
}
