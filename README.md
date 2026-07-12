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

**Für Mitwirkende:** Bei jeder Änderung, die das Add-on betrifft (`config.yaml`,
`Dockerfile`, `server/`, `client/`), muss `version` in `config.yaml` erhöht
werden. Home Assistant erkennt ein Update nur über eine geänderte Versionsnummer
— ohne Bump zeigt der Add-on Store keine verfügbare Aktualisierung an. Dabei
auch `CHANGELOG.md` um einen Eintrag zur neuen Version ergänzen — Home
Assistant zeigt diese Datei direkt im **Changelog**-Tab des Add-ons an.

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
6. Die App erscheint danach als eigenes Panel in der Home-Assistant-Sidebar
   (Würfel-Icon) — kein separater Port, kein „OPEN WEB UI"-Button nötig

Die App läuft über **HA-Ingress** eingebettet in die Home-Assistant-Oberfläche,
nicht über einen offenen Port. Das funktioniert sowohl lokal im Heimnetz als
auch remote (z.B. über Nabu Casa), weil der Zugriff über dieselbe
authentifizierte Verbindung läuft wie Home Assistant selbst — anders als bei
einem festen Port, den z.B. Nabu Casa nicht weiterleitet. Nebeneffekt: Die App
ist nicht mehr unauthentifiziert im lokalen Netzwerk erreichbar, sondern nur
für eingeloggte HA-Nutzer.

Standardmäßig sehen nur **Admin-Nutzer** das Add-on in der Sidebar. Damit auch
andere Haushaltsmitglieder Zugriff haben, in `config.yaml` `panel_admin: false`
setzen.

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
