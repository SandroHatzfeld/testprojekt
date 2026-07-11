import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO games (name, description) VALUES (?, ?)',
      [name, description ?? null]
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
    await pool.query(
      'UPDATE games SET name = ?, description = ? WHERE id = ?',
      [name, description ?? null, req.params.id]
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
