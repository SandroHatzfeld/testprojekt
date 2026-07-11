import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import playsRouter from './routes/plays.js';
import leaderboardRouter from './routes/leaderboard.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/players', playersRouter);
app.use('/api/plays', playsRouter);
app.use('/api/leaderboard', leaderboardRouter);

app.use((err, req, res, next) => {
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({ error: 'Eintrag wird noch referenziert und kann nicht gelöscht werden.' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Eintrag existiert bereits.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
