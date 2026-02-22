// ══════════════════════════════════════
//  DOCS — Über diese App
// ══════════════════════════════════════

function renderDocs() {
  const el = document.getElementById("p-docs");
  if (!el) return;

  el.innerHTML = `
  <div class="docs-wrap">

    <!-- HERO ──────────────────────────── -->
    <div class="docs-hero">
      <div class="docs-hero-bg"></div>
      <div class="docs-hero-glow"></div>
      <div class="docs-hero-content">
        <div class="docs-hero-badge">v3.0 · Februar 2026</div>
        <h1 class="docs-hero-title">Candlescope<br><span>FinanceBoard</span></h1>
        <p class="docs-hero-sub">Deine Finanzen. Offline. Sicher. Kompakt.<br>Entwickelt mit Präzision — powered by Claude AI.</p>
        <div class="docs-hero-tags">
          <span class="docs-tag">🔒 100% Lokal</span>
          <span class="docs-tag">⚡ Offline First</span>
          <span class="docs-tag">🧠 KI-entwickelt</span>
          <span class="docs-tag">🖥️ Electron App</span>
        </div>
      </div>
      <div class="docs-hero-visual">
        <div class="docs-hero-card">
          <div class="docs-hc-bar" style="width:72%;background:var(--blue)"></div>
          <div class="docs-hc-bar" style="width:45%;background:var(--green)"></div>
          <div class="docs-hc-bar" style="width:88%;background:var(--amber)"></div>
          <div class="docs-hc-label">Finanzübersicht</div>
        </div>
      </div>
    </div>

    <!-- KACHEL-GRID ────────────────────── -->
    <div class="docs-grid">

      <!-- Große Kachel: Warum offline? -->
      <div class="docs-tile docs-tile--wide docs-tile--accent">
        <div class="docs-tile-icon">🔒</div>
        <div class="docs-tile-content">
          <div class="docs-tile-tag">Sicherheit</div>
          <div class="docs-tile-title">Warum 100% offline?</div>
          <div class="docs-tile-body">
            Deine Kontonummern, Sparziele und Monatseinkommen gehören nur dir.
            FinanceBoard sendet <strong>keine einzige Zahl</strong> an Server.
            Keine Cloud, keine Accounts, keine Datenschutzerklärungen.
            Alles liegt verschlüsselt in deinem Browser — und bleibt dort.
          </div>
          <div class="docs-tile-chips">
            <span class="docs-chip">localStorage</span>
            <span class="docs-chip">SHA-256 Passwort</span>
            <span class="docs-chip">Kein Backend</span>
          </div>
        </div>
      </div>

      <!-- Kachel: Version -->
      <div class="docs-tile docs-tile--dark">
        <div class="docs-tile-icon">🚀</div>
        <div class="docs-tile-tag">Version</div>
        <div class="docs-tile-title">v3.0</div>
        <div class="docs-version-list">
          <div class="docs-vitem docs-vitem--done">v1 · Dashboard & Konten</div>
          <div class="docs-vitem docs-vitem--done">v2 · Tutorial & IBAN</div>
          <div class="docs-vitem docs-vitem--done">v3 · Ziele · Charts · Themes</div>
          <div class="docs-vitem docs-vitem--next">v4 · Bankimport · CSV</div>
        </div>
      </div>

      <!-- Kachel: Hersteller -->
      <div class="docs-tile docs-tile--glass">
        <div class="docs-tile-icon">👨‍💻</div>
        <div class="docs-tile-tag">Hersteller</div>
        <div class="docs-tile-title">Made by<br>Candlescope</div>
        <div class="docs-tile-body" style="margin-top:10px;">
          Entwickelt als persönliches Finanz-Dashboard. Kein Unternehmen, kein VC.
          Ein Projekt — entworfen für den täglichen Gebrauch.
        </div>
      </div>

      <!-- Kachel: Claude AI -->
      <div class="docs-tile docs-tile--claude">
        <div class="docs-tile-icon">🤖</div>
        <div class="docs-tile-tag">Technologie</div>
        <div class="docs-tile-title">Powered by<br>Claude AI</div>
        <div class="docs-tile-body" style="margin-top:10px;">
          Jede Zeile Code, jedes UI-Element, jede Logik entstand im Dialog mit
          <strong>Claude</strong> von Anthropic. KI als Co-Developer — nicht als Generator.
        </div>
        <div class="docs-claude-badge">Anthropic · Claude 4</div>
      </div>

      <!-- Breite Kachel: Features -->
      <div class="docs-tile docs-tile--features docs-tile--wide">
        <div class="docs-tile-tag" style="margin-bottom:16px;">Was die App kann</div>
        <div class="docs-features-grid">
          ${[
            {
              icon: "🏦",
              title: "Kontoverwaltung",
              desc: "IBAN, Kontoart, Live-Saldo",
            },
            {
              icon: "📊",
              title: "Zahlungsplan",
              desc: "Cockpit bis zum Zahltag",
            },
            { icon: "📋", title: "Umsätze", desc: "Liste · Kacheln · Export" },
            { icon: "📄", title: "Verträge", desc: "Laufzeiten & Badges" },
            { icon: "🎯", title: "Sparziele", desc: "Fortschritt & Sparrate" },
            {
              icon: "📈",
              title: "Jahresübersicht",
              desc: "Balken- & Sparquote-Chart",
            },
            {
              icon: "↕",
              title: "Umbuchungen",
              desc: "Transfers dokumentieren",
            },
            {
              icon: "🔐",
              title: "Passwortschutz",
              desc: "SHA-256 verschlüsselt",
            },
            { icon: "🎨", title: "Themes", desc: "Nacht-Blau · Crimson · HC" },
            { icon: "📖", title: "Tutorial", desc: "10-Schritt Einführung" },
            {
              icon: "💾",
              title: "Export / Import",
              desc: "Datensicherung als JSON",
            },
            {
              icon: "🖨️",
              title: "Kontoauszug",
              desc: "HTML-Export druckbereit",
            },
          ]
            .map(
              (f) => `
            <div class="docs-feature-item">
              <div class="docs-feature-icon">${f.icon}</div>
              <div class="docs-feature-title">${f.title}</div>
              <div class="docs-feature-desc">${f.desc}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- Kachel: Roadmap -->
      <div class="docs-tile docs-tile--roadmap">
        <div class="docs-tile-icon">🗺️</div>
        <div class="docs-tile-tag">Roadmap</div>
        <div class="docs-tile-title">Was kommt</div>
        <div class="docs-roadmap-list">
          ${[
            { label: "CSV-Bankimport", status: "planned" },
            { label: "Wiederkehrende Käufe", status: "planned" },
            { label: "Benachrichtigungen", status: "planned" },
            { label: "Mehrere Profile", status: "idea" },
            { label: "Mobile App", status: "idea" },
            { label: "Steuer-Assistent", status: "idea" },
          ]
            .map(
              (r) => `
            <div class="docs-roadmap-item">
              <div class="docs-roadmap-dot docs-roadmap-dot--${r.status}"></div>
              <span>${r.label}</span>
              <span class="docs-roadmap-badge docs-roadmap-badge--${r.status}">${r.status === "planned" ? "Geplant" : "Idee"}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <!-- Kachel: Stack -->
      <div class="docs-tile docs-tile--stack">
        <div class="docs-tile-icon">⚙️</div>
        <div class="docs-tile-tag">Tech Stack</div>
        <div class="docs-tile-title">Technologie</div>
        <div class="docs-stack-list">
          <div class="docs-stack-item"><span class="docs-stack-label">Runtime</span><span class="docs-stack-val">Electron</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Frontend</span><span class="docs-stack-val">Vanilla JS · CSS</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Charts</span><span class="docs-stack-val">Chart.js</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Speicher</span><span class="docs-stack-val">localStorage</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Crypto</span><span class="docs-stack-val">Web Crypto API</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">KI</span><span class="docs-stack-val">Claude 4 Sonnet</span></div>
        </div>
      </div>

      <!-- Kachel: Philosophie -->
      <div class="docs-tile docs-tile--philosophy docs-tile--tall">
        <div class="docs-tile-icon">💡</div>
        <div class="docs-tile-tag">Philosophie</div>
        <div class="docs-tile-title">Weniger ist mehr.</div>
        <div class="docs-tile-body" style="margin-top:14px;line-height:1.8;">
          FinanceBoard ist kein Fintech-Produkt. Es ist ein Werkzeug — präzise,
          schnell, ohne Ablenkung. Keine Gamification, keine Upsells, keine KI die
          deine Ausgaben „analysiert". Nur Zahlen, die stimmen.
          <br><br>
          <strong>Deine Daten gehören dir.</strong> Das war, ist und bleibt das
          einzige Versprechen dieser App.
        </div>
      </div>

      <!-- Kachel: Statistiken -->
      <div class="docs-tile docs-tile--stats">
        <div class="docs-tile-tag">App in Zahlen</div>
        <div class="docs-stats-grid">
          <div class="docs-stat">
            <div class="docs-stat-num">0</div>
            <div class="docs-stat-lbl">Server-Requests</div>
          </div>
          <div class="docs-stat">
            <div class="docs-stat-num">100%</div>
            <div class="docs-stat-lbl">Offline-fähig</div>
          </div>
          <div class="docs-stat">
            <div class="docs-stat-num">12</div>
            <div class="docs-stat-lbl">Features v3</div>
          </div>
          <div class="docs-stat">
            <div class="docs-stat-num">3</div>
            <div class="docs-stat-lbl">Themes</div>
          </div>
        </div>
      </div>

    </div><!-- /docs-grid -->

    <!-- FOOTER ──────────────────────────── -->
    <div class="docs-footer">
      <div class="docs-footer-logo">Candlescope FinanceBoard</div>
      <div class="docs-footer-sub">v3.0 · 2026 · Entwickelt mit Claude AI von Anthropic</div>
    </div>

  </div>`;
}
