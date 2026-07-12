import { useEffect, useState } from 'react';
import { ChevronDown, Trophy, Pencil, Trash2 } from 'lucide-react';
import { getJSON, putJSON, del } from '../api.js';
import PlayForm from '../components/PlayForm.jsx';
import IconButton from '../components/IconButton.jsx';

function sortGames(games) {
  return [...games].sort((a, b) => {
    if (!a.last_played_at && !b.last_played_at) return a.name.localeCompare(b.name);
    if (!a.last_played_at) return 1;
    if (!b.last_played_at) return -1;
    return new Date(b.last_played_at) - new Date(a.last_played_at);
  });
}

function gameSubtitle(game) {
  if (game.play_count === 0) return 'Noch nicht gespielt';
  const lastPlayed = game.last_played_at ? game.last_played_at.slice(0, 10) : null;
  return `${game.play_count} Partie${game.play_count === 1 ? '' : 'n'}${lastPlayed ? ` · zuletzt am ${lastPlayed}` : ''}`;
}

export default function OverviewPage() {
  const [games, setGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [playsByGame, setPlaysByGame] = useState(() => new Map());
  const [editingPlayId, setEditingPlayId] = useState(null);

  function reloadGames() {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
  }

  useEffect(() => {
    reloadGames();
    getJSON('/players').then(setPlayers).catch((err) => setError(err.message));
  }, []);

  function invalidatePlaysCache(gameId) {
    setPlaysByGame((prev) => {
      const next = new Map(prev);
      next.delete(gameId);
      return next;
    });
  }

  async function fetchPlaysFor(gameId) {
    try {
      const plays = await getJSON(`/games/${gameId}/plays`);
      setPlaysByGame((prev) => new Map(prev).set(gameId, plays));
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleExpand(gameId) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
        if (!playsByGame.has(gameId)) fetchPlaysFor(gameId);
      }
      return next;
    });
  }

  async function handleUpdatePlay(play, payload) {
    await putJSON(`/plays/${play.id}`, payload);
    setEditingPlayId(null);
    invalidatePlaysCache(play.game_id);
    if (payload.game_id !== play.game_id) invalidatePlaysCache(payload.game_id);
    if (expandedIds.has(play.game_id)) await fetchPlaysFor(play.game_id);
    if (payload.game_id !== play.game_id && expandedIds.has(payload.game_id)) await fetchPlaysFor(payload.game_id);
    reloadGames();
  }

  async function handleDeletePlay(play) {
    if (!window.confirm('Partie wirklich löschen?')) return;
    setError(null);
    try {
      await del(`/plays/${play.id}`);
      invalidatePlaysCache(play.game_id);
      if (expandedIds.has(play.game_id)) await fetchPlaysFor(play.game_id);
      reloadGames();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Übersicht</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="space-y-2">
        {sortGames(games).map((game) => {
          const isExpanded = expandedIds.has(game.id);
          const plays = playsByGame.get(game.id) ?? [];
          return (
            <div key={game.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleExpand(game.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <div className="font-medium text-brand-navy">{game.name}</div>
                  <div className="text-xs text-gray-500">{gameSubtitle(game)}</div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-3">
                  {plays.length === 0 && <p className="text-sm text-gray-500">Noch keine Partien erfasst.</p>}
                  {plays.map((play) =>
                    editingPlayId === play.id ? (
                      <div key={play.id} className="rounded-2xl bg-white p-3 shadow-sm">
                        <PlayForm
                          games={games}
                          players={players}
                          initialValues={play}
                          submitLabel="Änderungen speichern"
                          onCancel={() => setEditingPlayId(null)}
                          onSubmit={(payload) => handleUpdatePlay(play, payload)}
                        />
                      </div>
                    ) : (
                      <div key={play.id} className="rounded-2xl bg-white p-3 shadow-sm">
                        <div className="mb-1 flex items-center justify-between">
                          <strong className="text-brand-navy">{play.played_at.slice(0, 10)}</strong>
                          <div className="flex gap-1">
                            <IconButton label="Bearbeiten" onClick={() => setEditingPlayId(play.id)}>
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton label="Löschen" variant="danger" onClick={() => handleDeletePlay(play)}>
                              <Trash2 size={16} />
                            </IconButton>
                          </div>
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
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
        {games.length === 0 && <p className="text-gray-500">Noch keine Spiele vorhanden.</p>}
      </div>
    </div>
  );
}
