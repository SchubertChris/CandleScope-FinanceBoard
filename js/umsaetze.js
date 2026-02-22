// ══════════════════════════════════════
//  UMSÄTZE — Liste · Kacheln · Filter
// ══════════════════════════════════════

let postenSort = { k: "name", asc: true };
let postenView = "list"; // 'list' | 'tile'
let postenFilter = "all"; // 'all' | 'month' | 'week' | 'day' | 'year'

function renderPosten() {
  const pg = document.getElementById("p-posten");
  if (!pg) return;

  const data = _filteredPosten();

  // Header neu aufbauen
  const ph = pg.querySelector(".ph");
  if (ph) {
    ph.innerHTML = `
      <div>
        <div class="ph-title">Umsätze</div>
        <div class="ph-sub" id="postenCount">${data.filter((p) => p.type === "einnahme").length} Einnahmen · ${data.filter((p) => p.type === "ausgabe").length} Ausgaben</div>
      </div>
      <div class="btn-row" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <div class="view-toggle">
          <button class="vt-btn ${postenView === "list" ? "active" : ""}" onclick="setPostenView('list')" title="Liste">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button class="vt-btn ${postenView === "tile" ? "active" : ""}" onclick="setPostenView('tile')" title="Kacheln">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
        <div class="time-filter">
          ${["all", "month", "week", "day", "year"]
            .map(
              (f) => `
            <button class="tf-btn ${postenFilter === f ? "active" : ""}" onclick="setPostenFilter('${f}')">${_filterLabel(f)}</button>
          `,
            )
            .join("")}
        </div>
        <button class="btn" onclick="exportKontoauszug()">⬇ Kontoauszug</button>
        <button class="btn" onclick="openModal(null,'transfer')">⇄ Umbuchung</button>
        <button class="btn primary" onclick="openModal()">+ Neuer Posten</button>
      </div>`;
  }

  const panel = pg.querySelector(".panel");
  if (!panel) return;

  if (postenView === "tile") {
    _renderPostenTiles(panel, data);
  } else {
    _renderPostenList(panel, data);
  }
}

function _filterLabel(f) {
  return (
    { all: "Alle", month: "Monat", week: "Woche", day: "Heute", year: "Jahr" }[
      f
    ] || f
  );
}

function _filteredPosten() {
  if (postenFilter === "all") return S.data;
  const n = today();
  return S.data.filter((p) => {
    // Für fixe Posten filtern wir nach Fälligkeit im Zeitraum
    const due = parseInt(p.due) || 1;
    const d = new Date(n.getFullYear(), n.getMonth(), due);
    if (postenFilter === "day") return d.toDateString() === n.toDateString();
    if (postenFilter === "week") {
      const start = new Date(n);
      start.setDate(n.getDate() - n.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return d >= start && d <= end;
    }
    if (postenFilter === "month")
      return (
        d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
      );
    if (postenFilter === "year") return d.getFullYear() === n.getFullYear();
    return true;
  });
}

function setPostenView(v) {
  postenView = v;
  renderPosten();
}
function setPostenFilter(f) {
  postenFilter = f;
  renderPosten();
}

// ── LISTEN-ANSICHT ────────────────────
function _renderPostenList(panel, data) {
  panel.innerHTML = `
    <div class="panel-head">
      <div class="panel-title">Alle Posten</div>
      <div id="postenSaldo" style="font-family:var(--mono);font-size:.8em;"></div>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr id="postenThead">
            <th class="sortable" data-k="name" style="min-width:160px;"><span class="th-inner">Bezeichnung <span class="sort-arr">↕</span></span></th>
            <th class="sortable" data-k="type"><span class="th-inner">Typ <span class="sort-arr">↕</span></span></th>
            <th class="sortable" data-k="interval"><span class="th-inner">Intervall <span class="sort-arr">↕</span></span></th>
            <th class="sortable" data-k="due"><span class="th-inner">Fällig <span class="sort-arr">↕</span></span></th>
            <th class="sortable" data-k="accountId"><span class="th-inner">Konto <span class="sort-arr">↕</span></span></th>
            <th class="sortable r" data-k="amount"><span class="th-inner">Betrag <span class="sort-arr">↕</span></span></th>
            <th class="r">Ø/Mon</th>
            <th>Laufzeit</th>
            <th class="r">Aktion</th>
          </tr>
        </thead>
        <tbody id="postenBody"></tbody>
        <tfoot id="postenFoot"></tfoot>
      </table>
    </div>`;

  // Sort-Header
  document.querySelectorAll("#postenThead th.sortable").forEach((th) => {
    th.onclick = () => {
      const k = th.dataset.k;
      postenSort = { k, asc: postenSort.k === k ? !postenSort.asc : true };
      renderPosten();
    };
  });
  _applyPostenSortUI();

  const sorted = sortArr(data, postenSort.k, postenSort.asc);
  const body = document.getElementById("postenBody");
  const foot = document.getElementById("postenFoot");
  body.innerHTML = "";

  let totIn = 0,
    totOut = 0;
  sorted.forEach((p) => {
    const idx = S.data.indexOf(p);
    const mv = avgMonthly(p);
    if (p.type === "einnahme") totIn += mv;
    else totOut += mv;

    let endBadge = "";
    if (p.contractEnd) {
      const e = new Date(p.contractEnd),
        diff = Math.round((e - today()) / 86400000);
      if (diff < 0) endBadge = '<span class="badge expired">Abgelaufen</span>';
      else if (diff <= 30)
        endBadge = `<span class="badge warn">${diff}d</span>`;
      else if (diff <= 90)
        endBadge = `<span class="badge warn">${Math.round(diff / 30)}M</span>`;
      else
        endBadge = `<span class="badge ok">${e.toLocaleDateString("de-DE")}</span>`;
    } else if (p.contractStart) {
      endBadge = '<span class="badge info">läuft</span>';
    }

    const accOpts =
      `<option value="">—</option>` +
      S.accounts
        .map(
          (a) =>
            `<option value="${esc(a.id)}" ${a.id === p.accountId ? "selected" : ""}>${esc(a.label)}</option>`,
        )
        .join("");

    const tr = document.createElement("tr");
    tr.className = "t-" + (p.type === "einnahme" ? "in" : "out");
    tr.innerHTML = `
      <td><input class="cedit" value="${esc(p.name)}" onchange="upField(${idx},'name',this.value)"></td>
      <td>
        <select class="cedit-sel" onchange="upField(${idx},'type',this.value);renderPosten()">
          <option value="ausgabe"  ${p.type === "ausgabe" ? "selected" : ""}>Ausgabe</option>
          <option value="einnahme" ${p.type === "einnahme" ? "selected" : ""}>Einnahme</option>
        </select>
      </td>
      <td>
        <select class="cedit-sel" onchange="upField(${idx},'interval',this.value)">
          <option value="monatl."    ${p.interval === "monatl." ? "selected" : ""}>monatl.</option>
          <option value="viertelj."  ${p.interval === "viertelj." ? "selected" : ""}>viertelj.</option>
          <option value="halbjährl." ${p.interval === "halbjährl." ? "selected" : ""}>halbjährl.</option>
          <option value="jährl."     ${p.interval === "jährl." ? "selected" : ""}>jährl.</option>
          <option value="einmalig"   ${p.interval === "einmalig" ? "selected" : ""}>einmalig</option>
        </select>
      </td>
      <td><input class="cedit mono" value="${esc(p.due || "")}" onchange="upField(${idx},'due',this.value)" style="width:32px;text-align:center;" placeholder="—"></td>
      <td><select class="cedit-sel" onchange="upField(${idx},'accountId',this.value)">${accOpts}</select></td>
      <td class="${p.type === "einnahme" ? "amt-in" : "amt-out"}">
        <input class="cedit mono" value="${(parseFloat(p.amount) || 0).toFixed(2)}"
          onchange="upFieldNum(${idx},'amount',this.value)" style="width:80px;text-align:right;">
      </td>
      <td class="r" style="color:var(--text2);">${mv > 0 ? fm(mv) : "—"}</td>
      <td>${endBadge || '<span style="color:var(--text3);font-size:.78em;">—</span>'}</td>
      <td class="r">
        <button class="btn sm" onclick="openModal(${idx})">✎</button>
        <button class="btn sm danger" onclick="quickDeletePosten(${idx})">✕</button>
      </td>`;
    body.appendChild(tr);
  });

  const income = S.monthlyIncome > 0 ? S.monthlyIncome : totIn;
  const free = income - totOut;
  foot.innerHTML = `<tr>
    <td colspan="5">Monatssaldo (Ø)</td><td></td>
    <td class="r" style="color:${free >= 0 ? "var(--green)" : "var(--red)"};">${fm(free, true)}</td>
    <td colspan="2"></td>
  </tr>`;

  const sal = document.getElementById("postenSaldo");
  if (sal) {
    sal.textContent = "Ø/Monat: " + fm(free, true);
    sal.style.color = free >= 0 ? "var(--green)" : "var(--red)";
  }
}

// ── KACHEL-ANSICHT ────────────────────
function _renderPostenTiles(panel, data) {
  const sorted = sortArr(data, postenSort.k, postenSort.asc);

  panel.innerHTML = `
    <div class="panel-head">
      <div class="panel-title">Alle Posten</div>
    </div>
    <div class="posten-tiles">
      ${sorted
        .map((p) => {
          const idx = S.data.indexOf(p);
          const mv = avgMonthly(p);
          const acc = S.accounts.find((a) => a.id === p.accountId);
          const isIn = p.type === "einnahme";
          return `<div class="posten-tile ${isIn ? "tile-in" : "tile-out"}">
          <div class="pt-top">
            <div class="pt-dot" style="background:${acc ? acc.color : "var(--text3)"}"></div>
            <div class="pt-name">${esc(p.name)}</div>
            <button class="btn sm" onclick="openModal(${idx})" style="margin-left:auto;">✎</button>
          </div>
          <div class="pt-amount ${isIn ? "amt-in" : "amt-out"}">${isIn ? "+" : "−"}${fm(parseFloat(p.amount) || 0)}</div>
          <div class="pt-meta">
            <span>${p.interval}</span>
            <span>${p.due ? p.due + ". jeden Monat" : "—"}</span>
          </div>
          ${acc ? `<div class="pt-acc">${esc(acc.label)}</div>` : ""}
          ${mv > 0 ? `<div class="pt-monthly">Ø ${fm(mv)}/Mon</div>` : ""}
        </div>`;
        })
        .join("")}
    </div>`;
}

function _applyPostenSortUI() {
  document.querySelectorAll("#postenThead th.sortable").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
    const arr = th.querySelector(".sort-arr");
    if (arr) arr.textContent = "↕";
  });
  const active = document.querySelector(
    `#postenThead th[data-k="${postenSort.k}"]`,
  );
  if (active) {
    active.classList.add(postenSort.asc ? "sort-asc" : "sort-desc");
    const arr = active.querySelector(".sort-arr");
    if (arr) arr.textContent = postenSort.asc ? "↑" : "↓";
  }
}

// ── INLINE EDIT ───────────────────────
function upField(i, f, v) {
  S.data[i][f] = v;
  persist();
  refreshDash();
}
function upFieldNum(i, f, v) {
  S.data[i][f] = parseFloat(String(v).replace(",", ".")) || 0;
  persist();
  renderPosten();
  refreshDash();
}

function quickDeletePosten(i) {
  if (!confirm(`"${S.data[i].name}" löschen?`)) return;
  S.data.splice(i, 1);
  persist();
  renderPosten();
  refreshDash();
  if (document.getElementById("p-vertraege").classList.contains("active"))
    renderVertraege();
  if (document.getElementById("p-jahr").classList.contains("active"))
    renderJahr();
  updateContractBadge();
}

// ── KONTOAUSZUG EXPORT ────────────────
function exportKontoauszug() {
  const n = today();
  const data = _filteredPosten();
  let totIn = 0,
    totOut = 0;
  data.forEach((p) => {
    const mv = avgMonthly(p);
    if (p.type === "einnahme") totIn += mv;
    else totOut += mv;
  });
  const free = (S.monthlyIncome || totIn) - totOut;

  const rows = sortArr(data, "amount", false)
    .map((p) => {
      const acc = S.accounts.find((a) => a.id === p.accountId);
      return `<tr>
      <td>${esc(p.name)}</td>
      <td style="color:${p.type === "einnahme" ? "#1a6b1a" : "#b00"}">${p.type === "einnahme" ? "Einnahme" : "Ausgabe"}</td>
      <td>${p.interval}</td>
      <td style="text-align:center">${p.due || "—"}</td>
      <td>${acc ? esc(acc.label) : "—"}</td>
      <td style="text-align:right;font-family:monospace;color:${p.type === "einnahme" ? "#1a6b1a" : "#b00"}">${p.type === "einnahme" ? "+" : "-"}${(parseFloat(p.amount) || 0).toFixed(2).replace(".", ",")} €</td>
      <td style="text-align:right;font-family:monospace;color:#666">${avgMonthly(p) > 0 ? fm(avgMonthly(p)) : ""}</td>
    </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8">
<title>Kontoauszug · Candlescope FinanceBoard</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#111;margin:0;padding:0;}
  .header{background:#0d1220;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;}
  .hlogo{font-size:1.2em;font-weight:700;letter-spacing:-.3px;}
  .hsub{font-size:.75em;opacity:.6;margin-top:2px;}
  .hdate{font-size:.8em;opacity:.7;text-align:right;}
  .body{padding:28px 32px;}
  h2{font-size:.75em;text-transform:uppercase;letter-spacing:1.5px;color:#666;border-bottom:1px solid #e0e0e0;padding-bottom:6px;margin:24px 0 12px;}
  table{width:100%;border-collapse:collapse;font-size:.85em;}
  th{text-align:left;font-weight:700;font-size:.72em;text-transform:uppercase;letter-spacing:.8px;color:#666;padding:6px 8px;border-bottom:2px solid #e0e0e0;}
  td{padding:6px 8px;border-bottom:1px solid #f0f0f0;}
  tr:last-child td{border-bottom:none;}
  .summary{display:flex;gap:24px;margin-bottom:24px;}
  .kpi{background:#f7f8fa;border-radius:8px;padding:14px 18px;flex:1;}
  .kpi-lbl{font-size:.7em;text-transform:uppercase;letter-spacing:.8px;color:#888;margin-bottom:4px;}
  .kpi-val{font-size:1.2em;font-weight:700;}
  .footer{text-align:center;font-size:.7em;color:#aaa;padding:20px;border-top:1px solid #eee;}
</style></head><body>
<div class="header">
  <div><div class="hlogo">Candlescope FinanceBoard</div><div class="hsub">Persönliche Finanzen · Kontoauszug</div></div>
  <div class="hdate">Erstellt: ${n.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}<br>Filter: ${_filterLabel(postenFilter)}</div>
</div>
<div class="body">
  <h2>Zusammenfassung</h2>
  <div class="summary">
    <div class="kpi"><div class="kpi-lbl">Einnahmen Ø/Mon</div><div class="kpi-val" style="color:#1a6b1a">+${(S.monthlyIncome || totIn).toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Ausgaben Ø/Mon</div><div class="kpi-val" style="color:#b00">-${totOut.toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Verfügbar Ø/Mon</div><div class="kpi-val" style="color:${free >= 0 ? "#1a6b1a" : "#b00"}">${free >= 0 ? "+" : ""}${free.toFixed(2).replace(".", ",")} €</div></div>
    <div class="kpi"><div class="kpi-lbl">Posten gesamt</div><div class="kpi-val">${data.length}</div></div>
  </div>
  <h2>Posten</h2>
  <table>
    <thead><tr><th>Bezeichnung</th><th>Typ</th><th>Intervall</th><th>Fällig</th><th>Konto</th><th style="text-align:right">Betrag</th><th style="text-align:right">Ø/Mon</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<div class="footer">Candlescope FinanceBoard · Alle Daten lokal · ${n.toLocaleDateString("de-DE")}</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `kontoauszug_${n.toISOString().slice(0, 10)}.html`;
  a.click();
}
