// ══════════════════════════════════════
//  I/O — JSON Export/Import · PDF
// ══════════════════════════════════════

// ── JSON EXPORT ───────────────────────
function exportAll() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'candlescope_finanzboard_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

// ── JSON IMPORT ───────────────────────
function importAll() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const r = new FileReader();
    r.onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (Array.isArray(p.accounts))  S.accounts  = p.accounts;
        if (Array.isArray(p.data))      S.data       = p.data;
        if (Array.isArray(p.transfers)) S.transfers  = p.transfers;
        if (typeof p.monthlyIncome === 'number') S.monthlyIncome = p.monthlyIncome;
        persist();
        renderDashboard();
        alert('✓ Import erfolgreich');
      } catch(err) { alert('Fehler beim Import: ' + err.message); }
    };
    r.readAsText(e.target.files[0]);
  };
  inp.click();
}

// ── PDF EXPORT (3 Seiten) ─────────────
function exportPDF() {
  const n       = today();
  const mIdx    = n.getMonth();
  const yr      = n.getFullYear();
  const dateStr = n.toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  let bal = 0; S.accounts.forEach(a => { if (a.include) bal += a.balance; });
  let fixOut = 0, fixIn = 0;
  S.data.forEach(p => { if (p.type==='ausgabe') fixOut += avgMonthly(p); else fixIn += avgMonthly(p); });
  const income = S.monthlyIncome > 0 ? S.monthlyIncome : fixIn;
  const free   = income - fixOut;
  const cd     = buildCockpitData();

  const LOGO = `<div class="pdf-hd-logobox"><svg viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="4" fill="#111"/><path d="M5 10L8.5 13.5L15 6.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  const HDR  = sub => `<div class="pdf-hd"><div class="pdf-hd-logo">${LOGO}<div><div class="pdf-hd-name">Candlescope FinanceBoard</div><div class="pdf-hd-sub">Persönliche Finanzen · ${yr}</div></div></div><div class="pdf-hd-right"><div class="pdf-hd-date">${dateStr}</div><div style="margin-top:2px;">${sub}</div></div></div>`;
  const FT   = `<div class="pdf-ft"><div class="pdf-ft-logo">${LOGO}<span>Candlescope FinanceBoard ${yr}</span></div><span>Erstellt: ${n.toLocaleDateString('de-DE')}</span></div>`;

  const dueHtml = items => items.length === 0
    ? `<div style="font-size:6.5pt;color:#aaa;padding:4px 0;">✓ Keine weiteren Fälligkeiten</div>`
    : items.map(i=>`<div class="pdf-due-item"><span><span class="pdf-due-pill">${i.due}.${i.isNxt?' '+MONTHS_S[i.dueMo]:''}</span>${esc(i.name)}</span><span class="pdf-due-amt">−${fm(i.amt)}</span></div>`).join('');

  const kontenRows = S.accounts.map(a =>
    `<tr><td>${esc(a.label)}</td><td style="color:#777;">${esc(a.sub)}</td><td class="r">${a.balance>0?fm(a.balance):'—'}</td><td style="text-align:center;font-size:6.5pt;">${a.include?'✓':''}</td></tr>`
  ).join('');

  const postenSorted = sortArr(S.data.filter(p=>p.type==='ausgabe'),'amount',false)
                .concat(sortArr(S.data.filter(p=>p.type==='einnahme'),'amount',false));
  const postenRows = postenSorted.map(p =>
    `<tr><td>${esc(p.name)}</td><td>${p.type==='ausgabe'?'Ausgabe':'Einnahme'}</td><td>${p.interval}</td><td style="text-align:center;">${p.due?p.due+'.':'—'}</td><td>${esc(accLabel(p.accountId))}</td><td class="${p.type==='ausgabe'?'neg':'pos'}">${fm(parseFloat(p.amount)||0)}</td><td class="r" style="color:#888;">${avgMonthly(p)>0?fm(avgMonthly(p)):'—'}</td></tr>`
  ).join('');

  const ctItems = sortArr(S.data.filter(p=>p.contractEnd||p.contractStart),'contractEnd',true);
  const ctRows  = ctItems.map(p => {
    const s = p.contractStart ? new Date(p.contractStart) : null;
    const e = p.contractEnd   ? new Date(p.contractEnd)   : null;
    const diff = e ? Math.round((e-n)/86400000) : null;
    let stTxt='Laufend', stCls='run';
    if (diff!==null) {
      if      (diff<0)   { stTxt='Abgelaufen';               stCls='bad';  }
      else if (diff<=30) { stTxt=diff+' Tage';               stCls='warn'; }
      else if (diff<=90) { stTxt=Math.round(diff/30)+' Mon.'; stCls='warn'; }
      else               { stTxt=Math.round(diff/30)+' Mon. verbl.'; stCls='ok'; }
    }
    return `<tr><td>${esc(p.name)}${p.note?`<br><span style="font-size:6pt;color:#aaa;">${esc(p.note)}</span>`:''}</td><td>${s?s.toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'}):'—'}</td><td>${e?e.toLocaleDateString('de-DE'):'—'}</td><td class="r">${fm(parseFloat(p.amount)||0)}</td><td>${p.interval}</td><td><span class="pdf-pill ${stCls}">${stTxt}</span></td></tr>`;
  }).join('');

  const yearCards = Array.from({length:12},(_,m) => {
    let inc=0, exp=0;
    S.data.forEach(p => { const v=monthActual(p,m); if(p.type==='einnahme') inc+=v; else exp+=v; });
    if (inc===0 && S.monthlyIncome>0) inc=S.monthlyIncome;
    const b2=inc-exp, isCur=m===mIdx;
    return `<div class="pdf-mc${isCur?' cur':''}"><div class="pdf-mc-name">${MONTHS_S[m]}${isCur?' ★':''}</div><div class="pdf-mc-row"><span class="pdf-mc-lbl">Einnahmen</span><span class="pdf-mc-val" style="color:#1a6b1a;">${inc>0?'+'+fm(inc):'—'}</span></div><div class="pdf-mc-row"><span class="pdf-mc-lbl">Ausgaben</span><span class="pdf-mc-val" style="color:#b00;">${exp>0?'−'+fm(exp):'—'}</span></div><div class="pdf-mc-bal" style="color:${b2>=0?'#1a6b1a':'#b00'}">${fm(b2,true)}</div></div>`;
  }).join('');

  document.getElementById('pdf-root').innerHTML = `
  <div class="pdf-page">
    ${HDR('Übersicht & Zahlungsplan')}
    <div class="pdf-sec">Finanzübersicht — ${MONTHS[mIdx]} ${yr}</div>
    <div class="pdf-kpis">
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Kontostand</div><div class="pdf-kpi-val">${fm(bal)}</div><div class="pdf-kpi-sub">Einbezogene Konten</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Monatseingang</div><div class="pdf-kpi-val">${fm(income)}</div><div class="pdf-kpi-sub">Zahltag ${ZAHLTAG}.</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Fixausgaben Ø/Mon</div><div class="pdf-kpi-val">${fm(fixOut)}</div><div class="pdf-kpi-sub">${S.data.filter(p=>p.type==='ausgabe').length} Posten</div></div>
      <div class="pdf-kpi"><div class="pdf-kpi-lbl">Variabel frei</div><div class="pdf-kpi-val" style="color:${free>=0?'#1a6b1a':'#b00'};">${fm(free,true)}</div><div class="pdf-kpi-sub">Eingang − Fixkosten</div></div>
    </div>
    <div class="pdf-sec">Zahlungsplan</div>
    <div class="pdf-cockpit">
      <div class="pdf-cc">
        <div class="pdf-cc-lbl">Giro — bis ${ZAHLTAG}. ${MONTHS_S[cd.nextZahltag.getMonth()]}</div>
        <div class="pdf-progbar"><div class="pdf-progfill" style="width:${cd.pctZ}%"></div></div>
        <div class="pdf-proglbls"><span>${ZAHLTAG}. ${MONTHS_S[mIdx===0?11:mIdx-1]}</span><span>${ZAHLTAG}. ${MONTHS_S[cd.nextZahltag.getMonth()]} (in ${cd.daysToZ} Tagen)</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Giro-Stand</span><span class="pdf-sl-val">${fm(cd.giroBal)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Noch fällig</span><span class="pdf-sl-val">−${fm(cd.totalG)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Verbleibend</span><span class="pdf-sl-val" style="color:${cd.nach15>=0?'#1a6b1a':'#b00'};font-weight:700;">${fm(cd.nach15,true)}</span></div>
        ${dueHtml(cd.giroItems)}
      </div>
      <div class="pdf-cc">
        <div class="pdf-cc-lbl">${cd.visaAcc?esc(cd.visaAcc.label):'Kreditkarte'} — Abr. ${VISA_DAY}. ${MONTHS_S[cd.nextVisa.getMonth()]}</div>
        <div class="pdf-progbar"><div class="pdf-progfill" style="width:${cd.pctV}%"></div></div>
        <div class="pdf-proglbls"><span>1. ${MONTHS_S[mIdx]}</span><span>${VISA_DAY}. ${MONTHS_S[cd.nextVisa.getMonth()]} (in ${cd.daysToV} Tagen)</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Stand</span><span class="pdf-sl-val">${fm(cd.visaBal)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Offene Buchungen</span><span class="pdf-sl-val">−${fm(cd.totalV)}</span></div>
        <div class="pdf-sl"><span class="pdf-sl-lbl">Saldo</span><span class="pdf-sl-val" style="color:${cd.visaSaldo>=0?'#1a6b1a':'#b00'};font-weight:700;">${fm(cd.visaSaldo,true)}</span></div>
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
    ${HDR('Einnahmen & Ausgaben')}
    <div class="pdf-sec">Alle festen Posten</div>
    <table class="pdf-tbl">
      <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th style="text-align:center;">Fällig</th><th>Konto</th><th class="r">Betrag</th><th class="r">Ø/Mon</th></tr></thead>
      <tbody>${postenRows}</tbody>
      <tfoot><tr><td colspan="5"><strong>Monatssaldo Ø</strong></td><td></td><td class="r" style="color:${free>=0?'#1a6b1a':'#b00'};"><strong>${fm(free,true)}</strong></td></tr></tfoot>
    </table>
    ${FT}
  </div>
  <div class="pdf-page">
    ${HDR('Verträge & Jahresübersicht')}
    <div class="pdf-sec">Verträge & Laufzeiten</div>
    ${ctItems.length ? `<table class="pdf-tbl"><thead><tr><th>Bezeichnung</th><th>Start</th><th>Ende</th><th class="r">Betrag</th><th>Intervall</th><th>Status</th></tr></thead><tbody>${ctRows}</tbody></table>` : '<div style="font-size:8pt;color:#999;padding:6px 0 10px;">Keine Verträge hinterlegt.</div>'}
    <div class="pdf-sec">Jahresübersicht ${yr}</div>
    <div class="pdf-yg">${yearCards}</div>
    ${FT}
  </div>`;

  window.print();
}