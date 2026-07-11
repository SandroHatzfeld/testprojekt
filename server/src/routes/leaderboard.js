import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name,
              COALESCE(SUM(pp.is_winner), 0) AS wins,
              COUNT(pp.id) AS games_played
       FROM players p
       LEFT JOIN play_participants pp ON pp.player_id = p.id
       GROUP BY p.id, p.name
       ORDER BY wins DESC, p.name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
