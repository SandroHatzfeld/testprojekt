import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJSON } from '../api.js';

export default function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [plays, setPlays] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJSON(`/games/${id}`).then(setGame).catch((err) => setError(err.message));
    getJSON(`/games/${id}/plays`).then(setPlays).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!game) return <p>Lade...</p>;

  return (
    <div>
      <p>
        <Link to="/games">&larr; Zurück zu Spiele</Link>
      </p>
      <h1>{game.name}</h1>
      {game.description && <p>{game.description}</p>}

      <h2>Partien-Historie</h2>
      {plays.length === 0 && <p>Noch keine Partien erfasst.</p>}
      {plays.map((play) => (
        <div key={play.id} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
          <strong>{play.played_at.slice(0, 10)}</strong>
          {play.notes && <p>{play.notes}</p>}
          <table>
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Punkte</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {play.participants.map((p) => (
                <tr key={p.player_id}>
                  <td>{p.player_name}</td>
                  <td>{p.score ?? '-'}</td>
                  <td>{p.is_winner && <span className="winner-badge">Gewinner</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
