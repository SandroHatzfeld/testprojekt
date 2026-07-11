import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('INSERT INTO players (name) VALUES (?)', [name]);
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Spieler nicht gefunden.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE players SET name = ? WHERE id = ?', [name, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM players WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Spieler nicht gefunden.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM players WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
