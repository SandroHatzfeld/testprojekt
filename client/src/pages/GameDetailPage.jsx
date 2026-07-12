import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
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

  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!game) return <p className="text-gray-500">Lade...</p>;

  return (
    <div>
      <Link to="/games" className="mb-3 flex items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-orange">
        <ArrowLeft size={16} /> Zurück zu Spiele
      </Link>
      <h1 className="text-xl font-bold text-brand-navy">{game.name}</h1>
      {game.description && <p className="mt-1 text-gray-600">{game.description}</p>}

      <h2 className="mb-2 mt-6 text-sm font-semibold text-brand-navy">Partien-Historie</h2>
      {plays.length === 0 && <p className="text-gray-500">Noch keine Partien erfasst.</p>}
      <div className="space-y-3">
        {plays.map((play) => (
          <div key={play.id} className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="mb-1 flex items-baseline justify-between">
              <strong className="text-brand-navy">{play.played_at.slice(0, 10)}</strong>
            </div>
            {play.notes && <p className="mb-2 text-sm text-gray-600">{play.notes}</p>}
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 font-medium">Spieler</th>
                  <th className="py-1 font-medium">Punkte</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {play.participants.map((p) => (
                  <tr key={p.player_id} className="border-t border-gray-100">
                    <td className="py-1.5">{p.player_name}</td>
                    <td className="py-1.5">{p.score ?? '-'}</td>
                    <td className="py-1.5">
                      {p.is_winner && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-brand-orange">
                          <Trophy size={14} /> Gewinner
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
