// State 511 incidents — OWNABLE. GA is the wired example; TN/OH/FL clone this.
// If a state's incidentsUrl is blank, we return clearly-marked SAMPLE data so the
// app runs end-to-end before you plug in the real endpoint.
async function fetchIncidents(state) {
  if (!state.incidentsUrl) return sample(state);
  const key = process.env[state.code + '511_API_KEY'] || '';
  // URL expects a key but none is set yet -> keep running on sample data.
  if (state.incidentsUrl.includes('{key}') && !key) return sample(state);
  const url = state.incidentsUrl.replace('{key}', key);
  const res = await fetch(url);
  if (!res.ok) throw new Error('incidents ' + res.status);
  const j = await res.json();
  return normalize(j, state);
}

// Best-effort mapper. 511 vendors differ — adjust the field names per state.
// Handles: a bare array, {incidents:[...]}, or GeoJSON {features:[...]}.
function normalize(j, state) {
  let rows = Array.isArray(j) ? j
    : Array.isArray(j.incidents) ? j.incidents
    : Array.isArray(j.features) ? j.features.map(f => ({ ...f.properties,
        lon: f.geometry?.coordinates?.[0], lat: f.geometry?.coordinates?.[1] }))
    : [];
  return rows.map((r, i) => ({
    id:   r.id ?? r.ID ?? r.incidentId ?? `${state.code}-${i}`,
    type: r.type ?? r.eventType ?? r.EventType ?? r.category ?? 'Incident',
    road: r.road ?? r.roadName ?? r.RoadwayName ?? r.location ?? '',
    description: r.description ?? r.Description ?? r.headline ?? r.title ?? '',
    severity: severityRank(r.severity ?? r.Severity ?? r.impact),
    lat: num(r.lat ?? r.latitude ?? r.Latitude), lon: num(r.lon ?? r.longitude ?? r.Longitude),
    updated: toIso(r.updated ?? r.lastUpdated ?? r.LastUpdated) ?? new Date().toISOString(),
    source: state.code + '511'
  })).filter(x => x.description || x.road);
}

function severityRank(s) {
  if (typeof s === 'number') return s;
  const m = { minor: 1, moderate: 2, major: 3, severe: 4, critical: 5 };
  return m[String(s || '').toLowerCase()] ?? 2;
}
function num(v){ const n = parseFloat(v); return Number.isFinite(n) ? n : null; }

// Accepts ISO strings or Unix epoch (seconds or ms) — 511 vendors use all three.
function toIso(v) {
  if (v == null) return null;
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v).toISOString();
  const d = new Date(v);
  return isNaN(d) ? null : d.toISOString();
}

function sample(state) {
  const [lat, lon] = state.center;
  const near = (dl, dn) => [lat + dl, lon + dn];
  return [
    { id: state.code+'-S1', type: 'Crash', road: 'I-'+ (state.code==='GA'?'285 WB':'40 EB'), description: 'Multi-vehicle crash, right two lanes blocked', severity: 4, lat: near(0.03,-0.02)[0], lon: near(0.03,-0.02)[1], updated: new Date().toISOString(), source: 'SAMPLE — wire '+state.code+'511' },
    { id: state.code+'-S2', type: 'Construction', road: 'US-'+ (state.code==='GA'?'78':'70'), description: 'Lane closure for roadwork', severity: 2, lat: near(-0.02,0.03)[0], lon: near(-0.02,0.03)[1], updated: new Date().toISOString(), source: 'SAMPLE' },
    { id: state.code+'-S3', type: 'Disabled vehicle', road: state.metro+' Connector', description: 'Disabled vehicle on shoulder', severity: 1, lat: near(0.01,0.01)[0], lon: near(0.01,0.01)[1], updated: new Date().toISOString(), source: 'SAMPLE' }
  ];
}
module.exports = { fetchIncidents };
