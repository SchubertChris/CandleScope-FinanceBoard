// ══════════════════════════════════════
//  DASHBOARD — KPIs · Cockpit · Charts
// ══════════════════════════════════════

let barChartInst = null;
let donutInst    = null;

Chart.defaults.color = '#6b7a99';
Chart.defaults.font.family = "'DM Mono',monospace";
Chart.defaults.font.size   = 10;

// ── MAIN ENTRY ────────────────────────
function renderDashboard() {
  const d = document.getElementById('todayStr');
  if (d) d.textContent = today().toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  renderAccounts();
  refreshDash();
  updateContractBadge();
  // Monatseingang Feld füllen
  const mi = document.getElementById('monthlyIncome');
  if (mi && S.monthlyIncome > 0) mi.value = S.monthlyIncome.toFixed(2).replace('.',',');
}

function refreshDash() {
  renderKPIs();
  renderCockpit();
  renderBarChart();
  renderDonut();
}

function setMonthlyIncome(val) {
  S.monthlyIncome = pp(val);
  persist();
  refreshDash();
}

// ── KPI ROW ───────────────────────────
function renderKPIs() {
  let bal = 0;
  S.accounts.forEach(a => { if (a.include) bal += a.balance; });

  let fixOut = 0, fixIn = 0;
  S.data.forEach(p => {
    if (p.type === 'ausgabe') fixOut += avgMonthly(p);
    else                      fixIn  += avgMonthly(p);
  });
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : fixIn;
  const free   = income - fixOut;

  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi blue">
      <div class="kpi-icon">🏦</div>
      <div class="kpi-label">Kontostand gesamt</div>
      <div class="kpi-val">${fm(bal)}</div>
      <div class="kpi-sub">Alle einbezogenen Konten</div>
    </div>
    <div class="kpi green">
      <div class="kpi-icon">💰</div>
      <div class="kpi-label">Monatseingang</div>
      <div class="kpi-val">${fm(income)}</div>
      <div class="kpi-sub">Zahltag: ${ZAHLTAG}. des Monats</div>
    </div>
    <div class="kpi red">
      <div class="kpi-icon">📤</div>
      <div class="kpi-label">Fixausgaben Ø/Mon</div>
      <div class="kpi-val">${fm(fixOut)}</div>
      <div class="kpi-sub">${S.data.filter(p=>p.type==='ausgabe').length} Posten hinterlegt</div>
    </div>
    <div class="kpi ${free >= 0 ? 'green' : 'red'}">
      <div class="kpi-icon">${free >= 0 ? '📈' : '⚠️'}</div>
      <div class="kpi-label">Variabel frei</div>
      <div class="kpi-val">${fm(free, true)}</div>
      <div class="kpi-sub">Eingang minus Fixkosten</div>
    </div>`;
}

// ── COCKPIT DATA ──────────────────────
function buildCockpitData() {
  const n = today(), day = n.getDate(), mIdx = n.getMonth(), yr = n.getFullYear();

  // Nächster Zahltag
  let nextZahltag, daysToZ;
  if (day < ZAHLTAG) {
    nextZahltag = new Date(yr, mIdx, ZAHLTAG);
    daysToZ = ZAHLTAG - day;
  } else {
    const nm = (mIdx+1)%12, ny = mIdx===11?yr+1:yr;
    nextZahltag = new Date(ny, nm, ZAHLTAG);
    daysToZ = Math.round((nextZahltag - n) / 86400000);
  }

  // Visa-Konto (erstes Konto mit "visa" im id, sonst erstes Konto)
  const visaAcc = S.accounts.find(a => a.id.includes('visa')) || S.accounts[0];

  let nextVisa, daysToV;
  if (day < VISA_DAY) {
    nextVisa = new Date(yr, mIdx, VISA_DAY);
    daysToV  = VISA_DAY - day;
  } else {
    const nm = (mIdx+1)%12, ny = mIdx===11?yr+1:yr;
    nextVisa = new Date(ny, nm, VISA_DAY);
    daysToV  = Math.round((nextVisa - n) / 86400000);
  }

  const getItems = (untilDate, accId = null) => {
    const items = [], mCheck = [mIdx], seen = new Set();
    if (untilDate.getMonth() !== mIdx || untilDate.getFullYear() !== yr) mCheck.push(untilDate.getMonth());
    mCheck.forEach(cm => {
      const cy = cm < mIdx ? yr+1 : yr;
      S.data.forEach(p => {
        if (p.type !== 'ausgabe') return;
        if (!activeInMonth(p, cm)) return;
        const dd = parseInt(p.due) || 0; if (dd < 1) return;
        if (accId && p.accountId !== accId) return;
        const amt = parseFloat(p.amount) || 0; if (amt <= 0) return;
        const dObj = new Date(cy, cm, dd);
        if (dObj >= new Date(yr, mIdx, day) && dObj <= untilDate) {
          const key = p.id + '_' + dd + '_' + cm;
          if (seen.has(key)) return; seen.add(key);
          items.push({ name:p.name, due:dd, dueMo:cm, amt,
            isNxt: cm !== mIdx,
            urgent: cm===mIdx && (dd-day)<=2 && dd>=day });
        }
      });
    });
    return items.sort((a,b) => a.dueMo !== b.dueMo ? a.dueMo - b.dueMo : a.due - b.due);
  };

  const giroItems = getItems(nextZahltag);
  const totalG    = giroItems.reduce((s,i) => s+i.amt, 0);
  const visaItems = visaAcc ? getItems(nextVisa, visaAcc.id) : [];
  const totalV    = visaItems.reduce((s,i) => s+i.amt, 0);

  let giroBal = 0;
  S.accounts.forEach(a => { if (a.include && a.id !== (visaAcc?.id)) giroBal += a.balance; });
  const visaBal   = visaAcc ? visaAcc.balance : 0;
  const nach15    = giroBal - totalG;
  const visaSaldo = visaBal - totalV;
  const pctZ = Math.min(Math.max(((30-daysToZ)/30)*100, 2), 98);
  const pctV = Math.min(Math.max(((30-daysToV)/30)*100, 2), 98);

  return { n, day, mIdx, yr, nextZahltag, daysToZ, nextVisa, daysToV,
           giroItems, totalG, visaItems, totalV,
           giroBal, nach15, visaBal, visaSaldo, pctZ, pctV,
           visaAcc };
}

// ── COCKPIT RENDER ────────────────────
function renderCockpit() {
  const d = buildCockpitData();
  document.getElementById('cockpitSub').textContent = `Heute ${d.day}. ${MONTHS[d.mIdx]} · Zahltag in ${d.daysToZ} Tagen`;
  document.getElementById('cockpitTag').textContent = `${d.day}. → ${ZAHLTAG}. ${MONTHS_S[d.nextZahltag.getMonth()]}`;

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
      <div class="cockpit-lbl">Giro — bis ${ZAHLTAG}. ${MONTHS_S[d.nextZahltag.getMonth()]}</div>
      <div class="prog-track"><div class="prog-fill" style="width:${d.pctZ}%;background:var(--blue)"></div></div>
      <div class="prog-labels">
        <span>${ZAHLTAG}. ${MONTHS_S[d.mIdx===0?11:d.mIdx-1]}</span>
        <span style="color:var(--blue)">${ZAHLTAG}. ${MONTHS_S[d.nextZahltag.getMonth()]}</span>
      </div>
      <div style="margin:10px 0 8px;">
        <div class="sum-line"><span class="sum-line-lbl">Giro-Stand</span><span class="sum-line-val" style="color:var(--blue)">${fm(d.giroBal)}</span></div>
        <div class="sum-line"><span class="sum-line-lbl">Noch fällig</span><span class="sum-line-val" style="color:var(--red)">−${fm(d.totalG)}</span></div>
        <div class="sum-line total"><span class="sum-line-lbl">Verbleibend</span><span class="sum-line-val" style="color:${d.nach15>=0?'var(--green)':'var(--red)'}">${fm(d.nach15,true)}</span></div>
      </div>
      <div class="due-list">${makeItems(d.giroItems)}</div>
    </div>
    <div class="cockpit-col">
      <div class="cockpit-lbl">${d.visaAcc ? esc(d.visaAcc.label) : 'Kreditkarte'} — Abr. ${VISA_DAY}. ${MONTHS_S[d.nextVisa.getMonth()]}</div>
      <div class="prog-track"><div class="prog-fill" style="width:${d.pctV}%;background:var(--amber)"></div></div>
      <div class="prog-labels">
        <span>1. ${MONTHS_S[d.mIdx]}</span>
        <span style="color:var(--amber)">${VISA_DAY}. ${MONTHS_S[d.nextVisa.getMonth()]}</span>
      </div>
      <div style="margin:10px 0 8px;">
        <div class="sum-line"><span class="sum-line-lbl">${d.visaAcc ? esc(d.visaAcc.label) : 'Karte'}-Stand</span><span class="sum-line-val" style="color:var(--amber)">${fm(d.visaBal)}</span></div>
        <div class="sum-line"><span class="sum-line-lbl">Offene Buchungen</span><span class="sum-line-val" style="color:var(--red)">−${fm(d.totalV)}</span></div>
        <div class="sum-line total"><span class="sum-line-lbl">Saldo</span><span class="sum-line-val" style="color:${d.visaSaldo>=0?'var(--green)':'var(--red)'}">${fm(d.visaSaldo,true)}</span></div>
      </div>
      <div class="due-list">${makeItems(d.visaItems)}</div>
    </div>`;
}

// ── BAR CHART ────────────────────────
function renderBarChart() {
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : 0;
  const incomes = [], expenses = [];
  for (let m = 0; m < 12; m++) {
    let inc = income, exp = 0;
    S.data.forEach(p => {
      const v = monthActual(p, m);
      if (p.type === 'einnahme') inc += v; else exp += v;
    });
    incomes.push(inc); expenses.push(exp);
  }
  if (barChartInst) { barChartInst.destroy(); barChartInst = null; }
  barChartInst = new Chart(document.getElementById('barChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: MONTHS_S,
      datasets: [
        { label:'Einnahmen', data:incomes,  backgroundColor:'rgba(0,229,160,.25)', borderColor:'rgba(0,229,160,.7)',  borderWidth:1, borderRadius:3 },
        { label:'Ausgaben',  data:expenses, backgroundColor:'rgba(255,77,106,.2)', borderColor:'rgba(255,77,106,.6)', borderWidth:1, borderRadius:3 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend: { display:true, labels:{ boxWidth:10, padding:14, color:'#6b7a99' } },
        tooltip: { backgroundColor:'#1d2235', borderColor:'#252d42', borderWidth:1, padding:10, callbacks:{ label: c => ' '+fm(c.raw) } }
      },
      scales: {
        x: { grid:{ color:'rgba(255,255,255,.03)' }, ticks:{ color:'#4a5566' } },
        y: { grid:{ color:'rgba(255,255,255,.03)' }, ticks:{ color:'#4a5566', callback: v => fmShort(v)+' €' } }
      }
    }
  });
}

// ── DONUT CHART ───────────────────────
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
  if (!entries.length) {
    document.getElementById('donutLegend').innerHTML = '<div style="font-size:.72em;color:var(--text3);text-align:center;padding:8px 0;">Keine Ausgaben</div>';
    return;
  }
  donutInst = new Chart(document.getElementById('donutChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e=>e[0]),
      datasets:[{ data:entries.map(e=>e[1]), backgroundColor:DONUT_COLORS, borderWidth:0, hoverBorderWidth:2, hoverBorderColor:'#fff' }]
    },
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

// ── CONTRACT BADGE ────────────────────
function updateContractBadge() {
  const n    = today();
  const warn = S.data.filter(p => p.contractEnd && Math.round((new Date(p.contractEnd)-n)/86400000) <= 90);
  const b    = document.getElementById('contractBadge');
  if (b) { b.style.display = warn.length > 0 ? '' : 'none'; b.textContent = warn.length; }
}