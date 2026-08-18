import { useEffect, useState } from 'react';

export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'beranda';
  const [route, setRouteState] = useState(read);

  useEffect(() => {
    const onChange = () => setRouteState(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (next: string) => {
    window.location.hash = `/${next}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { route, navigate };
}
