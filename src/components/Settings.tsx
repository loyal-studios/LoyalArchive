import { CheckCircle2, Cloud, Database, ExternalLink, HardDrive, Info, KeyRound, Smartphone } from 'lucide-react';
import { isDemoMode, logout } from '../lib/api';

export function Settings({ onLogout }: { onLogout: () => void }) {
  return <main className="page settings-page">
    <header className="page-heading"><div><div className="eyebrow">SISTEM</div><h1>Pengaturan</h1><p>Status koneksi dan panduan perangkat.</p></div></header>
    {isDemoMode && <section className="notice-card"><Info/><div><strong>Frontend sedang memakai mode demo</strong><p>Semua layar bisa dicoba. Hubungkan URL Google Apps Script untuk memakai data asli.</p></div></section>}
    <div className="settings-grid">
      <section className="settings-card"><header><Database/><div><h2>Database metadata</h2><span>Google Sheets</span></div><CheckCircle2 className={isDemoMode ? 'pending' : 'success'}/></header><p>Judul, kategori, tag, status, pencarian, dan pagination.</p><dl><div><dt>Status</dt><dd>{isDemoMode ? 'Menunggu koneksi' : 'Terhubung'}</dd></div><div><dt>Mode baca</dt><dd>Server-side</dd></div></dl></section>
      <section className="settings-card"><header><HardDrive/><div><h2>Penyimpanan file</h2><span>Google Drive</span></div><CheckCircle2 className={isDemoMode ? 'pending' : 'success'}/></header><p>Original full resolution dan thumbnail otomatis tersimpan terpisah.</p><dl><div><dt>Original</dt><dd>Privat</dd></div><div><dt>Thumbnail</dt><dd>Link terbatas</dd></div></dl></section>
      <section className="settings-card"><header><Cloud/><div><h2>Backend API</h2><span>Apps Script Web App</span></div><CheckCircle2 className={isDemoMode ? 'pending' : 'success'}/></header><p>Login, upload, pencarian, edit, favorit, dan manajemen Drive.</p><dl><div><dt>Otentikasi</dt><dd>Email OTP</dd></div><div><dt>Cache</dt><dd>Aktif</dd></div></dl></section>
      <section className="settings-card"><header><Smartphone/><div><h2>iPhone / PWA</h2><span>Add to Home Screen</span></div><CheckCircle2 className="success"/></header><p>Buka dari Safari, tekan Share, lalu pilih “Add to Home Screen”.</p><dl><div><dt>Mode</dt><dd>Standalone</dd></div><div><dt>Safe area</dt><dd>Aktif</dd></div></dl></section>
    </div>
    <section className="settings-section"><header><KeyRound/><div><h2>Keamanan</h2><p>Sesi perangkat terpercaya berlaku hingga 30 hari dan dapat dicabut dari backend.</p></div></header><button className="button danger" onClick={async () => { await logout(); onLogout(); }}>Keluar dari perangkat ini</button></section>
    <section className="settings-section"><header><ExternalLink/><div><h2>Dokumentasi instalasi</h2><p>Langkah lengkap membuat Sheet, folder Drive, deploy Apps Script, dan GitHub Pages tersedia di README project.</p></div></header></section>
  </main>;
}
