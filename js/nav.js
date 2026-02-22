// ══════════════════════════════════════
//  NAV — Seitennavigation
// ══════════════════════════════════════

const PAGE_TITLES = {
  dashboard: "Dashboard",
  posten: "Umsätze",
  jahr: "Jahresübersicht",
  vertraege: "Verträge",
  goals: "Sparziele",
  settings: "Einstellungen",
  docs: "Über diese App",
};

function nav(el, page) {
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("p-" + page).classList.add("active");
  document.getElementById("pageTitle").textContent = PAGE_TITLES[page] || page;

  if (page === "dashboard") renderDashboard();
  if (page === "posten") renderPosten();
  if (page === "jahr") renderJahr();
  if (page === "vertraege") renderVertraege();
  if (page === "goals") renderGoals();
  if (page === "settings") renderSettings();
  if (page === "docs") renderDocs();
}
