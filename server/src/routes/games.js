import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const VALID_COMPLEXITIES = ['leicht', 'mittel', 'schwer'];

function normalizeComplexity(value) {
  if (value === undefined || value === null || value === '') return null;
  if (!VALID_COMPLEXITIES.includes(value)) {
    const err = new Error(`Ungültige Komplexität. Erlaubt: ${VALID_COMPLEXITIES.join(', ')}.`);
    err.status = 400;
    throw err;
  }
  return value;
}

function normalizeDuration(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    const err = new Error('Spieldauer muss eine Zahl sein.');
    err.status = 400;
    throw err;
  }
  return num;
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT g.id, g.name, g.description, g.duration_minutes, g.complexity, g.created_at,
              COUNT(pl.id) AS play_count,
              MAX(pl.played_at) AS last_played_at
       FROM games g
       LEFT JOIN plays pl ON pl.game_id = g.id
       GROUP BY g.id, g.name, g.description, g.duration_minutes, g.complexity, g.created_at
       ORDER BY g.name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const duration_minutes = normalizeDuration(req.body.duration_minutes);
    const complexity = normalizeComplexity(req.body.complexity);
    const [result] = await pool.query(
      'INSERT INTO games (name, description, duration_minutes, complexity) VALUES (?, ?, ?, ?)',
      [name, description ?? null, duration_minutes, complexity]
    );
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Spiel nicht gefunden.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const duration_minutes = normalizeDuration(req.body.duration_minutes);
    const complexity = normalizeComplexity(req.body.complexity);
    await pool.query(
      'UPDATE games SET name = ?, description = ?, duration_minutes = ?, complexity = ? WHERE id = ?',
      [name, description ?? null, duration_minutes, complexity, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Spiel nicht gefunden.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM games WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id/plays', async (req, res, next) => {
  try {
    const [plays] = await pool.query(
      'SELECT * FROM plays WHERE game_id = ? ORDER BY played_at DESC, id DESC',
      [req.params.id]
    );
    if (plays.length === 0) return res.json([]);

    const [participants] = await pool.query(
      `SELECT pp.play_id, pp.score, pp.is_winner, p.id AS player_id, p.name AS player_name
       FROM play_participants pp
       JOIN players p ON p.id = pp.player_id
       WHERE pp.play_id IN (?)`,
      [plays.map((p) => p.id)]
    );

    const participantsByPlay = new Map();
    for (const row of participants) {
      if (!participantsByPlay.has(row.play_id)) participantsByPlay.set(row.play_id, []);
      participantsByPlay.get(row.play_id).push({
        player_id: row.player_id,
        player_name: row.player_name,
        score: row.score,
        is_winner: !!row.is_winner,
      });
    }

    res.json(
      plays.map((play) => ({
        ...play,
        participants: participantsByPlay.get(play.id) ?? [],
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
