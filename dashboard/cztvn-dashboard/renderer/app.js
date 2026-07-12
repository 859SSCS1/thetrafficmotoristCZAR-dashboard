// Renderer logic. Talks to the main process only through window.cztvn (preload).
let CFG = null, current = 'GA', map = null, trafficLayer = null, markers = [];

const $ = (id) => document.getElementById(id);

async function boot() {
  CFG = await window.cztvn.getConfig();
  buildSwitch();
  initMap();
  tickClock(); setInterval(tickClock, 30000);
  await selectState('GA');
  setInterval(() => refreshData(), 5 * 60 * 1000); // refresh live data every 5 min (conserves TomTom credits)

  $('genBtn').addEventListener('click', async () => {
    $('genBtn').textContent = 'Generating…';
    await window.cztvn.generateCard(current, { screen: true, file: true, printer: false });
    $('genBtn').textContent = 'Generate Road Card';
  });
  $('featClose').addEventListener('click', () => { $('featured').hidden = true; });
  $('liveBtn').addEventListener('click', () => window.cztvn.openLiveBoard());

  // Featured card fired by the scheduler (or the button) -> show it for the stream.
  window.cztvn.onFeaturedCard((payload) => {
    if (payload.pngPath) {
      $('featuredImg').src = 'file://' + payload.pngPath.replace(/\\/g, '/');
      $('featured').hidden = false;
    }
  });
}

function buildSwitch() {
  const el = $('stateSwitch');
  el.innerHTML = '';
  CFG.states.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s.code;
    b.title = s.name + (s.wired ? '' : ' (wire endpoint)');
    b.onclick = () => selectState(s.code);
    b.dataset.code = s.code;
    el.appendChild(b);
  });
}

function initMap() {
  map = L.map('map', { zoomControl: true, attributionControl: true }).setView([33.749, -84.388], 10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  // TomTom live traffic flow tiles (RENTED — displayed live, never stored).
  if (CFG.tomtomKey) {
    trafficLayer = L.tileLayer(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${CFG.tomtomKey}&tileSize=256`,
      { opacity: 0.9, maxZoom: 22 }
    ).addTo(map);
    $('congNote').textContent = 'live congestion · TomTom';
  } else {
    $('congNote').textContent = 'add TOMTOM_API_KEY for live traffic';
  }
}

async function selectState(code) {
  current = code;
  document.querySelectorAll('#stateSwitch button').forEach(b =>
    b.classList.toggle('active', b.dataset.code === code));
  const st = CFG.states.find(s => s.code === code);
  if (st && map) map.setView(st.center, st.zoom || 10);
  await refreshData();
}

async function refreshData() {
  const st = CFG.states.find(s => s.code === current);
  // congestion
  try {
    const c = await window.cztvn.getCongestion(current);
    if (c && c.available) {
      $('congBig').textContent = (c.delayPct ?? 0) + '%';
      $('congSub').textContent = `${c.currentSpeed ?? '—'} / ${c.freeFlowSpeed ?? '—'} mph vs free-flow`;
    } else {
      $('congBig').textContent = '—';
      $('congSub').textContent = c && c.reason ? c.reason : 'live speed unavailable';
    }
  } catch (e) { $('congSub').textContent = 'congestion error'; }

  // incidents (+ archive)
  try {
    const { list, archivedNew } = await window.cztvn.getIncidents(current);
    const incs = (list || []).slice().sort((a, b) => (b.severity || 0) - (a.severity || 0));
    $('incBig').textContent = incs.length;
    $('archNote').textContent = archivedNew > 0 ? `+${archivedNew} archived to ${current} store` : 'owned archive';
    const top = incs[0];
    $('topRoad').textContent = top ? (top.road || top.type) : 'clear';
    $('topDesc').textContent = top ? (top.description || '') : 'no active incidents';
    drawMarkers(incs);
    drawTicker(incs);
    if (incs[0] && String(incs[0].source).includes('SAMPLE')) {
      $('archNote').textContent = 'sample data — wire ' + current + '511';
    }
  } catch (e) { $('ticker').textContent = 'incident feed error'; }
}

function drawMarkers(incs) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  incs.forEach(inc => {
    if (inc.lat == null || inc.lon == null) return;
    const color = inc.severity >= 4 ? '#E08A6B' : inc.severity >= 2 ? '#E8CB7A' : '#69B58C';
    const m = L.circleMarker([inc.lat, inc.lon], {
      radius: 6, color, fillColor: color, fillOpacity: .8, weight: 2
    }).bindPopup(`<b>${inc.road || inc.type}</b><br>${inc.description || ''}`);
    m.addTo(map); markers.push(m);
  });
}

function drawTicker(incs) {
  if (!incs.length) { $('ticker').textContent = 'No active incidents on the board.'; return; }
  $('ticker').innerHTML = incs.map(i =>
    `<b>${i.type}</b> ${i.road ? '· ' + i.road : ''} — ${i.description || ''}`
  ).join('<span class="sep">◆</span>');
}

function tickClock() {
  const d = new Date();
  $('dateline').innerHTML = 'Shannon, GA · <b>' +
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</b> · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

boot().catch(err => { console.error(err); document.body.insertAdjacentHTML('afterbegin',
  '<div style="padding:20px;color:#E08A6B;font-family:monospace">Boot error — see console. ' + err + '</div>'); });
