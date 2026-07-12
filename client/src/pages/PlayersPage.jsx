import { useEffect, useState } from 'react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { getJSON, postJSON, putJSON, del } from '../api.js';
import IconButton from '../components/IconButton.jsx';

const inputClass =
  'rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  function reload() {
    getJSON('/players').then(setPlayers).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    try {
      await postJSON('/players', { name: newName });
      setNewName('');
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(player) {
    setEditingId(player.id);
    setEditName(player.name);
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      await putJSON(`/players/${id}`, { name: editName });
      setEditingId(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await del(`/players/${id}`);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Spieler</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
          className={`${inputClass} min-w-[8rem] flex-1`}
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
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-t border-gray-100">
                {editingId === player.id ? (
                  <>
                    <td className="px-3 py-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <IconButton label="Speichern" variant="success" onClick={() => handleSaveEdit(player.id)}>
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
                    <td className="px-3 py-2 font-medium text-brand-navy">{player.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <IconButton label="Bearbeiten" onClick={() => startEdit(player)}>
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton label="Löschen" variant="danger" onClick={() => handleDelete(player.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-4 text-gray-500">
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
