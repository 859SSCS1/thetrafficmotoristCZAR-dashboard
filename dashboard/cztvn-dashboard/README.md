# CZTVN Dashboard

A living-data desktop app for CZTVN: a composed-grid view of live congestion, an **owned** incident archive, and the auto-print **Daily Road Card** — a few pertinent stats, beautifully rendered — sent to screen, file, or printer on a schedule.

Build-in-public under [`github.com/859SSCS1`](https://github.com/859SSCS1) · DJWZ Coding · DJWZ Holdings LLC.

> **New here?** Read `BUILD-PLAYBOOK.md` — it walks you from zero to a running app, and then to a `.exe`, assuming no prior experience.

---

## What it does

- **The face (for streams):** a Leaflet map with TomTom's live congestion overlay, stat panels (congestion, incident count, worst incident), and a scrolling incident ticker. Navy-and-gold, OBS-ready.
- **The memory (owned):** every 511 incident it fetches is appended to a local archive (`data/archive/*.jsonl`) — data you're allowed to keep. Rented API data (TomTom) is streamed live and never stored.
- **The marquee (auto-print):** on time + place triggers, it renders a **Daily Road Card** for a state — a handful of stats on a hand-built SVG design — and sends it to any of three destinations: an on-screen featured panel, a saved PDF/PNG, and a physical printer. Day-one states: **Georgia, Tennessee, Ohio, Florida** (Georgia fully wired as the example).

A preview of the card lives at `docs/daily-road-card.preview.png`.

## The Live Board (second mode)

The Data view analyzes; the **Live Board** broadcasts. Open it from the header button (⤢ Live Board) — it launches in its own window, so you can put the board on your stream capture and keep the Data view on a second monitor.

- **The wall** — a tile per metro (Atlanta, Nashville, Columbus, Orlando), each a live congestion mini-map, that **self-sorts by heat**: the worst congestion (and any Speeder Watch hit) floats to the top.
- **Instant jump** — type a city, or press `1`–`4`, and you're full-screen on it in under a second. Built for on-air speed.
- **The city view** — a **camera hero** (auto-refreshing DOT snapshot) with the live congestion **map beside it**, a corridor carousel (`Space` = next), and a broadcast **chyron** (city · corridor · flow · limit reference).
- **Traffic Channel** (`C`) — auto-rotates through cities and corridors, hot-list first. Dead-air insurance that runs itself.
- **Speeder Watch** — flags corridors where the **aggregate flow** speed runs above the reference limit (weighted up near caution zones), auto-surfacing them with a banner. It is flow-speed only and **never identifies an individual vehicle** — monitor the driving, not the driver.

Cameras and per-corridor points live in `config/states.json` under each state's `corridors`. Blank `cameraUrl` falls back to the live map, so the board runs before cameras are wired.

## Architecture

| Part | Folder | Role |
| --- | --- | --- |
| **Main** | `electron/main.js` | Holds keys, runs the scheduler, orchestrates cards, talks to the UI over IPC. |
| **Sources** | `electron/sources/` | `tomtom.js` (rented live), `incidents.js` (ownable 511), `fuel.js` (stub → EIA). |
| **Archive** | `electron/archive.js` | Append-only JSONL store of the ownable feeds. |
| **Scheduler** | `electron/scheduler.js` | Cron triggers for the auto-print cards. |
| **Render** | `electron/render/` | `cardTemplate.js` (the beautiful card) + `renderCard.js` (→ PNG/PDF/printer). |
| **Live Board** | `electron/live/board.js` + `sources/cameras.js` | Builds the heat-sorted board model and the aggregate Speeder Watch. |
| **Data face** | `renderer/index.html` `styles.css` `app.js` | The composed-grid analysis dashboard. |
| **Live face** | `renderer/live.html` `live.css` `live.js` | The broadcast board: wall, city view, channel. |
| **Config** | `config/states.json` | Per-state endpoints, map centers, and the card schedule. |

The UI never touches keys or the filesystem — it asks the main process through a locked `preload` bridge.

## The ownership model (this is the point)

- **Shell → open-source.** The app code is yours to publish under `859SSCS1`.
- **Core → proprietary.** The archive, the templates, the scheduling logic, and future CMMD capture.
- **Live edge → rented.** TomTom is streamed, never stored — access, not ownership.

That's the license-correct version of "a proprietary operating system of living data." See `LICENSE-NOTE.md`.

## How this maps to the Data Ladder

This app is Section V of *The Data Ladder* made real. It's built entirely on **Rung 1** dev-tier sources (TomTom + state 511), it archives only the **ownable** feeds, and shipping it as a public build is the first certified line in the `859SSCS1` Build Register.

## Quick start (the short version)

```bash
npm install
cp .env.example .env      # then paste your free TomTom key into .env
npm start                 # runs the app in dev
npm run dist:win          # builds the Windows .exe into dist/
```

Full detail, wiring the other states, and troubleshooting are in **`BUILD-PLAYBOOK.md`**.
