// ══════════════════════════════════════
//  JAHRESÜBERSICHT — Karten · Diagramme · Jahresvergleich
// ══════════════════════════════════════

let _jahresChart = null;
let _sparChart = null;
let _verglChart = null;
let _jahrA = new Date().getFullYear();
let _jahrB = new Date().getFullYear() - 1;
let _compareMode = false;

function renderJahr() {
  const pg = document.getElementById("p-jahr");
  if (!pg) return;

  const n = today();
  const yr = _jahrA;

  // Verfügbare Jahre (aus Daten ableiten + aktuelle ± 2)
  const dataYears = new Set();
  S.data.forEach((p) => {
    if (p.activeFrom) dataYears.add(new Date(p.activeFrom).getFullYear());
  });
  const curYear = n.getFullYear();
  for (let y = curYear - 3; y <= curYear; y++) dataYears.add(y);
  const allYears = [...dataYears].sort((a, b) => b - a);

  pg.innerHTML = `
    <div class="ph" style="margin-bottom:20px;">
      <div>
        <div class="ph-title">Jahresübersicht</div>
        <div class="ph-sub">Monatliche Saldi · Diagramme · Sparziele</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <!-- Jahr A -->
        <select onchange="_jahrA=+this.value;renderJahr()" style="background:var(--panel2);border:1px solid var(--border2);border-radius:var(--r1);padding:5px 10px;color:var(--text);font-size:.8em;cursor:pointer;outline:none;">
          ${allYears.map((y) => `<option value="${y}" ${y === _jahrA ? "selected" : ""}>${y}</option>`).join("")}
        </select>
        <!-- Vergleich Toggle -->
        <button class="btn ${_compareMode ? "primary" : ""}" onclick="_compareMode=!_compareMode;renderJahr();"
          title="Jahresvergleich" style="font-size:.75em;gap:5px;display:flex;align-items:center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          Vergleich
        </button>
        <!-- Jahr B (nur bei Vergleich) -->
        ${
          _compareMode
            ? `
          <span style="font-size:.75em;color:var(--text3);">vs.</span>
          <select onchange="_jahrB=+this.value;renderJahr()" style="background:var(--panel2);border:1px solid var(--border2);border-radius:var(--r1);padding:5px 10px;color:var(--text);font-size:.8em;cursor:pointer;outline:none;">
            ${allYears.map((y) => `<option value="${y}" ${y === _jahrB ? "selected" : ""}>${y}</option>`).join("")}
          </select>
        `
            : ""
        }
      </div>
    </div>

    <!-- Haupt-Kombinationschart: Ausgaben beider Jahre als Balken + Saldo als Linie -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">
          ${
            _compareMode
              ? `Ausgaben & Saldo — ${_jahrA} vs. ${_jahrB}`
              : `Monatlicher Verlauf ${_jahrA}`
          }
        </div>
        <div class="panel-tag" style="display:flex;gap:10px;align-items:center;">
          ${
            _compareMode
              ? `
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:.85em;">
              <span style="width:20px;height:3px;background:#4d9eff;border-radius:2px;display:inline-block;"></span>${_jahrA} Ausgaben
            </span>
            <span style="display:inline-flex;align-items:center;gap:5px;font-size:.85em;">
              <span style="width:20px;height:3px;background:rgba(255,181,71,.8);border-radius:2px;display:inline-block;border-top:2px dashed rgba(255,181,71,.8);"></span>${_jahrB} Ausgaben
            </span>
          `
              : "Einnahmen vs. Ausgaben · Saldo als Linie"
          }
        </div>
      </div>
      <div class="panel-body" style="padding-bottom:8px;">
        <div style="position:relative;height:${_compareMode ? "320px" : "260px"};">
          <canvas id="jahresBarChart"></canvas>
        </div>
      </div>
    </div>

    ${
      _compareMode
        ? `
    <!-- Δ Differenz-Chart: zeigt wo sich was verbessert/verschlechtert hat -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">Δ Ausgaben-Differenz ${_jahrA} minus ${_jahrB}</div>
        <div class="panel-tag">Grün = weniger ausgegeben als Vorjahr · Rot = mehr ausgegeben</div>
      </div>
      <div class="panel-body"><div style="position:relative;height:180px;"><canvas id="verglChart"></canvas></div></div>
    </div>
    `
        : `
    <!-- Sparquote nur im Einzelmodus -->
    <div class="panel" style="margin-bottom:14px;">
      <div class="panel-head">
        <div class="panel-title">Sparquote ${_jahrA}</div>
        <div class="panel-tag">% des Einkommens gespart</div>
      </div>
      <div class="panel-body"><div style="position:relative;height:220px;"><canvas id="sparChart"></canvas></div></div>
    </div>
    `
    }

    <!-- Sparziele Fortschritt -->
    ${
      (S.goals || []).length > 0
        ? `
    <div class="panel" style="margin-bottom:16px;">
      <div class="panel-head">
        <div class="panel-title">Sparziele — Fortschritt</div>
        <div class="panel-tag">${(S.goals || []).length} Ziele</div>
      </div>
      <div class="goals-year-grid" id="goalsYearGrid"></div>
    </div>`
        : ""
    }

    <!-- Monatskarten -->
    <div class="year-grid" id="yearGrid"></div>`;

  const monthsA = _calcMonths(_jahrA);
  const monthsB = _compareMode ? _calcMonths(_jahrB) : null;

  _renderJahresChart(monthsA, monthsB);
  if (_compareMode && monthsB) {
    _renderVerglChart(monthsA, monthsB);
  } else {
    _renderSparChart(monthsA, null);
  }
  if ((S.goals || []).length > 0) _renderGoalsYear();
  _renderMonthCards(monthsA, n, yr);
}

function _calcMonths(year) {
  return Array.from({ length: 12 }, (_, m) => {
    let inc = 0,
      exp = 0;
    S.data.forEach((p) => {
      const v = monthActualYear(p, m, year);
      if (p.type === "einnahme") inc += v;
      else exp += v;
    });
    if (inc === 0 && S.monthlyIncome > 0) inc = S.monthlyIncome;
    return {
      inc,
      exp,
      bal: inc - exp,
      spar: inc > 0 ? Math.max(0, ((inc - exp) / inc) * 100) : 0,
    };
  });
}

// monthActualYear — delegiert an utils.js monthActualForYear (year-aware)
function monthActualYear(p, m, year) {
  return monthActualForYear(p, m, year);
}

function _renderJahresChart(monthsA, monthsB) {
  const ctx = document.getElementById("jahresBarChart");
  if (!ctx) return;
  if (_jahresChart) {
    _jahresChart.destroy();
  }

  const TC = { color: "#6b7a99", font: { size: 10 } };
  const gridA = { color: "rgba(255,255,255,.05)" };

  if (monthsB) {
    // ── VERGLEICHSMODUS: Ausgaben A+B als Balken, Saldo A+B als Linien ──
    // Y-Achse links: Beträge (Ausgaben), rechts: Saldo-Differenz
    const expA = monthsA.map((m) => m.exp);
    const expB = monthsB.map((m) => m.exp);
    const balA = monthsA.map((m) => m.bal);
    const balB = monthsB.map((m) => m.bal);

    _jahresChart = new Chart(ctx, {
      data: {
        labels: MONTHS_S,
        datasets: [
          {
            type: "bar",
            label: `Ausgaben ${_jahrA}`,
            data: expA,
            backgroundColor: "rgba(77,158,255,.3)",
            borderColor: "rgba(77,158,255,.8)",
            borderWidth: 1.5,
            borderRadius: 3,
            yAxisID: "yAmt",
            order: 2,
          },
          {
            type: "bar",
            label: `Ausgaben ${_jahrB}`,
            data: expB,
            backgroundColor: "rgba(255,181,71,.2)",
            borderColor: "rgba(255,181,71,.6)",
            borderWidth: 1.5,
            borderRadius: 3,
            yAxisID: "yAmt",
            order: 3,
          },
          {
            type: "line",
            label: `Saldo ${_jahrA}`,
            data: balA,
            borderColor: "#00e5a0",
            backgroundColor: "rgba(0,229,160,.06)",
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#00e5a0",
            fill: false,
            tension: 0.35,
            yAxisID: "ySaldo",
            order: 0,
          },
          {
            type: "line",
            label: `Saldo ${_jahrB}`,
            data: balB,
            borderColor: "rgba(255,77,106,.85)",
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "rgba(255,77,106,.85)",
            borderDash: [6, 3],
            fill: false,
            tension: 0.35,
            yAxisID: "ySaldo",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              color: "#6b7a99",
              font: { size: 11 },
              boxWidth: 14,
              padding: 14,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
            },
          },
        },
        scales: {
          x: { ticks: TC, grid: gridA },
          yAmt: {
            type: "linear",
            position: "left",
            ticks: { ...TC, callback: (v) => fm(v) },
            grid: gridA,
            title: {
              display: true,
              text: "Ausgaben",
              color: "#6b7a99",
              font: { size: 9 },
            },
          },
          ySaldo: {
            type: "linear",
            position: "right",
            ticks: { ...TC, callback: (v) => fm(v, true) },
            grid: { drawOnChartArea: false },
            title: {
              display: true,
              text: "Saldo",
              color: "#6b7a99",
              font: { size: 9 },
            },
          },
        },
      },
    });
  } else {
    // ── EINZELMODUS: Einnahmen + Ausgaben als Balken, Saldo als Linie ──
    const inc = monthsA.map((m) => m.inc);
    const exp = monthsA.map((m) => m.exp);
    const bal = monthsA.map((m) => m.bal);

    _jahresChart = new Chart(ctx, {
      data: {
        labels: MONTHS_S,
        datasets: [
          {
            type: "bar",
            label: "Einnahmen",
            data: inc,
            backgroundColor: "rgba(0,229,160,.2)",
            borderColor: "rgba(0,229,160,.6)",
            borderWidth: 1.5,
            borderRadius: 3,
            yAxisID: "yAmt",
            order: 2,
          },
          {
            type: "bar",
            label: "Ausgaben",
            data: exp,
            backgroundColor: "rgba(255,77,106,.2)",
            borderColor: "rgba(255,77,106,.6)",
            borderWidth: 1.5,
            borderRadius: 3,
            yAxisID: "yAmt",
            order: 3,
          },
          {
            type: "line",
            label: "Monatssaldo",
            data: bal,
            borderColor: "#4d9eff",
            backgroundColor: "rgba(77,158,255,.07)",
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#4d9eff",
            fill: true,
            tension: 0.35,
            yAxisID: "ySaldo",
            order: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: { color: "#6b7a99", font: { size: 11 }, boxWidth: 14 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
            },
          },
        },
        scales: {
          x: { ticks: TC, grid: gridA },
          yAmt: {
            type: "linear",
            position: "left",
            ticks: { ...TC, callback: (v) => fm(v) },
            grid: gridA,
          },
          ySaldo: {
            type: "linear",
            position: "right",
            ticks: { ...TC, callback: (v) => fm(v, true) },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }
}

function _renderSparChart(monthsA, monthsB) {
  const ctx = document.getElementById("sparChart");
  if (!ctx) return;
  if (_sparChart) {
    _sparChart.destroy();
  }

  const valuesA = monthsA.map((m) => parseFloat(m.spar.toFixed(1)));
  const valuesB = monthsB
    ? monthsB.map((m) => parseFloat(m.spar.toFixed(1)))
    : [];

  // Dynamic Y axis: zoom in on actual range with generous padding
  const allVals = [...valuesA, ...valuesB].filter((v) => v > 0);
  const minVal = allVals.length ? Math.min(...allVals) : 0;
  const maxVal = allVals.length ? Math.max(...allVals) : 100;
  const range = Math.max(maxVal - minVal, 5); // at least 5% range
  const pad = range * 0.4;
  const yMin = Math.max(0, Math.floor(minVal - pad));
  const yMax = Math.min(100, Math.ceil(maxVal + pad));

  const datasets = [
    {
      label: `Sparquote ${_jahrA} %`,
      data: valuesA,
      borderColor: "#4d9eff",
      backgroundColor: "rgba(77,158,255,.12)",
      borderWidth: 2.5,
      pointRadius: 5,
      pointBackgroundColor: valuesA.map((v) =>
        v >= 30 ? "#00e5a0" : v >= 15 ? "#4d9eff" : "#ff4d6a",
      ),
      pointBorderColor: "transparent",
      fill: true,
      tension: 0.4,
    },
  ];

  if (monthsB) {
    datasets.push({
      label: `Sparquote ${_jahrB} %`,
      data: valuesB,
      borderColor: "rgba(255,181,71,.85)",
      backgroundColor: "rgba(255,181,71,.05)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "rgba(255,181,71,.85)",
      fill: false,
      tension: 0.4,
      borderDash: [5, 3],
    });
  }

  _sparChart = new Chart(ctx, {
    type: "line",
    data: { labels: MONTHS_S, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: "#6b7a99", font: { size: 11 }, boxWidth: 14 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#6b7a99", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,.04)" },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            color: "#6b7a99",
            font: { size: 10 },
            callback: (v) => v + "%",
            maxTicksLimit: 6,
          },
          grid: { color: "rgba(255,255,255,.06)" },
        },
      },
    },
  });
}

function _renderVerglChart(monthsA, monthsB) {
  const ctx = document.getElementById("verglChart");
  if (!ctx) return;
  if (_verglChart) {
    _verglChart.destroy();
  }

  // Δ Ausgaben: negativ = WENIGER ausgegeben = gut (grün)
  const deltaExp = monthsA.map((m, i) =>
    parseFloat((m.exp - monthsB[i].exp).toFixed(2)),
  );
  const deltaSal = monthsA.map((m, i) =>
    parseFloat((m.bal - monthsB[i].bal).toFixed(2)),
  );

  _verglChart = new Chart(ctx, {
    data: {
      labels: MONTHS_S,
      datasets: [
        {
          type: "bar",
          label: `Δ Ausgaben (${_jahrA}−${_jahrB})`,
          data: deltaExp,
          // Mehr ausgegeben = rot, weniger = grün
          backgroundColor: deltaExp.map((d) =>
            d > 0 ? "rgba(255,77,106,.35)" : "rgba(0,229,160,.3)",
          ),
          borderColor: deltaExp.map((d) =>
            d > 0 ? "rgba(255,77,106,.8)" : "rgba(0,229,160,.7)",
          ),
          borderWidth: 1.5,
          borderRadius: 4,
          yAxisID: "y",
          order: 1,
        },
        {
          type: "line",
          label: `Δ Saldo (${_jahrA}−${_jahrB})`,
          data: deltaSal,
          borderColor: "#4d9eff",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: deltaSal.map((d) =>
            d >= 0 ? "#00e5a0" : "#ff4d6a",
          ),
          fill: false,
          tension: 0.3,
          yAxisID: "y",
          order: 0,
          borderDash: [4, 2],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: "#6b7a99", font: { size: 11 }, boxWidth: 12 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fm(ctx.parsed.y, true)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#6b7a99", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,.04)" },
        },
        y: {
          ticks: {
            color: "#6b7a99",
            font: { size: 10 },
            callback: (v) => fm(v, true),
          },
          grid: { color: "rgba(255,255,255,.05)" },
        },
      },
    },
  });
}

function _renderGoalsYear() {
  const el = document.getElementById("goalsYearGrid");
  if (!el) return;
  el.innerHTML = (S.goals || [])
    .map((g) => {
      const pct = Math.min(
        100,
        g.targetAmount > 0
          ? Math.round((g.currentAmount / g.targetAmount) * 100)
          : 0,
      );
      const remaining = Math.max(
        0,
        (g.targetAmount || 0) - (g.currentAmount || 0),
      );
      const months = g.deadline
        ? Math.max(
            0,
            Math.round(
              (new Date(g.deadline) - today()) / (1000 * 60 * 60 * 24 * 30),
            ),
          )
        : null;
      return `<div class="goal-year-item">
      <div class="goal-year-top">
        <span style="font-size:1.2em">${g.icon || "🎯"}</span>
        <div>
          <div style="font-size:.82em;font-weight:700;color:var(--text1)">${esc(g.name)}</div>
          ${months !== null ? `<div style="font-size:.68em;color:var(--text3)">${months > 0 ? months + " Monate verbleibend" : "⚠ Zieldatum überschritten"}</div>` : ""}
        </div>
        <div style="margin-left:auto;font-family:var(--mono);font-size:.82em;font-weight:700;color:${g.color || "#4d9eff"}">${pct}%</div>
      </div>
      <div style="height:8px;background:var(--panel2);border-radius:4px;overflow:hidden;margin:8px 0 6px;">
        <div style="height:100%;width:${pct}%;background:${g.color || "#4d9eff"};border-radius:4px;transition:width .5s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.68em;color:var(--text3);">
        <span>${fm(g.currentAmount || 0)} gespart</span>
        <span>noch ${fm(remaining)}</span>
        <span>Ziel: ${fm(g.targetAmount || 0)}</span>
      </div>
    </div>`;
    })
    .join("");
}

function _renderMonthCards(months, n, yr) {
  const grid = document.getElementById("yearGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const curMo = n.getMonth();

  months.forEach((m, idx) => {
    const expiring = S.data.filter((p) => {
      if (!p.contractEnd) return false;
      const e = new Date(p.contractEnd);
      return e.getMonth() === idx && e.getFullYear() === yr;
    });
    const card = document.createElement("div");
    const isCurrentYear = yr === n.getFullYear();
    card.className = `month-card${isCurrentYear && idx === curMo ? " cur" : ""}${isCurrentYear && idx < curMo ? " past" : ""}`;
    card.innerHTML = `
      <div class="mc-name">
        ${MONTHS_S[idx]}${isCurrentYear && idx === curMo ? ' &middot; <span style="color:var(--blue)">heute</span>' : ""}
      </div>
      <div class="mc-row"><span class="mc-row-lbl">Einnahmen</span><span class="mc-row-val" style="color:var(--green)">${m.inc > 0 ? "+" + fm(m.inc) : "—"}</span></div>
      <div class="mc-row"><span class="mc-row-lbl">Ausgaben</span><span class="mc-row-val" style="color:var(--red)">${m.exp > 0 ? "−" + fm(m.exp) : "—"}</span></div>
      <hr class="mc-hr">
      <div class="mc-bal" style="color:${m.bal >= 0 ? "var(--green)" : "var(--red)"};">${fm(m.bal, true)}</div>
      <div class="mc-spar" style="color:var(--text3);font-size:.65em;margin-top:2px;">Sparquote: ${m.spar.toFixed(0)}%</div>
      ${expiring.map((p) => `<span class="mc-contract-tag">⏱ ${esc(p.name)}</span>`).join("")}`;
    grid.appendChild(card);
  });
}
