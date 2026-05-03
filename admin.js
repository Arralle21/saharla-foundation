/* ═══════════════════════════════════════════════
   SAHARLA FOUNDATION — Admin JS v2
   Events stored locally, exported as events.json
═══════════════════════════════════════════════ */
'use strict';

const CREDS = { u: 'admin', p: 'saharla2024' };
const KEY   = 'sf_events_v2';

const DEFAULT = [
  { id:1, title:"GBV Awareness Training Workshop", description:"A 20-day workshop providing GBV awareness training to community leaders and health workers across Sool region.", date:"2024-03-15", location:"Lasanod, Sool Region", type:"event", category:"Women Empowerment" },
  { id:2, title:"Teacher Training Program – Sanaag Schools", description:"Targeted training for teachers in conflict-affected schools to enhance instruction quality and support displaced students.", date:"2024-04-08", location:"Erigavo, Sanaag", type:"program", category:"Education" },
  { id:3, title:"GBV Research Publication Released", description:"Saharla Foundation releases findings from its comprehensive GBV Prevalence, Vulnerability, and Psychological Trauma Assessment.", date:"2024-04-20", location:"Mogadishu, Somalia", type:"news", category:"Research" },
  { id:4, title:"Youth Vocational Training Graduation", description:"Graduation ceremony for 60 youth participants who completed vocational training in carpentry, tailoring, and mobile phone repair.", date:"2024-05-12", location:"Cayn Region", type:"event", category:"Youth Development" },
  { id:5, title:"Community Tree-Planting Drive", description:"Community-wide reforestation initiative with over 500 trees planted by youth volunteers and school children.", date:"2024-06-03", location:"Sool & Sanaag", type:"program", category:"Climate Resilience" },
  { id:6, title:"Women Empowerment Research Phase 2", description:"Saharla Foundation launches Phase 2 study: Empowering Women and Girls in Conflict-Affected Areas across SSC regions.", date:"2024-06-22", location:"SSC Regions", type:"news", category:"Research" }
];

/* ── Helpers ─────────────────────────────── */
function get()       { try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT; } catch { return DEFAULT; } }
function save(d)     { localStorage.setItem(KEY, JSON.stringify(d)); }
function nextId(d)   { return d.length ? Math.max(...d.map(e => e.id)) + 1 : 1; }
function esc(s)      { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(s)  { return new Date(s+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }

function toast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="fas fa-${type==='ok'?'check':'times'}-circle"></i> ${msg}`;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Auth ────────────────────────────────── */
const loginScreen = document.getElementById('loginScreen');
const shell       = document.getElementById('shell');

if (sessionStorage.getItem('sf_admin') === '1') {
  loginScreen.style.display = 'none'; shell.style.display = 'flex'; boot();
}

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('lu').value.trim();
  const p = document.getElementById('lp').value;
  if (u === CREDS.u && p === CREDS.p) {
    sessionStorage.setItem('sf_admin','1');
    document.getElementById('lerr').style.display = 'none';
    loginScreen.style.display = 'none'; shell.style.display = 'flex'; boot();
  } else {
    document.getElementById('lerr').style.display = 'flex';
    document.getElementById('lp').value = '';
  }
});

document.getElementById('pwEye').addEventListener('click', function() {
  const inp  = document.getElementById('lp');
  const icon = this.querySelector('i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

document.getElementById('logout').addEventListener('click', () => {
  sessionStorage.removeItem('sf_admin');
  shell.style.display = 'none'; loginScreen.style.display = 'flex';
});

/* ── Sidebar nav ─────────────────────────── */
function boot() {
  renderTable(); updateStats();
  document.querySelectorAll('.sbn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sbn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.panel);
      if (panel) panel.style.display = 'block';
      const titles = {
        events: ['Events & News Manager', 'Add or remove events — then download and upload events.json to Hostinger'],
        howto:  ['How To Upload Events',  'Step-by-step guide to publish events on your live website']
      };
      const t = titles[btn.dataset.panel];
      if (t) { document.getElementById('panelTitle').textContent = t[0]; document.getElementById('panelSub').textContent = t[1]; }
    });
  });
}

/* ── Table ───────────────────────────────── */
function renderTable() {
  const tbody = document.getElementById('etbody');
  const data  = get();
  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#6b7280">No events yet. Click Add New above.</td></tr>';
    return;
  }
  [...data].sort((a,b) => new Date(b.date)-new Date(a.date)).forEach(ev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-t">${esc(ev.title)}<small>${esc((ev.description||'').substring(0,55))}…</small></td>
      <td>${fmtDate(ev.date)}</td>
      <td><span class="tbadge ${esc(ev.type)}">${esc(ev.type)}</span></td>
      <td>${esc(ev.category||'—')}</td>
      <td>${esc(ev.location||'—')}</td>
      <td><div class="td-acts">
        <button class="ibtn edit" data-id="${ev.id}" title="Edit"><i class="fas fa-pencil"></i></button>
        <button class="ibtn del"  data-id="${ev.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('.ibtn.edit').forEach(b => b.addEventListener('click', () => openEdit(+b.dataset.id)));
  tbody.querySelectorAll('.ibtn.del').forEach(b  => b.addEventListener('click', () => openDel(+b.dataset.id)));
}

function updateStats() {
  const d = get();
  document.getElementById('stTotal').textContent    = d.length;
  document.getElementById('stEvents').textContent   = d.filter(e=>e.type==='event').length;
  document.getElementById('stNews').textContent     = d.filter(e=>e.type==='news').length;
  document.getElementById('stPrograms').textContent = d.filter(e=>e.type==='program').length;
}

/* ── Download events.json ────────────────── */
document.getElementById('downloadJson').addEventListener('click', () => {
  const json = JSON.stringify(get(), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'events.json' });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('events.json downloaded! Upload it to Hostinger public_html folder.');
});

/* ── Reset ───────────────────────────────── */
document.getElementById('resetData').addEventListener('click', () => {
  if (confirm('Reset all events to the default sample data?')) {
    save(DEFAULT); renderTable(); updateStats();
    toast('Reset to default events.');
  }
});

/* ── Add / Edit modal ────────────────────── */
const overlay    = document.getElementById('overlay');
const evForm     = document.getElementById('evForm');
const modalTitle = document.getElementById('modalTitle');

function openAdd() {
  modalTitle.textContent = 'Add New Event / News';
  evForm.reset();
  document.getElementById('evId').value = '';
  document.getElementById('evDate').value = new Date().toISOString().slice(0,10);
  overlay.style.display = 'flex';
}
function openEdit(id) {
  const ev = get().find(e => e.id === id);
  if (!ev) return;
  modalTitle.textContent = 'Edit Event';
  document.getElementById('evId').value    = ev.id;
  document.getElementById('evTitle').value = ev.title;
  document.getElementById('evDate').value  = ev.date;
  document.getElementById('evType').value  = ev.type;
  document.getElementById('evCat').value   = ev.category || '';
  document.getElementById('evLoc').value   = ev.location || '';
  document.getElementById('evDesc').value  = ev.description;
  overlay.style.display = 'flex';
}
function closeModal() { overlay.style.display = 'none'; evForm.reset(); }

document.getElementById('openAdd').addEventListener('click', openAdd);
document.getElementById('mclose').addEventListener('click', closeModal);
document.getElementById('mcancel').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

evForm.addEventListener('submit', e => {
  e.preventDefault();
  const data  = get();
  const idVal = document.getElementById('evId').value;
  const payload = {
    title:       document.getElementById('evTitle').value.trim(),
    date:        document.getElementById('evDate').value,
    type:        document.getElementById('evType').value,
    category:    document.getElementById('evCat').value.trim(),
    location:    document.getElementById('evLoc').value.trim(),
    description: document.getElementById('evDesc').value.trim(),
  };
  if (idVal) {
    const i = data.findIndex(e => e.id === +idVal);
    if (i !== -1) data[i] = { ...data[i], ...payload };
    toast('Event updated! Download JSON to publish.');
  } else {
    payload.id = nextId(data);
    data.push(payload);
    toast('Event added! Download JSON to publish.');
  }
  save(data); renderTable(); updateStats(); closeModal();
});

/* ── Delete modal ────────────────────────── */
const delOverlay = document.getElementById('delOverlay');
let delId = null;

function openDel(id) {
  const ev = get().find(e => e.id === id);
  if (!ev) return;
  delId = id;
  document.getElementById('delTitle').textContent = ev.title;
  delOverlay.style.display = 'flex';
}
function closeDel() { delOverlay.style.display = 'none'; delId = null; }

document.getElementById('delCancel').addEventListener('click', closeDel);
delOverlay.addEventListener('click', e => { if (e.target === delOverlay) closeDel(); });
document.getElementById('delConfirm').addEventListener('click', () => {
  if (!delId) return;
  save(get().filter(e => e.id !== delId));
  renderTable(); updateStats();
  toast('Deleted. Download JSON to publish.', 'err');
  closeDel();
});
