// ══════════════════════════════════════
//  ACCOUNTS — Konten verwalten
// ══════════════════════════════════════

const ACC_PRESET_COLORS = [
  "#4d9eff",
  "#7b5fff",
  "#00e5a0",
  "#ff4d6a",
  "#ffb547",
  "#00d4cc",
  "#ff8c42",
  "#c084fc",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#60a5fa",
];

const ACC_TYPES = [
  { value: "girokonto", label: "Girokonto" },
  { value: "kreditkarte", label: "Kreditkarte" },
  { value: "tagesgeld", label: "Tagesgeld" },
  { value: "sparkonto", label: "Sparkonto" },
  { value: "depot", label: "Depot" },
  { value: "festgeld", label: "Festgeld" },
  { value: "sonstiges", label: "Sonstiges" },
];

// ── RENDER ACCOUNTS PANEL ─────────────
function renderAccounts() {
  const list = document.getElementById("accList");
  if (!list) return;

  list.innerHTML = S.accounts
    .map(
      (acc) => `
    <div class="acc-row" id="accrow-${acc.id}">
      <div class="acc-row-l">
        <div class="acc-dot" style="background:${esc(acc.color)};"></div>
        <div>
          <div class="acc-name">${esc(acc.label)}</div>
          <div class="acc-type-tag">${esc(acc.sub || _accTypeLabel(acc.accountType))}</div>
          ${acc.iban ? `<div class="acc-iban">${ibanLast4(acc.iban)}</div>` : ""}
          <div class="acc-chk">
            <input type="checkbox" id="ic-${acc.id}" ${acc.include ? "checked" : ""}
              onchange="toggleInclude('${acc.id}', this.checked)">
            <label for="ic-${acc.id}">Einbeziehen</label>
          </div>
        </div>
      </div>
      <div class="acc-actions">
        <div class="acc-inp-r">
          <input class="acc-inp" type="text" id="ai-${acc.id}"
            value="${acc.balance !== 0 ? acc.balance.toFixed(2).replace(".", ",") : ""}"
            placeholder="0,00"
            oninput="setBalance('${acc.id}', this.value)">
          <span class="acc-sfx">€</span>
        </div>
        <button class="btn sm" onclick="openAccountModal('${acc.id}')" title="Konto bearbeiten">✎</button>
      </div>
    </div>
  `,
    )
    .join("");

  // Footer: Konto hinzufügen
  const existingFoot = document.getElementById("accManagerFooter");
  if (existingFoot) existingFoot.remove();
  const foot = document.createElement("div");
  foot.id = "accManagerFooter";
  foot.className = "acc-manager-footer";
  foot.innerHTML = `<button class="btn primary" style="width:100%;margin-top:8px;" onclick="openAccountModal()">+ Konto hinzufügen</button>`;
  list.parentElement.insertBefore(foot, list.nextSibling);
}

function _accTypeLabel(type) {
  return (ACC_TYPES.find((t) => t.value === type) || { label: type || "—" })
    .label;
}

// ── BALANCE / INCLUDE ─────────────────
function setBalance(id, val) {
  const acc = getAccount(id);
  if (acc) {
    acc.balance = pp(val);
    persist();
    refreshDash();
  }
}

function toggleInclude(id, v) {
  const acc = getAccount(id);
  if (acc) {
    acc.include = v;
    persist();
    refreshDash();
  }
}

function setMonthlyIncome(val) {
  S.monthlyIncome = pp(val);
  persist();
  refreshDash();
}

// ── ACCOUNT MODAL ─────────────────────
let _editAccId = null;
let _selectedAccColor = ACC_PRESET_COLORS[0];

function openAccountModal(id = null) {
  _editAccId = id || null;
  const acc = id ? getAccount(id) : null;

  document.getElementById("accModalTitle").textContent = acc
    ? "Konto bearbeiten"
    : "Neues Konto";
  document.getElementById("accFLabel").value = acc ? acc.label : "";
  document.getElementById("accFSub").value = acc ? acc.sub || "" : "";
  document.getElementById("accFIban").value = acc
    ? acc.iban
      ? formatIban(acc.iban)
      : ""
    : "";
  document.getElementById("accFBalance").value =
    acc && acc.balance !== 0 ? acc.balance.toFixed(2).replace(".", ",") : "";

  // Kontoart Dropdown
  const typeEl = document.getElementById("accFType");
  if (typeEl) {
    typeEl.value = acc ? acc.accountType || "girokonto" : "girokonto";
    typeEl.onchange = () => updateAccNumberFields(acc);
  }
  // Felder initial befüllen
  updateAccNumberFields(acc);

  _selectedAccColor = acc ? acc.color : ACC_PRESET_COLORS[0];
  renderAccColorPicker(_selectedAccColor);

  const delBtn = document.getElementById("accModalDelete");
  if (delBtn) delBtn.style.display = acc ? "" : "none";

  document.getElementById("accModalOverlay").classList.add("open");
  setTimeout(() => document.getElementById("accFLabel").focus(), 50);
}

function renderAccColorPicker(selected) {
  const row = document.getElementById("accColorRow");
  if (!row) return;
  row.innerHTML = ACC_PRESET_COLORS.map(
    (c) => `
    <div class="color-swatch ${c === selected ? "active" : ""}"
         style="background:${c};"
         onclick="selectAccColor('${c}')"></div>
  `,
  ).join("");
}

function selectAccColor(c) {
  _selectedAccColor = c;
  renderAccColorPicker(c);
}

function saveAccountModal() {
  const label = document.getElementById("accFLabel").value.trim();
  if (!label) {
    document.getElementById("accFLabel").focus();
    return;
  }

  const sub = document.getElementById("accFSub").value.trim();
  const ibanRaw = _readAccNumber();
  const balance = pp(document.getElementById("accFBalance").value);
  const accountType = document.getElementById("accFType")?.value || "girokonto";

  const ccExp = document.getElementById("ccExp")?.value || "";
  const ccCvv = document.getElementById("ccCvv")?.value || "";

  if (_editAccId) {
    const acc = getAccount(_editAccId);
    if (acc) {
      acc.label = label;
      acc.sub = sub;
      acc.iban = ibanRaw;
      acc.accountType = accountType;
      acc.balance = balance;
      acc.color = _selectedAccColor;
      if (ccExp) acc.ccExp = ccExp;
      if (ccCvv) acc.ccCvv = ccCvv;
    }
  } else {
    S.accounts.push({
      id: genId("acc"),
      label,
      sub,
      accountType,
      iban: ibanRaw,
      ccExp,
      ccCvv,
      color: _selectedAccColor,
      balance,
      include: true,
    });
  }

  persist();
  closeAccountModal();
  renderAccounts();
  refreshDash();
}

function deleteAccount() {
  if (!_editAccId) return;
  const acc = getAccount(_editAccId);
  if (!acc) return;
  if (
    !confirm(
      `Konto "${acc.label}" wirklich löschen?\nAlle verknüpften Posten verlieren die Kontozuordnung.`,
    )
  )
    return;

  S.data.forEach((p) => {
    if (p.accountId === _editAccId) p.accountId = "";
  });
  S.transfers = S.transfers.filter(
    (t) => t.fromId !== _editAccId && t.toId !== _editAccId,
  );
  S.accounts = S.accounts.filter((a) => a.id !== _editAccId);

  persist();
  closeAccountModal();
  renderAccounts();
  refreshDash();
}

function closeAccountModal() {
  document.getElementById("accModalOverlay").classList.remove("open");
  _editAccId = null;
}

// ── DYNAMISCHE NUMMERNFELDER ──────────────
function updateAccNumberFields(acc) {
  const row = document.getElementById("accNumberRow");
  const type = document.getElementById("accFType")?.value || "girokonto";
  if (!row) return;

  if (type === "kreditkarte") {
    // Kreditkarte: 4×4 Blöcke + Ablaufdatum + CVV
    const parts = _splitCardNumber(acc?.iban || "");
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>Kartennummer <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <div class="cc-blocks" id="ccBlocks">
          <input class="cc-block" id="cc1" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[0]}"
            oninput="ccBlockInput(this,'cc2')" onkeydown="ccBlockBack(event,this,null)">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc2" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[1]}"
            oninput="ccBlockInput(this,'cc3')" onkeydown="ccBlockBack(event,this,'cc1')">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc3" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[2]}"
            oninput="ccBlockInput(this,'cc4')" onkeydown="ccBlockBack(event,this,'cc2')">
          <span class="cc-sep">—</span>
          <input class="cc-block" id="cc4" type="text" inputmode="numeric" maxlength="4" placeholder="••••" value="${parts[3]}"
            oninput="ccBlockInput(this,null)" onkeydown="ccBlockBack(event,this,'cc3')">
        </div>
      </div>
      <div class="fg">
        <label>Ablaufdatum</label>
        <input id="ccExp" type="text" inputmode="numeric" maxlength="5" placeholder="MM/JJ"
          value="${acc?.ccExp || ""}" oninput="ccExpInput(this)">
      </div>
      <div class="fg">
        <label>CVV <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="ccCvv" type="text" inputmode="numeric" maxlength="4" placeholder="•••"
          value="${acc?.ccCvv || ""}">
      </div>`;
  } else if (type === "depot") {
    // Depot: Depotnummer (12 Stellen, frei)
    const raw = acc?.iban || "";
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>Depotnummer <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="accFDepot" type="text" inputmode="numeric" maxlength="20"
          placeholder="z.B. 1234 5678 9012"
          value="${_formatGroups(raw, 4)}"
          oninput="this.value=_formatGroups(this.value.replace(/\\s/g,''),4)">
      </div>`;
  } else {
    // Alle anderen: IBAN
    const ibanVal = acc?.iban ? formatIban(acc.iban) : "";
    row.innerHTML = `
      <div class="fg" style="grid-column:1/-1;">
        <label>IBAN <span style="opacity:.5;font-size:.85em;">(optional)</span></label>
        <input id="accFIban" type="text" inputmode="text" maxlength="34"
          placeholder="DE89 3704 0044 0532 0130 00"
          value="${ibanVal}"
          oninput="this.value=formatIban(this.value)">
      </div>`;
  }
}

// Kreditkarten-Block: Auto-Weitersprung
function ccBlockInput(el, nextId) {
  el.value = el.value.replace(/\D/g, "");
  if (el.value.length === 4 && nextId) {
    document.getElementById(nextId)?.focus();
  }
}

// Kreditkarten-Block: Backspace springt zurück
function ccBlockBack(e, el, prevId) {
  if (e.key === "Backspace" && el.value === "" && prevId) {
    e.preventDefault();
    const prev = document.getElementById(prevId);
    if (prev) {
      prev.focus();
      prev.setSelectionRange(prev.value.length, prev.value.length);
    }
  }
}

// Ablaufdatum auto-slash
function ccExpInput(el) {
  let v = el.value.replace(/\D/g, "");
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
  el.value = v;
}

// Nummer auslesen je Typ
function _readAccNumber() {
  const type = document.getElementById("accFType")?.value || "girokonto";
  if (type === "kreditkarte") {
    const n = ["cc1", "cc2", "cc3", "cc4"]
      .map((id) => document.getElementById(id)?.value || "")
      .join("");
    return n.toUpperCase();
  } else if (type === "depot") {
    return (document.getElementById("accFDepot")?.value || "").replace(
      /\s/g,
      "",
    );
  } else {
    return (document.getElementById("accFIban")?.value || "")
      .replace(/\s/g, "")
      .toUpperCase();
  }
}

// Kreditkartennummer in 4er-Teile splitten
function _splitCardNumber(raw) {
  const clean = raw.replace(/\s/g, "");
  return [
    clean.slice(0, 4) || "",
    clean.slice(4, 8) || "",
    clean.slice(8, 12) || "",
    clean.slice(12, 16) || "",
  ];
}

// Freie Zahl in N-er Gruppen
function _formatGroups(raw, n) {
  return raw
    .replace(/\s/g, "")
    .replace(new RegExp(`(.{${n}})(?=.)`, "g"), "$1 ")
    .trim();
}
