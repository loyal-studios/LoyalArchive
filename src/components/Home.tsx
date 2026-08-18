import { useEffect, useState } from 'react';
import { ArrowRight, BrainCircuit, Dice5, LoaderCircle, Plus, Shuffle, Sparkles } from 'lucide-react';
import { getDashboard, toggleFavorite } from '../lib/api';
import type { ArchiveItem, ArchiveType, DashboardData } from '../types';
import { SECTIONS } from '../config';
import { ItemCard } from './ItemCard';

interface Props {
  navigate: (route: string) => void;
  onAdd: (type?: ArchiveType) => void;
  onOpen: (item: ArchiveItem) => void;
  notify: (message: string) => void;
  refreshKey: number;
}

export function Home({ navigate, onAdd, onOpen, notify, refreshKey }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { getDashboard().then(setData); }, [refreshKey]);
  if (!data) return <div className="page-loader"><LoaderCircle className="spin"/><span>Menyiapkan arsip...</span></div>;

  async function favorite(item: ArchiveItem) {
    await toggleFavorite(item.id, !item.favorite);
    setData((current) => current ? {
      ...current,
      latest: current.latest.map((entry) => entry.id === item.id ? { ...entry, favorite: !entry.favorite } : entry),
      favorites: item.favorite ? current.favorites.filter((entry) => entry.id !== item.id) : [{ ...item, favorite: true }, ...current.favorites].slice(0, 6),
    } : current);
  }

  return <main className="page home-page">
    <section className="home-hero">
      <div>
        <div className="eyebrow">SELASA, 18 AGUSTUS 2026</div>
        <h1>Selamat datang kembali.</h1>
        <p>Apa yang lagi kepikiran?</p>
      </div>
      <div className="hero-actions">
        <button className="button primary" onClick={() => onAdd('ide')}><Plus size={17}/>Tambah Ide</button>
        <button className="button" onClick={() => onAdd('asset')}><Plus size={17}/>Referensi</button>
        <button className="button" onClick={() => onAdd('catatan')}><Plus size={17}/>Catatan</button>
      </div>
    </section>

    <section className="section-grid shortcuts-grid">
      {SECTIONS.filter((section) => ['ide', 'prompt', 'catatan', 'asset', 'link'].includes(section.type)).map(({ type, label, description, icon: Icon }) => <button key={type} className="shortcut-card" onClick={() => navigate(type)}>
        <span className="shortcut-icon"><Icon size={22}/></span>
        <span><strong>{label}</strong><small>{data.counts[type] || 0} tersimpan</small></span>
        <ArrowRight size={18}/>
        <p>{description}</p>
      </button>)}
    </section>

    <div className="home-layout">
      <section className="content-section">
        <header className="section-heading"><div><span className="eyebrow">LINIMASA</span><h2>Baru Ditambahkan</h2></div><button className="text-link" onClick={() => navigate('ide')}>Lihat semua <ArrowRight size={15}/></button></header>
        <div className="compact-list">{data.latest.map((item) => <ItemCard key={item.id} item={item} variant="compact" onOpen={() => onOpen(item)} onFavorite={() => favorite(item)} />)}</div>
      </section>
      <section className="stuck-card">
        <span className="orbital-icon"><BrainCircuit size={30}/><i/></span>
        <div className="eyebrow">ANTI ART-BLOCK</div>
        <h2>Lagi Buntu?</h2>
        <p>Ambil bahan dari arsip lo sendiri untuk memancing konsep baru.</p>
        <button className="button inverted" onClick={() => navigate('brainstorm')}>Mulai eksplorasi <ArrowRight size={17}/></button>
      </section>
    </div>

    <section className="content-section">
      <header className="section-heading"><div><span className="eyebrow">PILIHAN LO</span><h2>Favorit</h2></div><button className="text-link" onClick={() => navigate('favorit')}>Lihat semua <ArrowRight size={15}/></button></header>
      <div className="cards-grid home-cards">{data.favorites.slice(0, 4).map((item) => <ItemCard key={item.id} item={item} onOpen={() => onOpen(item)} onFavorite={() => favorite(item)} onCopied={() => notify('Prompt disalin.')} />)}</div>
    </section>

    <section className="random-strip">
      <div><Sparkles size={20}/><span><strong>Mulai dari arsip sendiri</strong><small>Acak, gabungkan, lalu kembangkan.</small></span></div>
      <div><button onClick={() => navigate('brainstorm')}><Dice5 size={17}/>Acak Ide</button><button onClick={() => navigate('brainstorm')}><Shuffle size={17}/>Gabungkan</button></div>
    </section>
  </main>;
}
