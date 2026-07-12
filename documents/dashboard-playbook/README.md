# The CZTVN Dashboard — Field Playbook (Grade A1)

*The Traffic Motorist Czar Television Network, Inc. presents.* An action-oriented
A1 document: how to use the CZTVN Dashboard **today**, **tomorrow** (post-GA 511),
and **next week** (once paid data fits the budget) — then how to make it land on
**GitHub**, gather feedback on **Reddit**, and turn that traffic into the
**TM CZAR YouTube channel**.

`CZAR-PLAY-2026-0712` · July 12, 2026 · Shannon, Georgia · DJWZ Holdings LLC (859SSCS1)

## What's in this bundle

| File | What it is |
| --- | --- |
| `The-CZTVN-Dashboard-Playbook-CZAR-PLAY-2026-0712.pdf` | The finished A1 document — light paper theme, bold per-section colors, full-page dividers, sectional table of contents. **This is the deliverable.** |
| `The-CZTVN-Dashboard-Playbook-CZAR-PLAY-2026-0712.md` | Plain-text mirror of the same content, for the web / GitHub / quick edits. |
| `build.py` | The generator — one source of truth. Running it re-emits **both** the PDF and the `.md` from the same content. |
| `README.md` | This file. |

## Rebuild it

```bash
pip install --user reportlab      # one-time dependency
python build.py                   # writes the .pdf and the .md next to build.py
```

Everything — the six sections, the palette, the layout — lives in `build.py`.
Edit the `CONTENT` list to change wording; edit the palette / geometry constants
near the top to reshape the look. Re-run to regenerate both outputs.

## The theme

Light warm-paper background on every reading page, with bold color throughout:
a colored header band on each page, accent-tick headings, bold square bullets,
tinted callout boxes, and six **full-bleed color section dividers** keyed to the
platforms — Today (orange), Tomorrow (green), Next Week (gold), GitHub (purple),
Reddit (orange-red), YouTube (red).

*Layout prepared with Claude (Anthropic). Strategy and the wager are the operator's.*
