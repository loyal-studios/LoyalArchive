import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import './styles.css';
import { useHashRoute } from './hooks/useHashRoute';
import { getSession, isDemoMode } from './lib/api';
import type { ArchiveItem, ArchiveType, Session } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Shell } from './components/Shell';
import { Home } from './components/Home';
import { Library } from './components/Library';
import { Brainstorm } from './components/Brainstorm';
import { AddDialog, DetailDrawer, SearchDialog } from './components/Dialogs';
import { Settings } from './components/Settings';
import { SECTION_MAP } from './config';

export default function App() {
  const { route, navigate } = useHashRoute();
  const [session, setSessionState] = useState<Session | null>(() => getSession());
  const [addType, setAddType] = useState<ArchiveType | undefined>();
  const [showAdd, setShowAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [detail, setDetail] = useState<ArchiveItem | null>(null);
  const [toast, setToast] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setShowSearch(true); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); setShowAdd(true); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!isDemoMode && !session) return <AuthScreen onAuthenticated={setSessionState} />;

  const archiveRoute = route in SECTION_MAP ? route as ArchiveType : null;
  const openAdd = (type?: ArchiveType) => { setAddType(type); setShowAdd(true); };

  let content: React.ReactNode;
  if (route === 'beranda') content = <Home navigate={navigate} onAdd={openAdd} onOpen={setDetail} notify={notify} refreshKey={refreshKey} />;
  else if (archiveRoute) content = <Library type={archiveRoute} onOpen={setDetail} onAdd={openAdd} notify={notify} refreshKey={refreshKey} />;
  else if (route === 'favorit') content = <Library type="favorit" onOpen={setDetail} onAdd={openAdd} notify={notify} refreshKey={refreshKey} />;
  else if (route === 'brainstorm') content = <Brainstorm onOpen={setDetail} notify={notify} />;
  else if (route === 'pengaturan') content = <Settings onLogout={() => setSessionState(null)} />;
  else content = <Home navigate={navigate} onAdd={openAdd} onOpen={setDetail} notify={notify} refreshKey={refreshKey} />;

  return <>
    <Shell route={route} navigate={navigate} onAdd={() => openAdd()} onSearch={() => setShowSearch(true)} demo={isDemoMode}>{content}</Shell>
    {showAdd && <AddDialog initialType={addType} onClose={() => setShowAdd(false)} onSaved={(item) => { setShowAdd(false); setRefreshKey((value) => value + 1); notify(`${item.title || 'Referensi'} berhasil disimpan.`); if (route !== item.type) navigate(item.type); }} />}
    {showSearch && <SearchDialog onClose={() => setShowSearch(false)} onOpen={setDetail} />}
    {detail && <DetailDrawer item={detail} onClose={() => setDetail(null)} onChanged={(item) => { setDetail(item); setRefreshKey((value) => value + 1); }} notify={notify} />}
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </>;
}
