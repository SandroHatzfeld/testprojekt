import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import GameDetailPage from './pages/GameDetailPage.jsx';
import PlayersPage from './pages/PlayersPage.jsx';
import AddPlayPage from './pages/AddPlayPage.jsx';

function getBasename() {
  const pathname = new URL(document.baseURI).pathname;
  return pathname === '/' ? '/' : pathname.replace(/\/$/, '');
}

export default function App() {
  return (
    <BrowserRouter basename={getBasename()}>
      <div className="min-h-screen bg-gray-50 pb-24">
        <main className="mx-auto max-w-2xl px-4 py-6">
          <Routes>
            <Route path="/" element={<AddPlayPage />} />
            <Route path="/uebersicht" element={<OverviewPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/:id" element={<GameDetailPage />} />
            <Route path="/players" element={<PlayersPage />} />
          </Routes>
        </main>
        <NavBar />
      </div>
    </BrowserRouter>
  );
}
