// ══════════════════════════════════════
//  MODAL — Posten · Umbuchung · Universal
// ══════════════════════════════════════

let _editIdx = null; // Index in S.data (null = neu)
let _editTrfId = null; // Transfer-ID (null = kein Transfer)
let _activeTab = "posten"; // 'posten' | 'transfer'

// ── ÖFFNEN ────────────────────────────
/**
 * openModal(idx)          → Posten bearbeiten
 * openModal()             → Neuer Posten (Tab: Posten)
 * openModal(null,'trf')   → Neue Umbuchung
 * openModal(null,'trf',id) → Umbuchung bearbeiten
 */
function openModal(idx, tab = "posten", trfId = null) {
  _editIdx = idx !== undefined && idx !== null ? idx : null;
  _editTrfId = trfId;
  _activeTab = tab;

  // Tab anzeigen
  switchModalTab(tab, false);

  if (tab === "posten") {
    _fillPostenForm(_editIdx !== null ? S.data[_editIdx] : null);
  } else {
    _fillTransferForm(trfId ? S.transfers.find((t) => t.id === trfId) : null);
  }

  document.getElementById("modalOverlay").classList.add("open");
  setTimeout(() => document.getElementById("fName")?.focus(), 50);
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  _editIdx = null;
  _editTrfId = null;
}

function overlayClick(e) {
  if (e.target === document.getElementById("modalOverlay")) closeModal();
}

// ── TABS ──────────────────────────────
function switchModalTab(tab, fill = true) {
  _activeTab = tab;
  document
    .querySelectorAll(".modal-tab")
    .forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  document
    .querySelectorAll(".modal-pane")
    .forEach((p) => p.classList.toggle("active", p.id === "mpane-" + tab));
  // Titel
  const h = document.getElementById("modalH");
  if (tab === "posten")
    h.textContent = _editIdx !== null ? "Posten bearbeiten" : "Neuer Posten";
  if (tab === "transfer")
    h.textContent =
      _editTrfId !== null ? "Umbuchung bearbeiten" : "Neue Umbuchung";
  if (fill) {
    if (tab === "posten") _fillPostenForm(null);
    if (tab === "transfer") _fillTransferForm(null);
  }
}

// ── POSTEN FORM ───────────────────────
function _fillPostenForm(p) {
  document.getElementById("modalH").textContent = p
    ? "Posten bearbeiten"
    : "Neuer Posten";
  _fillAccountSelect("fAccount", p ? p.accountId : "");

  if (p) {
    document.getElementById("fName").value = p.name;
    document.getElementById("fType").value = p.type;
    document.getElementById("fAmount").value = p.amount;
    document.getElementById("fInterval").value = p.interval;
    document.getElementById("fDue").value = p.due || "";
    document.getElementById("fNote").value = p.note || "";
    document.getElementById("fStart").value = p.contractStart || "";
    document.getElementById("fEnd").value = p.contractEnd || "";
  } else {
    ["fName", "fAmount", "fDue", "fStart", "fEnd", "fNote"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("fType").value = "ausgabe";
    document.getElementById("fInterval").value = "monatl.";
  }

  // Delete-Button
  const del = document.getElementById("postenModalDelete");
  if (del) del.style.display = _editIdx !== null ? "" : "none";
}

function savePosten() {
  const name = document.getElementById("fName").value.trim();
  if (!name) {
    document.getElementById("fName").focus();
    return;
  }

  const p = {
    id: _editIdx !== null ? S.data[_editIdx].id : genId("p"),
    name,
    type: document.getElementById("fType").value,
    amount: parseFloat(document.getElementById("fAmount").value) || 0,
    interval: document.getElementById("fInterval").value,
    due: document.getElementById("fDue").value.trim(),
    accountId: document.getElementById("fAccount").value,
    note: document.getElementById("fNote").value.trim(),
    contractStart: document.getElementById("fStart").value,
    contractEnd: document.getElementById("fEnd").value,
  };

  if (_editIdx !== null) S.data[_editIdx] = p;
  else S.data.push(p);

  persist();
  closeModal();
  _afterSave();
}

function deletePosten() {
  if (_editIdx === null) return;
  const name = S.data[_editIdx].name;
  if (!confirm(`"${name}" wirklich löschen?`)) return;
  S.data.splice(_editIdx, 1);
  persist();
  closeModal();
  _afterSave();
}

// ── TRANSFER FORM ─────────────────────
function _fillTransferForm(t) {
  _fillAccountSelect("fTrfFrom", t ? t.fromId : "");
  _fillAccountSelect("fTrfTo", t ? t.toId : "");

  if (t) {
    document.getElementById("fTrfAmount").value = t.amount;
    document.getElementById("fTrfDate").value = t.date || "";
    document.getElementById("fTrfNote").value = t.note || "";
  } else {
    document.getElementById("fTrfAmount").value = "";
    document.getElementById("fTrfDate").value = today()
      .toISOString()
      .slice(0, 10);
    document.getElementById("fTrfNote").value = "";
  }

  const del = document.getElementById("trfModalDelete");
  if (del) del.style.display = _editTrfId ? "" : "none";
}

function saveTransfer() {
  const fromId = document.getElementById("fTrfFrom").value;
  const toId = document.getElementById("fTrfTo").value;
  const amount = parseFloat(document.getElementById("fTrfAmount").value) || 0;
  if (!fromId || !toId || fromId === toId || amount <= 0) {
    alert(
      "Bitte Quell- und Zielkonto (verschieden) sowie einen Betrag angeben.",
    );
    return;
  }
  const t = {
    id: _editTrfId || genId("trf"),
    fromId,
    toId,
    amount,
    date:
      document.getElementById("fTrfDate").value ||
      today().toISOString().slice(0, 10),
    note: document.getElementById("fTrfNote").value.trim(),
  };
  if (_editTrfId) {
    const idx = S.transfers.findIndex((x) => x.id === _editTrfId);
    if (idx >= 0) S.transfers[idx] = t;
    else S.transfers.push(t);
  } else {
    S.transfers.push(t);
  }
  persist();
  closeModal();
  _afterSave();
}

function deleteTransfer() {
  if (!_editTrfId) return;
  if (!confirm("Umbuchung wirklich löschen?")) return;
  S.transfers = S.transfers.filter((t) => t.id !== _editTrfId);
  persist();
  closeModal();
  _afterSave();
}

// ── HELPER ────────────────────────────
function _fillAccountSelect(selectId, selectedVal) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML =
    `<option value="">— nicht zugeordnet —</option>` +
    S.accounts
      .map(
        (a) =>
          `<option value="${esc(a.id)}" ${a.id === selectedVal ? "selected" : ""}>${esc(a.label)}</option>`,
      )
      .join("");
}

function _afterSave() {
  refreshDash();
  updateContractBadge();
  // Seite neu rendern falls aktiv
  if (document.getElementById("p-posten").classList.contains("active"))
    renderPosten();
  if (document.getElementById("p-vertraege").classList.contains("active"))
    renderVertraege();
  if (document.getElementById("p-jahr").classList.contains("active"))
    renderJahr();
}
