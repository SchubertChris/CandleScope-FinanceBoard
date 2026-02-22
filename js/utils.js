// ══════════════════════════════════════
//  UTILS — Formatierung · Hilfsfunktionen
// ══════════════════════════════════════

/** Zahl → "1.234,56 €" */
function fm(v, sign = false) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const s = v.toLocaleString('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' €';
  return (sign && v > 0) ? '+' + s : s;
}

/** Kurze Zahl → "1,2 K" */
function fmShort(v) {
  if (!v && v !== 0) return '—';
  if (Math.abs(v) >= 1000) return (v/1000).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1}) + ' K';
  return v.toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:0});
}

/** String mit Komma/Punkt → float */
function pp(v) {
  if (!v && v !== 0) return 0;
  const s = String(v).trim();
  if (s.includes(',')) return parseFloat(s.replace(/\./g,'').replace(',','.')) || 0;
  return parseFloat(s.replace(/[^\d.-]/g,'')) || 0;
}

/** HTML escapen */
function esc(v) {
  return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** today als Date */
function today() { return new Date(); }

/** Datum als DE-String */
function fmDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('de-DE');
}

/** Posten: Ø monatlicher Betrag */
function avgMonthly(p) {
  const a = parseFloat(p.amount) || 0;
  switch(p.interval) {
    case 'monatl.':    return a;
    case 'viertelj.':  return a / 3;
    case 'halbjährl.': return a / 6;
    case 'jährl.':     return a / 12;
    case 'einmalig':   return 0;
    default:           return a;
  }
}

/** Ist Posten in Monat mIdx aktiv? */
function activeInMonth(p, mIdx) {
  const yr    = today().getFullYear();
  const mDate = new Date(yr, mIdx, 1);
  if (p.contractEnd)   { const e = new Date(p.contractEnd);   if (mDate > new Date(e.getFullYear(), e.getMonth(), 1)) return false; }
  if (p.contractStart) { const s = new Date(p.contractStart); if (mDate < new Date(s.getFullYear(), s.getMonth(), 1)) return false; }
  if (p.interval === 'einmalig')    return false;
  if (p.interval === 'viertelj.')  { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return (((mIdx-ref)%3)+3)%3 === 0; }
  if (p.interval === 'halbjährl.') { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return (((mIdx-ref)%6)+6)%6 === 0; }
  if (p.interval === 'jährl.')     { const ref = p.contractStart ? new Date(p.contractStart).getMonth() : 0; return mIdx === ref; }
  return true;
}

/** Betrag des Postens in Monat mIdx (0 wenn inaktiv) */
function monthActual(p, mIdx) {
  if (!activeInMonth(p, mIdx)) return 0;
  return parseFloat(p.amount) || 0;
}

/** Array nach key sortieren */
function sortArr(arr, k, asc) {
  return [...arr].sort((a, b) => {
    let va = a[k] ?? '', vb = b[k] ?? '';
    if (k === 'amount' || k === 'due') {
      va = parseFloat(va) || 0; vb = parseFloat(vb) || 0;
      return asc ? va - vb : vb - va;
    }
    if (k === 'contractEnd' || k === 'contractStart') {
      va = va ? new Date(va).getTime() : Infinity;
      vb = vb ? new Date(vb).getTime() : Infinity;
      return asc ? va - vb : vb - va;
    }
    return asc
      ? String(va).localeCompare(String(vb), 'de')
      : String(vb).localeCompare(String(va), 'de');
  });
}

/** Konto anhand ID */
function getAccount(id) {
  return S.accounts.find(a => a.id === id) || null;
}

/** Label für Konto-ID */
function accLabel(id) {
  const a = getAccount(id);
  return a ? a.label : '—';
}

const MONTHS   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MONTHS_S = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const ZAHLTAG  = 15;
const VISA_DAY = 25;
const DONUT_COLORS = ['#4d9eff','#ff4d6a','#00e5a0','#ffb547','#7b5fff','#00d4cc','#ff8c42','#c084fc'];