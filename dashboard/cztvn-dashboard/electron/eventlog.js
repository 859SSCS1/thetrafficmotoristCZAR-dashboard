// The Daily Minutes log — an append-only per-day record of notable moments,
// so the operator can scroll through a day and see what happened. This captures
// what the incident archive does NOT: clears, congestion shifts, and card fires.
// (Incident *appearances* come from the owned archive, which already timestamps
// every incident — the Daily Minutes view merges the two.)
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DIR = app.isPackaged
  ? path.join(app.getPath('userData'), 'data', 'events')
  : path.join(__dirname, '..', 'data', 'events');

function ensure() { fs.mkdirSync(DIR, { recursive: true }); }
function today() { return new Date().toISOString().slice(0, 10); }        // YYYY-MM-DD (UTC)
function fileFor(d) { return path.join(DIR, (d || today()) + '.jsonl'); }

function log(evt) {
  ensure();
  const e = { ts: new Date().toISOString(), ...evt };
  try { fs.appendFileSync(fileFor(), JSON.stringify(e) + '\n'); } catch (err) { console.error('eventlog', err); }
  return e;
}

function read(d) {
  const f = fileFor(d);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
}

// Which day-files exist (for the date navigator).
function dates() {
  ensure();
  return fs.readdirSync(DIR).filter(f => f.endsWith('.jsonl'))
    .map(f => f.replace('.jsonl', '')).sort().reverse();
}

module.exports = { log, read, dates, today };
