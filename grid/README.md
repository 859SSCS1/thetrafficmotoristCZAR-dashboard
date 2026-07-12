# The Contributor Grid — Hub

The working implementation of the Contributor Grid spec
(`documents/The-Contributor-Grid-CMMD-GRID-2026-0711.pdf`), staged
**live-view-only** per §V.2: nothing is recorded until the consent-gated blur
pipeline exists.

```
CONTRIBUTOR ──RTMP──▶ MediaMTX hub ──HLS──▶ Live Board hero (hls.js)
(phone / 360 cam)     (this folder)  └─WHEP─▶ (sub-second cut — next stage)
```

**The design rule (spec §III.3):** contributors publish, the grid subscribes.
A contributor never touches the Live Board directly — the hub is where keys,
consent, and (later) blur + recording are enforced.

## Files in this folder

| File | Committed? | What |
| --- | --- | --- |
| `mediamtx.yml` | yes | Public config **template** — no real keys |
| `mediamtx.local.yml` | **no (gitignored)** | Your runtime config — real keys live here |
| `STREAM-KEYS.template.md` | yes | The register template + procedure |
| `STREAM-KEYS.md` | **no (gitignored)** | The private register — real keys + consent records |

Keys are the hub's only auth, so they never enter the public repo. First-time
setup: `cp mediamtx.yml mediamtx.local.yml` and `cp STREAM-KEYS.template.md STREAM-KEYS.md`.

## Run the hub

```bash
# binary: https://github.com/bluenviron/mediamtx (single exe, no install)
mediamtx.exe grid/mediamtx.local.yml
# opens: RTMP :1935 (publish) · HLS :8888 (subscribe) · WebRTC :8889 (later)
```

> **Network note:** the hub binds all interfaces by default and has no read
> auth or TLS at this staging — run it on a trusted LAN only, and do not add a
> Windows Firewall inbound allow-rule for `mediamtx.exe` beyond private
> networks. LAN/localhost binding + read auth are pre-deployment hardening.

## A contributor goes live (Tier 1 — phone)

1. Issue them a stream key (see `STREAM-KEYS.template.md` — consent first, always).
2. They install any RTMP broadcaster (e.g. Larix Broadcaster, free) and point it at:
   `rtmp://<your-ip>:1935/<STREAMKEY>`  (720p, 2–4 Mbps, 2s keyframes)
3. The feed is instantly pullable at:
   - `http://<your-ip>:8888/<STREAMKEY>/index.m3u8` (HLS — what the board uses)
   - `http://<your-ip>:8888/<STREAMKEY>` (built-in browser player, for checking)

Tier 2/3 (360 cams — Theta X / Insta360) push to the same RTMP URL; that
custom-server push is the whole reason those cameras were chosen (spec §II.2).

## Show it on the Live Board

Paste the HLS URL into any corridor's `cameraUrl` in
`dashboard/cztvn-dashboard/config/states.json`. The hero detects `.m3u8` and
plays it live via hls.js; any other URL is treated as a refreshing DOT
snapshot; blank falls back to the live map.

The committed `states.json` ships every `cameraUrl` **blank** (no keys in the
public repo) — wire your local HLS URL in when the hub is running, e.g. set the
GA Downtown Connector's `cameraUrl` to
`http://localhost:8888/<your-test-key>/index.m3u8`.

## Simulate a contributor (no phone needed)

```bash
# use whatever test key you put in mediamtx.local.yml
ffmpeg -re -f lavfi -i "testsrc2=size=1280x720:rate=30" \
  -f lavfi -i "sine=frequency=440" \
  -c:v libx264 -preset veryfast -b:v 2500k -g 60 -c:a aac \
  -f flv rtmp://localhost:1935/<your-test-key>
```

## What's deliberately NOT here yet (spec §IV.5 steps 4–5)

- **Blur + consent-gated recording (G-04)** — server-side anonymization on
  ingest, then and only then `record: yes`. Faces, plates, pedestrians out
  before anything is kept. *Monitor the driving, not the driver.* Until then,
  no path sets `record: yes` — that is the "nothing is stored until G-04"
  invariant, enforced by `pathDefaults: record: no`.
- **WebRTC / WHEP playback (G-05)** — the sub-second on-air cut:
  `http://<host>:8889/<STREAMKEY>/whep`.
