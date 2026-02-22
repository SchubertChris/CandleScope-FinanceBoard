// ══════════════════════════════════════
//  INTRO — Splash · Tutorial
// ══════════════════════════════════════

const TUT_STEPS = [
  {
    icon: "👋",
    tag: "Willkommen",
    title: "Willkommen bei Candlescope FinanceBoard",
    body: "Dein persönliches Finanz-Dashboard — <strong>vollständig offline</strong>, alle Daten lokal auf deinem Gerät.",
    target: null,
    arrowDir: null,
    arrowLabel: null,
    navTo: null,
    special: null,
  },
  {
    icon: "🔐",
    tag: "Schritt 1 — Sicherheit",
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
    tag: "Schritt 2 — Konten",
    title: "Konten anlegen & Stände eintragen",
    body: "Lege hier deine Konten an — Giro, Kredit, Depot, Sparkonto. Trage den aktuellen Stand ein. Mit <strong>IBAN</strong> (letzte 4 Ziffern) und <strong>Kontoart</strong> behältst du den Überblick.",
    target: "#accList",
    arrowDir: "down",
    arrowLabel: "Konten",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "💰",
    tag: "Schritt 3 — Monatseingang",
    title: "Monatlichen Eingang festlegen",
    body: "Trage hier deinen <strong>monatlichen Nettolohn</strong> ein. Alle KPIs berechnen sich automatisch daraus.",
    target: "#monthlyIncome",
    arrowDir: "down",
    arrowLabel: "Monatseingang",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "📊",
    tag: "Schritt 4 — Zahlungsplan",
    title: "Cockpit — Was ist bis zum Zahltag fällig?",
    body: "Das Cockpit zeigt was <strong>bis zum nächsten Zahltag</strong> noch fällig wird. Du siehst sofort was übrig bleibt.",
    target: "#cockpitCols",
    arrowDir: "down",
    arrowLabel: "Zahlungsplan",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "📋",
    tag: "Schritt 5 — Umsätze",
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
    tag: "Schritt 6 — Verträge",
    title: "Vertragslaufzeiten im Blick",
    body: "Posten mit <strong>Enddatum</strong> erscheinen hier automatisch. Läuft ein Vertrag in 90 Tagen aus, erscheint ein Badge in der Sidebar.",
    target: "#contractList",
    arrowDir: "down",
    arrowLabel: "Vertragsübersicht",
    navTo: "vertraege",
    special: null,
  },
  {
    icon: "🎯",
    tag: "Schritt 7 — Sparziele",
    title: "Sparziele anlegen & verfolgen",
    body: "Lege Ziele an — Notgroschen, Urlaub, Auto. Mit <strong>Zielbetrag</strong>, <strong>Sparrate</strong> und <strong>Zieldatum</strong> siehst du deinen Fortschritt.",
    target: "#p-goals",
    arrowDir: "down",
    arrowLabel: "Sparziele",
    navTo: "goals",
    special: null,
  },
  {
    icon: "↕",
    tag: "Schritt 8 — Umbuchungen",
    title: "Geld zwischen Konten verschieben",
    body: "Mit <strong>Umbuchung</strong> dokumentierst du Transfers — z.B. Sparrate auf Tagesgeld oder ETF-Kauf ins Depot.",
    target: "#btnUmbuchung",
    arrowDir: "up",
    arrowLabel: "Umbuchung",
    navTo: "dashboard",
    special: null,
  },
  {
    icon: "🎉",
    tag: "Los geht's!",
    title: "Du bist startklar!",
    body: "Tutorial jederzeit über <strong>? Hilfe & Tutorial</strong> in der Sidebar. Unter <strong>Einstellungen</strong> kannst du Theme, Schrift und Hintergrund anpassen.",
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
      () => _placeSpotlight(step.target, step.arrowDir, step.arrowLabel),
      150,
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
  if (TUT_STEPS[_tutStep].special === "password") {
    _saveTutPassword(() => {
      if (_tutStep < TUT_STEPS.length - 1) {
        _tutStep++;
        _renderStep();
      } else closeTutorial();
    });
    return;
  }
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

// ── RENDER ────────────────────────────
function _renderStep() {
  const step = TUT_STEPS[_tutStep];
  const total = TUT_STEPS.length;
  const isLast = _tutStep === total - 1;

  if (step.navTo) _navTo(step.navTo);

  document.getElementById("tutProgressFill").style.width =
    ((_tutStep + 1) / total) * 100 + "%";

  const iconEl = document.getElementById("tutIcon");
  iconEl.style.animation = "none";
  iconEl.textContent = step.icon;
  void iconEl.offsetWidth;
  iconEl.style.animation = "";

  document.getElementById("tutStepBadge").textContent =
    `${_tutStep + 1} / ${total}`;
  document.getElementById("tutTag").textContent = step.tag;
  document.getElementById("tutTitle").textContent = step.title;

  const bodyEl = document.getElementById("tutBody");
  if (step.special === "password") {
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
  } else {
    bodyEl.innerHTML = step.body;
  }

  document.getElementById("tutDots").innerHTML = TUT_STEPS.map(
    (_, i) =>
      `<div class="tut-dot ${i === _tutStep ? "active" : i < _tutStep ? "done" : ""}" onclick="tutGoTo(${i})"></div>`,
  ).join("");

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

  setTimeout(
    () => _placeSpotlight(step.target, step.arrowDir, step.arrowLabel),
    180,
  );
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

function _placeSpotlight(selector, arrowDir, arrowLabel) {
  if (!selector) {
    _hideHelpers();
    return;
  }
  const el = document.querySelector(selector);
  if (!el) {
    _hideHelpers();
    return;
  }

  el.scrollIntoView({ behavior: "smooth", block: "nearest" });

  setTimeout(() => {
    const r = el.getBoundingClientRect();
    const pad = 10;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const x1 = Math.max(0, r.left - pad);
    const y1 = Math.max(0, r.top - pad);
    const x2 = Math.min(W, r.right + pad);
    const y2 = Math.min(H, r.bottom + pad);

    // Backdrop: 4 Rechtecke, Spotlight-Bereich bleibt hell
    const ov = document.getElementById("tutorialOverlay");
    if (ov) {
      ov.style.background = `
        linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)) 0 0 / ${x1}px 100% no-repeat,
        linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)) ${x2}px 0 / ${W - x2}px 100% no-repeat,
        linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)) ${x1}px 0 / ${x2 - x1}px ${y1}px no-repeat,
        linear-gradient(rgba(0,0,0,0.62),rgba(0,0,0,0.62)) ${x1}px ${y2}px / ${x2 - x1}px ${H - y2}px no-repeat`;
    }

    // Blauer Rahmen
    if (!_spotEl) {
      _spotEl = document.createElement("div");
      _spotEl.className = "tut-spotlight";
      document.body.appendChild(_spotEl);
    }
    _spotEl.style.display = "block";
    _spotEl.style.left = x1 + "px";
    _spotEl.style.top = y1 + "px";
    _spotEl.style.width = x2 - x1 + "px";
    _spotEl.style.height = y2 - y1 + "px";

    // Pfeil
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
    const lbl = `<span class="tut-arrow-label">${arrowLabel || ""}</span>`;

    // Jede Richtung: eigenes SVG mit Spitze direkt in richtige Richtung gezeichnet
    const SVG = {
      down: `<svg width="32" height="44" viewBox="0 0 36 48" fill="none" style="filter:drop-shadow(0 0 8px rgba(77,158,255,.9));animation:arrow-bounce 1s ease-in-out infinite">
        <line x1="18" y1="4" x2="18" y2="36" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round"/>
        <polyline points="7,26 18,42 29,26" fill="none" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="18" cy="4" r="4" fill="#4d9eff" opacity="0.8"/></svg>`,
      up: `<svg width="32" height="44" viewBox="0 0 36 48" fill="none" style="filter:drop-shadow(0 0 8px rgba(77,158,255,.9));animation:arrow-bounce 1s ease-in-out infinite">
        <line x1="18" y1="44" x2="18" y2="12" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round"/>
        <polyline points="7,22 18,6 29,22" fill="none" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="18" cy="44" r="4" fill="#4d9eff" opacity="0.8"/></svg>`,
      right: `<svg width="44" height="32" viewBox="0 0 48 36" fill="none" style="filter:drop-shadow(0 0 8px rgba(77,158,255,.9));animation:arrow-bounce-h 1s ease-in-out infinite">
        <line x1="4" y1="18" x2="36" y2="18" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round"/>
        <polyline points="26,7 42,18 26,29" fill="none" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="4" cy="18" r="4" fill="#4d9eff" opacity="0.8"/></svg>`,
      left: `<svg width="44" height="32" viewBox="0 0 48 36" fill="none" style="filter:drop-shadow(0 0 8px rgba(77,158,255,.9));animation:arrow-bounce-h 1s ease-in-out infinite">
        <line x1="44" y1="18" x2="12" y2="18" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round"/>
        <polyline points="22,7 6,18 22,29" fill="none" stroke="#4d9eff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="44" cy="18" r="4" fill="#4d9eff" opacity="0.8"/></svg>`,
    };

    if (arrowDir === "down") {
      _arrowEl.innerHTML = SVG.down + lbl;
      _arrowEl.style.flexDirection = "column";
      _arrowEl.style.alignItems = "center";
      _arrowEl.style.left = cx - 16 + "px";
      _arrowEl.style.top = Math.max(4, y1 - 44 - 48) + "px";
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
      _arrowEl.style.left = Math.max(4, x1 - 52) + "px";
      _arrowEl.style.top = cy - 16 + "px";
    } else if (arrowDir === "left") {
      _arrowEl.innerHTML = SVG.left + lbl;
      _arrowEl.style.flexDirection = "row-reverse";
      _arrowEl.style.alignItems = "center";
      _arrowEl.style.left = x2 + 8 + "px";
      _arrowEl.style.top = cy - 16 + "px";
    }
    _arrowEl.style.display = "flex";
  }, 320);
}

// ── ERSTER START ─────────────────────
function checkFirstVisit() {
  try {
    if (!localStorage.getItem("csf_tut_done")) {
      setTimeout(() => openTutorial(0), 900);
    }
  } catch (e) {}
}
