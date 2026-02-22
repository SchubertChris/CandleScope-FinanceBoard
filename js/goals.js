// ══════════════════════════════════════
//  GOALS — Sparziele
// ══════════════════════════════════════

// Ziele leben in S.goals[]
// { id, name, targetAmount, currentAmount, monthlyRate, deadline, color, icon }

function renderGoals() {
  const el = document.getElementById('p-goals');
  if (!el) return;

  const goals = S.goals || [];

  el.innerHTML = `
  <div class="page-header">
    <div>
      <div class="ph-title">Sparziele</div>
      <div class="ph-sub">${goals.length} Ziel${goals.length !== 1 ? 'e' : ''} · ${goals.filter(g => _goalPct(g) >= 100).length} erreicht</div>
    </div>
    <button class="btn primary" onclick="openGoalModal()">+ Neues Ziel</button>
  </div>

  ${goals.length === 0 ? `
    <div class="empty-state">
      <div class="empty-icon">🎯</div>
      <div class="empty-title">Noch keine Sparziele</div>
      <div class="empty-sub">Lege dein erstes Ziel an — Urlaub, Auto, Notgroschen oder Depot-Aufbau</div>
      <button class="btn primary" style="margin-top:16px;" onclick="openGoalModal()">+ Erstes Ziel anlegen</button>
    </div>
  ` : `
    <div class="goals-grid">
      ${goals.map(g => _renderGoalCard(g)).join('')}
    </div>
  `}
`;

  _renderGoalIconPicker();
  _renderGoalColorPicker(null);
}

function _goalPct(g) {
  if (!g.targetAmount || g.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
}

function _goalMonthsLeft(g) {
  if (!g.deadline) return null;
  const diff = Math.round((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30));
  return Math.max(0, diff);
}

function _renderGoalCard(g) {
  const pct    = _goalPct(g);
  const months = _goalMonthsLeft(g);
  const remaining = Math.max(0, (g.targetAmount || 0) - (g.currentAmount || 0));
  const done   = pct >= 100;
  const idx    = (S.goals || []).indexOf(g);

  return `
  <div class="goal-card ${done ? 'done' : ''}">
    <div class="goal-card-top">
      <div class="goal-icon-badge" style="background:${g.color || '#4d9eff'}22;color:${g.color || '#4d9eff'}">${g.icon || '🎯'}</div>
      <div class="goal-card-meta">
        <div class="goal-card-name">${esc(g.name)}</div>
        ${months !== null ? `<div class="goal-card-deadline">${months > 0 ? months + ' Monate verbleibend' : '⚠ Zieldatum überschritten'}</div>` : ''}
      </div>
      <button class="btn sm" onclick="openGoalModal(${idx})" style="margin-left:auto;">✎</button>
    </div>
    <div class="goal-prog-track">
      <div class="goal-prog-fill" style="width:${pct}%;background:${g.color || '#4d9eff'};"></div>
    </div>
    <div class="goal-card-nums">
      <div>
        <div class="goal-num-val" style="color:${g.color || '#4d9eff'}">${fm(g.currentAmount || 0)}</div>
        <div class="goal-num-lbl">gespart</div>
      </div>
      <div style="text-align:center;">
        <div class="goal-num-val ${done ? 'done-val' : ''}">${pct}%</div>
        <div class="goal-num-lbl">${done ? '✓ Erreicht' : 'Fortschritt'}</div>
      </div>
      <div style="text-align:right;">
        <div class="goal-num-val">${fm(g.targetAmount || 0)}</div>
        <div class="goal-num-lbl">Ziel</div>
      </div>
    </div>
    ${g.monthlyRate > 0 && !done ? `
      <div class="goal-rate-row">
        <span>Sparrate ${fm(g.monthlyRate)}/Mon</span>
        <span style="color:var(--text3);">noch ${fm(remaining)} offen</span>
      </div>
    ` : ''}
  </div>`;
}

// ── GOAL MODAL ────────────────────────
let _editGoalIdx = null;
let _selectedGoalIcon  = '🎯';
let _selectedGoalColor = '#4d9eff';

function openGoalModal(idx = null) {
  _editGoalIdx = idx;
  const g = idx !== null ? (S.goals || [])[idx] : null;

  document.getElementById('goalModalTitle').textContent = g ? 'Ziel bearbeiten' : 'Neues Ziel';
  document.getElementById('gfName').value     = g ? g.name : '';
  document.getElementById('gfTarget').value   = g ? g.targetAmount.toFixed(2).replace('.',',') : '';
  document.getElementById('gfCurrent').value  = g ? (g.currentAmount||0).toFixed(2).replace('.',',') : '';
  document.getElementById('gfRate').value     = g ? (g.monthlyRate||0).toFixed(2).replace('.',',') : '';
  document.getElementById('gfDeadline').value = g ? (g.deadline || '') : '';

  _selectedGoalIcon  = g ? (g.icon || '🎯') : '🎯';
  _selectedGoalColor = g ? (g.color || '#4d9eff') : '#4d9eff';

  _renderGoalIconPicker();
  _renderGoalColorPicker(_selectedGoalColor);

  const delBtn = document.getElementById('goalModalDelete');
  if (delBtn) delBtn.style.display = g ? '' : 'none';

  document.getElementById('goalModalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('gfName').focus(), 50);
}

function closeGoalModal() {
  const ov = document.getElementById('goalModalOverlay');
  if (ov) ov.classList.remove('open');
  _editGoalIdx = null;
}

function selectGoalIcon(ic) {
  _selectedGoalIcon = ic;
  _renderGoalIconPicker();
}

function _renderGoalIconPicker() {
  const picker = document.getElementById('goalIconPicker');
  if (!picker) return;
  picker.querySelectorAll('.goal-icon-opt').forEach(el => {
    el.classList.toggle('active', el.textContent === _selectedGoalIcon);
  });
}

function _renderGoalColorPicker(selected) {
  const row = document.getElementById('goalColorRow');
  if (!row) return;
  row.innerHTML = ACC_PRESET_COLORS.map(c => `
    <div class="color-swatch ${c === (selected || _selectedGoalColor) ? 'active' : ''}"
         style="background:${c};"
         onclick="selectGoalColor('${c}')"></div>
  `).join('');
}

function selectGoalColor(c) {
  _selectedGoalColor = c;
  _renderGoalColorPicker(c);
}

function saveGoal() {
  const name = document.getElementById('gfName').value.trim();
  if (!name) { document.getElementById('gfName').focus(); return; }

  const g = {
    id:            _editGoalIdx !== null ? (S.goals[_editGoalIdx].id) : genId('goal'),
    name,
    icon:          _selectedGoalIcon,
    color:         _selectedGoalColor,
    targetAmount:  pp(document.getElementById('gfTarget').value),
    currentAmount: pp(document.getElementById('gfCurrent').value),
    monthlyRate:   pp(document.getElementById('gfRate').value),
    deadline:      document.getElementById('gfDeadline').value
  };

  if (!S.goals) S.goals = [];
  if (_editGoalIdx !== null) S.goals[_editGoalIdx] = g;
  else S.goals.push(g);

  persist(); closeGoalModal(); renderGoals();
}

function deleteGoal() {
  if (_editGoalIdx === null) return;
  const g = S.goals[_editGoalIdx];
  if (!confirm(`Ziel "${g.name}" löschen?`)) return;
  S.goals.splice(_editGoalIdx, 1);
  persist(); closeGoalModal(); renderGoals();
}

// ── DASHBOARD ZIELE-WIDGET ────────────
function renderGoalsWidget() {
  const el = document.getElementById('goalsWidget');
  if (!el) return;
  const goals = (S.goals || []).filter(g => _goalPct(g) < 100).slice(0, 3);
  if (goals.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text3);font-size:.8em;">
      <div style="font-size:1.8em;margin-bottom:8px;opacity:.3">🎯</div>Keine aktiven Ziele
    </div>`;
    return;
  }
  el.innerHTML = goals.map(g => {
    const pct = _goalPct(g);
    return `<div class="goal-mini">
      <div class="goal-mini-top">
        <span>${g.icon || '🎯'} ${esc(g.name)}</span>
        <span style="color:${g.color || '#4d9eff'};font-family:var(--mono);font-size:.78em;">${pct}%</span>
      </div>
      <div class="goal-mini-track">
        <div class="goal-mini-fill" style="width:${pct}%;background:${g.color || '#4d9eff'}"></div>
      </div>
      <div class="goal-mini-vals">
        <span>${fm(g.currentAmount||0)}</span>
        <span style="color:var(--text3)">${fm(g.targetAmount||0)}</span>
      </div>
    </div>`;
  }).join('');
}