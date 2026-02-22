// ══════════════════════════════════════
//  LOCKSCREEN — Passwortschutz
// ══════════════════════════════════════

const LOCK_KEY = "csf_pw_hash";
const LOCK_DONE = "csf_unlocked";

// ── HASH (SHA-256 via WebCrypto) ──────
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── PASSWORT VALIDIERUNG ──────────────
function validatePassword(pw) {
  if (pw.length < 8) return "Mindestens 8 Zeichen";
  if (!/[A-Z]/.test(pw)) return "Mindestens ein Großbuchstabe";
  if (!/[a-z]/.test(pw)) return "Mindestens ein Kleinbuchstabe";
  if (!/[0-9]/.test(pw)) return "Mindestens eine Zahl";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Mindestens ein Sonderzeichen";
  return null;
}

// ── LOCKSCREEN ANZEIGEN ───────────────
function showLockScreen(mode = "unlock") {
  const el = document.getElementById("lockScreen");
  if (!el) return;
  el.style.display = "flex";

  const isSetup = mode === "setup";
  document.getElementById("lockTitle").textContent = isSetup
    ? "Passwort festlegen"
    : "FinanceBoard entsperren";
  document.getElementById("lockSubtitle").textContent = isSetup
    ? "Lege ein sicheres Passwort fest (mind. 8 Zeichen, Groß/Klein, Zahl, Sonderzeichen)"
    : "Bitte Passwort eingeben um fortzufahren";

  const confirmRow = document.getElementById("lockConfirmRow");
  if (confirmRow) confirmRow.style.display = isSetup ? "" : "none";

  const btn = document.getElementById("lockBtn");
  if (btn) btn.textContent = isSetup ? "Passwort speichern" : "Entsperren";
  btn.onclick = isSetup ? setupPassword : unlockApp;

  document.getElementById("lockError").textContent = "";
  document.getElementById("lockPw").value = "";
  if (document.getElementById("lockPwConfirm"))
    document.getElementById("lockPwConfirm").value = "";
  setTimeout(() => document.getElementById("lockPw").focus(), 100);
}

function hideLockScreen() {
  const el = document.getElementById("lockScreen");
  if (el) {
    el.classList.add("fade-out");
    setTimeout(() => {
      el.style.display = "none";
      el.classList.remove("fade-out");
    }, 500);
  }
}

// ── PASSWORT EINRICHTEN ───────────────
async function setupPassword() {
  const pw = document.getElementById("lockPw").value;
  const pw2 = document.getElementById("lockPwConfirm")?.value || "";
  const err = document.getElementById("lockError");

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
  hideLockScreen();
}

// ── ENTSPERREN ────────────────────────
async function unlockApp() {
  const pw = document.getElementById("lockPw").value;
  const err = document.getElementById("lockError");
  const hash = await sha256(pw);
  const stored = localStorage.getItem(LOCK_KEY);

  if (hash === stored) {
    sessionStorage.setItem(LOCK_DONE, "1");
    hideLockScreen();
  } else {
    err.textContent = "Falsches Passwort";
    document.getElementById("lockPw").value = "";
    document.getElementById("lockPw").focus();
    // Shake-Animation
    const box = document.getElementById("lockBox");
    if (box) {
      box.classList.add("shake");
      setTimeout(() => box.classList.remove("shake"), 500);
    }
  }
}

// ── ENTER-KEY ─────────────────────────
function lockKeydown(e) {
  if (e.key === "Enter") {
    const isSetup =
      document.getElementById("lockConfirmRow")?.style.display !== "none";
    if (isSetup) setupPassword();
    else unlockApp();
  }
}

// ── INIT CHECK ────────────────────────
function checkLock() {
  const hasPassword = !!localStorage.getItem(LOCK_KEY);
  const isUnlocked = !!sessionStorage.getItem(LOCK_DONE);

  if (!hasPassword) return; // Kein Passwort gesetzt → direkt rein
  if (isUnlocked) return; // Diese Session bereits entsperrt

  showLockScreen("unlock");
}
