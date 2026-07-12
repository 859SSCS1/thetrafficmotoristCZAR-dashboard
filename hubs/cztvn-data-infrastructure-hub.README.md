# CZTVN — Data Infrastructure Hub

A tap-through map of the traffic-data stack behind CZTVN, organized as a three-rung ladder: from free-tier mastery, to the dashboard that proves it, to the first paid transaction.

Part of the CZTVN newsdesk toolkit. Sibling to the [Roadway & Mobility Source Hub](cztvn-source-hub.html). Documented in full by the A1 field manual *The Data Ladder* (`CZTVN-DATA-2026-0711`).

---

## What it is

A single, self-contained HTML page — `cztvn-data-infrastructure-hub.html`. No build step, no dependencies, no network calls. Open it in any browser, phone or desktop.

Where the source hub pulls the *news* (and clears before a show), this one maps the *data infrastructure* underneath it: every source that feeds — or could feed — CZTVN's traffic coverage and the dashboard, ranked by how you reach it and whether you can keep what it returns.

## The ladder

Three rungs, in the order you actually reach them:

- **Rung 1 — Free & Dev-tier.** The training ground. Everything reachable today at no cost, and the surface the dashboard is built on. Real-time flow APIs, city-cycle benchmarks, free government feeds, structural context.
- **Rung 2 — Agency.** Partnership-gated public feeds you can't open solo yet. Worth knowing now so you can partner into them later.
- **Rung 3 — Paid.** The milestone rung, set visually apart — where the entity opens its account and spends for the first time.

## Reading a card

Every source carries two markers, and dev-tier sources add a third:

| Marker | What it tells you |
| --- | --- |
| **Access tier** — `Free` / `Dev-key` / `Agency` / `Paid` | How you reach it: open, free-with-a-key, partnership-gated, or costs money. |
| **Ownable?** — `Ownable` / `Rented` / `Gated` / `Report` | Whether the terms let you *keep and reprocess* the data, or only access it. |
| **Build role** *(dev-tier only)* — `→ dashboard: …` | What that source feeds in the dashboard. |

## The one rule to carry

**Access is not ownership.** Renting a feed gives you more calls; it never gives you an asset. The `Ownable` flag is the one that decides which sources can legally feed the dashboard — and it's why the first paid transaction should point at something you can keep, not just more of something you rent.

## Using it

- **Open** the file in a browser — nothing to install.
- **Filter** with the box at the top: type a source, a function (e.g. `real-time`, `benchmark`), or a tier.
- **Tap** any card to open that source in a new tab.
- The **dateline clock** (Shannon, GA) ticks live in the header.

## Build-in-public — `859SSCS1`

Rung 1 carries the Open-Source Ledger framing: the CZTVN dashboard built on these dev-tier APIs is itself an artifact in the [`github.com/859SSCS1`](https://github.com/859SSCS1) vault — a public, dated demonstration of API competence, produced by the ledger's loop:

```
STUDY the gap → IMPLEMENT via Claude Code → CERTIFY the published build → log to the Build Register
```

The agent writes the code; the operator directs it and owns the record.

## Related artifacts

| File | Role |
| --- | --- |
| `cztvn-source-hub.html` | Sibling — the newsdesk pull (news, several times a week). |
| `The-Data-Ladder-CZTVN-DATA-2026-0711.pdf` | The full A1 field manual — every resource, beginner build-steps, the build-spec. |
| *The dashboard* | Downstream — the actual build this hub is the map for. |

## Notes

- **Static and private.** No data leaves your browser; the page makes no calls of its own.
- **Dev-tier sources need a key.** Free to sign up, but each dev-tier API requires your own key before it returns anything.
- The **HERE** card links to the parent domain; swap in the exact developer URL once confirmed.
- The page title is a placeholder — rename freely.

---

*Entity: TM CZAR Television Network, Inc. (CZTVN) · DJWZ Coding · DJWZ Holdings LLC · Shannon, Georgia. Layout prepared with Claude; strategy and framing are the operator's.*
