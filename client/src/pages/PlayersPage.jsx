import { useEffect, useState } from 'react';
import { getJSON, postJSON, putJSON, del } from '../api.js';

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
      <h1>Spieler</h1>
      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              {editingId === player.id ? (
                <>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <button onClick={() => handleSaveEdit(player.id)}>Speichern</button>{' '}
                    <button className="secondary" onClick={() => setEditingId(null)}>
                      Abbrechen
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{player.name}</td>
                  <td>
                    <button className="secondary" onClick={() => startEdit(player)}>
                      Bearbeiten
                    </button>{' '}
                    <button className="danger" onClick={() => handleDelete(player.id)}>
                      Löschen
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={2}>Noch keine Spieler vorhanden.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
