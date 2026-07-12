# The Contributor Grid — Stream Key Register (TEMPLATE)

**This is the public template. The live register — `grid/STREAM-KEYS.md` — is
gitignored and never committed**, because it holds real stream keys (the hub's
only auth) and contributor identity + consent references (privacy-sensitive per
spec §V). Copy this file to `STREAM-KEYS.md` and keep the real entries there.

**The rule (spec §IV.2):** the stream key is where consent attaches. No key is
issued without a signed contributor agreement. A key only works once it's also
added under `paths:` in `mediamtx.local.yml` (also gitignored).

| Key | Contributor | Consent | Issued | Status |
| --- | --- | --- | --- | --- |
| _(none committed — see private STREAM-KEYS.md)_ | | | | |

## Issuing a key

1. Signed contributor agreement on file (see spec §V.3 — involve counsel).
2. Generate: `cz-<tier><n>-<12 hex>` (e.g. `openssl rand -hex 6`).
3. Add a `paths:` entry in `mediamtx.local.yml`, restart the hub.
4. Log it in the private `STREAM-KEYS.md` with the contributor and consent reference.

## Revoking a key

Remove its `paths:` entry, restart the hub, mark it `revoked` in the private
register. The feed dies on restart. **Note:** a restart drops *all* active
feeds, not just the revoked one — the key is the on/off switch, but the switch
is hub-wide at this staging. Per-key live revocation is a future hardening item.

## What the contributor gets

- Publish URL: `rtmp://<host>:1935/<KEY>`
- Any RTMP app works (Larix Broadcaster, or a 360 cam with custom-RTMP push).
- Settings that work well: 1280x720, H.264, 2–4 Mbps, keyframe every 2s.
