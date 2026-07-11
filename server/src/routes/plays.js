import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

async function fetchPlayWithParticipants(conn, playId) {
  const [plays] = await conn.query('SELECT * FROM plays WHERE id = ?', [playId]);
  if (plays.length === 0) return null;
  const [participants] = await conn.query(
    `SELECT pp.score, pp.is_winner, p.id AS player_id, p.name AS player_name
     FROM play_participants pp
     JOIN players p ON p.id = pp.player_id
     WHERE pp.play_id = ?`,
    [playId]
  );
  return {
    ...plays[0],
    participants: participants.map((row) => ({
      player_id: row.player_id,
      player_name: row.player_name,
      score: row.score,
      is_winner: !!row.is_winner,
    })),
  };
}

router.get('/', async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : null;
    const sql =
      `SELECT plays.*, games.name AS game_name,
              (SELECT COUNT(*) FROM play_participants WHERE play_id = plays.id) AS participant_count
       FROM plays
       JOIN games ON games.id = plays.game_id
       ORDER BY played_at DESC, plays.id DESC` + (limit ? ' LIMIT ?' : '');
    const [rows] = await pool.query(sql, limit ? [limit] : []);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const play = await fetchPlayWithParticipants(pool, req.params.id);
    if (!play) return res.status(404).json({ error: 'Partie nicht gefunden.' });
    res.json(play);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { game_id, played_at, notes, participants } = req.body;
    if (!game_id || !played_at || !Array.isArray(participants) || participants.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'game_id, played_at und mindestens ein Teilnehmer sind erforderlich.' });
    }

    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO plays (game_id, played_at, notes) VALUES (?, ?, ?)',
      [game_id, played_at, notes ?? null]
    );
    const playId = result.insertId;

    for (const participant of participants) {
      await conn.query(
        'INSERT INTO play_participants (play_id, player_id, score, is_winner) VALUES (?, ?, ?, ?)',
        [playId, participant.player_id, participant.score ?? null, !!participant.is_winner]
      );
    }

    await conn.commit();
    const play = await fetchPlayWithParticipants(pool, playId);
    res.status(201).json(play);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.put('/:id', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { game_id, played_at, notes, participants } = req.body;
    if (!game_id || !played_at || !Array.isArray(participants) || participants.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'game_id, played_at und mindestens ein Teilnehmer sind erforderlich.' });
    }

    await conn.beginTransaction();
    const [existing] = await conn.query('SELECT id FROM plays WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Partie nicht gefunden.' });
    }

    await conn.query(
      'UPDATE plays SET game_id = ?, played_at = ?, notes = ? WHERE id = ?',
      [game_id, played_at, notes ?? null, req.params.id]
    );
    await conn.query('DELETE FROM play_participants WHERE play_id = ?', [req.params.id]);
    for (const participant of participants) {
      await conn.query(
        'INSERT INTO play_participants (play_id, player_id, score, is_winner) VALUES (?, ?, ?, ?)',
        [req.params.id, participant.player_id, participant.score ?? null, !!participant.is_winner]
      );
    }

    await conn.commit();
    const play = await fetchPlayWithParticipants(pool, req.params.id);
    res.json(play);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM plays WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
