import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { getJSON, postJSON } from '../api.js';

function emptyParticipant() {
  return { player_id: '', score: '', is_winner: false };
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none';
const labelClass = 'mb-1 block text-sm font-medium text-brand-navy';

export default function AddPlayPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [gameId, setGameId] = useState('');
  const [playedAt, setPlayedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState([emptyParticipant()]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
    getJSON('/players').then(setPlayers).catch((err) => setError(err.message));
  }, []);

  function updateParticipant(index, changes) {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, ...changes } : p)));
  }

  function addParticipantRow() {
    setParticipants((prev) => [...prev, emptyParticipant()]);
  }

  function removeParticipantRow(index) {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const validParticipants = participants.filter((p) => p.player_id);
    if (!gameId || validParticipants.length === 0) {
      setError('Bitte ein Spiel und mindestens einen Teilnehmer auswählen.');
      return;
    }

    try {
      await postJSON('/plays', {
        game_id: Number(gameId),
        played_at: playedAt,
        notes: notes || null,
        participants: validParticipants.map((p) => ({
          player_id: Number(p.player_id),
          score: p.score === '' ? null : Number(p.score),
          is_winner: p.is_winner,
        })),
      });
      navigate('/uebersicht');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Neue Partie</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Spiel</label>
          <select value={gameId} onChange={(e) => setGameId(e.target.value)} required className={inputClass}>
            <option value="">-- auswählen --</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Datum</label>
          <input
            type="date"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Notizen</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="optional"
            className={inputClass}
          />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-brand-navy">Teilnehmer</h2>
          <div className="space-y-2">
            {participants.map((participant, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
                <select
                  value={participant.player_id}
                  onChange={(e) => updateParticipant(index, { player_id: e.target.value })}
                  className="min-w-[8rem] flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none"
                >
                  <option value="">-- Spieler --</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Punkte"
                  value={participant.score}
                  onChange={(e) => updateParticipant(index, { score: e.target.value })}
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                <label className="flex items-center gap-1.5 text-sm text-brand-navy">
                  <input
                    type="checkbox"
                    checked={participant.is_winner}
                    onChange={(e) => updateParticipant(index, { is_winner: e.target.checked })}
                    className="h-4 w-4 accent-brand-orange"
                  />
                  Gewinner
                </label>
                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipantRow(index)}
                    aria-label="Teilnehmer entfernen"
                    className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addParticipantRow}
            className="mt-2 flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-200"
          >
            <Plus size={16} /> Teilnehmer
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-orange py-2.5 font-semibold text-white hover:bg-brand-orange-dark"
        >
          Partie speichern
        </button>
      </form>
    </div>
  );
}
