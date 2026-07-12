CREATE TABLE IF NOT EXISTS players (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS games (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150) NOT NULL UNIQUE,
  description      VARCHAR(500) NULL,
  duration_minutes INT NULL,
  complexity       ENUM('leicht', 'mittel', 'schwer') NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Idempotent, damit bereits existierende Installationen (schema.sql läuft bei jedem
-- Start erneut) die neuen Spalten nachträglich bekommen; CREATE TABLE IF NOT EXISTS
-- oben greift dafür nicht, da die Tabelle dort schon existiert.
ALTER TABLE games ADD COLUMN IF NOT EXISTS duration_minutes INT NULL AFTER description;
ALTER TABLE games ADD COLUMN IF NOT EXISTS complexity ENUM('leicht', 'mittel', 'schwer') NULL AFTER duration_minutes;

CREATE TABLE IF NOT EXISTS plays (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  game_id    INT NOT NULL,
  played_at  DATE NOT NULL,
  notes      VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plays_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_plays_game_id (game_id),
  INDEX idx_plays_played_at (played_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS play_participants (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  play_id    INT NOT NULL,
  player_id  INT NOT NULL,
  score      INT NULL,
  is_winner  BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_participants_play
    FOREIGN KEY (play_id) REFERENCES plays(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_participants_player
    FOREIGN KEY (player_id) REFERENCES players(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uniq_play_player (play_id, player_id),
  INDEX idx_participants_player_id (player_id)
) ENGINE=InnoDB;
