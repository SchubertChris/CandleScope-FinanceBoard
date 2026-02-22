// ══════════════════════════════════════
//  INTRO — Splash · Tutorial
// ══════════════════════════════════════

const TUT_STEPS = [
  {
    icon: "👋",
    tag: "Willkommen",
    title: "Willkommen bei Candlescope FinanceBoard",
    body: "Dein persönliches Finanz-Dashboard — <strong>vollständig offline</strong>, alle Daten lokal auf deinem Gerät. Keine Cloud, kein Login, kein Tracking.",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: null,
  },
  {
    icon: "🏷️",
    tag: "Schritt 1 — Dein Name",
    title: "Wie sollen wir dich nennen?",
    body: "",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: "username",
  },
  {
    icon: "🎨",
    tag: "Schritt 2 — Design",
    title: "Wähle dein Theme",
    body: "",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: "theme",
  },
  {
    icon: "🔤",
    tag: "Schritt 3 — Schriftgröße",
    title: "Wie groß soll der Text sein?",
    body: "",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: "fontsize",
  },
  {
    icon: "🔐",
    tag: "Schritt 4 — Sicherheit",
    title: "Passwort einrichten",
    body: "",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: "password",
  },
  {
    icon: "🏦",
    tag: "Schritt 5 — Konten",
    title: "Konten anlegen & Stände eintragen",
    body: "Lege hier deine Konten an — Giro, Kredit, Depot, Sparkonto. Trage den aktuellen Stand ein. Mit <strong>IBAN</strong> (letzte 4 Ziffern) und <strong>Kontoart</strong> behältst du den Überblick.",
    target: "#kontenPanel",
    arrowDir: "down",
    arrowLabel: "Konten",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "💰",
    tag: "Schritt 6 — Monatseingang",
    title: "Monatlichen Eingang festlegen",
    body: "Trage hier deinen <strong>monatlichen Nettolohn</strong> ein. Alle KPIs berechnen sich automatisch daraus.",
    target: "#monthlyIncome",
    arrowDir: "left",
    arrowLabel: "Monatseingang",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "📊",
    tag: "Schritt 7 — Zahlungsplan",
    title: "Cockpit — Was ist bis zum Zahltag fällig?",
    body: "Das Cockpit zeigt was <strong>bis zum nächsten Zahltag</strong> noch fällig wird. Du siehst sofort was übrig bleibt.",
    target: "#cockpitCols",
    arrowDir: "down",
    arrowLabel: "Zahlungsplan",
    navTo: "dashboard",
    targetExpand: "panel",
    special: null,
  },
  {
    icon: "📋",
    tag: "Schritt 8 — Umsätze",
    title: "Fixkosten & Einnahmen verwalten",
    body: "Alle festen Posten — Miete, Versicherungen, Abos. Wählbar als <strong>Liste oder Kacheln</strong>, filterbar nach Zeitraum, exportierbar als Kontoauszug.",
    target: "#p-posten",
    arrowDir: "down",
    arrowLabel: "Umsätze",
    navTo: "posten",
    special: null,
  },
  {
    icon: "📄",
    tag: "Schritt 9 — Verträge",
    title: "Vertragslaufzeiten im Blick",
    body: "Posten mit <strong>Enddatum</strong> erscheinen hier automatisch. Läuft ein Vertrag in 90 Tagen aus, erscheint ein Badge in der Sidebar.",
    target: "#contractList",
    arrowDir: "left",
    arrowLabel: "Vertragsübersicht",
    navTo: "vertraege",
    special: null,
  },
  {
    icon: "🎯",
    tag: "Schritt 10 — Sparziele",
    title: "Sparziele anlegen & verfolgen",
    body: "Lege Ziele an — Notgroschen, Urlaub, Auto. Mit <strong>Zielbetrag</strong>, <strong>Sparrate</strong> und <strong>Zieldatum</strong> siehst du deinen Fortschritt auf einen Blick.",
    target: "#p-goals",
    arrowDir: "down",
    arrowLabel: "Sparziele",
    navTo: "goals",
    targetExpand: "ph",
    special: null,
  },
  {
    icon: "📈",
    tag: "Schritt 11 — Jahresübersicht",
    title: "Jahresvergleich & Charts",
    body: "In der Jahresübersicht siehst du <strong>Einnahmen vs. Ausgaben</strong> als kombiniertes Chart — mit Saldo-Linie und Jahresvergleich. Erkenne Trends auf einen Blick.",
    target: "#p-jahr .ph",
    arrowDir: "down",
    arrowLabel: "Jahresübersicht",
    navTo: "jahr",
    special: null,
  },
  {
    icon: "↕",
    tag: "Schritt 12 — Umbuchungen",
    title: "Geld zwischen Konten verschieben",
    body: "Mit <strong>Umbuchung</strong> dokumentierst du Transfers — z.B. Sparrate auf Tagesgeld oder ETF-Kauf ins Depot. Jede Bewegung ist nachvollziehbar.",
    target: "#btnUmbuchung",
    arrowDir: "up",
    arrowLabel: "Umbuchung",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "🗂️",
    tag: "Schritt 13 — Demo-Daten",
    title: "Was möchtest du mit den Demo-Daten machen?",
    body: "",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: "dashboard",
    special: "demodata",
  },
  {
    icon: "🎉",
    tag: "Los geht's!",
    title: "Du bist startklar!",
    body: "Tutorial jederzeit über <strong>? Hilfe & Tutorial</strong> in der Sidebar erneut starten. Unter <strong>Einstellungen</strong> kannst du Theme, Schrift, Hintergrund und Privacy-Lock anpassen.",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: "dashboard",
    special: null,
  },
];

let _tutStep = 0;
let _spotEl = null;
let _arrowEl = null;
let _resizeTimer = null;

// ── SPLASH ────────────────────────────
function runSplash() {
  const splash = document.getElementById("splash");
  const shell = document.querySelector(".shell");
  if (!splash || !shell) return;
  shell.classList.add("shell-hidden");
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.classList.add("gone");
      shell.classList.add("shell-visible");
      shell.classList.remove("shell-hidden");
    }, 700);
  }, 2400);
}

// ── OPEN / CLOSE ──────────────────────
function openTutorial(startStep = 0) {
  _tutStep = startStep;
  document.body.style.overflow = "hidden";
  document.body.style.userSelect = "none";
  window.addEventListener("resize", _onTutResize);
  document.getElementById("tutorialOverlay").classList.add("open");
  document.getElementById("tutorialBox").classList.add("open");
  _renderStep();
}

function _onTutResize() {
  const step = TUT_STEPS[_tutStep];
  if (step && step.target) {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(
      () =>
        _placeSpotlight(
          step.target,
          step.arrowDir,
          step.arrowLabel,
          step.targetExpand || null,
          0,
        ),
      80,
    );
  }
}

function closeTutorial() {
  document.getElementById("tutorialOverlay").classList.remove("open");
  document.getElementById("tutorialBox").classList.remove("open");
  _hideHelpers();
  document.body.style.overflow = "";
  document.body.style.userSelect = "";
  window.removeEventListener("resize", _onTutResize);
  try {
    localStorage.setItem("csf_tut_done", "1");
  } catch (e) {}
}

function tutNext() {
  const step = TUT_STEPS[_tutStep];
  if (step.special === "password") {
    _saveTutPassword(() => {
      _advanceStep();
    });
    return;
  }
  if (step.special === "username") {
    _saveTutUsername();
  }
  if (step.special === "demodata") {
    // choice is handled by buttons directly — "Weiter" = keep demo data
    // nothing extra needed
  }
  _advanceStep();
}

function _advanceStep() {
  if (_tutStep < TUT_STEPS.length - 1) {
    _tutStep++;
    _renderStep();
  } else closeTutorial();
}

function tutBack() {
  if (_tutStep > 0) {
    _tutStep--;
    _renderStep();
  }
}

function tutGoTo(i) {
  _tutStep = i;
  _renderStep();
}

// ── USERNAME ──────────────────────────
function _saveTutUsername() {
  const val = document.getElementById("tutNameInput")?.value?.trim();
  if (val) {
    CFG.userName = val;
    saveSettings();
    _renderSidebarGreeting();
  }
}

function _renderSidebarGreeting() {
  const el = document.getElementById("sidebarGreeting");
  if (!el) return;
  const name = CFG?.userName;
  if (name) {
    el.style.display = "block";
    el.textContent = "Hallo, " + name + " 👋";
  } else {
    el.style.display = "none";
  }
}

// ── PASSWORT SCHRITT ──────────────────
async function _saveTutPassword(onSuccess) {
  const pw = document.getElementById("tutPwInput")?.value || "";
  const pw2 = document.getElementById("tutPwInput2")?.value || "";
  const err = document.getElementById("tutPwErr");

  if (!!localStorage.getItem(LOCK_KEY)) {
    onSuccess();
    return;
  }
  if (!pw && !pw2) {
    onSuccess();
    return;
  }

  const valErr = validatePassword(pw);
  if (valErr) {
    if (err) {
      err.style.color = "var(--red)";
      err.textContent = valErr;
    }
    return;
  }
  if (pw !== pw2) {
    if (err) {
      err.style.color = "var(--red)";
      err.textContent = "Passwörter stimmen nicht überein";
    }
    return;
  }

  const hash = await sha256(pw);
  localStorage.setItem(LOCK_KEY, hash);
  sessionStorage.setItem(LOCK_DONE, "1");
  if (err) {
    err.style.color = "var(--green)";
    err.textContent = "✓ Passwort gespeichert";
  }
  setTimeout(onSuccess, 700);
}

// ── THEME STEP ────────────────────────
function _tutSelectTheme(theme) {
  document
    .querySelectorAll(".tut-theme-card")
    .forEach((c) => c.classList.remove("active"));
  const card = document.querySelector(`.tut-theme-card[data-theme="${theme}"]`);
  if (card) card.classList.add("active");
  setTheme(theme); // live preview + save
  // Update accent color on box immediately
  const accent = _themeAccentColor();
  const box = document.getElementById("tutorialBox");
  if (box) box.style.setProperty("--tut-accent", accent);
  _updateSpotlightColor();
}

function _themeAccentColor() {
  const theme = CFG?.theme || "dark";
  if (theme === "crimson") return "#e05060";
  if (theme === "highcontrast") return "#ffffff";
  return "#4d9eff";
}

// ── RENDER ────────────────────────────
function _renderStep() {
  const step = TUT_STEPS[_tutStep];
  const total = TUT_STEPS.length;
  const isLast = _tutStep === total - 1;
  const accent = _themeAccentColor();

  if (step.navTo) _navTo(step.navTo);

  document.getElementById("tutProgressFill").style.width =
    ((_tutStep + 1) / total) * 100 + "%";
  document.getElementById("tutProgressFill").style.background = accent;

  const iconEl = document.getElementById("tutIcon");
  iconEl.style.animation = "none";
  iconEl.textContent = step.icon;
  void iconEl.offsetWidth;
  iconEl.style.animation = "";

  document.getElementById("tutStepBadge").textContent =
    `${_tutStep + 1} / ${total}`;
  document.getElementById("tutTag").textContent = step.tag;
  document.getElementById("tutTitle").textContent = step.title;

  // Propagate theme accent + app font size to tutorial box
  const box = document.getElementById("tutorialBox");
  if (box) {
    box.style.setProperty("--tut-accent", accent);
    // Mirror the app's font-size so tutorial scales with user preference
    const appFontSize = getComputedStyle(document.documentElement).fontSize;
    box.style.fontSize = appFontSize;
  }

  const bodyEl = document.getElementById("tutBody");

  if (step.special === "username") {
    const existing = CFG?.userName || "";
    bodyEl.innerHTML = `
      <div style="font-size:.8em;color:var(--text2);margin-bottom:14px;line-height:1.6;">
        Wie heißt du? Dein Name erscheint als Begrüßung in der Sidebar.<br>
        <span style="color:var(--text3);font-size:.9em;">Kann jederzeit in den Einstellungen geändert werden.</span>
      </div>
      <input id="tutNameInput" type="text" placeholder="Dein Vorname…" maxlength="30"
        value="${esc(existing)}"
        style="width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--border);border-radius:var(--r1);padding:10px 12px;color:var(--text1);font-family:var(--sans);font-size:.9em;outline:none;"
        oninput="CFG.userName=this.value.trim();saveSettings();_renderSidebarGreeting();">
      <div style="font-size:.68em;color:var(--text3);margin-top:6px;">Leer lassen zum Überspringen</div>`;
    setTimeout(() => document.getElementById("tutNameInput")?.focus(), 100);
  } else if (step.special === "theme") {
    const themes = [
      { id: "dark", label: "Nacht-Blau", accent: "#4d9eff", bg: "#0a0f1e" },
      { id: "crimson", label: "Crimson", accent: "#e05060", bg: "#120508" },
      {
        id: "highcontrast",
        label: "Hochkontrast",
        accent: "#ffffff",
        bg: "#000000",
      },
    ];
    const cur = CFG?.theme || "dark";
    bodyEl.innerHTML = `
      <div style="font-size:.78em;color:var(--text2);margin-bottom:14px;">
        Wähle dein Design — du kannst es jederzeit in den Einstellungen ändern.
      </div>
      <div style="display:flex;gap:10px;">
        ${themes
          .map(
            (t) => `
          <div class="tut-theme-card ${t.id === cur ? "active" : ""}" data-theme="${t.id}"
            onclick="_tutSelectTheme('${t.id}')"
            style="flex:1;cursor:pointer;border-radius:10px;overflow:hidden;border:2px solid ${t.id === cur ? t.accent : "var(--border)"};transition:all .15s;background:${t.bg};">
            <div style="padding:12px 10px 8px;text-align:center;">
              <div style="width:28px;height:28px;border-radius:50%;background:${t.accent};margin:0 auto 8px;box-shadow:0 0 12px ${t.accent}55;"></div>
              <div style="font-size:.7em;font-weight:700;color:${t.accent};">${t.label}</div>
              <div style="display:flex;gap:3px;justify-content:center;margin-top:6px;">
                <div style="height:4px;width:28px;border-radius:2px;background:${t.accent};opacity:.7;"></div>
                <div style="height:4px;width:16px;border-radius:2px;background:${t.accent};opacity:.3;"></div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>`;
  } else if (step.special === "fontsize") {
    const cur = CFG?.fontSize || 15;
    // Sizes: label → px value, showing relative preview
    const sizes = [
      { label: "Klein", val: 12 },
      { label: "Normal", val: 14 },
      { label: "Mittel", val: 15 },
      { label: "Groß", val: 17 },
      { label: "Sehr groß", val: 19 },
    ];
    bodyEl.innerHTML = `
      <div style="font-size:.78em;color:var(--text2);margin-bottom:16px;">
        Wähle eine Schriftgröße — die App passt sich sofort an.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${sizes
          .map(
            (s) => `
          <button class="tut-size-btn ${s.val === cur ? "active" : ""}"
            data-val="${s.val}"
            onclick="_tutSetFontSize(${s.val})"
            style="flex:1;min-width:70px;padding:10px 6px;border-radius:var(--r1);
              border:2px solid ${s.val === cur ? "var(--blue)" : "var(--border2)"};
              background:${s.val === cur ? "rgba(77,158,255,.1)" : "var(--panel2)"};
              color:${s.val === cur ? "var(--blue)" : "var(--text2)"};
              cursor:pointer;transition:all .15s;text-align:center;">
            <div style="font-size:${s.val}px;font-weight:700;line-height:1.1;margin-bottom:4px;">Aa</div>
            <div style="font-size:10px;opacity:.7;">${s.label}</div>
          </button>
        `,
          )
          .join("")}
      </div>
      <div style="margin-top:14px;padding:10px 12px;background:var(--panel2);border-radius:var(--r1);font-size:var(--tut-preview-size, ${cur}px);color:var(--text2);line-height:1.5;">
        Beispieltext: <strong>2.850,00 €</strong> · Monatseingang · Fixkosten
      </div>`;
  } else if (step.special === "password") {
    const hasPw = !!localStorage.getItem(LOCK_KEY);
    bodyEl.innerHTML = hasPw
      ? `<div style="color:var(--green);font-size:.85em;margin-bottom:8px;">✓ Passwort bereits eingerichtet</div>
         <div style="font-size:.78em;color:var(--text3);">Unter Einstellungen jederzeit änderbar.</div>`
      : `<div style="font-size:.78em;color:var(--text2);margin-bottom:12px;">
           Schütze deine Finanzdaten mit einem Passwort beim App-Start.<br>
           <span style="color:var(--text3);font-size:.9em;">Mind. 8 Zeichen · Groß/Klein · Zahl · Sonderzeichen</span>
         </div>
         <div style="display:flex;flex-direction:column;gap:8px;">
           <div style="position:relative;">
             <input id="tutPwInput" type="password" placeholder="Neues Passwort"
               style="width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--border);border-radius:var(--r1);padding:8px 36px 8px 10px;color:var(--text1);font-family:var(--sans);font-size:.82em;">
             <span onclick="toggleLockPwVis('tutPwInput',this)"
               style="position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text3);user-select:none;">👁</span>
           </div>
           <div style="position:relative;">
             <input id="tutPwInput2" type="password" placeholder="Passwort wiederholen"
               style="width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--border);border-radius:var(--r1);padding:8px 36px 8px 10px;color:var(--text1);font-family:var(--sans);font-size:.82em;">
             <span onclick="toggleLockPwVis('tutPwInput2',this)"
               style="position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text3);user-select:none;">👁</span>
           </div>
           <div id="tutPwErr" style="font-size:.7em;min-height:16px;"></div>
           <div style="font-size:.68em;color:var(--text3);">Felder leer lassen um zu überspringen</div>
         </div>`;
  } else if (step.special === "demodata") {
    const hasDemoData =
      S.data && S.data.length > 0 && S.data.some((p) => p.id === "p1");
    if (!hasDemoData) {
      bodyEl.innerHTML = `<div style="color:var(--green);font-size:.85em;">✓ Keine Demo-Daten vorhanden — du startst bereits mit leeren Daten.</div>`;
    } else {
      bodyEl.innerHTML = `
        <div style="font-size:.78em;color:var(--text2);margin-bottom:16px;line-height:1.7;">
          Die App enthält aktuell <strong>Demo-Daten</strong> von Max Mustermann — Konten, Fixkosten und Sparziele als Orientierung.<br><br>
          Du kannst sie jetzt löschen und <strong>frisch starten</strong>, oder sie noch etwas behalten um dich einzufinden.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button onclick="_tutDeleteDemoNow()"
            style="width:100%;padding:12px;border-radius:var(--r1);border:1px solid var(--red);background:rgba(255,77,106,.1);color:var(--red);font-size:.82em;font-weight:600;cursor:pointer;transition:all .15s;text-align:left;display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.3em;">🗑️</span>
            <span><strong>Jetzt löschen</strong> — sauberer Neustart<br><span style="font-weight:400;opacity:.8;font-size:.9em;">Alle Demo-Konten, Posten und Ziele werden entfernt</span></span>
          </button>
          <button onclick="_tutKeepDemo()"
            style="width:100%;padding:12px;border-radius:var(--r1);border:1px solid var(--border2);background:rgba(255,255,255,.04);color:var(--text2);font-size:.82em;font-weight:600;cursor:pointer;transition:all .15s;text-align:left;display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.3em;">📖</span>
            <span><strong>Vorerst behalten</strong> — zum Reinschnuppern<br><span style="font-weight:400;opacity:.8;font-size:.9em;">Demo-Daten kannst du jederzeit in den Einstellungen löschen</span></span>
          </button>
        </div>
        <div id="tutDemoMsg" style="min-height:18px;margin-top:8px;font-size:.7em;"></div>`;
    }
  } else {
    bodyEl.innerHTML = step.body;
  }

  document.getElementById("tutDots").innerHTML = TUT_STEPS.map(
    (_, i) =>
      `<div class="tut-dot ${i === _tutStep ? "active" : i < _tutStep ? "done" : ""}" onclick="tutGoTo(${i})"></div>`,
  ).join("");

  // Dot colors handled by CSS var(--tut-accent)

  document.getElementById("tutBackBtn").style.display =
    _tutStep === 0 ? "none" : "";
  const nb = document.getElementById("tutNextBtn");
  nb.textContent =
    step.special === "password" && !localStorage.getItem(LOCK_KEY)
      ? "Passwort speichern →"
      : isLast
        ? "Fertig 🚀"
        : "Weiter →";
  nb.className = isLast ? "tut-btn finish" : "tut-btn next";
  // Colors handled via CSS var(--tut-accent) — no inline overrides needed

  // Spotlight: pass targetExpand for dynamic containers
  if (step.target) {
    _placeSpotlight(
      step.target,
      step.arrowDir,
      step.arrowLabel,
      step.targetExpand || null,
      0,
    );
  } else {
    _hideHelpers();
  }
}

// ── AUTO-NAVIGATION ───────────────────
function _navTo(page) {
  const titles = {
    dashboard: "Dashboard",
    posten: "Umsätze",
    jahr: "Jahresübersicht",
    vertraege: "Verträge",
    goals: "Sparziele",
    settings: "Einstellungen",
  };
  if (!titles[page]) return;
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const pageEl = document.getElementById("p-" + page);
  if (pageEl) pageEl.classList.add("active");
  document.querySelectorAll(".nav-item").forEach((n) => {
    if ((n.getAttribute("onclick") || "").includes(`'${page}'`))
      n.classList.add("active");
  });
  document.getElementById("pageTitle").textContent = titles[page];
  if (page === "dashboard") renderDashboard();
  if (page === "posten") renderPosten();
  if (page === "jahr") renderJahr();
  if (page === "vertraege") renderVertraege();
  if (page === "goals") renderGoals();
  if (page === "settings") renderSettings();
}

// ── SPOTLIGHT + PFEIL ─────────────────
function _hideHelpers() {
  const ov = document.getElementById("tutorialOverlay");
  if (ov) ov.style.background = "rgba(0,0,0,0.6)";
  if (_spotEl) _spotEl.style.display = "none";
  if (_arrowEl) _arrowEl.style.display = "none";
}

function _updateSpotlightColor() {
  if (!_spotEl) return;
  const accent = _themeAccentColor();
  _spotEl.style.borderColor = accent;
  _spotEl.style.boxShadow = `0 0 0 3px ${accent}22, 0 0 24px ${accent}40`;
  if (_arrowEl) {
    // Re-render arrow SVGs with new color
    const step = TUT_STEPS[_tutStep];
    if (step?.target)
      _placeSpotlight(step.target, step.arrowDir, step.arrowLabel);
  }
}

function _placeSpotlight(
  selector,
  arrowDir,
  arrowLabel,
  targetExpand,
  attempt,
) {
  if (!selector) {
    _hideHelpers();
    return;
  }
  attempt = attempt || 0;

  // Resolve element — handle targetExpand modifiers
  let el = document.querySelector(selector);
  if (!el) {
    // Retry up to 8 frames for dynamically rendered pages (goals, etc.)
    if (attempt < 8) {
      requestAnimationFrame(() =>
        _placeSpotlight(
          selector,
          arrowDir,
          arrowLabel,
          targetExpand,
          attempt + 1,
        ),
      );
    } else {
      _hideHelpers();
    }
    return;
  }

  // targetExpand: "panel" → use closest .panel ancestor
  if (targetExpand === "panel") {
    const p = el.closest(".panel");
    if (p) el = p;
  }
  // targetExpand: "ph" → find first .ph child (dynamically rendered)
  if (targetExpand === "ph") {
    const ph = el.querySelector(".ph");
    if (ph) el = ph;
    // else just use el itself as fallback
  }

  const accent = _themeAccentColor();

  // Only scroll into view for non-fixed/sticky elements
  const pos = window.getComputedStyle(el).position;
  const parentFixed = el.closest(".topbar, .sidebar");
  if (!parentFixed && pos !== "fixed" && pos !== "sticky") {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Two rAF to ensure layout paint after any nav/scroll
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const pad = 8;
      const W = window.innerWidth;
      const H = window.innerHeight;

      // No artificial size cap — use exact element bounds, just clamp to viewport
      const x1 = Math.max(0, Math.round(r.left - pad));
      const y1 = Math.max(0, Math.round(r.top - pad));
      const x2 = Math.min(W, Math.round(r.right + pad));
      const y2 = Math.min(H, Math.round(r.bottom + pad));

      // Backdrop overlay
      const ov = document.getElementById("tutorialOverlay");
      if (ov) {
        ov.style.background = `
          linear-gradient(rgba(0,0,0,0.82),rgba(0,0,0,0.82)) 0 0 / ${x1}px 100% no-repeat,
          linear-gradient(rgba(0,0,0,0.82),rgba(0,0,0,0.82)) ${x2}px 0 / ${W - x2}px 100% no-repeat,
          linear-gradient(rgba(0,0,0,0.82),rgba(0,0,0,0.82)) ${x1}px 0 / ${x2 - x1}px ${y1}px no-repeat,
          linear-gradient(rgba(0,0,0,0.82),rgba(0,0,0,0.82)) ${x1}px ${y2}px / ${x2 - x1}px ${H - y2}px no-repeat`;
      }

      // Spotlight ring — theme-colored, no CSS transition delay
      if (!_spotEl) {
        _spotEl = document.createElement("div");
        _spotEl.className = "tut-spotlight";
        _spotEl.style.transition = "none"; // instant
        document.body.appendChild(_spotEl);
      }
      _spotEl.style.borderColor = accent;
      _spotEl.style.boxShadow = `0 0 0 3px ${accent}20, 0 0 28px ${accent}35`;
      _spotEl.style.display = "block";
      _spotEl.style.left = x1 + "px";
      _spotEl.style.top = y1 + "px";
      _spotEl.style.width = x2 - x1 + "px";
      _spotEl.style.height = y2 - y1 + "px";

      // Arrow
      if (!arrowDir) {
        if (_arrowEl) _arrowEl.style.display = "none";
        return;
      }

      if (!_arrowEl) {
        _arrowEl = document.createElement("div");
        _arrowEl.className = "tut-arrow";
        _arrowEl.style.cssText =
          "position:fixed;z-index:501;pointer-events:none;display:flex;align-items:center;gap:6px;";
        document.body.appendChild(_arrowEl);
      }

      const cx = x1 + (x2 - x1) / 2;
      const cy = y1 + (y2 - y1) / 2;
      const lbl = `<span class="tut-arrow-label" style="color:${accent};">${arrowLabel || ""}</span>`;

      const svgStyle = `filter:drop-shadow(0 0 8px ${accent}cc);animation:arrow-bounce 1s ease-in-out infinite`;
      const svgStyleH = `filter:drop-shadow(0 0 8px ${accent}cc);animation:arrow-bounce-h 1s ease-in-out infinite`;
      const SVG = {
        down: `<svg width="32" height="44" viewBox="0 0 36 48" fill="none" style="${svgStyle}">
          <line x1="18" y1="4" x2="18" y2="36" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
          <polyline points="7,26 18,42 29,26" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="18" cy="4" r="4" fill="${accent}" opacity="0.8"/></svg>`,
        up: `<svg width="32" height="44" viewBox="0 0 36 48" fill="none" style="${svgStyle}">
          <line x1="18" y1="44" x2="18" y2="12" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
          <polyline points="7,22 18,6 29,22" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="18" cy="44" r="4" fill="${accent}" opacity="0.8"/></svg>`,
        right: `<svg width="44" height="32" viewBox="0 0 48 36" fill="none" style="${svgStyleH}">
          <line x1="4" y1="18" x2="36" y2="18" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
          <polyline points="26,7 42,18 26,29" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="4" cy="18" r="4" fill="${accent}" opacity="0.8"/></svg>`,
        left: `<svg width="44" height="32" viewBox="0 0 48 36" fill="none" style="${svgStyleH}">
          <line x1="44" y1="18" x2="12" y2="18" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
          <polyline points="22,7 6,18 22,29" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="44" cy="18" r="4" fill="${accent}" opacity="0.8"/></svg>`,
      };

      if (arrowDir === "down") {
        _arrowEl.innerHTML = SVG.down + lbl;
        _arrowEl.style.flexDirection = "column";
        _arrowEl.style.alignItems = "center";
        _arrowEl.style.left = cx - 16 + "px";
        _arrowEl.style.top = Math.max(4, y1 - 52) + "px";
      } else if (arrowDir === "up") {
        _arrowEl.innerHTML = SVG.up + lbl;
        _arrowEl.style.flexDirection = "column";
        _arrowEl.style.alignItems = "center";
        _arrowEl.style.left = cx - 16 + "px";
        _arrowEl.style.top = y2 + 8 + "px";
      } else if (arrowDir === "right") {
        _arrowEl.innerHTML = SVG.right + lbl;
        _arrowEl.style.flexDirection = "row";
        _arrowEl.style.alignItems = "center";
        _arrowEl.style.left = Math.max(4, x1 - 56) + "px";
        _arrowEl.style.top = cy - 16 + "px";
      } else if (arrowDir === "left") {
        _arrowEl.innerHTML = SVG.left + lbl;
        _arrowEl.style.flexDirection = "row";
        _arrowEl.style.alignItems = "center";
        _arrowEl.innerHTML = SVG.up + lbl;
        _arrowEl.style.left = x2 + 8 - 190 + "px";
        _arrowEl.style.top = cy - 16 + 50 + "px";
      }
      _arrowEl.style.display = "flex";
    });
  });
}

// ── FONTSIZE HELPER ──────────────────
function _tutSetFontSize(val) {
  if (typeof setFontSize === "function") setFontSize(val);
  // Update button styles live
  document.querySelectorAll(".tut-size-btn").forEach((b) => {
    const isActive = parseInt(b.dataset.val) === val;
    b.style.borderColor = isActive ? "var(--blue)" : "var(--border2)";
    b.style.background = isActive ? "rgba(77,158,255,.1)" : "var(--panel2)";
    b.style.color = isActive ? "var(--blue)" : "var(--text2)";
  });
  // Update preview text size
  const preview = document.querySelector(
    '#tutBody [style*="tut-preview-size"]',
  );
  if (preview) preview.style.fontSize = val + "px";
}

// ── DEMO DATA HELPERS ────────────────
function _tutDeleteDemoNow() {
  // Clear all demo data (identified by original seed IDs)
  const demoAccIds = ["acc_giro", "acc_visa", "acc_ing", "acc_depot"];
  const demoPIds = [
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "p7",
    "p8",
    "p9",
    "p10",
    "p11",
    "p12",
    "p13",
  ];
  const demoGIds = ["g1", "g2", "g3"];

  S.accounts = S.accounts.filter((a) => !demoAccIds.includes(a.id));
  S.data = S.data.filter((p) => !demoPIds.includes(p.id));
  S.transfers = S.transfers.filter((t) => !["t1", "t2"].includes(t.id));
  S.goals = S.goals.filter((g) => !demoGIds.includes(g.id));
  persist();

  // Visual feedback, then advance
  const msg = document.getElementById("tutDemoMsg");
  if (msg) {
    msg.style.color = "var(--green)";
    msg.textContent = "✓ Demo-Daten gelöscht — sauberer Neustart!";
  }
  setTimeout(() => _advanceStep(), 900);
}

function _tutKeepDemo() {
  const msg = document.getElementById("tutDemoMsg");
  if (msg) {
    msg.style.color = "var(--text3)";
    msg.textContent =
      "Demo-Daten behalten — du findest die Option jederzeit in Einstellungen → Daten.";
  }
  setTimeout(() => _advanceStep(), 700);
}

// ── ERSTER START ─────────────────────
function checkFirstVisit() {
  try {
    if (!localStorage.getItem("csf_tut_done")) {
      setTimeout(() => openTutorial(0), 900);
    }
    // Always render greeting if name exists
    _renderSidebarGreeting();
  } catch (e) {}
}
