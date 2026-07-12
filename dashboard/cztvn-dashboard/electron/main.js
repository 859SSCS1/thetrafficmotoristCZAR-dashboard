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
const { renderCard }     = require('./render/renderCard');
const { startScheduler } = require('./scheduler');
const { buildBoard }     = require('./live/board');

let mainWindow = null;
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
  return { list, archivedNew: added };
});

ipcMain.handle('get-congestion', async (_e, code) => {
  return tomtom.congestionForMetro(stateBy(code), process.env.TOMTOM_API_KEY);
});

ipcMain.handle('generate-card', async (_e, code, destinations) => {
  return generateCard(code, destinations || config.schedule.destinations);
});

// ---- Live Board ----
ipcMain.handle('get-board', () => buildBoard(config, process.env.TOMTOM_API_KEY));
ipcMain.on('open-live-board', () => openLiveBoard());

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

  // Destination 1: on-screen featured panel for the livestream.
  if (destinations.screen && mainWindow) {
    mainWindow.webContents.send('featured-card', { state: st.code, pngPath: result.pngPath, data });
  }
  return result;
}

function stateBy(code) {
  return config.states.find(s => s.code === code) || config.states[0];
}
