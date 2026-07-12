import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayForm from '../components/PlayForm.jsx';
import { getJSON, postJSON } from '../api.js';

export default function AddPlayPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
    getJSON('/players').then(setPlayers).catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(payload) {
    await postJSON('/plays', payload);
    navigate('/uebersicht');
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Neue Partie</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <PlayForm games={games} players={players} submitLabel="Partie speichern" onSubmit={handleSubmit} />
    </div>
  );
}
