import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJSON, postJSON, putJSON, del } from '../api.js';

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
      <h1>Spiele</h1>
      {error && <p className="error">{error}</p>}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          placeholder="Beschreibung (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button type="submit">Hinzufügen</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Beschreibung</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              {editingId === game.id ? (
                <>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </td>
                  <td>
                    <button onClick={() => handleSaveEdit(game.id)}>Speichern</button>{' '}
                    <button className="secondary" onClick={() => setEditingId(null)}>
                      Abbrechen
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <Link to={`/games/${game.id}`}>{game.name}</Link>
                  </td>
                  <td>{game.description}</td>
                  <td>
                    <button className="secondary" onClick={() => startEdit(game)}>
                      Bearbeiten
                    </button>{' '}
                    <button className="danger" onClick={() => handleDelete(game.id)}>
                      Löschen
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {games.length === 0 && (
            <tr>
              <td colSpan={3}>Noch keine Spiele vorhanden.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
