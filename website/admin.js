/* ═══════════════════════════════════════════════
   SAHARLA FOUNDATION — Admin JS v3 (Live DB)
═══════════════════════════════════════════════ */
'use strict';

const API = 'api.php';

/* ── Helpers ─────────────────────────────── */
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function fmtDate(s) { return new Date(s+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }

function toast(msg, type='ok') {
  const t = document.getElementById('toast');
  t.innerHTML = `<i class="fas fa-${type==='ok'?'check':'times'}-circle"></i> ${msg}`;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

async function api(method, params = '', body = null) {
  const url = API + (params ? '?' + params : '');
  const opts = { method, credentials: 'same-origin' };
  if (body && !(body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body;
  }
  const res = await fetch(url, opts);
  return res.json();
}

/* ── Auth ────────────────────────────────── */
const loginScreen = document.getElementById('loginScreen');
const shell       = document.getElementById('shell');

// Check if already authenticated
api('GET', 'action=check').then(r => {
  if (r.authenticated) { loginScreen.style.display='none'; shell.style.display='flex'; boot(); }
});

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const u = document.getElementById('lu').value.trim();
  const p = document.getElementById('lp').value;
  const r = await api('POST', 'action=login', { username: u, password: p });
  if (r.ok) {
    document.getElementById('lerr').style.display = 'none';
    loginScreen.style.display = 'none'; shell.style.display = 'flex'; boot();
  } else {
    document.getElementById('lerr').style.display = 'flex';
    document.getElementById('lp').value = '';
  }
});

document.getElementById('pwEye').addEventListener('click', function() {
  const inp = document.getElementById('lp');
  const icon = this.querySelector('i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
});

document.getElementById('logout').addEventListener('click', async () => {
  await api('POST', 'action=logout');
  shell.style.display = 'none'; loginScreen.style.display = 'flex';
});

/* ── Sidebar nav ─────────────────────────── */
function boot() {
  loadTable();
  document.querySelectorAll('.sbn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sbn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const panel = document.getElementById('panel-' + btn.dataset.panel);
      if (panel) panel.style.display = 'block';
      const titles = {
        events: ['Events & News Manager', 'Add events with photos and reports — they publish instantly to your live website'],
        howto:  ['How Your CMS Works',    'Guide to managing events and publishing content']
      };
      const t = titles[btn.dataset.panel];
      if (t) { document.getElementById('panelTitle').textContent = t[0]; document.getElementById('panelSub').textContent = t[1]; }
    });
  });
}

/* ── Table ───────────────────────────────── */
async function loadTable() {
  const tbody = document.getElementById('etbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280"><i class="fas fa-spinner fa-spin"></i> Loading…</td></tr>';
  const data = await api('GET');
  updateStats(data);
  tbody.innerHTML = '';
  if (!Array.isArray(data) || !data.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#6b7280">No events yet. Click Add New above.</td></tr>';
    return;
  }
  data.forEach(ev => {
    const tr = document.createElement('tr');
    const thumb = ev.photo
      ? `<img src="${esc(ev.photo)}" class="tbl-thumb" alt=""/>`
      : `<div class="tbl-thumb-empty"><i class="fas fa-image"></i></div>`;
    tr.innerHTML = `
      <td>${thumb}</td>
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
  tbody.querySelectorAll('.ibtn.del').forEach(b  => b.addEventListener('click', () => openDel(+b.dataset.id, b.closest('tr').querySelector('.td-t').textContent.trim())));
}

function updateStats(data) {
  if (!Array.isArray(data)) return;
  document.getElementById('stTotal').textContent    = data.length;
  document.getElementById('stEvents').textContent   = data.filter(e=>e.type==='event').length;
  document.getElementById('stNews').textContent     = data.filter(e=>e.type==='news').length;
  document.getElementById('stPrograms').textContent = data.filter(e=>e.type==='program').length;
}

/* ── Photo upload ────────────────────────── */
const photoArea        = document.getElementById('photoArea');
const photoInput       = document.getElementById('evPhoto');
const photoPreview     = document.getElementById('photoPreview');
const photoPlaceholder = document.getElementById('photoPlaceholder');
const photoClear       = document.getElementById('photoClear');
const photoUrlInput    = document.getElementById('evPhotoUrl');

photoArea.addEventListener('click', e => {
  if (e.target === photoClear || photoClear.contains(e.target)) return;
  photoInput.click();
});

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    photoPreview.src = e.target.result;
    photoPreview.style.display = 'block';
    photoPlaceholder.style.display = 'none';
    photoClear.style.display = 'flex';
    photoUrlInput.value = '';
  };
  reader.readAsDataURL(file);
});

photoClear.addEventListener('click', e => {
  e.stopPropagation();
  resetPhoto();
});

function resetPhoto(url = '') {
  photoInput.value = '';
  photoUrlInput.value = url;
  if (url) {
    photoPreview.src = url;
    photoPreview.style.display = 'block';
    photoPlaceholder.style.display = 'none';
    photoClear.style.display = 'flex';
  } else {
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    photoPlaceholder.style.display = 'flex';
    photoClear.style.display = 'none';
  }
}

/* ── Add / Edit modal ────────────────────── */
const overlay    = document.getElementById('overlay');
const evForm     = document.getElementById('evForm');
const modalTitle = document.getElementById('modalTitle');
let editingData  = null;

function openAdd() {
  editingData = null;
  modalTitle.textContent = 'Add New Event / News';
  evForm.reset();
  document.getElementById('evId').value = '';
  document.getElementById('evDate').value = new Date().toISOString().slice(0,10);
  resetPhoto();
  overlay.style.display = 'flex';
}

async function openEdit(id) {
  const ev = await api('GET', 'id=' + id);
  if (ev.error) return;
  editingData = ev;
  modalTitle.textContent = 'Edit Event';
  document.getElementById('evId').value     = ev.id;
  document.getElementById('evTitle').value  = ev.title;
  document.getElementById('evDate').value   = ev.date;
  document.getElementById('evType').value   = ev.type;
  document.getElementById('evCat').value    = ev.category || '';
  document.getElementById('evLoc').value    = ev.location || '';
  document.getElementById('evDesc').value   = ev.description;
  document.getElementById('evReport').value = ev.report_url || '';
  resetPhoto(ev.photo || '');
  overlay.style.display = 'flex';
}

function closeModal() { overlay.style.display = 'none'; evForm.reset(); resetPhoto(); editingData = null; }

document.getElementById('openAdd').addEventListener('click', openAdd);
document.getElementById('mclose').addEventListener('click', closeModal);
document.getElementById('mcancel').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

evForm.addEventListener('submit', async e => {
  e.preventDefault();
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const idVal = document.getElementById('evId').value;

  // If new photo file selected, upload it first
  let photoPath = document.getElementById('evPhotoUrl').value || (editingData?.photo || '');
  if (photoInput.files[0]) {
    const fd = new FormData();
    fd.append('photo', photoInput.files[0]);
    const up = await api('POST', 'action=upload', fd);
    if (up.photo) photoPath = up.photo;
  }

  const payload = {
    title:       document.getElementById('evTitle').value.trim(),
    date:        document.getElementById('evDate').value,
    type:        document.getElementById('evType').value,
    category:    document.getElementById('evCat').value.trim(),
    location:    document.getElementById('evLoc').value.trim(),
    description: document.getElementById('evDesc').value.trim(),
    report_url:  document.getElementById('evReport').value.trim(),
    photo:       photoPath,
  };

  let result;
  if (idVal) {
    result = await api('PUT', 'id=' + idVal, payload);
  } else {
    result = await api('POST', '', payload);
  }

  saveBtn.disabled = false;
  saveBtn.innerHTML = '<i class="fas fa-save"></i> Save & Publish';

  if (result.ok) {
    toast(idVal ? 'Event updated and live!' : 'Event published live!');
    closeModal();
    loadTable();
  } else {
    toast('Error saving event. Check your connection.', 'err');
  }
});

/* ── Delete modal ────────────────────────── */
const delOverlay = document.getElementById('delOverlay');
let delId = null;

function openDel(id, title) {
  delId = id;
  document.getElementById('delTitle').textContent = title;
  delOverlay.style.display = 'flex';
}
function closeDel() { delOverlay.style.display = 'none'; delId = null; }

document.getElementById('delCancel').addEventListener('click', closeDel);
delOverlay.addEventListener('click', e => { if (e.target === delOverlay) closeDel(); });
document.getElementById('delConfirm').addEventListener('click', async () => {
  if (!delId) return;
  const r = await api('DELETE', 'id=' + delId);
  if (r.ok) {
    toast('Deleted successfully.', 'err');
    loadTable();
  } else {
    toast('Error deleting. Try again.', 'err');
  }
  closeDel();
});
