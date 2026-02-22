// ══════════════════════════════════════
//  JAHRESÜBERSICHT — Karten · Diagramme
// ══════════════════════════════════════

let _jahresChart = null;
let _sparChart = null;

function renderJahr() {
  const pg = document.getElementById("p-jahr");
  if (!pg) return;

  const n = today();
  const yr = n.getFullYear();

  pg.innerHTML = `
    <div class="ph" style="margin-bottom:20px;">
      <div>
        <div class="ph-title">Jahresübersicht ${yr}</div>
        <div class="ph-sub">Monatliche Saldi · Diagramme · Sparziele</div>
      </div>
    </div>

    <!-- Diagramme -->
    <div class="jahr-charts">
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Monatlicher Verlauf</div>
          <div class="panel-tag">Einnahmen vs. Ausgaben</div>
        </div>
        <div class="panel-body"><canvas id="jahresBarChart" height="80"></canvas></div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Sparquote</div>
          <div class="panel-tag">% vom Einkommen</div>
        </div>
        <div class="panel-body"><canvas id="sparChart" height="80"></canvas></div>
      </div>
    </div>

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

  // Monatsdaten berechnen
  const months = Array.from({ length: 12 }, (_, m) => {
    let inc = 0,
      exp = 0;
    S.data.forEach((p) => {
      const v = monthActual(p, m);
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

  // Bar Chart
  _renderJahresChart(months);
  // Spar Chart
  _renderSparChart(months);
  // Ziele
  if ((S.goals || []).length > 0) _renderGoalsYear();
  // Monatskarten
  _renderMonthCards(months, n, yr);
}

function _renderJahresChart(months) {
  const ctx = document.getElementById("jahresBarChart");
  if (!ctx) return;
  if (_jahresChart) {
    _jahresChart.destroy();
  }

  _jahresChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: MONTHS_S,
      datasets: [
        {
          label: "Einnahmen",
          data: months.map((m) => m.inc),
          backgroundColor: "rgba(0,229,160,.25)",
          borderColor: "rgba(0,229,160,.7)",
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: "Ausgaben",
          data: months.map((m) => m.exp),
          backgroundColor: "rgba(255,77,106,.2)",
          borderColor: "rgba(255,77,106,.6)",
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#6b7a99", font: { size: 11 } } } },
      scales: {
        x: {
          ticks: { color: "#6b7a99", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,.04)" },
        },
        y: {
          ticks: {
            color: "#6b7a99",
            font: { size: 10 },
            callback: (v) => fm(v),
          },
          grid: { color: "rgba(255,255,255,.06)" },
        },
      },
    },
  });
}

function _renderSparChart(months) {
  const ctx = document.getElementById("sparChart");
  if (!ctx) return;
  if (_sparChart) {
    _sparChart.destroy();
  }

  _sparChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: MONTHS_S,
      datasets: [
        {
          label: "Sparquote %",
          data: months.map((m) => parseFloat(m.spar.toFixed(1))),
          borderColor: "#4d9eff",
          backgroundColor: "rgba(77,158,255,.08)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#4d9eff",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#6b7a99", font: { size: 10 } },
          grid: { color: "rgba(255,255,255,.04)" },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: "#6b7a99",
            font: { size: 10 },
            callback: (v) => v + "%",
          },
          grid: { color: "rgba(255,255,255,.06)" },
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
    card.className = `month-card${idx === curMo ? " cur" : ""}${idx < curMo ? " past" : ""}`;
    card.innerHTML = `
      <div class="mc-name">
        ${MONTHS_S[idx]}${idx === curMo ? ' &middot; <span style="color:var(--blue)">heute</span>' : ""}
      </div>
      <div class="mc-row">
        <span class="mc-row-lbl">Einnahmen</span>
        <span class="mc-row-val" style="color:var(--green)">${m.inc > 0 ? "+" + fm(m.inc) : "—"}</span>
      </div>
      <div class="mc-row">
        <span class="mc-row-lbl">Ausgaben</span>
        <span class="mc-row-val" style="color:var(--red)">${m.exp > 0 ? "−" + fm(m.exp) : "—"}</span>
      </div>
      <hr class="mc-hr">
      <div class="mc-bal" style="color:${m.bal >= 0 ? "var(--green)" : "var(--red)"};">${fm(m.bal, true)}</div>
      <div class="mc-spar" style="color:var(--text3);font-size:.65em;margin-top:2px;">Sparquote: ${m.spar.toFixed(0)}%</div>
      ${expiring.map((p) => `<span class="mc-contract-tag">⏱ ${esc(p.name)}</span>`).join("")}`;
    grid.appendChild(card);
  });
}
