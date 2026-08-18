import { useState } from 'react';
import { ArrowRight, BrainCircuit, Dice5, LoaderCircle, RefreshCw, Shuffle, Sparkles } from 'lucide-react';
import { listItems } from '../lib/api';
import type { ArchiveItem } from '../types';
import { ItemCard } from './ItemCard';

const styles = ['Vintage', 'Airbrush', 'Y2K', 'Gothic', 'Sports', 'Workwear', 'Minimal'];
const garments = ['Tee', 'Hoodie', 'Jersey', 'Jacket', 'Bebas'];

export function Brainstorm({ onOpen, notify }: { onOpen: (item: ArchiveItem) => void; notify: (message: string) => void }) {
  const [mode, setMode] = useState<'acak' | 'gabung' | 'buntu'>('acak');
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Graphic');
  const [style, setStyle] = useState('Vintage');
  const [garment, setGarment] = useState('Tee');
  const [prompt, setPrompt] = useState('');

  async function draw(count: number) {
    setLoading(true);
    const result = await listItems({ page: 1, pageSize: 48, sort: 'terbaru' });
    setItems([...result.items].sort(() => Math.random() - .5).slice(0, count));
    setLoading(false);
  }

  function generate() {
    const next = `${style} ${category} × ${garment}`;
    setPrompt(next);
  }

  return <main className="page brainstorm-page">
    <header className="page-heading"><div><div className="eyebrow">ANTI ART-BLOCK</div><h1>Lagi Buntu?</h1><p>Gunakan isi arsip sendiri sebagai bahan bakar konsep baru.</p></div></header>
    <div className="mode-tabs"><button className={mode === 'acak' ? 'active' : ''} onClick={() => setMode('acak')}><Dice5/>Acak Arsip</button><button className={mode === 'gabung' ? 'active' : ''} onClick={() => setMode('gabung')}><Shuffle/>Gabungkan</button><button className={mode === 'buntu' ? 'active' : ''} onClick={() => setMode('buntu')}><BrainCircuit/>Panduan Buntu</button></div>
    {mode !== 'buntu' ? <section className="brainstorm-workspace">
      <div className="brainstorm-intro"><Sparkles/><div><h2>{mode === 'acak' ? 'Temukan ulang satu bahan' : 'Benturkan beberapa hal'}</h2><p>{mode === 'acak' ? 'Ambil satu item acak yang mungkin sudah lama nggak lo buka.' : 'Gabungkan ide, referensi, teknik, atau catatan tanpa AI.'}</p></div><button className="button primary" onClick={() => draw(mode === 'acak' ? 1 : 3)}>{loading ? <LoaderCircle className="spin"/> : <RefreshCw/>}{items.length ? 'Acak lagi' : 'Mulai'}</button></div>
      {items.length > 0 && <><div className={`brainstorm-results ${mode}`}>{items.map((item, index) => <div className="result-piece" key={item.id}>{index > 0 && mode === 'gabung' && <span className="plus-sign">＋</span>}<ItemCard item={item} onOpen={() => onOpen(item)} onFavorite={() => notify('Buka item untuk mengubah Favorit.')} /></div>)}</div>{mode === 'gabung' && <div className="combination-line"><span>ARAH AWAL</span><strong>{items.map((item) => item.title).join(' × ')}</strong></div>}</>}
    </section> : <section className="guided-workspace">
      <div className="guided-header"><span>01</span><div><h2>Mau mulai dari mana?</h2><p>Pilih arah dasar yang terasa paling dekat.</p></div></div>
      <div className="choice-row">{['Graphic', 'Typography', 'Garment', 'Effect / Technique'].map((value) => <button className={category === value ? 'active' : ''} onClick={() => setCategory(value)} key={value}>{value}</button>)}</div>
      <div className="guided-header"><span>02</span><div><h2>Rasa visual?</h2><p>Nanti arsip akan mengambil bahan yang relevan.</p></div></div>
      <div className="choice-row">{styles.map((value) => <button className={style === value ? 'active' : ''} onClick={() => setStyle(value)} key={value}>{value}</button>)}</div>
      <div className="guided-header"><span>03</span><div><h2>Media atau garment?</h2></div></div>
      <div className="choice-row">{garments.map((value) => <button className={garment === value ? 'active' : ''} onClick={() => setGarment(value)} key={value}>{value}</button>)}</div>
      <button className="button primary generate-button" onClick={generate}>Bangun arah <ArrowRight/></button>
      {prompt && <div className="generated-direction"><span>COBA MULAI DARI</span><h2>{prompt}</h2><p>Gunakan kata kunci ini di Pencarian Universal atau gabungkan dengan arsip acak.</p><button className="button inverted" onClick={() => draw(3)}>Ambil 3 bahan dari arsip</button></div>}
      {items.length > 0 && <div className="brainstorm-results gabung">{items.map((item) => <ItemCard key={item.id} item={item} onOpen={() => onOpen(item)} onFavorite={() => notify('Buka item untuk mengubah Favorit.')} />)}</div>}
    </section>}
  </main>;
}
