import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJSON, postJSON } from '../api.js';

function emptyParticipant() {
  return { player_id: '', score: '', is_winner: false };
}

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
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Partie erfassen</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="participant-row">
          <label>
            Spiel:{' '}
            <select value={gameId} onChange={(e) => setGameId(e.target.value)} required>
              <option value="">-- auswählen --</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="participant-row">
          <label>
            Datum:{' '}
            <input type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} required />
          </label>
        </div>

        <div className="participant-row">
          <label>
            Notizen:{' '}
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
          </label>
        </div>

        <h3>Teilnehmer</h3>
        {participants.map((participant, index) => (
          <div className="participant-row" key={index}>
            <select
              value={participant.player_id}
              onChange={(e) => updateParticipant(index, { player_id: e.target.value })}
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
              style={{ width: '6rem' }}
            />
            <label>
              <input
                type="checkbox"
                checked={participant.is_winner}
                onChange={(e) => updateParticipant(index, { is_winner: e.target.checked })}
              />{' '}
              Gewinner
            </label>
            {participants.length > 1 && (
              <button type="button" className="secondary" onClick={() => removeParticipantRow(index)}>
                Entfernen
              </button>
            )}
          </div>
        ))}
        <button type="button" className="secondary" onClick={addParticipantRow}>
          + Teilnehmer
        </button>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit">Partie speichern</button>
        </div>
      </form>
    </div>
  );
}
