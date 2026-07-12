import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function Fab() {
  const { pathname } = useLocation();
  if (pathname === '/neue-partie') return null;

  return (
    <Link
      to="/neue-partie"
      aria-label="Neue Partie erfassen"
      className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg hover:bg-brand-orange-dark"
    >
      <Plus size={28} strokeWidth={2.5} />
    </Link>
  );
}
