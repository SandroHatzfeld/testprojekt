# Changelog

## 1.3.2

- Dauer-Schnellfilter überarbeitet: Kurz/Mittel/Lang sind jetzt lückenlos
  und überschneidungsfrei (Kurz <30, Mittel 30–75 inklusive, Lang >75) —
  Spiele mit genau 30 oder 75 Minuten fielen vorher durch alle drei Filter
- Zeilenumbruch in den Filter-Buttons korrigiert (war zuvor als Text
  "<br>" sichtbar statt als echter Umbruch)

## 1.3.1

- Datumsanzeige jetzt als DD.MM.YY statt YYYY-MM-DD
- Spiele-Liste: Beschreibung nicht mehr als eigene Spalte, steht jetzt
  zwischen Spielname und den Attributen (Dauer/Komplexität/Partienzahl)
- Vorschlag-Seite: Schnellfilter-Buttons für die Spieldauer (Kurz <30 Min,
  Mittel 30–75 Min, Lang >75 Min)

## 1.3.0

- "Neue Partie" jetzt über einen Floating-Action-Button (unten rechts) statt
  eigenem Tab erreichbar
- Spiel- und Spielerauswahl beim Erfassen einer Partie als durchsuchbares
  Auswahlfeld statt Dropdown
- Gewinner wird beim Eintragen der Punkte automatisch anhand der höchsten
  Punktzahl vorausgewählt, bleibt aber manuell überschreibbar
- Übersicht komplett überarbeitet: Spiele mit Datum der letzten Partie,
  ausklappbare Partien-Historie inkl. Bearbeiten/Löschen einzelner Partien
  (ersetzt die bisherige Sieg-Rangliste und die separate Spiel-Detailseite)
- Spiele haben jetzt Spieldauer und Komplexität (leicht/mittel/schwer),
  außerdem wird die Anzahl der Partien pro Spiel angezeigt
- Neue "Vorschlag"-Seite (zweiter Tab): Filter nach Dauer, Komplexität und
  Partienzahl, dazu "Zufällig wählen" und "Wenig gespielt wählen"
  (Spiele, die seit über einem Monat nicht gespielt wurden)

## 1.2.0

- Neues UI-Design auf Basis von Tailwind CSS mit den druckf3ld-Markenfarben
- Navigation als untere Tab-Leiste mit Icons, aktiver Tab durch Kontur oben markiert
- Startseite ist jetzt "Neue Partie" statt der Übersicht
- Kleine Icon-Buttons zum Bearbeiten/Löschen in den Listen
- Durchgängig abgerundete Ecken (8–16px)

## 1.1.0

- Umstieg auf Home Assistant Ingress statt festem Port — die App ist jetzt
  als Panel in der HA-Sidebar erreichbar, sowohl lokal als auch remote (z.B.
  über Nabu Casa)
- Kein offener, unauthentifizierter Port im lokalen Netzwerk mehr

## 1.0.0

- Erste Version des Add-ons
- Automatische Anwendung des Datenbankschemas beim Start
- Verständlichere Fehlermeldungen bei Datenbank-Verbindungsproblemen
  (falscher Host, falsche Zugangsdaten, fehlende Datenbank)
