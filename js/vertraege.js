// ══════════════════════════════════════
//  VERTRÄGE — Liste · Kacheln
// ══════════════════════════════════════

let ctSort = { k: "contractEnd", asc: true };
let ctView = "list"; // 'list' | 'tile'

function doCtSort(k) {
  ctSort = { k, asc: ctSort.k === k ? !ctSort.asc : true };
  renderVertraege();
}

function setCTView(v) {
  ctView = v;
  renderVertraege();
}

function renderVertraege() {
  const el = document.getElementById("contractList");
  const items = S.data.filter((p) => p.contractEnd || p.contractStart);

  // View-Toggle in page header
  const ph = document.querySelector("#p-vertraege .ph");
  if (ph) {
    ph.innerHTML = `
      <div>
        <div class="ph-title">Verträge & Laufzeiten</div>
        <div class="ph-sub">Alle Posten mit Vertragsdaten</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div class="view-toggle">
          <button class="vt-btn ${ctView === "list" ? "active" : ""}" onclick="setCTView('list')" title="Liste">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <button class="vt-btn ${ctView === "tile" ? "active" : ""}" onclick="setCTView('tile')" title="Kacheln">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
        </div>
        <button class="btn primary" onclick="openModal()">+ Neuer Posten</button>
      </div>`;
  }

  if (!items.length) {
    el.innerHTML = `<div style="padding:48px;text-align:center;color:var(--text3);">
      <div style="font-size:2em;margin-bottom:12px;opacity:.25">📋</div>
      <div style="font-weight:600;margin-bottom:4px;color:var(--text2)">Keine Verträge hinterlegt</div>
      <div style="font-size:.8em">Start- oder Enddatum beim Posten angeben</div>
    </div>`;
    return;
  }

  if (ctView === "tile") {
    _renderCTTiles(el, items);
  } else {
    _renderCTList(el, items);
  }
}

function _ctStatus(p) {
  const n = today();
  const e = p.contractEnd ? new Date(p.contractEnd) : null;
  const diff = e ? Math.round((e - n) / 86400000) : null;
  let badge = '<span class="badge info">Laufend</span>',
    fillCls = "blue",
    pct = 50;
  if (diff !== null) {
    if (diff < 0) {
      badge = '<span class="badge expired">Abgelaufen</span>';
      fillCls = "red";
      pct = 100;
    } else if (diff <= 30) {
      badge = `<span class="badge warn">${diff} Tage</span>`;
      fillCls = "amber";
      pct = 95;
    } else if (diff <= 90) {
      badge = `<span class="badge warn">${Math.round(diff / 30)} Monate</span>`;
      fillCls = "amber";
      pct = 85;
    } else {
      badge = `<span class="badge ok">${Math.round(diff / 30)} Mon. verbl.</span>`;
    }
    const s = p.contractStart ? new Date(p.contractStart) : null;
    if (s && e && diff >= 0) {
      const tot = (e - s) / 86400000,
        ela = (n - s) / 86400000;
      pct = tot > 0 ? Math.min(Math.max((ela / tot) * 100, 2), 100) : 50;
    }
  }
  return { badge, fillCls, pct };
}

// ── LISTEN-ANSICHT ────────────────────
function _renderCTList(el, items) {
  const sorted = sortArr(items, ctSort.k, ctSort.asc);
  const n = today();

  const thS = (k, lbl) => {
    const active = ctSort.k === k;
    const cls = active ? (ctSort.asc ? "sort-asc" : "sort-desc") : "";
    const arr = active ? (ctSort.asc ? "↑" : "↓") : "↕";
    return `<span class="sortable ${cls}" onclick="doCtSort('${k}')">${lbl} <small style="opacity:.5">${arr}</small></span>`;
  };

  el.innerHTML = `<div class="ct-list">
    <div class="ct-header">
      ${thS("name", "Bezeichnung")}
      ${thS("contractStart", "Start")}
      ${thS("contractEnd", "Ende")}
      ${thS("amount", "Betrag")}
      <span>Intervall</span>
      <span>Status</span>
      <span></span>
    </div>
    ${sorted
      .map((p) => {
        const idx = S.data.indexOf(p);
        const s = p.contractStart ? new Date(p.contractStart) : null;
        const e = p.contractEnd ? new Date(p.contractEnd) : null;
        const { badge, fillCls, pct } = _ctStatus(p);
        return `<div class="ct-row">
        <div>
          <div class="ct-name">${esc(p.name)}</div>
          ${p.note ? `<div class="ct-note">${esc(p.note)}</div>` : ""}
          <div class="ct-prog"><div class="ct-prog-fill ${fillCls}" style="width:${pct.toFixed(0)}%"></div></div>
        </div>
        <div class="ct-cell">${s ? s.toLocaleDateString("de-DE", { month: "2-digit", year: "numeric" }) : "—"}</div>
        <div class="ct-cell">${e ? e.toLocaleDateString("de-DE") : "—"}</div>
        <div class="ct-cell r">${fm(parseFloat(p.amount) || 0)}</div>
        <div class="ct-cell">${p.interval}</div>
        <div class="ct-cell">${badge}</div>
        <div class="ct-cell actions"><button class="btn sm" onclick="openModal(${idx})">✎</button></div>
      </div>`;
      })
      .join("")}
  </div>`;
}

// ── KACHEL-ANSICHT ────────────────────
function _renderCTTiles(el, items) {
  const sorted = sortArr(items, ctSort.k, ctSort.asc);

  el.innerHTML = `<div class="ct-tiles ct-tiles-v2">
    ${sorted
      .map((p) => {
        const idx = S.data.indexOf(p);
        const s = p.contractStart ? new Date(p.contractStart) : null;
        const e = p.contractEnd ? new Date(p.contractEnd) : null;
        const acc = S.accounts.find((a) => a.id === p.accountId);
        const { badge, fillCls, pct } = _ctStatus(p);

        const accentColor =
          fillCls === "red"
            ? "var(--red)"
            : fillCls === "amber"
              ? "var(--amber)"
              : "var(--blue)";
        return `<div class="ct-tile">
        <div class="ct-tile-accent" style="background:${accentColor}"></div>
        <div class="ct-tile-head">
          <div style="flex:1;min-width:0;">
            <div class="ct-name">${esc(p.name)}</div>
            ${p.note ? `<div class="ct-note" style="margin-top:3px;">${esc(p.note)}</div>` : ""}
          </div>
          <button class="btn sm" onclick="openModal(${idx})" style="flex-shrink:0;">✎</button>
        </div>
        <div class="ct-tile-amount">${p.type === "ausgabe" ? "−" : "+"} ${fm(parseFloat(p.amount) || 0)}</div>
        <div class="ct-tile-interval">${p.interval || "—"}</div>
        <div class="ct-prog" style="margin:14px 0 8px;"><div class="ct-prog-fill ${fillCls}" style="width:${pct.toFixed(0)}%"></div></div>
        <div class="ct-tile-dates">
          <div><div class="ct-meta-lbl">Start</div><div class="ct-date-val">${s ? s.toLocaleDateString("de-DE", { month: "2-digit", year: "numeric" }) : "—"}</div></div>
          <div style="text-align:right;"><div class="ct-meta-lbl">Ende</div><div class="ct-date-val">${e ? e.toLocaleDateString("de-DE") : "—"}</div></div>
        </div>
        <div class="ct-tile-foot">
          ${badge}
          ${acc ? `<span class="ct-acc-dot" style="background:${acc.color};margin-left:auto;"></span><span style="font-size:.7em;color:var(--text2)">${esc(acc.label)}</span>` : ""}
        </div>
      </div>`;
      })
      .join("")}
  </div>`;
}

// ── CONTRACT BADGE ────────────────────
function updateContractBadge() {
  const n = today();
  const warn = S.data.filter((p) => {
    if (!p.contractEnd) return false;
    const diff = Math.round((new Date(p.contractEnd) - n) / 86400000);
    return diff >= 0 && diff <= 90;
  }).length;
  const badge = document.getElementById("contractBadge");
  if (badge) {
    badge.style.display = warn > 0 ? "" : "none";
    badge.textContent = warn;
  }
}
