# Brettspiele-Tracker

Kleine App, um Brettspielabende zu tracken: wer hat wann was gespielt, mit
welcher Punktzahl, wer hat gewonnen. Spiele- und Spielerlisten sind über die
Weboberfläche pflegbar, eine Übersichtsseite zeigt die Siege pro Spieler, und
jedes Spiel ist anklickbar für seine Partien-Historie.

## Architektur

- `server/` — Node.js/Express REST-API, Datenhaltung in MySQL
- `client/` — React-Frontend (Vite)
- `docker-compose.yml` — MySQL 8 als Docker-Container für den eigenen Server

## MySQL starten

Im Repo-Root eine `.env` anlegen (nicht eingecheckt):

```
DB_PASSWORD=<beliebiges_passwort>
DB_ROOT_PASSWORD=<beliebiges_root_passwort>
```

Dann:

```
docker compose up -d
```

Das Schema (`server/db/schema.sql`) wird beim allerersten Start automatisch
angewendet (leeres Volume). Bei einem bereits existierenden Volume muss das
Schema ggf. manuell nachgezogen werden:

```
docker compose exec -T mysql mysql -uroot -p"$DB_ROOT_PASSWORD" boardgames < server/db/schema.sql
```

## Backend starten

```
cd server
cp .env.example .env   # DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME/PORT eintragen
npm install
npm run dev
```

Läuft standardmäßig auf `http://localhost:3001`.

## Frontend starten

```
cd client
npm install
npm run dev
```

Läuft standardmäßig auf `http://localhost:5173` und proxied `/api` an das
Backend.

## Produktion

Frontend bauen (`npm run build` in `client/`) und die statischen Dateien aus
`client/dist` z.B. über einen Reverse Proxy oder direkt über Express
ausliefern lassen.
