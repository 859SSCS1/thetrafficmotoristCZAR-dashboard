# License note

**The code is MIT.** Everything committed to this repo — the Electron app, the
render templates, the scheduling logic, the Live Board, the grid config
template — is released under the MIT LICENSE at the repo root. If it's in the
public repo, it's MIT. Build on it freely.

**The data is not.** What stays yours and is deliberately **kept out of the
repo** (gitignored, never committed): the incident archive this app builds
(`data/archive/`), any future CMMD capture, and the private stream-key register.
These are the owned asset — the moat is the accumulated data, not the code that
collects it. Open-sourcing the tool does not open-source the data it produces.

**The live API layer is rented.** TomTom (and any commercial API) data is
streamed through live and never stored — per their terms you have access, not
ownership. Only the ownable feeds (state 511, government data) are archived.

> **The model, in one line:** open code, rented live edge, owned data.
> The code is a public credential; the data it captures is the private asset.
