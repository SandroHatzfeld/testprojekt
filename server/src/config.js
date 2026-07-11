import fs from 'node:fs';
import dotenv from 'dotenv';

const HA_OPTIONS_PATH = '/data/options.json';

function loadHaOptions() {
  if (!fs.existsSync(HA_OPTIONS_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(HA_OPTIONS_PATH, 'utf8'));
  } catch (err) {
    console.error(`Konnte ${HA_OPTIONS_PATH} nicht lesen:`, err);
    return null;
  }
}

const haOptions = loadHaOptions();
if (!haOptions) dotenv.config();

function pick(haKey, envKey, fallback) {
  if (haOptions && haOptions[haKey] !== undefined) return haOptions[haKey];
  if (process.env[envKey] !== undefined) return process.env[envKey];
  return fallback;
}

export const config = {
  dbHost: pick('db_host', 'DB_HOST', 'localhost'),
  dbPort: Number(pick('db_port', 'DB_PORT', 3306)),
  dbUser: pick('db_user', 'DB_USER', 'boardgames'),
  dbPassword: pick('db_password', 'DB_PASSWORD', ''),
  dbName: pick('db_name', 'DB_NAME', 'boardgames'),
  port: Number(pick('port', 'PORT', 3001)),
  isHaAddon: haOptions !== null,
};
