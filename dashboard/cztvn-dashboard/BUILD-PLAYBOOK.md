# Build Playbook — CZTVN Dashboard

Zero to a running app, then to a `.exe`. Written for a beginner: every step is one action, and the wins are marked. You can hand any step to Claude Code verbatim.

> **What this project is:** complete, buildable source. It is *not* a pre-compiled `.exe` — you press the final build button on your own machine (Step 6). That last press is yours by design.

---

## Before you start — install Node.js

Node is the engine everything runs on.

1. Go to **nodejs.org** and install the **LTS** version (accept the defaults).
2. Open a terminal (on Windows: **PowerShell**) and confirm it worked:
   ```bash
   node --version
   npm --version
   ```
   Two version numbers = you're ready.

> **◆ Eureka:** Node is installed. Your machine can now build desktop apps. That capability didn't exist on it an hour ago.

---

## Step 1 — Get the project and its dependencies

1. Put this folder somewhere sensible (e.g. `Documents/cztvn-dashboard`).
2. In the terminal, move into it and install:
   ```bash
   cd path/to/cztvn-dashboard
   npm install
   ```
   This downloads Electron and the two small libraries into `node_modules/`. It takes a minute.

> **◆ Eureka:** the toolchain is assembled. Everything the app needs now lives in one folder.

---

## Step 2 — Add your free TomTom key

The live congestion layer needs one key. It's free.

1. Sign up at **developer.tomtom.com**, create an app, copy the **API key**.
2. In the project, copy `.env.example` to a new file named `.env`.
3. Paste your key:
   ```
   TOMTOM_API_KEY=paste_your_key_here
   ```
   `.env` is git-ignored — your key never gets committed.

> **◆ Eureka:** you hold your first live-data key, stored the safe way — in the app's engine, never in the page.

---

## Step 3 — Run it

```bash
npm start
```

The window opens: a dark map centered on Atlanta, stat panels, and a ticker. With the TomTom key in place, the roads color themselves with live congestion. The incident panels show **sample** Georgia data for now (Step 5 swaps in the real feed).

> **◆ Eureka:** the map is breathing. A desktop app you commissioned is showing live traffic. This is the proof-of-skill moment.

Tip: `npm run dev` opens the same thing with developer tools, so you (or Claude Code) can see logs.

---

## Step 4 — Fire a Road Card by hand

Click **Generate Road Card** (top right). The app pulls the current state's stats, renders the card, and:
- pops it up as a **featured panel** (the stream overlay),
- saves a **PNG and PDF** into an `out/` folder.

Open `out/` and you'll see them.

> **◆ Eureka:** you just produced a spectacular, few-stat dataset card — to screen and to file — from live data, on demand. The marquee feature works.

---

## Step 5 — Wire the real state feeds (GA, then TN, OH, FL)

Right now incidents are sample data. To go live, fill in each state's 511 endpoint in `config/states.json`.

1. Open `config/states.json`. Each state has an empty `"incidentsUrl": ""` and a `docsUrl` pointing to where its feed lives.
2. Start with **Georgia** (`docsUrl`: 511ga.org). Find its incident feed URL and paste it into `incidentsUrl`. If it needs a key, put the key in `.env` as `GA511_API_KEY` and use `{key}` in the URL where it belongs.
3. Restart the app. The incident panel, ticker, map markers, **and the archive** now use the real feed.
4. Repeat for **Tennessee, Ohio, Florida** — same shape, one field each. (Ohio's OHGO and Florida's FL511 both publish developer feeds; Tennessee's is via SmartWay/TDOT.)

The field-mapper in `electron/sources/incidents.js` handles the common feed shapes (array, `{incidents:[]}`, or GeoJSON). If a state names fields differently, adjust the mapper there — a good task to hand Claude Code with a sample of that feed's response.

> **◆ Eureka:** the first time `data/archive/ga.jsonl` gets a new line, the app stopped being a live window and became an archive with a memory. That file is the first data you genuinely **own**.

---

## Step 6 — Build the `.exe`

```bash
npm run dist:win
```

electron-builder packages everything into the `dist/` folder: an installer (`CZTVN Dashboard Setup.exe`) and a portable `.exe`. Double-click to run it like any Windows app — no terminal needed.

> **◆ Eureka:** it's an app now. A `.exe` with your name on it, built from your own repo. That's the release the `859SSCS1` Build Register points to.

---

## Turning on the scheduled auto-print

`config/states.json` → `schedule` controls the timed cards. Each entry is a cron expression (local time) and a state:

```json
{ "state": "GA", "cron": "0 7 * * *", "label": "GA morning card" }
```

`0 7 * * *` = every day at 7:00am. The four day-one states are pre-scheduled a few minutes apart. Set `destinations` to choose where each fires:

```json
"destinations": { "screen": true, "file": true, "printer": true }
```

Flip `printer` to `true` once you've confirmed the card looks right — it sends to your default printer.

---

## Using the Live Board (the stream view)

Click **⤢ Live Board** in the header — it opens in its own window (put this one on your stream capture).

- **The wall** shows your four metros, sorted worst-first. Press `1`–`4` or type a city name to jump full-screen instantly.
- In a city: `Space` cycles the corridor cameras, `Esc` goes back, `F` toggles fullscreen.
- Press `C` (or the button) for **Traffic Channel** — it auto-rotates through cities and corridors on its own.
- **Speeder Watch** lights up a corridor when the *aggregate flow* runs over its reference limit. It's flow-speed only — never an individual vehicle. Tune the trigger in `config/states.json` → `liveBoard.speeder.overRefPct`.

**Wiring cameras:** each corridor in `config/states.json` has a blank `cameraUrl`. Paste a DOT camera snapshot URL (Georgia 511 / OHGO / FL511 / TN SmartWay publish these) and it becomes the hero shot; leave it blank and the live map stands in. Adjust each corridor's `point` and `postedRef` (its reference speed limit) to taste — a good task to hand Claude Code with a state's camera list.

## Troubleshooting

- **Map is blank / no traffic colors** → the `TOMTOM_API_KEY` in `.env` is missing or wrong. The panel note will say so.
- **Packaged `.exe` shows no traffic** → the `.exe` doesn't bundle your keys. Copy your `.env` next to the `.exe`, or into `%APPDATA%\CZTVN Dashboard\`. (The packaged app also writes its archive and cards to `%APPDATA%\CZTVN Dashboard\` instead of the app folder.)
- **Card PNG is blank** → increase the settle delay in `electron/render/renderCard.js` (the `setTimeout` before capture), or set the hidden window `show: true` and move it off-screen. Beginner-safe: hand this line to Claude Code.
- **Incidents say "SAMPLE"** → that state's `incidentsUrl` is still empty (Step 5).
- **Build fails on native modules** → this project deliberately uses zero native dependencies to avoid that. If you add one (e.g. SQLite), you'll need `electron-rebuild`.
- **Build fails: `makensis.exe process failed ERR_ELECTRON_BUILDER_CANNOT_EXECUTE` (exit `3221225781` / `0xC0000135`)** → electron-builder's *bundled* NSIS compiler (cached at `%LOCALAPPDATA%\electron-builder\Cache\nsis\nsis-3.0.4.1`) can't run on some Windows machines (missing runtime). Fix by pointing electron-builder at an official NSIS instead:
  1. Download official NSIS 3.10 (nsis.sourceforge.io), extract it somewhere, e.g. `C:\tools\nsis-3.10`.
  2. Copy `elevate.exe` from the broken cache dir above into that NSIS folder (electron-builder expects it there).
  3. Build with the override env var set:
     ```bash
     ELECTRON_BUILDER_NSIS_DIR="C:\tools\nsis-3.10" npm run dist:win
     ```
  The `nsis.warningsAsErrors: false` in `package.json` is intentional — official NSIS emits a benign missing-Korean-langstring warning that would otherwise fail the build. This whole workaround is only needed on machines where the bundled makensis won't launch; a clean machine with a working bundled NSIS builds with a plain `npm run dist:win`.
- **Want a custom icon** → see `assets/README.txt`.

---

## The build-in-public loop

Each milestone above is a line for the Build Register under `859SSCS1`:

```
STUDY the gap → IMPLEMENT via Claude Code → CERTIFY the published build → log it
```

Publishing this repo, then tagging the first `.exe` release, is the first certified line. The agent writes the code; you direct it and own the record.
