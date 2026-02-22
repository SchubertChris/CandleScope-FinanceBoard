// ══════════════════════════════════════
//  DOCS — Über diese App
// ══════════════════════════════════════

function renderDocs() {
  const el = document.getElementById("p-docs");
  if (!el) return;

  el.innerHTML = `
  <div class="docs-wrap">

    <!-- HERO -->
    <div class="docs-hero">
      <div class="docs-hero-bg"></div>
      <div class="docs-hero-content">
        <div class="docs-hero-badge">v3.0 · Februar 2026</div>
        <h1 class="docs-hero-title">Candlescope<br><span>FinanceBoard</span></h1>
        <p class="docs-hero-sub">Deine Finanzen. Offline. Sicher. Kompakt.<br>Entwickelt mit Claude AI von Anthropic.</p>
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

    <!-- ZEILE 1: Warum offline (breit) + Version + Hersteller -->
    <div class="docs-grid docs-grid-3">
      <div class="docs-tile docs-tile--accent docs-tile--span2">
        <div class="docs-tile-icon">🔒</div>
        <div>
          <div class="docs-tile-tag">Sicherheit & Philosophie</div>
          <div class="docs-tile-title">Warum 100% offline?</div>
          <div class="docs-tile-body">
            Deine Kontonummern, Sparziele und Monatseinkommen gehören nur dir.
            FinanceBoard sendet <strong>keine einzige Zahl</strong> an Server — keine Cloud,
            keine Accounts, kein Tracking. Alle Daten liegen lokal in deinem Browser,
            geschützt durch SHA-256 Passworthash und vollständig unter deiner Kontrolle.
            <br><br>
            <strong>Kein Abo. Kein Login. Keine Datenschutzerklärungen.</strong>
          </div>
          <div class="docs-tile-chips">
            <span class="docs-chip">localStorage</span>
            <span class="docs-chip">SHA-256</span>
            <span class="docs-chip">Kein Backend</span>
            <span class="docs-chip">Privacy Mode</span>
            <span class="docs-chip">Auto-Lock</span>
          </div>
        </div>
      </div>
      <div class="docs-tile docs-tile--dark">
        <div class="docs-tile-icon">👨‍💻</div>
        <div class="docs-tile-tag">Hersteller</div>
        <div class="docs-tile-title">Made by<br>Candlescope</div>
        <div class="docs-tile-body" style="margin-top:10px;">
          Persönliches Finanz-Dashboard, entwickelt für den täglichen Gebrauch.
          Kein Unternehmen, kein VC — ein Projekt mit Sinn.
        </div>
        <div class="docs-claude-badge" style="margin-top:14px;">
          🤖 Powered by Claude AI
        </div>
      </div>
    </div>

    <!-- ZEILE 2: Features (breit, 6 Spalten) -->
    <div class="docs-tile docs-tile--features">
      <div class="docs-tile-tag" style="margin-bottom:14px;">Was die App kann — v3.0</div>
      <div class="docs-features-grid">
        ${[
          {
            icon: "🏦",
            title: "Kontoverwaltung",
            desc: "IBAN · IBAN · Depot · Kreditkarte · Farbkodiert",
          },
          {
            icon: "📊",
            title: "Zahlungsplan",
            desc: "Cockpit — was bis zum Zahltag fällig ist",
          },
          {
            icon: "📋",
            title: "Umsätze & Fixkosten",
            desc: "Liste & Kacheln · Zeitfilter · CSV-Export",
          },
          {
            icon: "📄",
            title: "Verträge",
            desc: "Laufzeiten · Badges · Ablaufwarnungen",
          },
          {
            icon: "🎯",
            title: "Sparziele",
            desc: "Fortschritt · Sparrate · Deadline",
          },
          {
            icon: "📈",
            title: "Jahresübersicht",
            desc: "Balken · Sparquote · Jahresvergleich",
          },
          {
            icon: "↕",
            title: "Umbuchungen",
            desc: "Transfers zwischen Konten dokumentieren",
          },
          {
            icon: "🔐",
            title: "Passwortschutz",
            desc: "SHA-256 · Privacy Mode · Auto-Lock",
          },
          {
            icon: "🎨",
            title: "Themes & Schrift",
            desc: "Nacht-Blau · Crimson · Hochkontrast · 11–20px",
          },
          {
            icon: "📖",
            title: "Tutorial",
            desc: "10-Schritt interaktive Einführung",
          },
          {
            icon: "💾",
            title: "Export / Import",
            desc: "Vollständige Datensicherung als JSON",
          },
          {
            icon: "🖨️",
            title: "Kontoauszug",
            desc: "HTML-Export · druckoptimiert",
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

    <!-- ZEILE 3: Stats + Stack + Philosophie (3 gleich) -->
    <div class="docs-grid docs-grid-3">
      <div class="docs-tile docs-tile--stats">
        <div class="docs-tile-tag">App in Zahlen</div>
        <div class="docs-stats-grid">
          <div class="docs-stat">
            <div class="docs-stat-num">0</div>
            <div class="docs-stat-lbl">Server-Anfragen</div>
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

      <div class="docs-tile docs-tile--stack">
        <div class="docs-tile-icon">⚙️</div>
        <div class="docs-tile-tag">Tech Stack</div>
        <div class="docs-stack-list">
          <div class="docs-stack-item"><span class="docs-stack-label">Runtime</span><span class="docs-stack-val">Electron</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Frontend</span><span class="docs-stack-val">Vanilla JS · CSS</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Charts</span><span class="docs-stack-val">Chart.js 4</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Speicher</span><span class="docs-stack-val">localStorage</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">Crypto</span><span class="docs-stack-val">Web Crypto API</span></div>
          <div class="docs-stack-item"><span class="docs-stack-label">KI</span><span class="docs-stack-val">Claude Sonnet 4</span></div>
        </div>
      </div>

      <div class="docs-tile docs-tile--philosophy">
        <div class="docs-tile-icon">💡</div>
        <div class="docs-tile-tag">Philosophie</div>
        <div class="docs-tile-title">Weniger ist mehr.</div>
        <div class="docs-tile-body" style="margin-top:10px;line-height:1.75;">
          Kein Fintech-Produkt. Ein Werkzeug — präzise, schnell, ohne Ablenkung.
          Keine Gamification, keine Upsells. Nur Zahlen, die stimmen.
          <br><br>
          <strong>Deine Daten gehören dir.</strong>
        </div>
      </div>
    </div>

    <!-- ZEILE 4: Roadmap als Schlangenweg -->
    <div class="docs-tile docs-tile--roadmap-full">
      <div class="docs-tile-tag" style="margin-bottom:18px;">Roadmap · Entwicklungsweg</div>
      <div class="docs-roadmap-snake">
        ${[
          {
            v: "v1",
            label: "Dashboard & Konten",
            status: "done",
            desc: "Grundstruktur, Konten, Saldo",
          },
          {
            v: "v2",
            label: "Tutorial & IBAN",
            status: "done",
            desc: "10-Schritt Tutorial, IBAN-Formatierung",
          },
          {
            v: "v3",
            label: "Ziele · Charts · Themes",
            status: "current",
            desc: "Sparziele, Jahresübersicht, Crimson Theme, Privacy Mode",
          },
          {
            v: "v4",
            label: "CSV-Bankimport",
            status: "planned",
            desc: "Direktimport aus Bankexports",
          },
          {
            v: "v5",
            label: "Wiederkehrende Ereignisse",
            status: "planned",
            desc: "Automatische Buchungsvorschläge",
          },
          {
            v: "v6",
            label: "Benachrichtigungen",
            status: "idea",
            desc: "Ablaufwarnungen & Erinnerungen",
          },
          {
            v: "v7",
            label: "Mehrere Profile",
            status: "idea",
            desc: "Familie, Partner, Business trennen",
          },
          {
            v: "v8",
            label: "Mobile App",
            status: "idea",
            desc: "iOS & Android Companion",
          },
        ]
          .map(
            (r, i) => `
          <div class="docs-snake-item docs-snake-item--${r.status} ${i % 2 === 0 ? "even" : "odd"}">
            <div class="docs-snake-connector ${i % 2 === 0 ? "right" : "left"}"></div>
            <div class="docs-snake-node">
              <div class="docs-snake-dot docs-snake-dot--${r.status}"></div>
              <div class="docs-snake-version">${r.v}</div>
            </div>
            <div class="docs-snake-content">
              <div class="docs-snake-label">${r.label}</div>
              <div class="docs-snake-desc">${r.desc}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="docs-footer">
      <div class="docs-footer-logo">Candlescope FinanceBoard</div>
      <div class="docs-footer-sub">v3.0 · 2026 · Entwickelt mit Claude AI von Anthropic</div>
    </div>

  </div>`;
}
