// The Daily Road Card template — pure string builder, no Electron dependency,
// so it can be rendered to PDF/PNG by the app OR previewed on its own.
// Design principle: a FEW pertinent stats, beautifully rendered. Restraint is the point.

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Semicircular congestion gauge (top arc). delayPct 0..100 -> sweep + color.
function gauge(delayPct) {
  const pct = Math.max(0, Math.min(100, delayPct == null ? 0 : delayPct));
  const cx = 130, cy = 134, r = 104, f = pct / 100;
  const P = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)]; // minus sin -> upward
  const [x0, y0] = P(Math.PI);            // left end
  const [xe, ye] = P(0);                  // right end
  const [x1, y1] = P(Math.PI * (1 - f));  // value end
  const color = pct < 20 ? '#69B58C' : pct < 45 ? '#E8CB7A' : '#E08A6B';
  return `
    <svg viewBox="0 0 260 160" width="260" height="160">
      <path d="M ${x0} ${y0} A ${r} ${r} 0 0 0 ${xe} ${ye}" fill="none" stroke="#222C44" stroke-width="16" stroke-linecap="round"/>
      <path d="M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/>
      <text x="130" y="118" text-anchor="middle" fill="#F2F4F9" font-family="Georgia,serif" font-size="46" font-weight="700">${pct}%</text>
      <text x="130" y="150" text-anchor="middle" fill="#8B93A8" font-family="ui-monospace,monospace" font-size="11" letter-spacing="2">DELAY VS FREE-FLOW</text>
    </svg>`;
}

function buildHtml(data) {
  const st = data.state || {};
  const c = data.congestion || {};
  const incs = (data.incidents || []).slice().sort((a, b) => (b.severity || 0) - (a.severity || 0));
  const top = incs[0];
  const count = incs.length;
  const fuel = data.fuel;
  const when = new Date(data.generatedAt || Date.now());
  const dateStr = when.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const accent = st.accent || '#C9A24B';

  const fuelBlock = (fuel && fuel.price != null)
    ? `<div class="stat"><div class="s-n">$${Number(fuel.price).toFixed(2)}</div><div class="s-l">Avg gas ${esc(fuel.unit || '/gal')}</div></div>`
    : `<div class="stat muted"><div class="s-n">—</div><div class="s-l">Avg gas · wire EIA</div></div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    html{overflow:hidden}
    body{width:1080px;height:1080px;position:relative;color:#D7DCE8;font-family:Georgia,serif;
      -webkit-print-color-adjust:exact;print-color-adjust:exact;
      background:radial-gradient(900px 520px at 82% -10%, rgba(201,162,75,.10), transparent 60%), #0A0E1C}
    .pad{padding:66px 68px}
    .eyebrow{font-family:ui-monospace,monospace;font-size:15px;letter-spacing:.28em;text-transform:uppercase;color:${accent}}
    .eyebrow .dot{display:inline-block;width:8px;height:8px;background:${accent};transform:rotate(45deg);margin-right:12px;vertical-align:middle}
    h1{font-size:64px;font-weight:700;color:#F2F4F9;margin:16px 0 2px;line-height:1.02}
    .sub{font-size:21px;color:#AEB6C8;font-style:italic}
    .rule{height:2px;background:linear-gradient(90deg,${accent},transparent);margin:30px 0 6px}
    .grid{display:flex;gap:26px;margin-top:22px;align-items:stretch}
    .box{background:#121A2E;border:1px solid #222C44;border-radius:16px}
    .gauge-box{width:330px;text-align:center;padding:26px 20px}
    .gauge-box .cap{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.18em;color:#8B93A8;text-transform:uppercase;margin-bottom:8px}
    .gauge-box .spd{font-family:ui-monospace,monospace;font-size:14px;color:#8B93A8;margin-top:8px}
    .stacks{flex:1;display:flex;flex-direction:column;gap:20px}
    .stat{background:#121A2E;border:1px solid #222C44;border-left:4px solid ${accent};border-radius:14px;padding:22px 26px;display:flex;align-items:baseline;gap:20px}
    .stat.muted{border-left-color:#2A3650}
    .s-n{font-size:56px;font-weight:700;color:#F2F4F9;line-height:1}
    .s-l{font-family:ui-monospace,monospace;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:#8B93A8}
    .top{margin-top:26px;background:#16101a;border:1px solid #3a2740;border-left:4px solid #E08A6B;border-radius:14px;padding:24px 28px}
    .top .k{font-family:ui-monospace,monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#E08A6B}
    .top .r{font-size:28px;color:#F2F4F9;margin-top:8px;font-weight:700}
    .top .d{font-size:19px;color:#AEB6C8;margin-top:3px}
    .foot{position:absolute;bottom:54px;left:68px;right:68px;display:flex;justify-content:space-between;
      font-family:ui-monospace,monospace;font-size:13px;letter-spacing:.06em;color:#6B7488;border-top:1px solid #222C44;padding-top:16px;text-transform:uppercase}
    .foot .b{color:${accent}}
  </style></head><body><div class="pad">
    <div class="eyebrow"><span class="dot"></span>CZTVN · Daily Road Card · ${esc(st.code)}</div>
    <h1>${esc(st.name)}</h1>
    <div class="sub">${esc(st.metro)} &middot; ${esc(dateStr)}</div>
    <div class="rule"></div>
    <div class="grid">
      <div class="box gauge-box">
        <div class="cap">${esc(st.metro)} congestion</div>
        ${gauge(c.delayPct)}
        <div class="spd">${c.available ? `${c.currentSpeed == null ? '—' : c.currentSpeed} / ${c.freeFlowSpeed == null ? '—' : c.freeFlowSpeed} mph` : 'live speed unavailable'}</div>
      </div>
      <div class="stacks">
        <div class="stat"><div class="s-n">${count}</div><div class="s-l">Active incidents · ${esc(st.code)} 511</div></div>
        ${fuelBlock}
      </div>
    </div>
    ${top ? `<div class="top"><div class="k">Worst on the board</div>
      <div class="r">${esc(top.road || top.type)}</div>
      <div class="d">${esc(top.description || '')}</div></div>` : ''}
    <div class="foot"><span>TM CZAR Television Network, Inc. · CZTVN</span>
      <span class="b">Generated ${esc(timeStr)}</span><span>859SSCS1</span></div>
  </div></body></html>`;
}

module.exports = { buildHtml, gauge, esc };
