// TomTom live congestion — RENTED. Streamed live, never archived.
async function congestionAtPoint(point, key) {
  if (!key) return { available: false, reason: 'no TOMTOM_API_KEY set' };
  const [lat, lon] = point;
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`
            + `?point=${lat},${lon}&unit=MPH&key=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('tomtom ' + res.status);
  const j = await res.json();
  const d = j.flowSegmentData || {};
  const cur = d.currentSpeed, free = d.freeFlowSpeed;
  const delayPct = (free && cur != null) ? Math.max(0, Math.round((1 - cur / free) * 100)) : null;
  return { available: true, currentSpeed: cur, freeFlowSpeed: free, delayPct, roadClosure: !!d.roadClosure, point };
}
async function congestionForMetro(state, key) { return congestionAtPoint(state.center, key); }
module.exports = { congestionForMetro, congestionAtPoint };
