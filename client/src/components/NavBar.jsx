import { NavLink } from 'react-router-dom';
import { PlusCircle, Trophy, Dices, Users } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Neue Partie', icon: PlusCircle, end: true },
  { to: '/uebersicht', label: 'Übersicht', icon: Trophy },
  { to: '/games', label: 'Spiele', icon: Dices },
  { to: '/players', label: 'Spieler', icon: Users },
];

export default function NavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex bg-brand-navy pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_4px_rgba(0,0,0,0.15)]">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 border-t-[3px] py-2 text-xs font-medium transition-colors ${
              isActive ? 'border-brand-orange text-brand-orange' : 'border-transparent text-white/70'
            }`
          }
        >
          <Icon size={20} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
