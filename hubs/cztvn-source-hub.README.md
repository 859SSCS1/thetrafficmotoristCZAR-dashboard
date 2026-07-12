# CZTVN — Roadway & Mobility Source Hub

One job: pull refreshed data fast, several times a week, before a show.

Part of the CZTVN newsdesk toolkit. Sibling to the [Data Infrastructure Hub](cztvn-data-infrastructure-hub.html). Documented in full by the source & topic reference `CZTVN-REF-2026-0619`.

---

## What it is

A single, self-contained HTML page — `cztvn-source-hub.html`. No build step, no dependencies, no network calls. Open it in any browser, phone or desktop.

It's a pre-broadcast checklist of free public sources for the roadway & mobility beat, grouped by how often each one actually refreshes — so annual reports aren't being checked daily, and the daily-fresh sources are never missed.

## How it's organized

- **The Rundown** *(daily-fresh)* — the sources that genuinely refresh every day: AAA gas prices, Georgia 511, the Atlanta Journal-Constitution, Electrek, TechCrunch Transportation, and a standing Google News beat scan. Tap a box to mark a source cleared; the gold meter tracks the session; **reset** clears it for the next pull. State is per session — a fresh session is a fresh pull, which matches the daily rhythm.
- **Cadence groups** — the periodic feeds, so they deposit on their own schedule: **Weekly** (EIA fuel report, Waymo newsroom, TomTom Traffic Index), **Monthly** (NSC fatality estimates, Cox Automotive, Kelley Blue Book), **Quarterly & Annual** (Uber/Lyft investor relations, NHTSA Crash Stats, FHWA Highway Statistics, S&P Global Mobility, BTS).
- **The ROADS-economy beat** — the "who's locked out, and why" sources the big outlets skip: Fines & Fees Justice Center, Free to Drive, ACLU, Movement Advancement Project, Census, Georgia DDS, IIHS. These anchor the deep-dive show.
- **Tools** — the capture side: Google Alerts (standing keyword capture) and a one-tap new Google Sheet for the intake table.

## Using it

- **Open** the file in a browser — nothing to install.
- **Clear the Rundown** before a show; the periodic feeds deposit on their own schedule.
- **Filter** with the box at the top to jump to any source by keyword.
- The **dateline clock** (Shannon, GA) ticks live in the header.

## The routing rule (printed in the footer)

Timely item → **Show A** (the weekly roundup) or a **Short**. Deep or structural item → **Show B** (the deep dive). The intake sheet's *Slot* column then becomes the weekly plan — filter by slot and the two shows and six shorts are already assembled.

## Related artifacts

| File | Role |
| --- | --- |
| `cztvn-data-infrastructure-hub.html` | Sibling — the data-stack ladder (free-tier → first transaction). |
| `CZTVN-REF-2026-0619` | The source & topic reference that documents this hub. |
| `The-Data-Ladder-CZTVN-DATA-2026-0711.pdf` | The A1 field manual for the data infrastructure. |

## Notes

- **All sources are free and public**, and open in a new tab.
- If a government page has moved, the parent site still gets you there.
- **Session-only state** — the checklist resets on reload; nothing is stored.
- The page title is a placeholder — rename freely.

---

*Entity: TM CZAR Television Network, Inc. (CZTVN) · DJWZ Coding · DJWZ Holdings LLC · Shannon, Georgia.*
