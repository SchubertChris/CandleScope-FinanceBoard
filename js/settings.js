// ══════════════════════════════════════
//  SETTINGS — Einstellungen
// ══════════════════════════════════════

const SETTINGS_KEY = "csf_settings";

const DEFAULT_SETTINGS = {
  theme: "dark", // 'dark' | 'anthracite' | 'highcontrast' | 'crimson'
  font: "default", // 'default' | 'mono' | 'large'
  fontSize: 14, // px, 11-18
  autosave: true,
  bgImage: null, // base64 oder null
  pwEnabled: false,
};

let CFG = { ...DEFAULT_SETTINGS };

// ── LOAD / SAVE ───────────────────────
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) CFG = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (e) {}
  applySettings();
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(CFG));
  } catch (e) {}
  applySettings();
}

// ── APPLY ─────────────────────────────
function applySettings() {
  const root = document.documentElement;

  // Theme
  root.setAttribute("data-theme", CFG.theme);

  // Font
  root.setAttribute("data-font", CFG.font);
  root.style.fontSize = CFG.fontSize + "px";
  document.body.style.fontSize = CFG.fontSize + "px";

  // Hintergrundbild
  const bgEl = document.querySelector(".bg");
  if (bgEl) {
    bgEl.style.backgroundImage = CFG.bgImage
      ? `url(${CFG.bgImage})`
      : "url('./images/pexels-joao-vitor-heinrichs-862489-1787044.jpg')";
  }

  // Autosave label
  const lbl = document.getElementById("saveLabel");
  if (lbl) lbl.textContent = CFG.autosave ? "autosave · on" : "autosave · off";
}

// ── RENDER SETTINGS PAGE ─────────────
function renderSettings() {
  const el = document.getElementById("p-settings");
  if (!el) return;

  const hasPw = !!localStorage.getItem(LOCK_KEY);

  el.innerHTML = `
  <div class="settings-wrap">
    <div class="settings-header">
      <div class="ph-title">Einstellungen</div>
      <div class="ph-sub">Personalisierung · Sicherheit · Datenverwaltung</div>
    </div>

    <!-- THEME -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        Farbschema
      </div>
      <div class="theme-options">
        ${[
          {
            id: "dark",
            label: "Nacht-Blau",
            desc: "Standard dunkel",
            bg: "#0d1220",
            bars: ["#4d9eff", "#7b5fff", "#00e5a0"],
            dots: ["#4d9eff", "#ff4d6a", "#ffb547"],
          },
          {
            id: "crimson",
            label: "Crimson",
            desc: "Dunkles Anthrazit · Rot",
            bg: "#1a0c0e",
            bars: ["#e05060", "#a02840", "#00d48a"],
            dots: ["#e05060", "#ff6b7a", "#ff9f47"],
          },
          {
            id: "highcontrast",
            label: "Hochkontrast",
            desc: "Schwarz/Weiß · barrierefrei",
            bg: "#000000",
            bars: ["#facc15", "#ffffff", "#4ade80"],
            dots: ["#facc15", "#f87171", "#fb923c"],
          },
        ]
          .map(
            (t) => `
          <div class="theme-option ${CFG.theme === t.id ? "active" : ""}" onclick="setTheme('${t.id}')">
            <div class="theme-swatch" style="background:${t.bg};">
              <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
                <div style="display:flex;gap:3px;">
                  ${t.bars.map((c) => `<div class="theme-swatch-bar" style="background:${c};opacity:.9;"></div>`).join("")}
                </div>
                <div style="display:flex;gap:4px;">
                  ${t.dots.map((c) => `<div class="theme-swatch-dot" style="background:${c};"></div>`).join("")}
                </div>
              </div>
            </div>
            <div class="theme-option-label">${t.label}</div>
            <div class="theme-option-desc">${t.desc}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- SCHRIFT -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
        Schrift & Größe
      </div>
      <!-- Schriftgröße -->
      <div style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div>
            <div class="settings-row-label">Schriftgröße</div>
            <div class="settings-row-desc">Globale Textgröße der App</div>
          </div>
          <span id="fontSizeLabel" style="font-family:var(--mono);font-size:.8em;color:var(--blue);font-weight:700;">${CFG.fontSize}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:.7em;color:var(--text3);">A</span>
          <input type="range" min="11" max="20" step="1" value="${CFG.fontSize}"
            oninput="setFontSize(this.value)"
            style="flex:1;accent-color:var(--blue);cursor:pointer;">
          <span style="font-size:1em;color:var(--text3);font-weight:700;">A</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.62em;color:var(--text3);margin-top:4px;padding:0 18px;">
          <span>11px · Klein</span><span>14px · Standard</span><span>18px · Groß</span>
        </div>
      </div>
      <div class="font-options">
        ${[
          {
            id: "default",
            label: "Standard",
            desc: "Space Grotesk · Normal",
            sample: "Aa",
          },
          {
            id: "mono",
            label: "Mono",
            desc: "DM Mono · Kompakt",
            sample: "Aa",
          },
          {
            id: "large",
            label: "Groß",
            desc: "Space Grotesk · Groß",
            sample: "Aa",
          },
        ]
          .map(
            (f) => `
          <div class="font-option ${CFG.font === f.id ? "active" : ""}" onclick="setFont('${f.id}')">
            <div class="font-sample font-sample-${f.id}">${f.sample}</div>
            <div>
              <div class="font-option-label">${f.label}</div>
              <div class="font-option-desc">${f.desc}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- HINTERGRUND -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        Hintergrundbild
      </div>
      <div class="bg-preview-row">
        <div class="bg-preview" id="bgPreview">
          ${CFG.bgImage ? `<img src="${CFG.bgImage}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : '<span style="color:var(--text3);font-size:.75em;">Standard</span>'}
        </div>
        <div class="bg-actions">
          <button class="btn" onclick="document.getElementById('bgUpload').click()">📁 Bild hochladen</button>
          ${CFG.bgImage ? '<button class="btn danger sm" onclick="clearBg()">✕ Entfernen</button>' : ""}
          <input type="file" id="bgUpload" accept="image/*" style="display:none" onchange="uploadBg(this)">
          <div style="font-size:.72em;color:var(--text3);margin-top:6px;">JPG, PNG, WEBP · Bleibt lokal auf deinem Gerät</div>
        </div>
      </div>
    </div>

    <!-- AUTOSAVE -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Autosave
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row-label">Automatisch speichern</div>
          <div class="settings-row-desc">Alle Änderungen werden sofort in localStorage gesichert</div>
        </div>
        <div class="toggle-switch ${CFG.autosave ? "on" : ""}" onclick="toggleAutosave()">
          <div class="toggle-knob"></div>
        </div>
      </div>
    </div>

    <!-- SICHERHEIT -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        Passwortschutz
      </div>
      ${
        hasPw
          ? `
        <div class="settings-row">
          <div>
            <div class="settings-row-label" style="color:var(--green)">✓ Passwort aktiv</div>
            <div class="settings-row-desc">App wird beim Start gesperrt</div>
          </div>
          <button class="btn danger sm" onclick="removePassword()">Passwort entfernen</button>
        </div>
        <div style="margin-top:12px;">
          <div class="settings-row-label" style="margin-bottom:8px;">Passwort ändern</div>
          <div class="pw-change-form">
            <input type="password" id="pwOld" placeholder="Aktuelles Passwort" class="settings-input">
            <input type="password" id="pwNew" placeholder="Neues Passwort" class="settings-input">
            <input type="password" id="pwNew2" placeholder="Wiederholen" class="settings-input">
            <button class="btn primary" onclick="changePassword()">Ändern</button>
          </div>
          <div class="settings-err" id="pwErr"></div>
        </div>
      `
          : `
        <div class="settings-row-desc" style="margin-bottom:12px;">Schütze deine Finanzdaten mit einem Passwort. Wird beim App-Start abgefragt.</div>
        <div class="pw-change-form">
          <input type="password" id="pwNew" placeholder="Neues Passwort" class="settings-input">
          <input type="password" id="pwNew2" placeholder="Wiederholen" class="settings-input">
          <button class="btn primary" onclick="enablePassword()">Passwort aktivieren</button>
        </div>
        <div class="settings-err" id="pwErr"></div>
        <div style="font-size:.7em;color:var(--text3);margin-top:8px;">Mind. 8 Zeichen · Groß/Klein · Zahl · Sonderzeichen</div>
      `
      }
    </div>

    <!-- DATEN -->
    <div class="settings-card">
      <div class="settings-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        Datenverwaltung
      </div>
      <div class="data-actions">
        <button class="btn" onclick="exportAll()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          JSON Export
        </button>
        <button class="btn" onclick="importAll()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          JSON Import
        </button>
        <button class="btn danger" onclick="confirmResetAll()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          Alle Daten löschen
        </button>
      </div>
    </div>

    <!-- VERSION -->
    <div style="text-align:center;padding:20px 0 8px;font-size:.68em;color:var(--text3);font-family:var(--mono);">
      Candlescope FinanceBoard v2.0 · Alle Daten lokal · Kein Internet
    </div>
  </div>`;
}

// ── ACTIONS ───────────────────────────
function setTheme(t) {
  CFG.theme = t;
  saveSettings();
  renderSettings();
}

function setFont(f) {
  CFG.font = f;
  saveSettings();
  renderSettings();
}

function setFontSize(val) {
  CFG.fontSize = parseInt(val);
  // Sofort anwenden ohne re-render
  const root = document.documentElement;
  root.style.fontSize = CFG.fontSize + "px";
  document.body.style.fontSize = CFG.fontSize + "px";
  // Label im Slider aktualisieren
  const lbl = document.getElementById("fontSizeLabel");
  if (lbl) lbl.textContent = CFG.fontSize + "px";
  saveSettings();
}

function toggleAutosave() {
  CFG.autosave = !CFG.autosave;
  saveSettings();
  renderSettings();
}

function uploadBg(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    CFG.bgImage = e.target.result;
    saveSettings();
    renderSettings();
  };
  reader.readAsDataURL(file);
}

function clearBg() {
  CFG.bgImage = null;
  saveSettings();
  renderSettings();
}

async function enablePassword() {
  const pw = document.getElementById("pwNew")?.value || "";
  const pw2 = document.getElementById("pwNew2")?.value || "";
  const err = document.getElementById("pwErr");

  const valErr = validatePassword(pw);
  if (valErr) {
    err.textContent = valErr;
    return;
  }
  if (pw !== pw2) {
    err.textContent = "Passwörter stimmen nicht überein";
    return;
  }

  const hash = await sha256(pw);
  localStorage.setItem(LOCK_KEY, hash);
  CFG.pwEnabled = true;
  saveSettings();
  renderSettings();
}

async function changePassword() {
  const old = document.getElementById("pwOld")?.value || "";
  const pw = document.getElementById("pwNew")?.value || "";
  const pw2 = document.getElementById("pwNew2")?.value || "";
  const err = document.getElementById("pwErr");

  const oldHash = await sha256(old);
  if (oldHash !== localStorage.getItem(LOCK_KEY)) {
    err.textContent = "Aktuelles Passwort falsch";
    return;
  }

  const valErr = validatePassword(pw);
  if (valErr) {
    err.textContent = valErr;
    return;
  }
  if (pw !== pw2) {
    err.textContent = "Neue Passwörter stimmen nicht überein";
    return;
  }

  const hash = await sha256(pw);
  localStorage.setItem(LOCK_KEY, hash);
  err.textContent = "";
  err.style.color = "var(--green)";
  err.textContent = "✓ Passwort geändert";
  setTimeout(() => renderSettings(), 1200);
}

function removePassword() {
  if (!confirm("Passwortschutz wirklich deaktivieren?")) return;
  localStorage.removeItem(LOCK_KEY);
  sessionStorage.removeItem(LOCK_DONE);
  CFG.pwEnabled = false;
  saveSettings();
  renderSettings();
}

function confirmResetAll() {
  if (
    !confirm(
      "Alle Daten unwiderruflich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden!",
    )
  )
    return;
  localStorage.removeItem("csf_v1");
  S.accounts = [];
  S.data = [];
  S.transfers = [];
  S.monthlyIncome = 0;
  renderDashboard();
  alert("✓ Alle Daten gelöscht");
}
