// ══════════════════════════════════════
//  STATE — Globaler Zustand · Speichern
// ══════════════════════════════════════

/**
 * accounts: [{ id, label, sub, accountType, iban, color, balance, include }]
 * data:      [{ id, name, type, amount, interval, due, accountId, note, contractStart, contractEnd }]
 * transfers: [{ id, date, fromId, toId, amount, note }]
 * goals:     [{ id, name, icon, color, targetAmount, currentAmount, monthlyRate, deadline }]
 * monthlyIncome: number
 */
const S = {
  accounts: [],
  data: [],
  transfers: [],
  goals: [],
  monthlyIncome: 0,
};

// ── PERSIST ──────────────────────────
function persist() {
  try {
    localStorage.setItem("csf_v1", JSON.stringify(S));
    const dot = document.getElementById("saveDot");
    const lbl = document.getElementById("saveLabel");
    if (dot) {
      dot.classList.add("saved");
      lbl.textContent = "gespeichert";
      clearTimeout(dot._t);
      dot._t = setTimeout(() => {
        dot.classList.remove("saved");
        lbl.textContent = "autosave · on";
      }, 1500);
    }
  } catch (e) {
    console.warn("persist failed", e);
  }
}

// ── HYDRATE ──────────────────────────
function hydrate() {
  try {
    const raw = localStorage.getItem("csf_v1");
    if (!raw) return false;
    const p = JSON.parse(raw);
    if (Array.isArray(p.accounts)) S.accounts = p.accounts;
    if (Array.isArray(p.data)) S.data = p.data;
    if (Array.isArray(p.transfers)) S.transfers = p.transfers;
    if (Array.isArray(p.goals)) S.goals = p.goals;
    if (typeof p.monthlyIncome === "number") S.monthlyIncome = p.monthlyIncome;
    return true;
  } catch (e) {
    console.warn("hydrate failed", e);
    return false;
  }
}

// ── SEED — Max Mustermann Demo ────────
// Realistische Demo-Daten damit das Tutorial sofort Sinn macht.
// Wird NUR beim absolut ersten Start geladen (kein csf_v1 in localStorage).
function seedData() {
  S.monthlyIncome = 2850.0;

  S.accounts = [
    {
      id: "acc_giro",
      label: "Musterbank Giro",
      sub: "Girokonto",
      accountType: "girokonto",
      iban: "DE89370400440532013000",
      color: "#4d9eff",
      balance: 1842.5,
      include: true,
    },
    {
      id: "acc_visa",
      label: "Musterbank Visa",
      sub: "Kreditkarte · Abr. 25.",
      accountType: "kreditkarte",
      iban: "DE89370400440532013001",
      color: "#ff4d6a",
      balance: -243.6,
      include: true,
    },
    {
      id: "acc_ing",
      label: "Sparbank Tagesgeld",
      sub: "Tagesgeld 2,5% p.a.",
      accountType: "tagesgeld",
      iban: "DE89370400440532013002",
      color: "#ffb547",
      balance: 5200.0,
      include: true,
    },
    {
      id: "acc_depot",
      label: "Depot Capital",
      sub: "ETF Depot",
      accountType: "depot",
      iban: "",
      color: "#7b5fff",
      balance: 8430.0,
      include: false,
    },
  ];

  S.data = [
    {
      id: "p1",
      name: "Warmmiete",
      type: "ausgabe",
      amount: 780.0,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "inkl. Nebenkosten",
      contractStart: "2022-04-01",
      contractEnd: "",
    },
    {
      id: "p2",
      name: "Internetvertrag",
      type: "ausgabe",
      amount: 39.99,
      interval: "monatl.",
      due: "3",
      accountId: "acc_giro",
      note: "",
      contractStart: "2024-01-01",
      contractEnd: "2026-12-31",
    },
    {
      id: "p3",
      name: "Handyvertrag",
      type: "ausgabe",
      amount: 22.99,
      interval: "monatl.",
      due: "15",
      accountId: "acc_visa",
      note: "Kündbar 1M vorher",
      contractStart: "2025-02-15",
      contractEnd: "2027-02-14",
    },
    {
      id: "p4",
      name: "Krankenversicherung",
      type: "ausgabe",
      amount: 210.0,
      interval: "monatl.",
      due: "1",
      accountId: "acc_giro",
      note: "",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: "p5",
      name: "KFZ-Versicherung",
      type: "ausgabe",
      amount: 94.5,
      interval: "viertelj.",
      due: "1",
      accountId: "acc_giro",
      note: "",
      contractStart: "2026-01-01",
      contractEnd: "2026-12-31",
    },
    {
      id: "p6",
      name: "Autokredit",
      type: "ausgabe",
      amount: 189.0,
      interval: "monatl.",
      due: "20",
      accountId: "acc_giro",
      note: "",
      contractStart: "2023-08-01",
      contractEnd: "2028-07-31",
    },
    {
      id: "p7",
      name: "Netflix",
      type: "ausgabe",
      amount: 12.99,
      interval: "monatl.",
      due: "8",
      accountId: "acc_visa",
      note: "",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: "p8",
      name: "Spotify",
      type: "ausgabe",
      amount: 10.99,
      interval: "monatl.",
      due: "12",
      accountId: "acc_visa",
      note: "",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: "p9",
      name: "GEZ Rundfunkbeitrag",
      type: "ausgabe",
      amount: 18.36,
      interval: "viertelj.",
      due: "15",
      accountId: "acc_giro",
      note: "",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: "p10",
      name: "Fitnessstudio",
      type: "ausgabe",
      amount: 29.9,
      interval: "monatl.",
      due: "5",
      accountId: "acc_visa",
      note: "",
      contractStart: "2025-09-01",
      contractEnd: "2026-08-31",
    },
    {
      id: "p11",
      name: "ETF Sparplan",
      type: "ausgabe",
      amount: 200.0,
      interval: "monatl.",
      due: "2",
      accountId: "acc_giro",
      note: "→ Depot Capital",
      contractStart: "2024-01-01",
      contractEnd: "",
    },
    {
      id: "p12",
      name: "Tagesgeld Sparrate",
      type: "ausgabe",
      amount: 150.0,
      interval: "monatl.",
      due: "2",
      accountId: "acc_giro",
      note: "→ Sparbank",
      contractStart: "",
      contractEnd: "",
    },
    {
      id: "p13",
      name: "Gehalt",
      type: "einnahme",
      amount: 2850.0,
      interval: "monatl.",
      due: "25",
      accountId: "acc_giro",
      note: "Nettogehalt",
      contractStart: "2021-06-01",
      contractEnd: "",
    },
  ];

  S.transfers = [
    {
      id: "t1",
      date: "2026-02-02",
      fromId: "acc_giro",
      toId: "acc_depot",
      amount: 200.0,
      note: "ETF Sparplan Feb",
    },
    {
      id: "t2",
      date: "2026-02-02",
      fromId: "acc_giro",
      toId: "acc_ing",
      amount: 150.0,
      note: "Tagesgeld Feb",
    },
  ];

  S.goals = [
    {
      id: "g1",
      name: "Notgroschen",
      icon: "🛡️",
      color: "#4d9eff",
      targetAmount: 5000.0,
      currentAmount: 3200.0,
      monthlyRate: 200.0,
      deadline: "2026-10-01",
    },
    {
      id: "g2",
      name: "Urlaubskasse",
      icon: "✈️",
      color: "#00e5a0",
      targetAmount: 2000.0,
      currentAmount: 650.0,
      monthlyRate: 150.0,
      deadline: "2026-07-01",
    },
    {
      id: "g3",
      name: "Neues Auto",
      icon: "🚗",
      color: "#ffb547",
      targetAmount: 15000.0,
      currentAmount: 2100.0,
      monthlyRate: 300.0,
      deadline: "2029-01-01",
    },
  ];

  persist();
}

// ── ID GENERATOR ─────────────────────
function genId(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6)
  );
}

// ── IBAN FORMATTER ────────────────────
function formatIban(raw) {
  // Leerzeichen entfernen, Großbuchstaben, dann in 4er-Gruppen
  return raw
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function ibanLast4(iban) {
  if (!iban) return "—";
  const clean = iban.replace(/\s/g, "");
  if (clean.length === 0) return "—";
  // Kreditkarte (16 Ziffern) oder IBAN (beginnt mit 2 Buchstaben)
  if (/^\d{12,19}$/.test(clean)) {
    // Kartennummer: •••• •••• •••• XXXX
    return "•••• •••• •••• " + clean.slice(-4);
  }
  return clean.length >= 4 ? "•••• " + clean.slice(-4) : clean;
}
