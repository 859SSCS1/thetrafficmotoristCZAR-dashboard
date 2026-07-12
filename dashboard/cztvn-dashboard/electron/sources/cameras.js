// DOT traffic camera resolver — config-driven. Each corridor may carry a
// cameraUrl (a DOT snapshot JPEG, refreshed by appending a cache-buster).
// Cameras are public DOT feeds; wire them per state like the incident feeds.
// When cameraUrl is blank, the Live Board falls back to the corridor map.
function cameraFor(corridor) {
  if (!corridor || !corridor.cameraUrl) return null;
  const bust = corridor.cameraUrl.includes('?') ? '&' : '?';
  return corridor.cameraUrl + bust + 't=' + Date.now(); // force a fresh frame
}
module.exports = { cameraFor };
