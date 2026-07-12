import { useEffect, useState } from 'react';
import { Dice5, Clock3 } from 'lucide-react';
import { getJSON } from '../api.js';

const COMPLEXITY_OPTIONS = [
  { value: 'leicht', label: 'Leicht' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'schwer', label: 'Schwer' },
];

const DURATION_PRESETS = [
  { key: 'kurz', label: 'Kurz<br>(<=30)', min: '', max: '30' },
  { key: 'mittel', label: 'Mittel <br>(30–75)', min: '30', max: '75' },
  { key: 'lang', label: 'Lang<br>(>=75)', min: '75', max: '' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-orange focus:outline-none';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500';

function filterGames(games, { durationMin, durationMax, complexitySet, playCountMin, playCountMax }) {
  return games.filter((g) => {
    if (durationMin !== '' && (g.duration_minutes == null || g.duration_minutes <= Number(durationMin))) return false;
    if (durationMax !== '' && (g.duration_minutes == null || g.duration_minutes >= Number(durationMax))) return false;
    if (complexitySet.size > 0 && (!g.complexity || !complexitySet.has(g.complexity))) return false;
    if (playCountMin !== '' && g.play_count < Number(playCountMin)) return false;
    if (playCountMax !== '' && g.play_count > Number(playCountMax)) return false;
    return true;
  });
}

function isRarelyPlayed(game) {
  if (!game.last_played_at) return true;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return new Date(game.last_played_at) < oneMonthAgo;
}

function pickRandom(list) {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

const COMPLEXITY_LABELS = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };

export default function SuggestionPage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [durationMin, setDurationMin] = useState('');
  const [durationMax, setDurationMax] = useState('');
  const [activeDurationPreset, setActiveDurationPreset] = useState(null);
  const [complexitySet, setComplexitySet] = useState(() => new Set());
  const [playCountMin, setPlayCountMin] = useState('');
  const [playCountMax, setPlayCountMax] = useState('');
  const [pickedGame, setPickedGame] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(null);

  useEffect(() => {
    getJSON('/games').then(setGames).catch((err) => setError(err.message));
  }, []);

  function applyDurationPreset(preset) {
    if (activeDurationPreset === preset.key) {
      setActiveDurationPreset(null);
      setDurationMin('');
      setDurationMax('');
    } else {
      setActiveDurationPreset(preset.key);
      setDurationMin(preset.min);
      setDurationMax(preset.max);
    }
  }

  function handleManualDurationChange(setter, value) {
    setActiveDurationPreset(null);
    setter(value);
  }

  function toggleComplexity(value) {
    setComplexitySet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const filters = { durationMin, durationMax, complexitySet, playCountMin, playCountMax };
  const filteredGames = filterGames(games, filters);

  function handlePickRandom() {
    const game = pickRandom(filteredGames);
    setPickedGame(game);
    setEmptyMessage(game ? null : 'Keine passenden Spiele gefunden.');
  }

  function handlePickRarelyPlayed() {
    const candidates = filteredGames.filter(isRarelyPlayed);
    const game = pickRandom(candidates);
    setPickedGame(game);
    setEmptyMessage(game ? null : 'Keine wenig gespielten Spiele im aktuellen Filter.');
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-brand-navy">Vorschlag</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <span className={labelClass}>Spieldauer (Min.)</span>
          <div className="mb-2 flex gap-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyDurationPreset(preset)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  activeDurationPreset === preset.key
                    ? 'bg-brand-orange text-white'
                    : 'bg-gray-100 text-brand-navy hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="Von"
              value={durationMin}
              onChange={(e) => handleManualDurationChange(setDurationMin, e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="Bis"
              value={durationMax}
              onChange={(e) => handleManualDurationChange(setDurationMax, e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Komplexität</span>
          <div className="flex gap-2">
            {COMPLEXITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleComplexity(opt.value)}
                className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  complexitySet.has(opt.value)
                    ? 'bg-brand-orange text-white'
                    : 'bg-gray-100 text-brand-navy hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>Anzahl Partien</span>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="Von"
              value={playCountMin}
              onChange={(e) => setPlayCountMin(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="Bis"
              value={playCountMax}
              onChange={(e) => setPlayCountMax(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">{filteredGames.length} Spiel(e) passen zu den Filtern</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={handlePickRandom}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-orange py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark"
        >
          <Dice5 size={16} /> Zufällig wählen
        </button>
        <button
          type="button"
          onClick={handlePickRarelyPlayed}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-navy py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light"
        >
          <Clock3 size={16} /> Wenig gespielt wählen
        </button>
      </div>

      {emptyMessage && <p className="text-sm text-gray-500">{emptyMessage}</p>}

      {pickedGame && (
        <div className="rounded-2xl bg-brand-navy p-4 text-white shadow-sm">
          <div className="text-xs uppercase tracking-wide text-white/60">Vorschlag</div>
          <div className="text-lg font-bold">{pickedGame.name}</div>
          <div className="mt-1 text-sm text-white/80">
            {[
              pickedGame.duration_minutes != null ? `${pickedGame.duration_minutes} Min` : null,
              pickedGame.complexity ? COMPLEXITY_LABELS[pickedGame.complexity] : null,
              `${pickedGame.play_count}× gespielt`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      )}
    </div>
  );
}
