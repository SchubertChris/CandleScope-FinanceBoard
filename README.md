# 💻 Finanzübersichtsboard (Electron)

## Projektziel

* Desktop-App für **Windows 11**, **macOS**
* Übersicht über Finanzen: Dashboard, Umsätze, Jahresübersicht, Verträge
* Fokus: **Einfach, schnell, stabil**, offline-fähig

---

## Technologie-Stack

| Bereich              | Technologie / Tool                               |
| -------------------- | ------------------------------------------------ |
| Framework            | Electron 26+                                     |
| UI                   | React + TailwindCSS (oder Vanilla JS + HTML/CSS) |
| State Management     | Redux oder Zustand (optional)                    |
| Datenbank / Speicher | SQLite (lokal) oder JSON für erste Version       |
| Build / Packaging    | Electron Builder                                 |
| Charts / Diagramme   | Recharts oder Chart.js                           |
| Version Control      | Git + GitHub                                     |

> Hinweis: Mobile-Wrapper später; aktuell Fokus auf Desktop (Windows/macOS).

---

## Projektstruktur

```
/src
 ├─ main.js             # Electron main process
 ├─ preload.js          # Bridge main ↔ renderer
 ├─ renderer/
 │    ├─ index.html
 │    ├─ app.js          # React/Vanilla JS entry
 │    ├─ components/
 │    │    ├─ Dashboard.jsx
 │    │    ├─ Umsätze.jsx
 │    │    ├─ Jahresübersicht.jsx
 │    │    └─ Verträge.jsx
 │    └─ styles/
 │         └─ tailwind.css
 └─ db/
      └─ finance.db       # SQLite-Datenbank
```

---

## Features & Umsetzung

### 1. Übersicht (Dashboard)

* Aktuelles Guthaben nach Fixkosten
* Monatsdurchschnitt (Einnahmen/Ausgaben)
* Neue Konten hinzufügen
* Ampelanzeige oder Diagramm
  **Technik:** React-Komponente + SQLite-Abfragen

### 2. Umsätze

* Alle Buchungen nach Datum, Kategorie, Konto
* Manuelles Hinzufügen von Buchungen
* Wiederkehrende Zahlungen markieren
  **Technik:** CRUD-Funktionen + SQLite + React Table

### 3. Jahresübersicht

* Filter nach Monat/Jahr
* Einnahmen vs. Ausgaben Diagramme
* Durchschnittswerte, Trends, Peaks
  **Technik:** Chart.js/Recharts + DB-Abfragen

### 4. Verträge / Abonnements

* Vertragsname, Start/Ende, Betrag, Notizen
* Optional: Erinnerungen (Electron Notifications)
  **Technik:** SQLite + Notifications

---

## Build & Packaging

### Windows

```bash
npm run build
electron-builder --win
```

Erzeugt `.exe` + Installer.

### macOS

```bash
npm run build
electron-builder --mac
```

Erzeugt `.dmg` + notarized App.

### Linux (optional)

```bash
electron-builder --linux
```

---

## Minimaler Entwicklungsplan

| Schritt | Aufgabe                                 | Zeitrahmen |
| ------- | --------------------------------------- | ---------- |
| 1       | Electron + React Setup                  | 1 Tag      |
| 2       | DB-Struktur (Konten, Umsätze, Verträge) | 1 Tag      |
| 3       | Dashboard / Übersicht                   | 1-2 Tage   |
| 4       | Umsätze CRUD + Tabellen                 | 2 Tage     |
| 5       | Jahresübersicht + Diagramme             | 1-2 Tage   |
| 6       | Verträge + Notizen                      | 1-2 Tage   |
| 7       | Packaging + Installer                   | 1 Tag      |
| 8       | Testen + Bugfixing                      | 2-3 Tage   |

---

## Hinweise für Massentauglichkeit

* Sensible Daten verschlüsseln (optional)
* SQLite lokal → offline + schnell
* Responsive UI für verschiedene Fenstergrößen
* Installer + portable Version für Windows
* Minimalistische UI → schnelle Orientierung
* Logging & Fehlerbehandlung

---

## Nächste Schritte

1. Electron + React Setup starten
2. SQLite-Datenbank anlegen
3. Dashboard implementieren
4. Umsätze, Jahresübersicht, Verträge nacheinander hinzufügen
5. Packaging & Testing

> Optional: Später mobile Portierung über React Native / Capacitor




!!!!!!!!!!!!!!!!!!!!!!

FOR RESET 

 rm -rf "$APPDATA/candlescope-financeboard"

!!!!!!!!!!!!!!!!!!!!!!
