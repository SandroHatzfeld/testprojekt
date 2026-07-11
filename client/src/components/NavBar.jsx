import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
        Übersicht
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => (isActive ? 'active' : '')}>
        Spiele
      </NavLink>
      <NavLink to="/players" className={({ isActive }) => (isActive ? 'active' : '')}>
        Spieler
      </NavLink>
      <NavLink to="/plays/new" className={({ isActive }) => (isActive ? 'active' : '')}>
        Partie erfassen
      </NavLink>
    </nav>
  );
}
