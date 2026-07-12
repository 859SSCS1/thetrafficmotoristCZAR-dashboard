# WARMUP — The Runway to the Commission

How to warm Claude Code up before the real build, so the commission lands on prepared ground instead of a cold start. Run these **in order**, in a Claude Code session with this bundle folder open. Each step lists **what to have ready**, then the **prompt to paste**.

## Before you start

- Open the whole `thetrafficmotoristCZAR-dashboard` folder in Claude Code so it can see `HANDOFF.md`, `README.md`, the dashboard, and the documents.
- Have your keys handy (see the `HANDOFF.md` checklist). You'll need the **TomTom key by Step 6**.

---

### Step 1 — Set the working dynamic
**Have ready:** nothing (folder open).
> Here's how I want to work: I direct, you build. Go one task at a time, explain what you're doing in plain terms as you go, ask me before any big change, and call out the wins as we hit them. I'm newer to code, so don't assume — walk me through it. Sound good?

### Step 2 — Orient it in the packet
**Have ready:** `HANDOFF.md` + `README.md` (already in the folder).
> Before we build anything, read HANDOFF.md and README.md in this folder. Then tell me back, in your own words, what this system is, the three tasks in order, and the definition of done. No code yet.

### Step 3 — Map the code
**Have ready:** the `dashboard/cztvn-dashboard/` folder.
> Now walk the dashboard/cztvn-dashboard/ folder. Give me a short map of what each main file does, how the pieces connect — main process, preload, renderer, the data sources — and flag anything incomplete or anything you'll need from me: keys, endpoints, decisions. Still no changes.

### Step 4 — Check the bench
**Have ready:** nothing.
> Check my environment. Do I have Node.js and npm installed, and what versions? Tell me exactly what I need to install or set up before we can run the app — step by step, assuming I'm new to this.

### Step 5 — Get the plan, then commit
**Have ready:** `dashboard/cztvn-dashboard/BUILD-PLAYBOOK.md`.
> Lay out Task 1 — the Dashboard — as a numbered checklist, from where we are to a running app showing live traffic. Mark each step where you'll need a key or a decision from me, and each step most likely to break. We'll work it top to bottom.

### Step 6 — The commission (Task 1)
**Have ready:** your `.env` with a real **TomTom key**.
> This is a scaffolded Electron app. Read BUILD-PLAYBOOK.md, run `npm install` and `npm start` with my TomTom key, fix any errors until the map shows live traffic, then help me wire Georgia 511's real incident feed into config/states.json.

---

## After Task 1 runs

- **Task 2 — Contributor Grid:** point it at `documents/The-Contributor-Grid-CMMD-GRID-2026-0711.pdf` as the spec; use the first prompt in `HANDOFF.md`.
- **Task 3 — Publish the vault:** whole folder; use the first prompt in `HANDOFF.md`.

*Warm first, commission second. The runway lives here; the tasks and the definition of done live in `HANDOFF.md`.*
