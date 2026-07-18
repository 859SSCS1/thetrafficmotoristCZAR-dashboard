const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// Keys are never bundled into the app. Dev reads the project .env; a packaged
// build reads a .env placed next to the .exe, or in the app's user-data folder.
const dotenv = require('dotenv');
// (portable builds run from a temp extraction dir — PORTABLE_EXECUTABLE_DIR
// points back to the folder the .exe actually sits in)
for (const p of [
  path.join(__dirname, '..', '.env'),
  process.env.PORTABLE_EXECUTABLE_DIR && path.join(process.env.PORTABLE_EXECUTABLE_DIR, '.env'),
  path.join(path.dirname(process.execPath), '.env'),
  path.join(app.getPath('userData'), '.env')
].filter(Boolean)) { if (fs.existsSync(p)) { dotenv.config({ path: p }); break; } }

const config    = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'states.json'), 'utf8'));
const tomtom    = require('./sources/tomtom');
const incidents = require('./sources/incidents');
const fuel      = require('./sources/fuel');
const archive   = require('./archive');
const eventlog  = require('./eventlog');
const { renderCard }     = require('./render/renderCard');
const { startScheduler } = require('./scheduler');
const { buildBoard }     = require('./live/board');

// Daily Minutes state: last-seen incidents + congestion level, per state, to
// detect clears and congestion shifts between refreshes.
const seenIncidents = {};   // code -> Map(id -> incident)
const lastCongLevel = {};   // code -> 'clear' | 'moderate' | 'heavy'
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
const congLevel = (pct) => pct == null ? null : pct < 20 ? 'clear' : pct < 45 ? 'moderate' : 'heavy';

let mainWindow = null;
let dailyWindow = null;
let liveWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480, height: 920, minWidth: 1100, minHeight: 720,
    backgroundColor: '#0A0E1C',
    title: 'CZTVN Dashboard',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  // Arm the time+place triggers for the auto-print card.
  startScheduler(config, (state) => generateCard(state, config.schedule.destinations));
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

/* ------------------------------- IPC ------------------------------- */
ipcMain.handle('get-config', () => ({
  states: config.states,
  schedule: config.schedule,
  liveBoard: config.liveBoard,
  tomtomKey: process.env.TOMTOM_API_KEY || ''   // used for the map's traffic tile layer
}));

ipcMain.handle('get-incidents', async (_e, code) => {
  const st = stateBy(code);
  const list = await incidents.fetchIncidents(st);
  const added = archive.appendIncidents(st.code, list);   // archive the OWNED feed
  logClears(st, list);                                     // Daily Minutes: note resolved incidents
  return { list, archivedNew: added };
});

ipcMain.handle('get-congestion', async (_e, code) => {
  const st = stateBy(code);
  const c = await tomtom.congestionForMetro(st, process.env.TOMTOM_API_KEY);
  logCongestion(st, c);                                    // Daily Minutes: note level shifts
  return c;
});

ipcMain.handle('generate-card', async (_e, code, destinations) => {
  return generateCard(code, destinations || config.schedule.destinations);
});

// ---- Daily Minutes ----
// Merge the OWNED archive (incident appearances) with the event log (clears,
// congestion shifts, card fires) into one time-sorted day view.
ipcMain.handle('get-events', (_e, date) => {
  const d = date || eventlog.today();
  const evts = eventlog.read(d);
  for (const st of config.states) {
    for (const inc of archive.readArchive(st.code)) {
      if (String(inc.archivedAt || '').slice(0, 10) === d) {
        evts.push({ ts: inc.archivedAt, kind: 'incident', state: st.code, severity: inc.severity,
          title: `${cap(inc.type)}${inc.road ? ' · ' + inc.road : ''}`, detail: inc.description || '' });
      }
    }
  }
  return evts.sort((a, b) => (a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0));   // newest first
});
ipcMain.handle('get-event-dates', () => eventlog.dates());
ipcMain.on('open-daily', () => openDaily());

function logClears(st, list) {
  const cur = new Map(list.filter(i => !String(i.source).includes('SAMPLE')).map(i => [String(i.id), i]));
  const prev = seenIncidents[st.code];
  seenIncidents[st.code] = cur;
  if (!prev) return;   // first fetch this session = baseline, don't flood
  for (const [id, inc] of prev) {
    if (!cur.has(id)) {
      eventlog.log({ kind: 'cleared', state: st.code, severity: inc.severity,
        title: `Cleared · ${inc.road || cap(inc.type)}`, detail: inc.description || '' });
    }
  }
}

function logCongestion(st, c) {
  if (!c || !c.available || c.delayPct == null) return;
  const lvl = congLevel(c.delayPct);
  const prev = lastCongLevel[st.code];
  lastCongLevel[st.code] = lvl;
  if (prev && prev !== lvl) {
    eventlog.log({ kind: 'congestion', state: st.code,
      title: `${st.metro} congestion → ${lvl}`,
      detail: `${c.delayPct}% delay · ${c.currentSpeed ?? '—'}/${c.freeFlowSpeed ?? '—'} mph` });
  }
}

// ---- Live Board ----
ipcMain.handle('get-board', () => buildBoard(config, process.env.TOMTOM_API_KEY));
ipcMain.on('open-live-board', () => openLiveBoard());

function openDaily() {
  if (dailyWindow) { dailyWindow.focus(); return; }
  dailyWindow = new BrowserWindow({
    width: 1120, height: 900, backgroundColor: '#0A0E1C', title: 'CZTVN Daily Minutes',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  dailyWindow.loadFile(path.join(__dirname, '..', 'renderer', 'daily.html'));
  if (process.argv.includes('--dev')) dailyWindow.webContents.openDevTools({ mode: 'detach' });
  dailyWindow.on('closed', () => { dailyWindow = null; });
}

function openLiveBoard() {
  if (liveWindow) { liveWindow.focus(); return; }
  liveWindow = new BrowserWindow({
    width: 1600, height: 900, backgroundColor: '#0A0E1C', title: 'CZTVN Live Board',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    }
  });
  liveWindow.loadFile(path.join(__dirname, '..', 'renderer', 'live.html'));
  if (process.argv.includes('--dev')) liveWindow.webContents.openDevTools({ mode: 'detach' });
  liveWindow.on('closed', () => { liveWindow = null; });
}

/* --------------------- the marquee: build a card -------------------- */
async function generateCard(code, destinations) {
  const st = stateBy(code);
  const [congestion, incs, fuelData] = await Promise.all([
    tomtom.congestionForMetro(st, process.env.TOMTOM_API_KEY).catch(() => ({ available: false })),
    incidents.fetchIncidents(st).catch(() => []),
    fuel.priceFor(st).catch(() => null)
  ]);
  if (Array.isArray(incs) && incs.length) archive.appendIncidents(st.code, incs);

  const data = { state: st, congestion, incidents: incs, fuel: fuelData, generatedAt: new Date().toISOString() };
  const result = await renderCard(data, destinations);

  // Daily Minutes: mark the card fire in the day's timeline.
  eventlog.log({ kind: 'card', state: st.code, title: `Daily Road Card · ${st.code}`,
    detail: `${(incs || []).length} incidents · ${congestion && congestion.delayPct != null ? congestion.delayPct + '% congestion' : 'congestion n/a'}` });

  // Destination 1: on-screen featured panel for the livestream.
  if (destinations.screen && mainWindow) {
    mainWindow.webContents.send('featured-card', { state: st.code, pngPath: result.pngPath, data });
  }
  return result;
}

function stateBy(code) {
  return config.states.find(s => s.code === code) || config.states[0];
}
