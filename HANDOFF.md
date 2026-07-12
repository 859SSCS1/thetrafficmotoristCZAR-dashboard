# HANDOFF — Building This With Claude Code

**New here? Warm the agent up first — see `WARMUP.md`, then come back.**

**Start here.** This bundle is scaffolded source plus specs. Hand Claude Code **one task at a time, in order**. For each task: point it at the working directory, name the spec, paste the first prompt.

## The rule of thumb

- **Source in the working directory** — open the folder for the task.
- **Spec as reference** — the named PDF or README for that task.
- **One clear job at a time** — "get this running, then wire that," never "build the empire."
- **Keys ready** — the one thing no scaffold can supply (checklist at the bottom).

---

## Task 1 — The Dashboard *(do this first — it's the flagship)*

- **Working dir:** `dashboard/cztvn-dashboard/`
- **Spec:** its own `BUILD-PLAYBOOK.md` + `README.md` (written for exactly this handoff)
- **Also give it:** your `.env` with a real TomTom key · `documents/The-Data-Ladder-*.pdf` as source background
- **What's genuinely left:** wire the real state 511 endpoints (blank in `config/states.json`, with doc links) · confirm live TomTom calls parse · the blank-PNG capture fix if it appears · package to `.exe` on your machine
- **First prompt:**
  > "This is a scaffolded Electron app. Read BUILD-PLAYBOOK.md, run `npm install` and `npm start` with my TomTom key, fix any errors until the map shows live traffic, then help me wire Georgia 511's real incident feed into config/states.json."

## Task 2 — The Contributor Grid *(after the dashboard runs)*

- **Spec:** `documents/The-Contributor-Grid-CMMD-GRID-2026-0711.pdf` — **this IS the build-spec** (MediaMTX, stream keys, HLS/WebRTC, Live Board integration, blur/consent)
- **Working dir:** the same dashboard folder (the grid plugs into the Live Board's `cameraUrl`)
- **What's left:** stand up MediaMTX · the `hls.js` hero · then the harder part, server-side blur + the consent flow. **Stage it:** live-view-only first, blur-plus-record second.
- **First prompt:**
  > "Following the Contributor Grid spec, stand up MediaMTX locally, issue one test stream key, and show a phone's HLS feed in the Live Board's camera hero via hls.js."

## Task 3 — Publish the vault *(the 859SSCS1 line)*

- **Working dir:** the whole `thetrafficmotoristCZAR-dashboard` folder
- **First prompt:**
  > "Initialize a git repo here, add an MIT LICENSE and a .gitignore, and prep it to publish to github.com/859SSCS1 as build-in-public."
- This is your **first certified line** in the Build Register.

## The hubs *(minor polish, not a build)*

`hubs/*.html` need almost nothing — fill in the HERE developer URL and swap any source links you want. Open them in a browser; no build step.

---

## What "semi-perfect" honestly means

The scaffolds are solid and syntax-clean, but three things **always** need real iteration — no scaffold skips them:

1. **Live endpoint wiring** — the state 511 feeds and DOT camera URLs.
2. **The media server + blur pipeline** — Task 2's harder half.
3. **Native packaging** — building the `.exe` on your machine.

All well within Claude Code's range with the specs above — expect a few back-and-forth loops on each, not a one-shot.

## Have these ready *(only you can supply)*

- [ ] TomTom API key — developer.tomtom.com
- [ ] State 511 feed URLs / keys — **GA first** (511ga.org), then TN / OH / FL
- [ ] A server or host for MediaMTX (Task 2)
- [ ] DOT camera snapshot URLs (optional, for Task 2 hero shots)
- [ ] GitHub access for github.com/859SSCS1 (Task 3)

## Definition of done — what "semi-perfect" should produce

A working **v1** you can go live with, not a demo:

- [ ] **Dashboard `.exe`** installs and opens; Data view shows live congestion + real 511 incidents for at least GA (more states as wired).
- [ ] **Daily Road Card** auto-prints on schedule to screen + PDF (printer optional).
- [ ] **Live Board** runs: city wall, instant jump, camera-or-map hero, Traffic Channel, Speeder Watch.
- [ ] **Owned archive** (`data/archive/`) is collecting 511 incidents — the first seed of CMMD.
- [ ] *(if Task 2)* a contributor phone/360 feed appears in the Live Board hero on command.
- [ ] **Published** to `github.com/859SSCS1`, MIT-shelled — the first Build Register line.

Not in scope for v1 (that's Q1 2028+): the deluxe paid-data layer, national coverage, and a bulletproof blur pipeline. v1 proves the sequence — free tools → owned tool → owned data → public standing. That is the win.

---

*Read order: this file → the task's named spec → the first prompt. That's the whole handoff.*
