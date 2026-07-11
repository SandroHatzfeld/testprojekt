import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../db/schema.sql');

export async function runMigrations() {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const connection = await mysql.createConnection({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    multipleStatements: true,
  });
  try {
    await connection.query(schemaSql);
    console.log('Datenbankschema geprüft/angewendet.');
  } finally {
    await connection.end();
  }
}
