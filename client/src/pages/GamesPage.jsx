import { useEffect, useState } from 'react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { getJSON, postJSON, putJSON, del } from '../api.js';
import IconButton from '../components/IconButton.jsx';

const inputClass =
  'rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none';

const COMPLEXITY_LABELS = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };

function emptyForm() {
  return { name: '', description: '', duration_minutes: '', complexity: '' };
}

function GameFields({ values, onChange, idPrefix }) {
  return (
    <>
      <input
        placeholder="Name"
        value={values.name}
        onChange={(e) => onChange({ ...values, name: e.target.value })}
        required
        className={`${inputClass} min-w-[8rem] flex-1`}
      />
      <input
        placeholder="Beschreibung (optional)"
        value={values.description}
        onChange={(e) => onChange({ ...values, description: e.target.value })}
        className={`${inputClass} min-w-[10rem] flex-1`}
      />
      <input
        type="number"
        min="0"
        placeholder="Dauer (Min)"
        value={values.duration_minutes}
        onChange={(e) => onChange({ ...values, duration_minutes: e.target.value })}
        className={`${inputClass} w-28`}
      />
      <select
        value={values.complexity}
        onChange={(e) => onChange({ ...values, complexity: e.target.value })}
        className={inputClass}
        aria-label="Komplexität"
      >
        <option value="">Komplexität</option>
        <option value="leicht">Leicht</option>
        <option value="mittel">Mittel</option>
        <option value="schwer">Schwer</option>
      </select>
    </>
  );
}

function gameSubtitle(game) {
  const parts = [];
  if (game.duration_minutes != null) parts.push(`${game.duration_minutes} Min`);
  if (game.complexity) parts.push(COMPLEXITY_LABELS[game.complexity]);
  parts.push(`${game.play_count}× gespielt`);
  return parts.join(' · ');
}

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [newGame, setNewGame] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [editGame, setEditGame] = useState(emptyForm());

  function reload() {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  function toPayload(values) {
    return {
      name: values.name,
      description: values.description || null,
      duration_minutes: values.duration_minutes === '' ? null : Number(values.duration_minutes),
      complexity: values.complexity || null,
    };
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await postJSON('/games', toPayload(newGame));
      setNewGame(emptyForm());
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(game) {
    setEditingId(game.id);
    setEditGame({
      name: game.name,
      description: game.description || '',
      duration_minutes: game.duration_minutes ?? '',
      complexity: game.complexity || '',
    });
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      await putJSON(`/games/${id}`, toPayload(editGame));
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await del(`/games/${id}`);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Spiele</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <GameFields values={newGame} onChange={setNewGame} />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-brand-orange px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-orange-dark"
        >
          <Plus size={16} /> Hinzufügen
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Beschreibung</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-t border-gray-100 align-top">
                {editingId === game.id ? (
                  <>
                    <td className="px-3 py-2" colSpan={2}>
                      <div className="flex flex-wrap gap-2">
                        <GameFields values={editGame} onChange={setEditGame} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <IconButton label="Speichern" variant="success" onClick={() => handleSaveEdit(game.id)}>
                          <Check size={16} />
                        </IconButton>
                        <IconButton label="Abbrechen" onClick={() => setEditingId(null)}>
                          <X size={16} />
                        </IconButton>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2">
                      <div className="font-medium text-brand-navy">{game.name}</div>
                      <div className="text-xs text-gray-500">{gameSubtitle(game)}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{game.description}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <IconButton label="Bearbeiten" onClick={() => startEdit(game)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton label="Löschen" variant="danger" onClick={() => handleDelete(game.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-gray-500">
                  Noch keine Spiele vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
