// Live Board. Talks to main only through window.cztvn (preload).
// Speeder Watch is AGGREGATE FLOW ONLY — it flags corridors where the live flow
// speed exceeds the reference limit. It never identifies an individual vehicle.
let CFG = null, BOARD = [], KEY = '';
let miniMaps = {}, sideMap = null, heroMap = null;
let cityCode = null, corridorIdx = 0, camTimer = null, channelOn = false, channelTimer = null;
let heroWatch = null;   // stall watchdog for the contributor video hero

const $ = (id) => document.getElementById(id);
const tomtomTiles = (m) => KEY
  ? L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${KEY}&tileSize=256`, { opacity: .9 }).addTo(m)
  : null;
const baseTiles = (m) => L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { subdomains: 'abcd', maxZoom: 19 }).addTo(m);

async function boot() {
  const cfg = await window.cztvn.getConfig();
  CFG = cfg; KEY = cfg.tomtomKey || '';
  await refreshBoard();
  renderWall();
  // Re-poll congestion every 2 min. The board queries every corridor's flow per
  // cycle, so this is the heaviest TomTom credit user — keep the interval modest.
  setInterval(refreshBoard, 2 * 60 * 1000);
  setInterval(() => { if (!cityCode) updateWallChips(); }, 2 * 60 * 1000);
  wireKeys();
}

async function refreshBoard() {
  try { BOARD = await window.cztvn.getBoard(); } catch (e) { console.error(e); }
  // Periodic refresh updates stats only — it must NOT rebuild the hero, or a
  // playing contributor feed would stutter every minute and a dropped feed
  // would reset its retry state and sit black under a LIVE badge forever.
  if (cityCode) updateCity(false);
  else if (Object.keys(miniMaps).length) reorderWall();
}

/* ----------------------------- THE WALL ----------------------------- */
function renderWall() {
  const wall = $('wall'); wall.innerHTML = ''; miniMaps = {};
  BOARD.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'tile' + (t.speeder ? ' speeding' : '');
    el.dataset.code = t.code;
    el.innerHTML = `
      <div class="mini" id="mini-${t.code}"></div>
      <div class="veil"></div>
      <div class="hot">${i === 0 ? '● HOTTEST' : 'rank ' + (i + 1)}</div>
      <div class="key">${i + 1}</div>
      ${t.speeder ? '<div class="badge-spd">Speeder Watch</div>' : ''}
      <div class="name"><div class="m">${t.metro}</div><div class="s">${t.name} · ${t.code}</div></div>
      <div class="cong"><div class="n">${t.delayPct}%</div><div class="l">delay</div></div>`;
    el.onclick = () => openCity(t.code);
    wall.appendChild(el);
    const m = L.map(`mini-${t.code}`, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false })
      .setView(t.center, (t.zoom || 10) - 1);
    baseTiles(m); tomtomTiles(m);
    miniMaps[t.code] = m;
  });
}
function updateWallChips() {
  BOARD.forEach((t, i) => {
    const el = document.querySelector(`.tile[data-code="${t.code}"]`);
    if (!el) return;
    el.classList.toggle('speeding', t.speeder);
    el.querySelector('.cong .n').textContent = t.delayPct + '%';
    el.querySelector('.hot').textContent = i === 0 ? '● HOTTEST' : 'rank ' + (i + 1);
    el.querySelector('.key').textContent = i + 1;
  });
}
function reorderWall() { renderWall(); } // simplest: rebuild in hot-list order

/* --------------------------- THE CITY VIEW -------------------------- */
function openCity(code) {
  cityCode = code; corridorIdx = 0;
  $('cityView').hidden = false;
  if (!sideMap) {
    sideMap = L.map('sideMap', { zoomControl: true, attributionControl: false });
    baseTiles(sideMap); tomtomTiles(sideMap);
  }
  updateCity(true);
}
function tile() { return BOARD.find(t => t.code === cityCode) || BOARD[0]; }

// rebuildHero: true when the corridor/city changed (fresh hero); false on the
// periodic stats refresh (leave the hero — playing, map, or signal-lost — alone).
function updateCity(rebuildHero) {
  const t = tile(); if (!t) return;
  const cors = t.corridors || [];
  if (corridorIdx >= cors.length) corridorIdx = 0;
  const cor = cors[corridorIdx] || {};
  sideMap.setView(cor.point || t.center, 13);
  if (rebuildHero) buildHero(cor, t);
  renderCorridorList(t, cors);
  // chyron
  $('chyCity').textContent = t.metro;
  $('chyCorridor').textContent = cor.name || t.name;
  const spd = cor.congestion && cor.congestion.available ? `${cor.currentSpeed} mph` : '—';
  $('chyStats').innerHTML =
    `<span>delay <b>${t.delayPct}%</b></span><span>flow <b>${spd}</b></span><span>limit ref <b>${cor.postedRef || '—'}</b></span>`;
  // speeder banner (aggregate flow only)
  const banner = $('speederBanner');
  if (cor.speeder) {
    banner.hidden = false;
    banner.innerHTML = `⚠ SPEEDER WATCH · ${t.metro} ${cor.name} — flow +${cor.overRefMph} mph over the ${cor.postedRef} reference`
      + `<span class="sub">aggregate flow speed, not individual vehicles</span>`;
  } else banner.hidden = true;
}

// A cameraUrl can be a DOT snapshot (image, refreshed) or a live stream from
// the Contributor Grid (HLS via hls.js — spec CMMD-GRID §IV.3).
const isStreamUrl = (u) => /\.m3u8(\?|$)/i.test(u || '');
let heroHls = null;

function destroyHeroStream() {
  if (heroWatch) { clearInterval(heroWatch); heroWatch = null; }
  if (heroHls) { try { heroHls.destroy(); } catch (_) {} heroHls = null; }
}

// The corridor on a live congestion map — the default hero when no camera is
// wired, AND the fallback when a contributor feed drops (never a frozen frame).
function renderMapHero(cor, t, label) {
  const hero = $('hero');
  clearInterval(camTimer);
  destroyHeroStream();
  hero.innerHTML = `<div class="camlabel">${label}</div><div class="heromap" id="heroMap"></div>`;
  setTimeout(() => {
    heroMap = L.map('heroMap', { zoomControl: false, attributionControl: false });
    baseTiles(heroMap); tomtomTiles(heroMap);
    heroMap.setView(cor.point || t.center, 14);
  }, 30);
}

function buildHero(cor, t) {
  const hero = $('hero');
  clearInterval(camTimer);
  destroyHeroStream();
  if (cor.cameraUrl && isStreamUrl(cor.cameraUrl)) {
    // Contributor feed as hero — the grid subscribes, the board just plays.
    // A live product must never show a frozen frame (or a black one) under a
    // LIVE badge: on an unrecoverable drop we fall back to the corridor map
    // labeled SIGNAL LOST. Re-select the corridor to retry a returned feed.
    hero.innerHTML = `<div class="camlabel"><span class="live-dot"></span>LIVE · ${cor.name} · contributor</div><video id="camVid" autoplay muted playsinline></video>`;
    const v = $('camVid');
    const lost = () => renderMapHero(cor, t, `⚠ SIGNAL LOST · ${cor.name}`);
    // Stall watchdog: catches the case where the feed dies with no fatal error
    // (segments simply stop; the video goes black/frozen). If playback hasn't
    // advanced for ~8s, drop to the map.
    let lastT = -1, stalls = 0;
    heroWatch = setInterval(() => {
      if (!v.isConnected) { clearInterval(heroWatch); heroWatch = null; return; }
      if (!v.paused && v.currentTime === lastT) { if (++stalls >= 4) lost(); }
      else { stalls = 0; lastT = v.currentTime; }
    }, 2000);
    if (window.Hls && Hls.isSupported()) {
      const h = new Hls({ lowLatencyMode: true });
      heroHls = h;
      h.loadSource(cor.cameraUrl);
      h.attachMedia(v);
      let recovers = 0;
      h.on(Hls.Events.ERROR, (_evt, data) => {
        if (h !== heroHls || !data.fatal) return;   // stale instance or non-fatal
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && recovers < 3) { recovers++; try { h.startLoad(); } catch (_) {} }
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && recovers < 3) { recovers++; try { h.recoverMediaError(); } catch (_) {} }
        else lost();   // give up — drop to the map, don't sit on a dead frame
      });
    } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = cor.cameraUrl;   // native HLS (Safari/WebKit)
      v.addEventListener('error', () => { if ($('camVid') === v) lost(); });
    } else {
      lost();   // no HLS support at all
    }
    heroMap = null;
  } else if (cor.cameraUrl) {
    // Camera as hero — auto-refresh the DOT snapshot every 4s.
    hero.innerHTML = `<div class="camlabel"><span class="live-dot"></span>LIVE · ${cor.name}</div><img id="camImg" alt="camera">`;
    const load = () => { const im = $('camImg'); if (im) im.src = cor.cameraUrl + (cor.cameraUrl.includes('?') ? '&' : '?') + 't=' + Date.now(); };
    load(); camTimer = setInterval(load, 4000);
    heroMap = null;
  } else {
    renderMapHero(cor, t, `MAP · ${cor.name} (wire ${t.code} camera)`);
  }
}

function renderCorridorList(t, cors) {
  $('corridorList').innerHTML = cors.map((c, i) => {
    const spd = c.congestion && c.congestion.available ? `${c.currentSpeed} mph` : '—';
    const fast = c.speeder ? `<span class="fast">+${c.overRefMph} over</span>` : '';
    return `<div class="cor ${i === corridorIdx ? 'active' : ''} ${c.speeder ? 'spd' : ''}" data-i="${i}">
      <div class="cn">${c.name}</div><div class="cs"><b>${spd}</b> ${fast}</div></div>`;
  }).join('');
  document.querySelectorAll('#corridorList .cor').forEach(el =>
    el.onclick = () => { corridorIdx = +el.dataset.i; updateCity(true); });
}

function nextCorridor() { const t = tile(); if (!t) return; corridorIdx = (corridorIdx + 1) % (t.corridors.length || 1); updateCity(true); }
function closeCity() { cityCode = null; clearInterval(camTimer); destroyHeroStream(); $('cityView').hidden = true; }

/* --------------------------- TRAFFIC CHANNEL ------------------------ */
function toggleChannel() {
  channelOn = !channelOn;
  $('channelBtn').classList.toggle('on', channelOn);
  $('channelBtn').textContent = channelOn ? '⏸ Traffic Channel' : '▶ Traffic Channel';
  clearInterval(channelTimer);
  if (channelOn) {
    if (!cityCode) openCity(BOARD[0].code);
    const secs = (CFG.liveBoard && CFG.liveBoard.rotateSec) || 12;
    channelTimer = setInterval(advanceChannel, secs * 1000);
  }
}
function advanceChannel() {
  // Walk corridors within a city, then hop to the next hot city.
  const t = tile(); if (!t) { openCity(BOARD[0].code); return; }
  if (corridorIdx < (t.corridors.length - 1)) { nextCorridor(); return; }
  const order = BOARD.map(x => x.code);
  const ni = (order.indexOf(cityCode) + 1) % order.length;
  openCity(order[ni]);
}

/* ------------------------------- KEYS ------------------------------- */
function wireKeys() {
  $('jump').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    const hit = BOARD.find(t => t.metro.toLowerCase().startsWith(q) || t.name.toLowerCase().startsWith(q) || t.code.toLowerCase() === q);
    if (hit) { openCity(hit.code); e.target.blur(); e.target.value = ''; }
  });
  $('channelBtn').onclick = toggleChannel;
  $('backBtn').onclick = closeCity;
  document.addEventListener('keydown', (e) => {
    if (document.activeElement === $('jump')) { if (e.key === 'Escape') $('jump').blur(); return; }
    if (e.key >= '1' && e.key <= '9') { const t = BOARD[+e.key - 1]; if (t) openCity(t.code); }
    else if (e.code === 'Space' && cityCode) { e.preventDefault(); nextCorridor(); }
    else if (e.key === 'Escape' && cityCode) closeCity();
    else if (e.key.toLowerCase() === 'c') toggleChannel();
    else if (e.key.toLowerCase() === 'f') { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
  });
}

boot().catch(err => { console.error(err);
  document.body.insertAdjacentHTML('afterbegin', '<div style="padding:16px;color:#E08A6B;font-family:monospace">Live Board boot error — see console. ' + err + '</div>'); });
