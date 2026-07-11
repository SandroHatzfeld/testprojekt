# Brettspiele-Tracker

Kleine App, um Brettspielabende zu tracken: wer hat wann was gespielt, mit
welcher Punktzahl, wer hat gewonnen. Spiele- und Spielerlisten sind über die
Weboberfläche pflegbar, eine Übersichtsseite zeigt die Siege pro Spieler, und
jedes Spiel ist anklickbar für seine Partien-Historie.

## Architektur

- `server/` — Node.js/Express REST-API, Datenhaltung in MySQL
- `client/` — React-Frontend (Vite)
- `config.yaml` / `Dockerfile` (Repo-Root) — Home-Assistant-Add-on-Paket, siehe unten

Die App läuft produktiv als **Home Assistant Add-on**, verbunden mit einer
separat installierten MariaDB-Instanz (z.B. dem offiziellen „MariaDB"-Add-on).
Für lokale Entwicklung/Tests läuft sie weiterhin ganz normal über `npm run dev`
gegen eine beliebige MySQL-Instanz, konfiguriert per `.env`.

Die Konfiguration (`server/src/config.js`) erkennt automatisch, in welcher
Umgebung die App läuft: Existiert `/data/options.json` (Home-Assistant-Add-on),
werden die Werte von dort gelesen; sonst wird `.env` verwendet.

## Backend starten

Voraussetzung: eine erreichbare MySQL- oder MariaDB-Instanz (lokal installiert
oder anderweitig gehostet) für die lokale Entwicklung.

```
cd server
cp .env.example .env   # DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME/PORT eintragen
npm install
npm run dev
```

Das Datenbankschema wird beim Start automatisch angewendet, kein manueller
Schritt nötig. Läuft standardmäßig auf `http://localhost:3001`.

## Frontend starten

```
cd client
npm install
npm run dev
```

Läuft standardmäßig auf `http://localhost:5173` und proxied `/api` an das
Backend.

## Betrieb als Home-Assistant-Add-on

Voraussetzung: eine MariaDB-Instanz auf demselben HAOS-Gerät, z.B. das
offizielle **„MariaDB"**-Add-on (falls noch nicht installiert: im Add-on
Store bzw. „App Store" suchen und installieren, dort eine Datenbank/einen
Nutzer anlegen). Der interne Hostname dieses Add-ons für andere Add-ons ist
in der Regel `core-mariadb` — den genauen Namen zeigt das MariaDB-Add-on
selbst in seinen Infos an.

1. In Home Assistant: **Einstellungen → Add-ons → Add-on Store** (neuere
   Versionen: **Apps → App Store**) → Menü oben rechts → **Repositories**
2. Dieses GitHub-Repo als URL hinzufügen:
   `https://github.com/SandroHatzfeld/BoardgameTracker`
3. „Brettspiele-Tracker" in der Liste suchen und installieren
4. Im **Konfiguration**-Tab des Add-ons `db_host`, `db_port`, `db_user`,
   `db_password`, `db_name` passend zur MariaDB-Instanz eintragen
5. Add-on starten — das Datenbankschema wird beim Start automatisch angelegt,
   kein manueller Schritt nötig
6. Über den Button **„OPEN WEB UI"** bzw. `http://homeassistant.local:3001`
   öffnen (Port ggf. im **Info**-Tab des Add-ons anpassen)

Die App läuft dabei als ein einzelner Container ohne HA-Ingress, d.h. sie ist
über einen festen Port erreichbar statt über die HA-Oberfläche eingebettet zu
sein — für eine kleine App im Heimnetz ausreichend und deutlich einfacher als
eine Ingress-Integration.
