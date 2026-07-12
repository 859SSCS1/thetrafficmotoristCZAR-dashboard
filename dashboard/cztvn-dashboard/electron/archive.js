// Append-only JSONL archive of the OWNABLE feeds (state 511 incidents).
// This is the proprietary layer — data you are allowed to keep. Rented API
// data (TomTom) is never written here.
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
// Packaged builds can't write inside the read-only app bundle — archive to the
// per-user data folder instead. Dev keeps writing to the repo's data/archive.
const DIR = app.isPackaged
  ? path.join(app.getPath('userData'), 'data', 'archive')
  : path.join(__dirname, '..', 'data', 'archive');

function ensure() { fs.mkdirSync(DIR, { recursive: true }); }
function file(code) { return path.join(DIR, code.toLowerCase() + '.jsonl'); }

function appendIncidents(code, list) {
  if (!Array.isArray(list) || !list.length) return 0;
  // The archive is the OWNED layer — never let placeholder sample rows in.
  list = list.filter(inc => !String(inc && inc.source || '').includes('SAMPLE'));
  if (!list.length) return 0;
  ensure();
  const f = file(code);
  const seen = new Set();
  if (fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try { seen.add(JSON.parse(line).id); } catch (_) {}
    }
  }
  const stamp = new Date().toISOString();
  let out = '', n = 0;
  for (const inc of list) {
    if (inc && inc.id != null && !seen.has(inc.id)) {
      out += JSON.stringify({ ...inc, archivedAt: stamp }) + '\n';
      seen.add(inc.id); n++;
    }
  }
  if (out) fs.appendFileSync(f, out);
  return n; // number of NEW incidents archived this pass
}

function readArchive(code) {
  const f = file(code);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
}

module.exports = { appendIncidents, readArchive };
