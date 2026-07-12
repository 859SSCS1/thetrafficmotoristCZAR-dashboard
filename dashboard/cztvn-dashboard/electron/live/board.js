// Builds the Live Board model: per-metro tiles with congestion, corridor detail,
// and the Speeder Watch flag. Speeder logic is AGGREGATE ONLY — it flags a
// corridor when the live FLOW speed exceeds its reference limit. It never sees,
// tracks, or identifies an individual vehicle. Monitor the driving, not the driver.
const tomtom = require('../sources/tomtom');

async function buildBoard(config, key) {
  const sp = (config.liveBoard && config.liveBoard.speeder) || { overRefPct: 0.05, cautionBonus: 0.03 };
  const tiles = [];

  for (const st of config.states) {
    const corridors = st.corridors || [];
    const detail = await Promise.all(corridors.map(async (cor) => {
      let c = { available: false };
      try { c = await tomtom.congestionAtPoint(cor.point, key); } catch (_) {}
      const ref = cor.postedRef || 65;
      const cur = c.currentSpeed;
      const overRefPct = (c.available && cur != null) ? (cur - ref) / ref : null;
      const threshold = sp.overRefPct + (cor.caution ? (sp.cautionBonus || 0) : 0);
      const speeder = overRefPct != null && overRefPct >= threshold;
      return {
        id: cor.id, name: cor.name, point: cor.point, postedRef: ref, caution: !!cor.caution,
        cameraUrl: cor.cameraUrl || '', congestion: c,
        currentSpeed: cur ?? null, overRefPct,
        overRefMph: (c.available && cur != null) ? Math.round(cur - ref) : null,
        speeder
      };
    }));

    const delayPct = detail.reduce((m, r) => Math.max(m, r.congestion.delayPct || 0), 0);
    const speederHits = detail.filter(r => r.speeder);
    tiles.push({
      code: st.code, name: st.name, metro: st.metro, center: st.center, zoom: st.zoom || 10,
      accent: st.accent, delayPct, speeder: speederHits.length > 0,
      speederTop: speederHits.sort((a, b) => (b.overRefPct || 0) - (a.overRefPct || 0))[0] || null,
      corridors: detail
    });
  }

  // Hot-list: speeders float up, then worst congestion.
  tiles.sort((a, b) => (Number(b.speeder) - Number(a.speeder)) || (b.delayPct - a.delayPct));
  return tiles;
}
module.exports = { buildBoard };
