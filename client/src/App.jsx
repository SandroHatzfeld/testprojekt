import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Fab from './components/Fab.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import SuggestionPage from './pages/SuggestionPage.jsx';
import GamesPage from './pages/GamesPage.jsx';
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
            <Route path="/" element={<Navigate to="/uebersicht" replace />} />
            <Route path="/uebersicht" element={<OverviewPage />} />
            <Route path="/vorschlag" element={<SuggestionPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/neue-partie" element={<AddPlayPage />} />
          </Routes>
        </main>
        <Fab />
        <NavBar />
      </div>
    </BrowserRouter>
  );
}
