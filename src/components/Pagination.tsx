import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2]);
  const valid = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  return <nav className="pagination" aria-label="Halaman">
    <button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya"><ChevronLeft size={18}/></button>
    {valid.map((value, index) => <span className="page-slot" key={value}>{index > 0 && value - valid[index - 1] > 1 && <i>…</i>}<button className={value === page ? 'active' : ''} onClick={() => onChange(value)}>{value}</button></span>)}
    <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya"><ChevronRight size={18}/></button>
  </nav>;
}
