import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import SearchableSelect from './SearchableSelect.jsx';

function emptyParticipant() {
  return { player_id: '', score: '', is_winner: false };
}

function recomputeWinners(list) {
  const numericScores = list.map((p) => (p.score === '' || p.score === null ? null : Number(p.score)));
  const validScores = numericScores.filter((s) => s !== null && !Number.isNaN(s));
  if (validScores.length === 0) return list;
  const max = Math.max(...validScores);
  return list.map((p, i) => ({ ...p, is_winner: numericScores[i] === max }));
}

const labelClass = 'mb-1 block text-sm font-medium text-brand-navy';

export default function PlayForm({ games, players, initialValues, submitLabel, onSubmit, onCancel }) {
  const [gameId, setGameId] = useState(initialValues ? String(initialValues.game_id) : '');
  const [playedAt, setPlayedAt] = useState(
    initialValues ? initialValues.played_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [participants, setParticipants] = useState(
    initialValues
      ? initialValues.participants.map((p) => ({
          player_id: String(p.player_id),
          score: p.score ?? '',
          is_winner: p.is_winner,
        }))
      : [emptyParticipant()]
  );
  const [autoWinnerMode, setAutoWinnerMode] = useState(!initialValues);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const gameOptions = games.map((g) => ({ value: String(g.id), label: g.name }));
  const playerOptions = players.map((p) => ({ value: String(p.id), label: p.name }));

  function updateParticipantScore(index, score) {
    setParticipants((prev) => {
      const next = prev.map((p, i) => (i === index ? { ...p, score } : p));
      return autoWinnerMode ? recomputeWinners(next) : next;
    });
  }

  function updateParticipantPlayer(index, player_id) {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, player_id } : p)));
  }

  function toggleParticipantWinner(index) {
    setAutoWinnerMode(false);
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, is_winner: !p.is_winner } : p)));
  }

  function addParticipantRow() {
    setParticipants((prev) => [...prev, emptyParticipant()]);
  }

  function removeParticipantRow(index) {
    setParticipants((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return autoWinnerMode ? recomputeWinners(next) : next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const validParticipants = participants.filter((p) => p.player_id);
    if (!gameId || validParticipants.length === 0) {
      setError('Bitte ein Spiel und mindestens einen Teilnehmer auswählen.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        game_id: Number(gameId),
        played_at: playedAt,
        notes: notes || null,
        participants: validParticipants.map((p) => ({
          player_id: Number(p.player_id),
          score: p.score === '' ? null : Number(p.score),
          is_winner: p.is_winner,
        })),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div>
        <label className={labelClass}>Spiel</label>
        <SearchableSelect options={gameOptions} value={gameId} onChange={setGameId} placeholder="Spiel suchen..." />
      </div>

      <div>
        <label className={labelClass}>Datum</label>
        <input
          type="date"
          value={playedAt}
          onChange={(e) => setPlayedAt(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div>
        <label className={labelClass}>Notizen</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="optional"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none"
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-brand-navy">Teilnehmer</h2>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
              <div className="min-w-[8rem] flex-1">
                <SearchableSelect
                  options={playerOptions}
                  value={participant.player_id}
                  onChange={(value) => updateParticipantPlayer(index, value)}
                  placeholder="Spieler suchen..."
                />
              </div>
              <input
                type="number"
                placeholder="Punkte"
                value={participant.score}
                onChange={(e) => updateParticipantScore(index, e.target.value)}
                className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none"
              />
              <label className="flex items-center gap-1.5 text-sm text-brand-navy">
                <input
                  type="checkbox"
                  checked={participant.is_winner}
                  onChange={() => toggleParticipantWinner(index)}
                  className="h-4 w-4 accent-brand-orange"
                />
                Gewinner
              </label>
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipantRow(index)}
                  aria-label="Teilnehmer entfernen"
                  className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addParticipantRow}
          className="mt-2 flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-200"
        >
          <Plus size={16} /> Teilnehmer
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-brand-orange py-2.5 font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-brand-navy hover:bg-gray-200"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
