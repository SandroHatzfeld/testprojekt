import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import GameDetailPage from './pages/GameDetailPage.jsx';
import PlayersPage from './pages/PlayersPage.jsx';
import AddPlayPage from './pages/AddPlayPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/plays/new" element={<AddPlayPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
