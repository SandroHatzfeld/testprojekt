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
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Übersicht</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-3 py-2 font-semibold">Spieler</th>
              <th className="px-3 py-2 font-semibold">Siege</th>
              <th className="px-3 py-2 font-semibold">Partien gespielt</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.wins}</td>
                <td className="px-3 py-2">{row.games_played}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-gray-500">
                  Noch keine Spieler vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
