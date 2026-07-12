import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../db/schema.sql');

function explainConnectionError(err) {
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return `Verbindung zu ${config.dbHost}:${config.dbPort} nicht möglich. Prüfe, ob db_host/db_port korrekt sind und die Datenbank (z.B. das MariaDB-Add-on) läuft und erreichbar ist.`;
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return `Login als '${config.dbUser}' bei ${config.dbHost} wurde abgelehnt. Prüfe, ob dieser Nutzer/diese Datenbank in der MariaDB-Konfiguration (Eintrag unter "databases") angelegt wurde und ob db_password exakt mit dem dort gesetzten Passwort übereinstimmt.`;
  }
  if (err.code === 'ER_BAD_DB_ERROR') {
    return `Datenbank '${config.dbName}' existiert nicht auf ${config.dbHost}. Lege sie in der MariaDB-Konfiguration an (Eintrag unter "databases") oder passe db_name an.`;
  }
  return null;
}

export async function runMigrations() {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      multipleStatements: true,
    });
    await connection.query(schemaSql);
    console.log('Datenbankschema geprüft/angewendet.');
  } catch (err) {
    const hint = explainConnectionError(err);
    if (hint) console.error(`Datenbankverbindung fehlgeschlagen: ${hint}`);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}
