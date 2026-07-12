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
Store bzw. „App Store" suchen und installieren). Der interne Hostname dieses
Add-ons für andere Add-ons ist in der Regel `core-mariadb` — den genauen
Namen zeigt das MariaDB-Add-on selbst in seinen Infos an.

**Wichtig:** Das MariaDB-Add-on legt Datenbank und Nutzer nicht automatisch
an. Im **Konfiguration**-Tab des MariaDB-Add-ons muss unter `databases` ein
Eintrag angelegt werden, z.B.:

```yaml
databases:
  - database: boardgames
    username: boardgames
    password: <ein_passwort_deiner_wahl>
```

1. In Home Assistant: **Einstellungen → Add-ons → Add-on Store** (neuere
   Versionen: **Apps → App Store**) → Menü oben rechts → **Repositories**
2. Dieses GitHub-Repo als URL hinzufügen:
   `https://github.com/SandroHatzfeld/BoardgameTracker`
3. „Brettspiele-Tracker" in der Liste suchen und installieren
4. Im **Konfiguration**-Tab des Add-ons `db_host`, `db_port`, `db_user`,
   `db_password`, `db_name` eintragen — **exakt passend** zu dem Eintrag, der
   oben im MariaDB-Add-on angelegt wurde
5. Add-on starten — das Datenbankschema wird beim Start automatisch angelegt,
   kein manueller Schritt nötig
6. Über den Button **„OPEN WEB UI"** bzw. `http://homeassistant.local:3001`
   öffnen (Port ggf. im **Info**-Tab des Add-ons anpassen)

Die App läuft dabei als ein einzelner Container ohne HA-Ingress, d.h. sie ist
über einen festen Port erreichbar statt über die HA-Oberfläche eingebettet zu
sein — für eine kleine App im Heimnetz ausreichend und deutlich einfacher als
eine Ingress-Integration.

### Fehlerbehebung

Fehler erscheinen im **Log**-Tab des Add-ons.

- **`ETIMEDOUT` / `ECONNREFUSED` / `ENOTFOUND`**: Die App kommt nicht bis zur
  Datenbank durch. Prüfe, ob `db_host`/`db_port` korrekt sind und das
  MariaDB-Add-on läuft.
- **`Access denied for user ... (using password: YES)`**
  (`ER_ACCESS_DENIED_ERROR`): Die Verbindung klappt, aber Login schlägt fehl.
  Häufigste Ursache: Der Nutzer wurde im MariaDB-Add-on nicht unter
  `databases` angelegt, oder `db_password` im Brettspiele-Tracker-Add-on
  stimmt nicht mit dem dort gesetzten Passwort überein.
- **`Unknown database` / `ER_BAD_DB_ERROR`**: `db_name` verweist auf eine
  Datenbank, die im MariaDB-Add-on noch nicht existiert — ebenfalls über
  `databases` dort anlegen.
