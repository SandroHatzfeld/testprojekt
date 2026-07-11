import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

import { config } from './config.js';
import { runMigrations } from './migrate.js';
import gamesRouter from './routes/games.js';
import playersRouter from './routes/players.js';
import playsRouter from './routes/plays.js';
import leaderboardRouter from './routes/leaderboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/players', playersRouter);
app.use('/api/plays', playsRouter);
app.use('/api/leaderboard', leaderboardRouter);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

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

await runMigrations();
app.listen(config.port, () => {
  console.log(`Server läuft auf Port ${config.port}`);
});
