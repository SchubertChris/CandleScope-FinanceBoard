// ══════════════════════════════════════
//  FINANZBOARD — app.js
// ══════════════════════════════════════

// ── STATE ──
let S = {
  data: [],
  accounts: { sparda_giro:0, sparda_visa:0, ing:0, scalable:0, union:0 },
  include:  { sparda_giro:true, sparda_visa:true, ing:true, scalable:false, union:false },
  monthlyIncome: 0
};
let editIdx = null;
let barChartInst = null, donutInst = null;
let postenSort = { k:'name', asc:true };
let ctSort     = { k:'contractEnd', asc:true };

const ZAHLTAG  = 15;
const VISA_DAY = 25;
const ACC_KEYS = ['sparda_giro','sparda_visa','ing','scalable','union'];
const MONTHS   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MONTHS_S = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const ACC_META = {
  sparda_giro: { label:'Sparda Fix-Giro',   sub:'Girokonto',            dot:'giro'  },
  sparda_visa: { label:'Sparda Visa',        sub:'Kreditkarte · Abr. 25.', dot:'visa'  },
  ing:         { label:'ING DiBa',           sub:'Variable Giro',        dot:'ing'   },
  scalable:    { label:'Scalable',           sub:'Depot',                dot:'depot' },
  union:       { label:'Union Invest',       sub:'VL / Depot',           dot:'depot' }
};

Chart.defaults.color = '#6b7a99';
Chart.defaults.font.family = "'DM Mono',monospace";
Chart.defaults.font.size = 10;

// ── STORAGE ──
function persist() {
  try {
    localStorage.setItem('fpv4', JSON.stringify(S));
    const dot = document.getElementById('saveDot');
    const lbl = document.getElementById('saveLabel');
    if (dot) { dot.classList.add('saved'); lbl.textContent = 'Gespeichert'; }
    setTimeout(() => { if (dot) { dot.classList.remove('saved'); lbl.textContent = 'Bereit'; } }, 1500);
  } catch(e) {}
}
function hydrate() {
  try {
    const r = localStorage.getItem('fpv4');
    if (!r) return false;
    const p = JSON.parse(r);
    if (p.data)    S.data    = p.data;
    if (p.accounts) S.accounts = Object.assign({ sparda_giro:0, sparda_visa:0, ing:0, scalable:0, union:0 }, p.accounts);
    if (p.include)  S.include  = Object.assign({ sparda_giro:true, sparda_visa:true, ing:true, scalable:false, union:false }, p.include);
    if (p.monthlyIncome !== undefined) S.monthlyIncome = p.monthlyIncome;
    return true;
  } catch(e) {} return false;
}

// ── UTILS ──
function fm(v, sign=false) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const s = v.toLocaleString('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €';
  return (sign && v > 0) ? '+' + s : s;
}
function fmShort(v) {
  if (!v || isNaN(v)) return '—';
  if (Math.abs(v) >= 1000) return (v/1000).toLocaleString('de-DE', { minimumFractionDigits:1, maximumFractionDigits:1 }) + ' K';
  return v.toLocaleString('de-DE', { minimumFractionDigits:0, maximumFractionDigits:0 });
}
function pp(v) {
  if (!v && v !== 0) return 0;
  const s = String(v).trim();
  if (s.includes(',')) return parseFloat(s.replace(/\./g,'').replace(',','.')) || 0;
  return parseFloat(s.replace(/[^\d.-]/g,'')) || 0;
}
function esc(v) {
  return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function today() { return new Date(); }
function avgMonthly(p) {
  const a = parseFloat(p.amount) || 0;
  switch (p.interval) {
    case 'monatl.':    return a;
    case 'viertelj.':  return a / 3;
    case 'halbjährl.': return a / 6;
    case 'jährl.':     return a / 12;
    case 'einmalig':   return 0;
    default:           return a;
  }
}
function activeInMonth(p, mIdx) {
  const yr    = today().getFullYear();
  const mDate = new Date(yr, mIdx, 1);
  if (p.contractEnd)   { const e = new Date(p.contractEnd);   if (mDate > new Date(e.getFullYear(), e.getMonth(), 1)) return false; }
  if (p.contractStart) { const s = new Date(p.contractStart); if (mDate < new Date(s.getFullYear(), s.getMonth(), 1)) return false; }
  if (p.interval === 'einmalig')    return false;
  if (p.interval === 'viertelj.')  { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return (((mIdx - ref) % 3) + 3) % 3 === 0; }
  if (p.interval === 'halbjährl.') { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return (((mIdx - ref) % 6) + 6) % 6 === 0; }
  if (p.interval === 'jährl.')     { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return mIdx === ref; }
  return true;
}
function monthActual(p, mIdx) {
  if (!activeInMonth(p, mIdx)) return 0;
  return parseFloat(p.amount) || 0;
}

// ── SORT HELPER ──
function sortArr(arr, k, asc) {
  return [...arr].sort((a, b) => {
    let va = a[k] ?? '', vb = b[k] ?? '';
    if (k === 'amount' || k === 'due') {
      va = parseFloat(va) || 0; vb = parseFloat(vb) || 0;
      return asc ? va - vb : vb - va;
    }
    if (k === 'contractEnd' || k === 'contractStart') {
      va = va ? new Date(va).getTime() : Infinity;
      vb = vb ? new Date(vb).getTime() : Infinity;
      return asc ? va - vb : vb - va;
    }
    return asc
      ? String(va).localeCompare(String(vb), 'de')
      : String(vb).localeCompare(String(va), 'de');
  });
}

// ── NAV ──
const PAGE_TITLES = { dashboard:'Dashboard', posten:'Umsätze', jahr:'Jahresübersicht', vertraege:'Verträge' };
function nav(el, page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('p-' + page).classList.add('active');
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
  if (page === 'dashboard') renderDashboard();
  if (page === 'posten')    renderPosten();
  if (page === 'jahr')      renderJahr();
  if (page === 'vertraege') renderVertraege();
}

// ── INPUTS ──
function setAcc(key, val)        { S.accounts[key] = pp(val); persist(); refreshDash(); }
function setInc(key, v)          { S.include[key]  = v;      persist(); refreshDash(); }
function setMonthlyIncome(val)   { S.monthlyIncome = pp(val); persist(); refreshDash(); }
function fillInputs() {
  ACC_KEYS.forEach(k => {
    const el  = document.getElementById('ai-' + k); if (el)  el.value  = S.accounts[k] > 0 ? S.accounts[k].toFixed(2).replace('.', ',') : '';
    const chk = document.getElementById('ic-' + k); if (chk) chk.checked = S.include[k] !== false;
  });
  const mi = document.getElementById('monthlyIncome');
  if (mi) mi.value = S.monthlyIncome > 0 ? S.monthlyIncome.toFixed(2).replace('.', ',') : '';
}

// ── KPI ROW ──
function renderKPIs() {
  let bal = 0; ACC_KEYS.forEach(k => { if (S.include[k]) bal += S.accounts[k]; });
  let fixOut = 0, fixIn = 0;
  S.data.forEach(p => { if (p.type === 'ausgabe') fixOut += avgMonthly(p); else fixIn += avgMonthly(p); });
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : fixIn;
  const free   = income - fixOut;
  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi blue">
      <div class="kpi-icon">🏦</div>
      <div class="kpi-label">Kontostand</div>
      <div class="kpi-val">${fm(bal)}</div>
      <div class="kpi-sub">Alle einbezogenen Konten</div>
    </div>
    <div class="kpi green">
      <div class="kpi-icon">💰</div>
      <div class="kpi-label">Monatseingang</div>
      <div class="kpi-val">${fm(income)}</div>
      <div class="kpi-sub">Zahltag: 15. des Monats</div>
    </div>
    <div class="kpi red">
      <div class="kpi-icon">📤</div>
      <div class="kpi-label">Fixausgaben Ø/Mon</div>
      <div class="kpi-val">${fm(fixOut)}</div>
      <div class="kpi-sub">${S.data.filter(p => p.type === 'ausgabe').length} hinterlegte Posten</div>
    </div>
    <div class="kpi ${free >= 0 ? 'green' : 'red'}">
      <div class="kpi-icon">${free >= 0 ? '📈' : '⚠️'}</div>
      <div class="kpi-label">Variabel frei</div>
      <div class="kpi-val">${fm(free, true)}</div>
      <div class="kpi-sub">Eingang minus Fixkosten</div>
    </div>`;
}

// ── ACCOUNTS PANEL ──
function renderAccounts() {
  document.getElementById('accList').innerHTML = ACC_KEYS.map(k => {
    const m = ACC_META[k];
    return `<div class="acc-row">
      <div class="acc-row-l">
        <div class="acc-dot ${m.dot}"></div>
        <div>
          <div class="acc-name">${m.label}</div>
          <div class="acc-type-tag">${m.sub}</div>
          <div class="acc-chk"><input type="checkbox" id="ic-${k}" onchange="setInc('${k}',this.checked)"><label for="ic-${k}">Einbeziehen</label></div>
        </div>
      </div>
      <div class="acc-inp-r">
        <input class="acc-inp" id="ai-${k}" type="text" placeholder="0,00" oninput="setAcc('${k}',this.value)">
        <span class="acc-sfx">€</span>
      </div>
    </div>`;
  }).join('');
  fillInputs();
}

// ── COCKPIT (shared data builder) ──
function buildCockpitData() {
  const n = today(), day = n.getDate(), mIdx = n.getMonth(), yr = n.getFullYear();
  let nextZahltag, daysToZ;
  if (day < ZAHLTAG) { nextZahltag = new Date(yr, mIdx, ZAHLTAG); daysToZ = ZAHLTAG - day; }
  else { const nm = (mIdx+1)%12, ny = mIdx===11?yr+1:yr; nextZahltag = new Date(ny, nm, ZAHLTAG); daysToZ = Math.round((nextZahltag - n) / 86400000); }
  let nextVisa;
  if (day < VISA_DAY) nextVisa = new Date(yr, mIdx, VISA_DAY);
  else { const nm = (mIdx+1)%12, ny = mIdx===11?yr+1:yr; nextVisa = new Date(ny, nm, VISA_DAY); }

  const getItems = (untilDate, accFilter=null) => {
    const items = [], mCheck = [mIdx], seen = new Set();
    if (untilDate.getMonth() !== mIdx || untilDate.getFullYear() !== yr) mCheck.push(untilDate.getMonth());
    mCheck.forEach(cm => {
      const cy = cm < mIdx ? yr+1 : yr;
      S.data.forEach(p => {
        if (p.type !== 'ausgabe') return;
        if (!activeInMonth(p, cm)) return;
        const dd = parseInt(p.due) || 0; if (dd < 1) return;
        if (accFilter && p.account !== accFilter) return;
        const amt = parseFloat(p.amount) || 0; if (amt <= 0) return;
        const dObj = new Date(cy, cm, dd);
        if (dObj >= new Date(yr, mIdx, day) && dObj <= untilDate) {
          const key = p.name + '_' + dd + '_' + cm;
          if (seen.has(key)) return; seen.add(key);
          items.push({ name:p.name, due:dd, dueMo:cm, amt, isNxt:cm!==mIdx, urgent:cm===mIdx&&(dd-day)<=2&&dd>=day });
        }
      });
    });
    return items.sort((a,b) => a.dueMo !== b.dueMo ? a.dueMo - b.dueMo : a.due - b.due);
  };

  const giroItems = getItems(nextZahltag);
  const totalG    = giroItems.reduce((s,i) => s + i.amt, 0);
  const visaItems = getItems(nextVisa, 'sparda_visa');
  const totalV    = visaItems.reduce((s,i) => s + i.amt, 0);
  const giroBal   = (S.include['sparda_giro'] ? S.accounts['sparda_giro'] : 0) + (S.include['ing'] ? S.accounts['ing'] : 0);
  const nach15    = giroBal - totalG;
  const visaSaldo = S.accounts['sparda_visa'] - totalV;
  const pctZ      = Math.min(Math.max(((30 - daysToZ) / 30) * 100, 2), 98);
  let daysToV     = day < VISA_DAY ? VISA_DAY - day : Math.round((nextVisa - n) / 86400000);
  const pctV      = Math.min(Math.max(((30 - daysToV) / 30) * 100, 2), 98);

  return { n, day, mIdx, yr, nextZahltag, daysToZ, nextVisa, daysToV, giroItems, totalG, visaItems, totalV, giroBal, nach15, visaSaldo, pctZ, pctV };
}

function renderCockpit() {
  const d = buildCockpitData();
  document.getElementById('cockpitSub').textContent = `Heute ${d.day}. ${MONTHS[d.mIdx]} · Zahltag in ${d.daysToZ} Tagen`;
  document.getElementById('cockpitTag').textContent = `${d.day}. → 15. ${MONTHS_S[d.nextZahltag.getMonth()]}`;

  const makeItems = items => items.length === 0
    ? `<div class="due-empty">✓ Keine weiteren Abbuchungen</div>`
    : items.map(i => `<div class="due-row${i.isNxt?' next-m':''}${i.urgent?' urgent':''}">
        <div class="due-row-l">
          <span class="due-day-pill">${i.due}.${i.isNxt?' '+MONTHS_S[i.dueMo]:''}</span>
          <span class="due-name">${esc(i.name)}</span>
        </div>
        <span class="due-amt">−${fm(i.amt)}</span>
      </div>`).join('');

  document.getElementById('cockpitCols').innerHTML = `
    <div class="cockpit-col">
      <div class="cockpit-lbl">Giro — bis 15. ${MONTHS_S[d.nextZahltag.getMonth()]}</div>
      <div class="prog-track"><div class="prog-fill" style="width:${d.pctZ}%;background:var(--blue)"></div></div>
      <div class="prog-labels"><span>15. ${MONTHS_S[d.mIdx===0?11:d.mIdx-1]}</span><span style="color:var(--blue)">15. ${MONTHS_S[d.nextZahltag.getMonth()]}</span></div>
      <div style="margin:10px 0 8px;">
        <div class="sum-line"><span class="sum-line-lbl">Giro-Stand</span><span class="sum-line-val" style="color:var(--blue)">${fm(d.giroBal)}</span></div>
        <div class="sum-line"><span class="sum-line-lbl">Noch fällig</span><span class="sum-line-val" style="color:var(--red)">−${fm(d.totalG)}</span></div>
        <div class="sum-line total"><span class="sum-line-lbl">Verbleibend</span><span class="sum-line-val" style="color:${d.nach15>=0?'var(--green)':'var(--red)'}">${fm(d.nach15,true)}</span></div>
      </div>
      <div class="due-list">${makeItems(d.giroItems)}</div>
    </div>
    <div class="cockpit-col">
      <div class="cockpit-lbl">Visa — Abrechnung 20. ${MONTHS_S[d.nextVisa.getMonth()]}</div>
      <div class="prog-track"><div class="prog-fill" style="width:${d.pctV}%;background:var(--amber)"></div></div>
      <div class="prog-labels"><span>1. ${MONTHS_S[d.mIdx]}</span><span style="color:var(--amber)">20. ${MONTHS_S[d.nextVisa.getMonth()]}</span></div>
      <div style="margin:10px 0 8px;">
        <div class="sum-line"><span class="sum-line-lbl">Visa-Stand</span><span class="sum-line-val" style="color:var(--amber)">${fm(S.accounts['sparda_visa'])}</span></div>
        <div class="sum-line"><span class="sum-line-lbl">Offene Buchungen</span><span class="sum-line-val" style="color:var(--red)">−${fm(d.totalV)}</span></div>
        <div class="sum-line total"><span class="sum-line-lbl">Visa-Saldo</span><span class="sum-line-val" style="color:${d.visaSaldo>=0?'var(--green)':'var(--red)'}">${fm(d.visaSaldo,true)}</span></div>
      </div>
      <div class="due-list">${d.visaItems.length > 0 ? makeItems(d.visaItems) : `<div class="due-empty">Keine Visa-Posten hinterlegt<br><span style="font-size:.9em;opacity:.6">→ Konto beim Posten zuweisen</span></div>`}</div>
    </div>`;
}

// ── BAR CHART ──
function renderBarChart() {
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : 0;
  const incomes = [], expenses = [];
  for (let m = 0; m < 12; m++) {
    let inc = income, exp = 0;
    S.data.forEach(p => { const v = monthActual(p, m); if (p.type === 'einnahme') inc += v; else exp += v; });
    incomes.push(inc); expenses.push(exp);
  }
  if (barChartInst) { barChartInst.destroy(); barChartInst = null; }
  barChartInst = new Chart(document.getElementById('barChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: MONTHS_S,
      datasets: [
        { label:'Einnahmen', data:incomes,  backgroundColor:'rgba(0,229,160,.25)', borderColor:'rgba(0,229,160,.7)', borderWidth:1, borderRadius:3 },
        { label:'Ausgaben',  data:expenses, backgroundColor:'rgba(255,77,106,.2)', borderColor:'rgba(255,77,106,.6)', borderWidth:1, borderRadius:3 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend: { display:true, labels:{ boxWidth:10, padding:14, color:'#6b7a99' } },
        tooltip: { backgroundColor:'#1d2235', borderColor:'#252d42', borderWidth:1, padding:10, callbacks:{ label:c => ' '+fm(c.raw) } }
      },
      scales: {
        x: { grid:{ color:'rgba(255,255,255,.03)', drawBorder:false }, ticks:{ color:'#4a5566' } },
        y: { grid:{ color:'rgba(255,255,255,.03)', drawBorder:false }, ticks:{ color:'#4a5566', callback:v => fmShort(v)+' €' } }
      }
    }
  });
}

// ── DONUT CHART ──
const DONUT_COLORS = ['#4d9eff','#ff4d6a','#00e5a0','#ffb547','#7b5fff','#00d4cc','#ff8c42','#c084fc'];
function renderDonut() {
  const cats = {};
  S.data.forEach(p => {
    if (p.type !== 'ausgabe') return;
    const v = avgMonthly(p); if (v <= 0) return;
    cats[p.name] = (cats[p.name] || 0) + v;
  });
  const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,8);
  const total   = entries.reduce((s,[,v]) => s+v, 0);
  document.getElementById('donutTotal').textContent = fmShort(total) + ' €';
  if (donutInst) { donutInst.destroy(); donutInst = null; }
  if (entries.length === 0) {
    document.getElementById('donutLegend').innerHTML = '<div style="font-size:.72em;color:var(--text3);text-align:center;padding:8px 0;">Keine Ausgaben</div>';
    return;
  }
  donutInst = new Chart(document.getElementById('donutChart').getContext('2d'), {
    type: 'doughnut',
    data: { labels:entries.map(e=>e[0]), datasets:[{ data:entries.map(e=>e[1]), backgroundColor:DONUT_COLORS, borderWidth:0, hoverBorderWidth:2, hoverBorderColor:'#fff' }] },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'72%',
      plugins: { legend:{ display:false }, tooltip:{ backgroundColor:'#1d2235', borderColor:'#252d42', borderWidth:1, padding:8, callbacks:{ label:c=>' '+fm(c.raw) } } }
    }
  });
  document.getElementById('donutLegend').innerHTML = entries.map(([name,val],i) => `
    <div class="donut-legend-row">
      <div class="donut-legend-l"><div class="donut-legend-dot" style="background:${DONUT_COLORS[i]};"></div>${esc(name)}</div>
      <div class="donut-legend-val">${fm(val)}</div>
    </div>`).join('');
}

// ── CONTRACT BADGE ──
function updateContractBadge() {
  const n    = today();
  const warn = S.data.filter(p => { if (!p.contractEnd) return false; return Math.round((new Date(p.contractEnd)-n)/86400000) <= 90; });
  const b    = document.getElementById('contractBadge');
  if (b) { b.style.display = warn.length > 0 ? '' : 'none'; b.textContent = warn.length; }
}

// ── DASHBOARD ──
function refreshDash() { renderKPIs(); renderCockpit(); renderBarChart(); renderDonut(); }
function renderDashboard() {
  const d = document.getElementById('todayStr');
  if (d) d.textContent = today().toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  renderAccounts(); fillInputs(); refreshDash(); updateContractBadge();
}

// ── POSTEN TABLE (sortierbar) ──
function applyPostenSort() {
  document.querySelectorAll('#postenThead th.sortable').forEach(th => {
    th.classList.remove('sort-asc','sort-desc');
    const arr = th.querySelector('.sort-arr'); if (arr) arr.textContent = '↕';
  });
  const active = document.querySelector(`#postenThead th[data-k="${postenSort.k}"]`);
  if (active) {
    active.classList.add(postenSort.asc ? 'sort-asc' : 'sort-desc');
    const arr = active.querySelector('.sort-arr'); if (arr) arr.textContent = postenSort.asc ? '↑' : '↓';
  }
}
function renderPosten() {
  // Attach sort click handlers
  document.querySelectorAll('#postenThead th.sortable').forEach(th => {
    th.onclick = () => {
      const k = th.dataset.k;
      if (postenSort.k === k) postenSort.asc = !postenSort.asc;
      else { postenSort.k = k; postenSort.asc = true; }
      applyPostenSort(); renderPosten();
    };
  });
  applyPostenSort();
  const sorted = sortArr(S.data, postenSort.k, postenSort.asc);
  const body = document.getElementById('postenBody');
  const foot = document.getElementById('postenFoot');
  body.innerHTML = ''; let totIn = 0, totOut = 0;
  sorted.forEach(p => {
    const i  = S.data.indexOf(p);
    const mv = avgMonthly(p);
    if (p.type === 'einnahme') totIn += mv; else totOut += mv;
    let endBadge = '';
    if (p.contractEnd) {
      const e = new Date(p.contractEnd), diff = Math.round((e - today()) / 86400000);
      if (diff < 0)    endBadge = '<span class="badge expired">Abgelaufen</span>';
      else if (diff <= 30) endBadge = `<span class="badge warn">${diff}d</span>`;
      else if (diff <= 90) endBadge = `<span class="badge warn">${Math.round(diff/30)}M</span>`;
      else endBadge = `<span class="badge ok">${e.toLocaleDateString('de-DE')}</span>`;
    } else if (p.contractStart) endBadge = '<span class="badge info">läuft</span>';
    const tr = document.createElement('tr'); tr.className = 't-' + (p.type === 'einnahme' ? 'in' : 'out');
    tr.innerHTML = `
      <td><input class="cedit" value="${esc(p.name)}" onchange="upField(${i},'name',this.value)"></td>
      <td><select class="cedit-sel" onchange="upField(${i},'type',this.value);renderPosten()"><option value="ausgabe" ${p.type==='ausgabe'?'selected':''}>Ausgabe</option><option value="einnahme" ${p.type==='einnahme'?'selected':''}>Einnahme</option></select></td>
      <td><select class="cedit-sel" onchange="upField(${i},'interval',this.value)"><option value="monatl." ${p.interval==='monatl.'?'selected':''}>monatl.</option><option value="viertelj." ${p.interval==='viertelj.'?'selected':''}>viertelj.</option><option value="halbjährl." ${p.interval==='halbjährl.'?'selected':''}>halbjährl.</option><option value="jährl." ${p.interval==='jährl.'?'selected':''}>jährl.</option><option value="einmalig" ${p.interval==='einmalig'?'selected':''}>einmalig</option></select></td>
      <td><input class="cedit mono" value="${esc(p.due||'')}" onchange="upField(${i},'due',this.value)" style="width:32px;text-align:center;" placeholder="—"></td>
      <td><select class="cedit-sel" onchange="upField(${i},'account',this.value)"><option value="" ${!p.account?'selected':''}>—</option><option value="sparda_giro" ${p.account==='sparda_giro'?'selected':''}>Sparda Giro</option><option value="sparda_visa" ${p.account==='sparda_visa'?'selected':''}>Sparda Visa</option><option value="ing" ${p.account==='ing'?'selected':''}>ING DiBa</option></select></td>
      <td class="${p.type==='einnahme'?'amt-in':'amt-out'}"><input class="cedit mono" value="${(parseFloat(p.amount)||0).toFixed(2)}" onchange="upFieldNum(${i},'amount',this.value)" style="width:80px;text-align:right;"></td>
      <td class="r" style="color:var(--text2);">${mv>0?fm(mv):'—'}</td>
      <td>${endBadge||'<span style="color:var(--text3);font-size:.78em;">—</span>'} <button class="btn sm" style="margin-left:3px;" onclick="openModal(${i})">✎</button></td>
      <td class="r"><button class="btn sm danger" onclick="delPosten(${i})">✕</button></td>`;
    body.appendChild(tr);
  });
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : totIn;
  const free   = income - totOut;
  foot.innerHTML = `<tr><td colspan="5">Monatssaldo (Ø)</td><td></td><td class="r" style="color:${free>=0?'var(--green)':'var(--red)'}">${fm(free,true)}</td><td colspan="2"></td></tr>`;
  const cnt = document.getElementById('postenCount');
  if (cnt) cnt.textContent = `${S.data.filter(p=>p.type==='einnahme').length} Einnahmen · ${S.data.filter(p=>p.type==='ausgabe').length} Ausgaben`;
  const sal = document.getElementById('postenSaldo');
  if (sal) { sal.textContent = 'Ø/Monat: ' + fm(free, true); sal.style.color = free >= 0 ? 'var(--green)' : 'var(--red)'; }
}
function upField(i, f, v)    { S.data[i][f] = v;                                            persist(); refreshDash(); }
function upFieldNum(i, f, v) { S.data[i][f] = parseFloat(String(v).replace(',','.')) || 0;  persist(); renderPosten(); refreshDash(); }
function delPosten(i) {
  if (!confirm(`"${S.data[i].name}" löschen?`)) return;
  S.data.splice(i, 1); persist(); renderPosten(); refreshDash();
  if (document.getElementById('p-vertraege').classList.contains('active')) renderVertraege();
  if (document.getElementById('p-jahr').classList.contains('active'))      renderJahr();
  updateContractBadge();
}

// ── MODAL ──
function openModal(idx) {
  editIdx = idx !== undefined ? idx : null;
  document.getElementById('modalH').textContent = editIdx !== null ? 'Posten bearbeiten' : 'Neuer Posten';
  if (editIdx !== null) {
    const p = S.data[editIdx];
    document.getElementById('fName').value     = p.name;
    document.getElementById('fType').value     = p.type;
    document.getElementById('fAmount').value   = p.amount;
    document.getElementById('fInterval').value = p.interval;
    document.getElementById('fDue').value      = p.due || '';
    document.getElementById('fAccount').value  = p.account || '';
    document.getElementById('fNote').value     = p.note || '';
    document.getElementById('fStart').value    = p.contractStart || '';
    document.getElementById('fEnd').value      = p.contractEnd || '';
  } else {
    ['fName','fAmount','fDue','fStart','fEnd','fNote'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fType').value     = 'ausgabe';
    document.getElementById('fInterval').value = 'monatl.';
    document.getElementById('fAccount').value  = '';
  }
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('fName').focus(), 50);
}
function closeModal()    { document.getElementById('modalOverlay').classList.remove('open'); }
function overlayClick(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }
function savePosten() {
  const name = document.getElementById('fName').value.trim();
  if (!name) { document.getElementById('fName').focus(); return; }
  const p = {
    name, type:document.getElementById('fType').value,
    amount:parseFloat(document.getElementById('fAmount').value) || 0,
    interval:document.getElementById('fInterval').value,
    due:document.getElementById('fDue').value.trim(),
    account:document.getElementById('fAccount').value,
    note:document.getElementById('fNote').value.trim(),
    contractStart:document.getElementById('fStart').value,
    contractEnd:document.getElementById('fEnd').value
  };
  if (editIdx !== null) S.data[editIdx] = p; else S.data.push(p);
  persist(); closeModal(); renderPosten(); refreshDash();
  if (document.getElementById('p-vertraege').classList.contains('active')) renderVertraege();
  if (document.getElementById('p-jahr').classList.contains('active'))      renderJahr();
  updateContractBadge();
}

// ── JAHRESÜBERSICHT ──
function renderJahr() {
  const grid = document.getElementById('yearGrid'); grid.innerHTML = '';
  const n = today(), curMo = n.getMonth(), yr = n.getFullYear();
  for (let m = 0; m < 12; m++) {
    let inc = 0, exp = 0;
    S.data.forEach(p => { const v = monthActual(p, m); if (p.type === 'einnahme') inc += v; else exp += v; });
    if (inc === 0 && S.monthlyIncome > 0) inc = S.monthlyIncome;
    const bal = inc - exp;
    const expiring = S.data.filter(p => { if (!p.contractEnd) return false; const e = new Date(p.contractEnd); return e.getMonth()===m && e.getFullYear()===yr; });
    const card = document.createElement('div');
    card.className = `month-card${m===curMo?' cur':''}${m<curMo?' past':''}`;
    card.innerHTML = `
      <div class="mc-name">${MONTHS_S[m]}${m===curMo?' ·&nbsp;<span style="color:var(--blue)">heute</span>':''}</div>
      <div class="mc-row"><span class="mc-row-lbl">Einnahmen</span><span class="mc-row-val" style="color:var(--green)">${inc>0?'+'+fm(inc):'—'}</span></div>
      <div class="mc-row"><span class="mc-row-lbl">Ausgaben</span><span class="mc-row-val" style="color:var(--red)">${exp>0?'−'+fm(exp):'—'}</span></div>
      <hr class="mc-hr">
      <div class="mc-bal" style="color:${bal>=0?'var(--green)':'var(--red)'}">${fm(bal,true)}</div>
      ${expiring.map(p=>`<span class="mc-contract-tag">⏱ ${esc(p.name)}</span>`).join('')}`;
    grid.appendChild(card);
  }
}

// ── VERTRÄGE (sortierbar) ──
function doCtSort(k) {
  if (ctSort.k === k) ctSort.asc = !ctSort.asc; else { ctSort.k = k; ctSort.asc = true; }
  renderVertraege();
}
function renderVertraege() {
  const el    = document.getElementById('contractList');
  const items = S.data.filter(p => p.contractEnd || p.contractStart);
  if (items.length === 0) {
    el.innerHTML = `<div style="padding:48px;text-align:center;color:var(--text3);">
      <div style="font-size:2em;margin-bottom:12px;opacity:.25">📋</div>
      <div style="font-weight:600;margin-bottom:4px;color:var(--text2)">Keine Verträge hinterlegt</div>
      <div style="font-size:.8em">Beim Anlegen eines Postens Start- und/oder Enddatum eingeben</div>
    </div>`; return;
  }
  const sorted = sortArr(items, ctSort.k, ctSort.asc);
  const n = today();
  const thS = (k, lbl) => {
    const active = ctSort.k === k;
    const cls = active ? (ctSort.asc ? 'sort-asc' : 'sort-desc') : '';
    const arr = active ? (ctSort.asc ? '↑' : '↓') : '↕';
    return `<span class="sortable ${cls}" onclick="doCtSort('${k}')">${lbl} <small style="opacity:.5">${arr}</small></span>`;
  };
  el.innerHTML = `<div class="ct-list">
    <div class="ct-header">
      ${thS('name','Bezeichnung')}${thS('contractStart','Start')}${thS('contractEnd','Ende')}
      ${thS('amount','Betrag')}<span>Intervall</span><span>Status</span><span></span>
    </div>
    ${sorted.map(p => {
      const idx = S.data.indexOf(p);
      const s   = p.contractStart ? new Date(p.contractStart) : null;
      const e   = p.contractEnd   ? new Date(p.contractEnd)   : null;
      const diff = e ? Math.round((e - n) / 86400000) : null;
      let badge = '<span class="badge info">Laufend</span>', fillCls = 'blue', pct = 50;
      if (diff !== null) {
        if (diff < 0)       { badge = '<span class="badge expired">Abgelaufen</span>';                     fillCls = 'red';   pct = 100; }
        else if (diff <= 30){ badge = `<span class="badge warn">${diff} Tage</span>`;                      fillCls = 'amber'; pct = 95; }
        else if (diff <= 90){ badge = `<span class="badge warn">${Math.round(diff/30)} Monate</span>`;    fillCls = 'amber'; pct = 85; }
        else                { badge = `<span class="badge ok">${Math.round(diff/30)} Mon.</span>`; }
        if (s && e && diff >= 0) { const tot=(e-s)/86400000, ela=(n-s)/86400000; pct=tot>0?Math.min(Math.max((ela/tot)*100,2),100):50; }
      }
      return `<div class="ct-row">
        <div>
          <div class="ct-name">${esc(p.name)}</div>
          ${p.note ? `<div class="ct-note">${esc(p.note)}</div>` : ''}
          <div class="ct-prog"><div class="ct-prog-fill ${fillCls}" style="width:${pct.toFixed(0)}%"></div></div>
        </div>
        <div class="ct-cell">${s ? s.toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'}) : '—'}</div>
        <div class="ct-cell" style="${diff!==null&&diff>=0&&diff<=90?'color:var(--amber);font-weight:600':''}">${e ? e.toLocaleDateString('de-DE') : '—'}</div>
        <div class="ct-cell r">${fm(parseFloat(p.amount)||0)}</div>
        <div class="ct-cell">${p.interval}</div>
        <div class="ct-cell">${badge}</div>
        <div class="ct-cell actions"><button class="btn sm" onclick="openModal(${idx})">✎</button></div>
      </div>`;
    }).join('')}
  </div>`;
}

// ── EXPORT JSON / IMPORT ──
function exportAll() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'finanzboard_' + new Date().toISOString().slice(0,10) + '.json'; a.click();
}
function importAll() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const r = new FileReader();
    r.onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (p.data)    S.data    = p.data;
        if (p.accounts) S.accounts = Object.assign(S.accounts, p.accounts);
        if (p.include)  S.include  = Object.assign(S.include, p.include);
        if (p.monthlyIncome !== undefined) S.monthlyIncome = p.monthlyIncome;
        persist(); renderDashboard(); alert('✓ Import erfolgreich');
      } catch(err) { alert('Fehler: ' + err.message); }
    };
    r.readAsText(e.target.files[0]);
  };
  inp.click();
}

// ── PDF EXPORT (3 Seiten) ──
function exportPDF() {
  const n = today(), day = n.getDate(), mIdx = n.getMonth(), yr = n.getFullYear();
  const dateStr = n.toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  let bal = 0; ACC_KEYS.forEach(k => { if (S.include[k]) bal += S.accounts[k]; });
  let fixOut = 0, fixIn = 0;
  S.data.forEach(p => { if (p.type === 'ausgabe') fixOut += avgMonthly(p); else fixIn += avgMonthly(p); });
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : fixIn;
  const free   = income - fixOut;
  const cd     = buildCockpitData();

  const LOGO = `<div class="pdf-hd-logobox"><svg viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="4" fill="#111"/><path d="M5 10 L8.5 13.5 L15 6.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  const HDR  = sub => `<div class="pdf-hd"><div class="pdf-hd-logo">${LOGO}<div><div class="pdf-hd-name">FinanzBoard 2026</div><div class="pdf-hd-sub">Persönliche Finanzen · ${yr}</div></div></div><div class="pdf-hd-right"><div class="pdf-hd-date">${dateStr}</div><div style="margin-top:2px;">${sub}</div></div></div>`;
  const FT   = `<div class="pdf-ft"><div class="pdf-ft-logo">${LOGO}<span>FinanzBoard 2026 — Persönlicher Finanzreport</span></div><span>Erstellt: ${n.toLocaleDateString('de-DE')}</span></div>`;

  // Due items HTML
  const dueHtml = items => items.length === 0
    ? `<div style="font-size:6.5pt;color:#aaa;padding:4px 0;">✓ Keine weiteren Fälligkeiten</div>`
    : items.map(i => `<div class="pdf-due-item"><span><span class="pdf-due-pill">${i.due}.${i.isNxt?' '+MONTHS_S[i.dueMo]:''}</span>${esc(i.name)}</span><span class="pdf-due-amt">−${fm(i.amt)}</span></div>`).join('');

  // Konten rows
  const kontenRows = ACC_KEYS.map(k => {
    const m = ACC_META[k];
    return `<tr><td>${m.label}</td><td style="color:#777;">${m.sub}</td><td class="r">${S.accounts[k]>0?fm(S.accounts[k]):'—'}</td><td style="text-align:center;font-size:6.5pt;">${S.include[k]?'✓':''}</td></tr>`;
  }).join('');

  // Posten rows (sorted by amount)
  const accLabel = { sparda_giro:'Sparda Giro', sparda_visa:'Sparda Visa', ing:'ING DiBa', '':'—' };
  const postenSorted = sortArr(S.data.filter(p=>p.type==='ausgabe'), 'amount', false).concat(sortArr(S.data.filter(p=>p.type==='einnahme'), 'amount', false));
  const postenRows   = postenSorted.map(p => `<tr><td>${esc(p.name)}</td><td>${p.type==='ausgabe'?'Ausgabe':'Einnahme'}</td><td>${p.interval}</td><td style="text-align:center;">${p.due?p.due+'.':'—'}</td><td>${accLabel[p.account||'']||'—'}</td><td class="${p.type==='ausgabe'?'neg':'pos'}">${fm(parseFloat(p.amount)||0)}</td><td class="r" style="color:#888;">${avgMonthly(p)>0?fm(avgMonthly(p)):'—'}</td></tr>`).join('');

  // Contract rows
  const ctItems = sortArr(S.data.filter(p => p.contractEnd || p.contractStart), 'contractEnd', true);
  const ctRows  = ctItems.map(p => {
    const s = p.contractStart ? new Date(p.contractStart) : null;
    const e = p.contractEnd   ? new Date(p.contractEnd)   : null;
    const diff = e ? Math.round((e - n) / 86400000) : null;
    let stTxt = 'Laufend', stCls = 'run';
    if (diff !== null) {
      if (diff < 0)       { stTxt = 'Abgelaufen';              stCls = 'bad'; }
      else if (diff <= 30){ stTxt = diff + ' Tage';            stCls = 'warn'; }
      else if (diff <= 90){ stTxt = Math.round(diff/30)+' Mon.'; stCls = 'warn'; }
      else                { stTxt = Math.round(diff/30)+' Mon. verbl.'; stCls = 'ok'; }
    }
    return `<tr><td>${esc(p.name)}${p.note?`<br><span style="font-size:6pt;color:#aaa;">${esc(p.note)}</span>`:''}</td><td>${s?s.toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'}):'—'}</td><td>${e?e.toLocaleDateString('de-DE'):'—'}</td><td class="r">${fm(parseFloat(p.amount)||0)}</td><td>${p.interval}</td><td><span class="pdf-pill ${stCls}">${stTxt}</span></td></tr>`;
  }).join('');

  // Year grid
  const yearCards = Array.from({ length:12 }, (_,m) => {
    let inc = 0, exp = 0;
    S.data.forEach(p => { const v = monthActual(p,m); if (p.type==='einnahme') inc+=v; else exp+=v; });
    if (inc === 0 && S.monthlyIncome > 0) inc = S.monthlyIncome;
    const bal2 = inc - exp, isCur = m === mIdx;
    return `<div class="pdf-mc${isCur?' cur':''}"><div class="pdf-mc-name">${MONTHS_S[m]}${isCur?' ★':''}</div><div class="pdf-mc-row"><span class="pdf-mc-lbl">Einnahmen</span><span class="pdf-mc-val" style="color:#1a6b1a;">${inc>0?'+'+fm(inc):'—'}</span></div><div class="pdf-mc-row"><span class="pdf-mc-lbl">Ausgaben</span><span class="pdf-mc-val" style="color:#b00;">${exp>0?'−'+fm(exp):'—'}</span></div><div class="pdf-mc-bal" style="color:${bal2>=0?'#1a6b1a':'#b00'}">${fm(bal2,true)}</div></div>`;
  }).join('');

  document.getElementById('pdf-root').innerHTML = `
  <div class="pdf-page">
    ${HDR('Übersicht & Zahlungsplan')}
    <div class="pdf-sec">Finanzübersicht — ${MONTHS[mIdx]} ${yr}</div>
    <div class="pdf-kpis">
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Kontostand</div><div class="pdf-kpi-val">${fm(bal)}</div><div class="pdf-kpi-sub">Einbezogene Konten</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Monatseingang</div><div class="pdf-kpi-val">${fm(income)}</div><div class="pdf-kpi-sub">Zahltag 15.</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Fixausgaben Ø/Mon</div><div class="pdf-kpi-val">${fm(fixOut)}</div><div class="pdf-kpi-sub">${S.data.filter(p=>p.type==='ausgabe').length} Posten</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Variabel frei</div><div class="pdf-kpi-val" style="color:${free>=0?'#1a6b1a':'#b00'};">${fm(free,true)}</div><div class="pdf-kpi-sub">Eingang − Fixkosten</div></div>
    </div>
    <div class="pdf-sec">Zahlungsplan — Giro & Visa</div>
    <div class="pdf-cockpit">
      <div class="pdf-cc">
        <div class="pdf-cc-lbl">Giro — bis 15. ${MONTHS_S[cd.nextZahltag.getMonth()]}</div>
        <div class="pdf-progbar"><div class="pdf-progfill" style="width:${cd.pctZ}%"></div></div>
        <div class="pdf-proglbls"><span>15. ${MONTHS_S[mIdx===0?11:mIdx-1]}</span><span>15. ${MONTHS_S[cd.nextZahltag.getMonth()]} (in ${cd.daysToZ} Tagen)</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Giro-Stand</span><span class="pdf-sl-val">${fm(cd.giroBal)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Noch fällig</span><span class="pdf-sl-val">−${fm(cd.totalG)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Verbleibend</span><span class="pdf-sl-val" style="color:${cd.nach15>=0?'#1a6b1a':'#b00'};font-weight:700;">${fm(cd.nach15,true)}</span></div>
        ${dueHtml(cd.giroItems)}
      </div>
      <div class="pdf-cc">
        <div class="pdf-cc-lbl">Visa — Abrechnung 20. ${MONTHS_S[cd.nextVisa.getMonth()]}</div>
        <div class="pdf-progbar"><div class="pdf-progfill" style="width:${cd.pctV}%"></div></div>
        <div class="pdf-proglbls"><span>1. ${MONTHS_S[mIdx]}</span><span>20. ${MONTHS_S[cd.nextVisa.getMonth()]} (in ${cd.daysToV} Tagen)</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Visa-Stand</span><span class="pdf-sl-val">${fm(S.accounts['sparda_visa'])}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Offene Buchungen</span><span class="pdf-sl-val">−${fm(cd.totalV)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Visa-Saldo</span><span class="pdf-sl-val" style="color:${cd.visaSaldo>=0?'#1a6b1a':'#b00'};font-weight:700;">${fm(cd.visaSaldo,true)}</span></div>
        ${dueHtml(cd.visaItems)}
      </div>
    </div>
    <div class="pdf-sec">Kontostände</div>
    <table class="pdf-tbl">
      <thead><tr><th>Konto</th><th>Typ</th><th class="r">Stand</th><th style="text-align:center;">Einbez.</th></tr></thead>
      <tbody>${kontenRows}</tbody>
      <tfoot><tr><td colspan="2"><strong>Gesamt (einbezogen)</strong></td><td class="r"><strong>${fm(bal)}</strong></td><td></td></tr></tfoot>
    </table>
    ${FT}
  </div>

  <div class="pdf-page">
    ${HDR('Umsätze & Posten')}
    <div class="pdf-sec">Alle festen Posten — sortiert nach Betrag</div>
    <table class="pdf-tbl">
      <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th style="text-align:center;">Fällig</th><th>Konto</th><th class="r">Betrag</th><th class="r">Ø/Mon</th></tr></thead>
      <tbody>${postenRows}</tbody>
      <tfoot><tr><td colspan="5"><strong>Monatssaldo (Eingang − Ausgaben Ø)</strong></td><td></td><td class="r" style="color:${free>=0?'#1a6b1a':'#b00'};"><strong>${fm(free,true)}</strong></td></tr></tfoot>
    </table>
    ${FT}
  </div>

  <div class="pdf-page">
    ${HDR('Verträge & Jahresübersicht')}
    <div class="pdf-sec">Verträge & Laufzeiten</div>
    ${ctItems.length > 0
      ? `<table class="pdf-tbl"><thead><tr><th>Bezeichnung</th><th>Start</th><th>Ende</th><th class="r">Betrag</th><th>Intervall</th><th>Status</th></tr></thead><tbody>${ctRows}</tbody></table>`
      : '<div style="font-size:8pt;color:#999;padding:6px 0 10px;">Keine Verträge hinterlegt.</div>'}
    <div class="pdf-sec">Jahresübersicht ${yr} — Monatliche Saldi</div>
    <div class="pdf-yg">${yearCards}</div>
    ${FT}
  </div>`;

  window.print();
}

// ── INIT ──
function init() {
  const had = hydrate();
  if (!had) {
    S.monthlyIncome = 3200.00;
    S.include = { sparda_giro:true, sparda_visa:true, ing:true, scalable:false, union:false };
    S.data = [
      { name:'Wohnungsmiete',    type:'ausgabe', amount:820.00, interval:'monatl.',   due:'1',  account:'sparda_giro', note:'',                        contractStart:'2023-01-01', contractEnd:'' },
      { name:'Vodafone DSL',     type:'ausgabe', amount:39.99,  interval:'monatl.',   due:'5',  account:'sparda_giro', note:'',                        contractStart:'2024-03-15', contractEnd:'2026-03-14' },
      { name:'Nebenkosten',      type:'ausgabe', amount:120.00, interval:'monatl.',   due:'15', account:'sparda_giro', note:'Abschlag',               contractStart:'',           contractEnd:'' },
      { name:'Fitnessstudio',    type:'ausgabe', amount:25.00,  interval:'monatl.',   due:'10', account:'sparda_visa', note:'',                        contractStart:'2024-09-01', contractEnd:'2026-08-31' },
      { name:'Versicherung KFZ', type:'ausgabe', amount:98.50,  interval:'halbjährl.', due:'1', account:'sparda_giro', note:'',                        contractStart:'2026-01-01', contractEnd:'2027-12-31' },
      { name:'Autokreditrate',   type:'ausgabe', amount:285.00, interval:'monatl.',   due:'20', account:'sparda_giro', note:'',                        contractStart:'2022-06-01', contractEnd:'2028-05-31' },
      { name:'Netflix',          type:'ausgabe', amount:12.99,  interval:'monatl.',   due:'8',  account:'sparda_visa', note:'',                        contractStart:'',           contractEnd:'' },
      { name:'Krankenversicherung', type:'ausgabe', amount:329.50, interval:'monatl.', due:'1', account:'sparda_giro', note:'Arbeitnehmer+Arbeitgeber', contractStart:'', contractEnd:'' },
      { name:'GEZ',              type:'ausgabe', amount:18.36,  interval:'monatl.',   due:'12', account:'sparda_giro', note:'',                        contractStart:'',           contractEnd:'' },
      { name:'Telekomvertrag',   type:'ausgabe', amount:22.50,  interval:'monatl.',   due:'25', account:'sparda_visa', note:'Kündigbar zum 31.03.2026', contractStart:'2025-04-01', contractEnd:'2026-03-31' },
    ];
    persist();
  }
  renderDashboard();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
init();