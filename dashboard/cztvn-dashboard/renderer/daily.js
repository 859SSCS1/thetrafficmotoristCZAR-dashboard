// Daily Minutes — scroll through a day of traffic events. Talks to main only
// through window.cztvn (preload). Merges the owned archive (incident
// appearances) with the event log (clears, congestion shifts, card fires).
let curDate = null, allEvents = [], filter = 'all';

const $ = (id) => document.getElementById(id);

const KINDS = {
  incident:   { label: 'Incidents',  cls: 'k-incident' },
  cleared:    { label: 'Cleared',    cls: 'k-cleared'  },
  congestion: { label: 'Congestion', cls: 'k-cong'     },
  card:       { label: 'Road Cards', cls: 'k-card'     },
};

async function boot() {
  curDate = await todayFromMain();
  buildFilters();
  $('prevDay').onclick = () => shiftDay(-1);
  $('nextDay').onclick = () => shiftDay(1);
  await load();
  setInterval(load, 60 * 1000);   // refresh the current day every minute
}

async function todayFromMain() {
  // Use the newest day that has events, else the UTC today the log uses.
  const dates = await window.cztvn.getEventDates();
  if (dates && dates.length) return dates[0];
  return new Date().toISOString().slice(0, 10);
}

function buildFilters() {
  const el = $('filters');
  el.innerHTML = '';
  const mk = (key, label) => {
    const b = document.createElement('button');
    b.textContent = label; b.dataset.k = key;
    b.className = key === filter ? 'active' : '';
    b.onclick = () => { filter = key; buildFilters(); render(); };
    el.appendChild(b);
  };
  mk('all', 'All');
  Object.entries(KINDS).forEach(([k, v]) => mk(k, v.label));
}

async function shiftDay(dir) {
  const d = new Date(curDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dir);
  curDate = d.toISOString().slice(0, 10);
  await load();
}

async function load() {
  try { allEvents = await window.cztvn.getEvents(curDate) || []; }
  catch (e) { allEvents = []; }
  render();
}

function render() {
  $('dateLabel').textContent = prettyDate(curDate);
  const evts = filter === 'all' ? allEvents : allEvents.filter(e => e.kind === filter);
  // summary counts (always over the full day, not the filtered set)
  const c = { incident: 0, cleared: 0, congestion: 0, card: 0 };
  allEvents.forEach(e => { if (c[e.kind] != null) c[e.kind]++; });
  $('summary').innerHTML =
    `<b>${c.incident}</b> appeared · <b>${c.cleared}</b> cleared · <b>${c.congestion}</b> shifts · <b>${c.card}</b> cards`;

  const tl = $('timeline');
  tl.innerHTML = '';
  $('empty').hidden = evts.length > 0;
  if (!evts.length) return;

  let lastHour = null;
  for (const e of evts) {
    const hr = hourLabel(e.ts);
    if (hr !== lastHour) {
      const h = document.createElement('div');
      h.className = 'hour'; h.textContent = hr;
      tl.appendChild(h); lastHour = hr;
    }
    tl.appendChild(row(e));
  }
}

function row(e) {
  const k = KINDS[e.kind] || { cls: 'k-incident' };
  const sev = e.kind === 'incident' || e.kind === 'cleared' ? sevClass(e.severity) : '';
  const el = document.createElement('div');
  el.className = 'evt ' + k.cls + ' ' + sev;
  el.innerHTML = `
    <div class="t">${timeLabel(e.ts)}</div>
    <div class="dotcol"><span class="edot"></span></div>
    <div class="body">
      <div class="etitle">${esc(e.title || cap(e.kind))}<span class="tag">${e.state || ''}</span></div>
      ${e.detail ? `<div class="edetail">${esc(e.detail)}</div>` : ''}
    </div>`;
  return el;
}

/* ---- helpers ---- */
function sevClass(s) { return s >= 4 ? 'sev-hi' : s >= 3 ? 'sev-md' : 'sev-lo'; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function cap(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }
function timeLabel(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
function hourLabel(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(':00', ''); }
function prettyDate(d) {
  const dt = new Date(d + 'T12:00:00');
  const today = new Date().toISOString().slice(0, 10);
  const label = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return d === today ? 'Today · ' + label : label;
}

boot().catch(err => { console.error(err); document.body.insertAdjacentHTML('afterbegin',
  '<div style="padding:20px;color:#E08A6B;font-family:monospace">Boot error — ' + err + '</div>'); });
