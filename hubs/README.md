# CZTVN Hubs — `859SSCS1`

The working data surfaces behind CZTVN's road & mobility coverage: two browser-based hubs, the A1 field manual that documents them, and the dashboard build they lead to.

Build-in-public under [`github.com/859SSCS1`](https://github.com/859SSCS1) · DJWZ Coding · DJWZ Holdings LLC · Shannon, Georgia.

---

## The two hubs

| Hub | Its one job |
| --- | --- |
| **Roadway & Mobility Source Hub** — `cztvn-source-hub.html` | **Pull the news.** Refreshed sources, several times a week, cleared before a show. |
| **Data Infrastructure Hub** — `cztvn-data-infrastructure-hub.html` | **Map the data stack.** A three-rung ladder from free-tier mastery, to the dashboard that proves it, to the first paid transaction. |

News versus infrastructure. One clears before a show; the other is the layer beneath it. They share a design language (navy and gold) so they read as siblings, and each links to the other.

## What's in this bundle

```
cztvn-hubs/
├── README.md                                  ← you are here
├── cztvn-source-hub.html                      the newsdesk pull
├── cztvn-source-hub.README.md
├── cztvn-data-infrastructure-hub.html         the data-stack ladder
├── cztvn-data-infrastructure-hub.README.md
└── The-Data-Ladder-CZTVN-DATA-2026-0711.pdf   the A1 field manual
```

Both hubs are self-contained HTML — no build step, no dependencies, no network calls. Open either in any browser, phone or desktop.

## The idea that ranks everything

**Access is not ownership.** Renting a data feed gives you more calls; it never gives you an asset. Across the data hub, an *ownable* flag marks whether each source can be kept and reprocessed — and that flag is what decides which sources may legally feed the dashboard. The ladder is built so the first paid transaction points at something you can keep, not just more of something you rent.

## Build-in-public

The dashboard built on the hub's dev-tier sources is itself an artifact in this vault — a public, dated demonstration of API competence, produced by the ledger's loop:

```
STUDY the gap → IMPLEMENT via Claude Code → CERTIFY the published build → log to the Build Register
```

The agent writes the code; the operator directs it and owns the record.

## What's here, what's next

- **Here:** two hubs, their READMEs, and the full A1 field manual (*The Data Ladder*), which walks all three rungs with beginner build-steps and the dashboard build-spec.
- **Next:** the dashboard — the actual build the data hub is the map for. It follows Section V of the manual, and lands here as the first certified line in the Build Register.

---

*Layout prepared with Claude (Anthropic). Strategy and framing are the operator's — Josh Wayne, Founder / Architect.*
