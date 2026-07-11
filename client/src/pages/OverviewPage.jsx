import { useEffect, useState } from 'react';
import { getJSON } from '../api.js';

export default function OverviewPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getJSON('/leaderboard').then(setLeaderboard).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Übersicht</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Spieler</th>
            <th>Siege</th>
            <th>Partien gespielt</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.wins}</td>
              <td>{row.games_played}</td>
            </tr>
          ))}
          {leaderboard.length === 0 && (
            <tr>
              <td colSpan={3}>Noch keine Spieler vorhanden.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
