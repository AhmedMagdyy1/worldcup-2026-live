# World Cup 2026 Live Tracker

A real-time World Cup 2026 dashboard built with Angular 20. Tracks live scores, group standings, the full knockout bracket, fixtures, and more — pulling live data from the ESPN public API.

![Angular](https://img.shields.io/badge/Angular-20-red?logo=angular) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript) ![PWA](https://img.shields.io/badge/PWA-ready-green)

---

## Features

- **Live Match Center** — real-time minute clock, possession stats, xG, and a live event timeline (goals, cards, VAR, substitutions)
- **Knockout Bracket** — full tournament tree graph from Round of 32 to the Final with SVG connector lines showing match progression. Uses live ESPN data.
- **Group Standings** — all 48 teams across 12 groups (A–L), updated from ESPN with a mock fallback
- **Schedule** — all 144 group-stage fixtures with date, status, and score. Filter by group or status.
- **Live Ticker** — scrolling event feed with goal flash animations
- **Team Comparison** — pick any two teams and compare stats side by side
- **Predictions** — pick winners for every group match and track your score, persisted to localStorage
- **⌘K Search** — command palette to find any team instantly (keyboard shortcut: `Cmd+K` / `Ctrl+K`)
- **Dark / Light Theme** — toggle from the settings page, persisted to localStorage
- **PWA** — installable on desktop and mobile, works offline with service worker caching

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components, signals, lazy routes) |
| Language | TypeScript 5 |
| Styles | SCSS + CSS custom properties (design tokens) |
| Data | ESPN public API (no API key required) |
| Offline | Angular Service Worker (`@angular/service-worker`) |
| Tests | Vitest via `@angular/build:unit-test` |
| Fonts | Hanken Grotesk + JetBrains Mono |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
git clone https://github.com/your-username/worldcup-2026-live.git
cd worldcup-2026-live
npm install
```

### Run locally

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### Build for production

```bash
npm run build
```

Output goes to `dist/worldcup-2026-live`. Deploy the contents of that folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

### Run tests

```bash
npm test
```

---

## Project Structure

```
src/
├── app/
│   ├── core/               # Models, API service, data service
│   ├── features/
│   │   ├── live/           # Live match center
│   │   ├── bracket/        # Knockout bracket tree
│   │   ├── standings/      # Group standings
│   │   ├── schedule/       # Fixture list
│   │   ├── compare/        # Team comparison
│   │   ├── predictions/    # Match predictions
│   │   ├── settings/       # Theme toggle
│   │   └── teams/          # Team list + team detail
│   ├── layout/             # Shell (topbar, sidebar, bottom nav)
│   └── shared/             # Search palette
├── styles.scss             # Global design tokens + animations
└── manifest.webmanifest    # PWA manifest
```

---

## Data Source

Live data is fetched from the ESPN public API — no API key required:

```
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
```

The app falls back to mock data if the API is unavailable or returns no results, so it always renders something meaningful.

---

## Screenshots

> Add screenshots here after deploying

---

## License

MIT
