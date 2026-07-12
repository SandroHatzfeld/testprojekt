import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { getJSON, postJSON, putJSON, del } from '../api.js';

const inputClass =
  'rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none';

function IconButton({ onClick, label, variant = 'default', children }) {
  const variants = {
    default: 'text-gray-400 hover:bg-gray-100 hover:text-brand-navy',
    danger: 'text-gray-400 hover:bg-red-50 hover:text-red-600',
    success: 'text-gray-400 hover:bg-green-50 hover:text-green-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-lg p-1.5 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  function reload() {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await postJSON('/games', { name: newName, description: newDescription || null });
      setNewName('');
      setNewDescription('');
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(game) {
    setEditingId(game.id);
    setEditName(game.name);
    setEditDescription(game.description || '');
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      await putJSON(`/games/${id}`, { name: editName, description: editDescription || null });
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
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          className={`${inputClass} min-w-[8rem] flex-1`}
        />
        <input
          placeholder="Beschreibung (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className={`${inputClass} min-w-[10rem] flex-1`}
        />
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
              <tr key={game.id} className="border-t border-gray-100">
                {editingId === game.id ? (
                  <>
                    <td className="px-3 py-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className={inputClass}
                      />
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
                      <Link to={`/games/${game.id}`} className="font-medium text-brand-navy hover:text-brand-orange">
                        {game.name}
                      </Link>
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
