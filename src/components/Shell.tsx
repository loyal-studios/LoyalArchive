import { useState } from 'react';
import {
  Archive,
  BrainCircuit,
  ChevronLeft,
  Home,
  Menu,
  Plus,
  Search,
  Settings,
  Star,
  X,
} from 'lucide-react';
import { SECTIONS } from '../config';
import type { ReactNode } from 'react';

interface Props {
  route: string;
  navigate: (route: string) => void;
  onAdd: () => void;
  onSearch: () => void;
  children: ReactNode;
  demo: boolean;
}

export function Shell({ route, navigate, onAdd, onSearch, children, demo }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const go = (next: string) => { navigate(next); setMobileOpen(false); };

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <img className="brand-mark" src="./brand/favicon.svg" alt="" />
        <div className="brand-copy"><strong>LOYAL ARCHIVE</strong><span>CREATIVE MEMORY SYSTEM</span></div>
        <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={20}/></button>
      </div>
      <nav className="nav-scroll">
        <NavButton active={route === 'beranda'} icon={Home} label="Beranda" onClick={() => go('beranda')} />
        <div className="nav-label">ARSIP</div>
        {SECTIONS.map(({ type, label, icon }) => <NavButton key={type} active={route === type} icon={icon} label={label} onClick={() => go(type)} />)}
        <div className="nav-label">PILIHAN</div>
        <NavButton active={route === 'favorit'} icon={Star} label="Favorit" onClick={() => go('favorit')} />
        <NavButton active={route === 'brainstorm'} icon={BrainCircuit} label="Lagi Buntu?" onClick={() => go('brainstorm')} />
      </nav>
      <div className="sidebar-footer">
        {demo && <span className="demo-pill">MODE DEMO</span>}
        <NavButton active={route === 'pengaturan'} icon={Settings} label="Pengaturan" onClick={() => go('pengaturan')} />
        <button className="collapse-button" onClick={() => setCollapsed((value) => !value)}><ChevronLeft size={18}/><span>Ciutkan sidebar</span></button>
      </div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} />}
    <div className="main-column">
      <header className="topbar">
        <button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Buka menu"><Menu size={21}/></button>
        <button className="search-trigger" onClick={onSearch}><Search size={18}/><span>Cari di seluruh arsip...</span><kbd>⌘ K</kbd></button>
        <button className="button primary add-button" onClick={onAdd}><Plus size={18}/><span>Tambah</span></button>
      </header>
      {children}
      <nav className="bottom-nav">
        <MobileNav active={route === 'beranda'} icon={Home} label="Beranda" onClick={() => go('beranda')} />
        <MobileNav active={route === 'ide'} icon={SECTIONS[0].icon} label="Ide" onClick={() => go('ide')} />
        <button className="mobile-add" onClick={onAdd}><Plus size={25}/><span>Tambah</span></button>
        <MobileNav active={route === 'asset'} icon={Archive} label="Referensi" onClick={() => go('asset')} />
        <MobileNav active={route === 'favorit'} icon={Star} label="Favorit" onClick={() => go('favorit')} />
      </nav>
    </div>
  </div>;
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Home; label: string; onClick: () => void }) {
  return <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick}><Icon size={19}/><span>{label}</span></button>;
}

function MobileNav({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Home; label: string; onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}><Icon size={20}/><span>{label}</span></button>;
}
