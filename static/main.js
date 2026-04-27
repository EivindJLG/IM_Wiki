const state = {
  isAdmin: false,
  currentUser: null,
  pages: [],
  users: [
    { id: 1, name: 'Admin',         username: 'admin', password: 'im2026', role: 'Superadmin' },
    { id: 2, name: 'Tord', username: 'Toast', password: 'Toast1', role: 'Lærer' },
    { id: 3, name: 'Nikita Fedoseev', username: 'MrFenik', password: '67', role: 'Elev' }
  ],
  activity: [],
  editingId: null,
  confirmCallback: null,
  activeAdminPanel: 'dashboard',
  activeCat: 'alle',
};

const CATS = {
  'Programmering': { color: '#00cfff', icon: '⌥', bg: 'rgba(0,207,255,0.09)', border: 'rgba(0,207,255,0.3)' },
  'Nettverk':      { color: '#00e87a', icon: '⌘', bg: 'rgba(0,232,122,0.09)', border: 'rgba(0,232,122,0.3)' },
  'Media':         { color: '#ff4da6', icon: '◉', bg: 'rgba(255,77,166,0.09)', border: 'rgba(255,77,166,0.3)' },
  'Design':        { color: '#ffb340', icon: '◈', bg: 'rgba(255,179,64,0.09)',  border: 'rgba(255,179,64,0.3)' },
  'Database':      { color: '#b78cfc', icon: '⊞', bg: 'rgba(183,140,252,0.09)', border: 'rgba(183,140,252,0.3)' },
  'Annet':         { color: '#7e8ba0', icon: '…', bg: 'rgba(126,139,160,0.09)', border: 'rgba(126,139,160,0.3)' },
};

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  showLogin();
  bindEvents();
  renderTopbar();
});

if (localStorage.getItem('username'));

function bindEvents() {
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-pass').focus(); });
  document.getElementById('cp-title').addEventListener('input', function () { if (!state.editingId) document.getElementById('cp-slug').value = slugify(this.value); });
  document.getElementById('cp-content').addEventListener('input', () => { if (document.getElementById('preview-box').classList.contains('visible')) renderPreview(); });
  document.getElementById('search-input-student').addEventListener('input', doStudentSearch);
  document.getElementById('modal-create').addEventListener('click', e => { if (e.target === document.getElementById('modal-create')) closeCreate(); });
  document.getElementById('modal-user').addEventListener('click', e => { if (e.target === document.getElementById('modal-user')) closeUserModal(); });
}

/* ── AUTH ── */
function showLogin() {
  document.getElementById('view-login').style.display = 'flex';
  document.getElementById('view-admin').style.display = 'none';
  document.getElementById('view-student').style.display = 'none';
  document.getElementById('topbar').style.display = 'flex';
  setTimeout(() => document.getElementById('login-user').focus(), 50);
}

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const match = state.users.find(x => x.username === u && x.password === p);
  const err = document.getElementById('login-error');
  if (match) {
    err.style.display = 'none';
    state.isAdmin = true;
    state.currentUser = match;
    document.getElementById('view-login').style.display = 'none';
    showAdmin();
    toast(`Velkommen, ${match.name}!`, 'success');
    logActivity(`${match.name} logget inn`);
  } else {
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
}

function doLogout() {
  logActivity(`${state.currentUser.name} logget ut`);
  state.isAdmin = false;
  state.currentUser = null;
  document.getElementById('view-admin').style.display = 'none';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  showLogin();
  renderTopbar();
}

/* ── TOPBAR ── */
function renderTopbar() {
  document.getElementById('tb-right').innerHTML = `<button class="btn btn-ghost" onclick="showLogin()">Logg inn</button>`;
}

function renderTopbarAdmin() {
  const u = state.currentUser;
  const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('tb-right').innerHTML = `
    <div class="tb-user-chip">
      <div class="tb-avatar">${initials}</div>
      <span>${u.name}</span>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="doLogout()">Logg ut</button>
  `;
}

/* ── ADMIN ── */
function showAdmin() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-student').style.display = 'none';
  document.getElementById('view-admin').style.display = 'flex';
  renderTopbarAdmin();
  document.getElementById('strip-username').textContent = state.currentUser.name;
  switchPanel('dashboard');
}

function switchPanel(panel) {
  state.activeAdminPanel = panel;
  document.querySelectorAll('.sb-item').forEach(el => el.classList.toggle('active', el.dataset.panel === panel));
  document.querySelectorAll('.admin-panel').forEach(el => el.style.display = el.id === 'panel-' + panel ? 'block' : 'none');
  if (panel === 'dashboard') renderDashboard();
  if (panel === 'pages')     renderPagesPanel();
  if (panel === 'users')     renderUsersPanel();
}

function renderDashboard() {
  const week = new Date(); week.setDate(week.getDate() - 7);
  document.getElementById('dash-stat-total').textContent = state.pages.length;
  document.getElementById('dash-stat-cats').textContent = Object.keys(CATS).length;
  document.getElementById('dash-stat-new').textContent = state.pages.filter(p => new Date(p.date) >= week).length;
  document.getElementById('dash-stat-users').textContent = state.users.length;
  const feed = document.getElementById('activity-feed');
  if (!state.activity.length) {
    feed.innerHTML = `<div class="empty-state"><div class="empty-title">// ingen aktivitet ennå</div></div>`;
    return;
  }
  feed.innerHTML = state.activity.slice().reverse().slice(0, 12).map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color || 'var(--accent)'}"></div>
      <div class="activity-msg">${a.msg}</div>
      <div class="activity-time">${a.time}</div>
    </div>`).join('');
}

function renderPagesPanel() {
  updateSbCounts();
  const tbody = document.getElementById('pages-tbody');
  const filtered = state.activeCat === 'alle' ? state.pages : state.pages.filter(p => p.cat === state.activeCat);
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <div class="empty-icon">◈</div>
      <div class="empty-title">// ingen sider ennå</div>
      <div class="empty-sub">Klikk «Ny side» for å komme i gang</div>
    </div></td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(p => {
    const cfg = CATS[p.cat] || CATS['Annet'];
    return `<tr>
      <td><div class="td-title">${p.title}</div><div class="td-slug">/${p.slug}</div></td>
      <td><span class="cat-tag" style="background:${cfg.bg};border-color:${cfg.border};color:${cfg.color}">${p.cat}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text2)">${p.author}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--text3)">${p.date}</td>
      <td><span class="badge ${p.published ? 'badge-green' : 'badge-ghost'}">${p.published ? 'Publisert' : 'Utkast'}</span></td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="editPage(${p.id})">Rediger</button>
        <button class="btn btn-ghost btn-sm" onclick="togglePublish(${p.id})">${p.published ? 'Avpubliser' : 'Publiser'}</button>
        <button class="btn btn-red btn-sm" onclick="confirmDelete(${p.id})">Slett</button>
      </div></td>
    </tr>`;
  }).join('');
}

function filterPagesPanel(cat) {
  state.activeCat = cat;
  document.querySelectorAll('#pages-cat-filter .filter-btn').forEach(b => b.classList.toggle('active-filter', b.dataset.cat === cat));
  renderPagesPanel();
}

function togglePublish(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  p.published = !p.published;
  logActivity(`${state.currentUser.name} ${p.published ? 'publiserte' : 'avpubliserte'} «${p.title}»`, p.published ? '#00e87a' : '#7e8ba0');
  renderPagesPanel();
  toast(p.published ? 'Side publisert' : 'Side avpublisert', p.published ? 'success' : '');
}

function renderUsersPanel() {
  document.getElementById('users-grid').innerHTML = state.users.map(u => {
    const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['var(--accent)', 'var(--green)', 'var(--amber)', 'var(--purple)'];
    const c = colors[u.id % colors.length];
    return `<div class="user-card">
      <div class="user-avatar" style="background:rgba(0,0,0,0.3);border:1px solid ${c};color:${c}">${initials}</div>
      <div>
        <div class="user-name">${u.name}</div>
        <div class="user-role">${u.role} · @${u.username}</div>
        <div class="user-role" style="margin-top:2px">${state.pages.filter(p => p.author === u.name).length} sider</div>
      </div>
      <div class="user-actions">
        ${u.id !== 1 ? `<button class="btn btn-red btn-sm btn-icon" onclick="confirmDeleteUser(${u.id})">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

/* ── CREATE / EDIT ── */
function openCreate() {
  state.editingId = null;
  document.getElementById('cp-title').value = '';
  document.getElementById('cp-slug').value = '';
  document.getElementById('cp-cat').value = 'Programmering';
  document.getElementById('cp-content').value = '';
  document.getElementById('cp-tags').value = '';
  document.getElementById('cp-published').checked = false;
  document.getElementById('modal-title-text').textContent = '// ny_side.md';
  document.getElementById('preview-box').classList.remove('visible');
  document.getElementById('modal-create').classList.add('open');
  setTimeout(() => document.getElementById('cp-title').focus(), 80);
}

function editPage(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  state.editingId = id;
  document.getElementById('cp-title').value = p.title;
  document.getElementById('cp-slug').value = p.slug;
  document.getElementById('cp-cat').value = p.cat;
  document.getElementById('cp-content').value = p.content;
  document.getElementById('cp-tags').value = p.tags.join(', ');
  document.getElementById('cp-published').checked = p.published;
  document.getElementById('modal-title-text').textContent = '// rediger_side.md';
  document.getElementById('preview-box').classList.remove('visible');
  document.getElementById('modal-create').classList.add('open');
  setTimeout(() => document.getElementById('cp-title').focus(), 80);
}

function closeCreate() {
  document.getElementById('modal-create').classList.remove('open');
  state.editingId = null;
}

function savePage() {
  const title   = document.getElementById('cp-title').value.trim();
  const slug    = document.getElementById('cp-slug').value.trim() || slugify(title);
  const cat     = document.getElementById('cp-cat').value;
  const content = document.getElementById('cp-content').value.trim();
  const tags    = document.getElementById('cp-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const pub     = document.getElementById('cp-published').checked;
  if (!title)   { toast('Tittel er påkrevd', 'error'); return; }
  if (!content) { toast('Innhold er påkrevd', 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  if (state.editingId) {
    const p = state.pages.find(x => x.id === state.editingId);
    Object.assign(p, { title, slug, cat, content, tags, published: pub, updated: today });
    logActivity(`${state.currentUser.name} redigerte «${title}»`, 'var(--amber)');
    toast('Side oppdatert', 'success');
  } else {
    state.pages.unshift({ id: Date.now(), title, slug, cat, content, tags, published: pub, author: state.currentUser.name, date: today, updated: null });
    logActivity(`${state.currentUser.name} opprettet «${title}»`, 'var(--accent)');
    toast('Side opprettet!', 'success');
  }
  closeCreate();
  renderPagesPanel();
  updateSbCounts();
  if (state.activeAdminPanel === 'dashboard') renderDashboard();
}

/* ── DELETE ── */
function confirmDelete(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  document.getElementById('confirm-msg').textContent = `Er du sikker på at du vil slette «${p.title}»? Dette kan ikke angres.`;
  state.confirmCallback = () => {
    logActivity(`${state.currentUser.name} slettet «${p.title}»`, 'var(--red)');
    state.pages = state.pages.filter(x => x.id !== id);
    renderPagesPanel(); updateSbCounts(); toast('Side slettet');
    if (state.activeAdminPanel === 'dashboard') renderDashboard();
  };
  document.getElementById('modal-confirm').classList.add('open');
}

function doConfirm() { if (state.confirmCallback) state.confirmCallback(); state.confirmCallback = null; document.getElementById('modal-confirm').classList.remove('open'); }
function cancelConfirm() { state.confirmCallback = null; document.getElementById('modal-confirm').classList.remove('open'); }

function confirmDeleteUser(id) {
  const u = state.users.find(x => x.id === id);
  if (!u) return;
  document.getElementById('confirm-msg').textContent = `Slett brukeren «${u.name}» (@${u.username})?`;
  state.confirmCallback = () => { state.users = state.users.filter(x => x.id !== id); renderUsersPanel(); toast('Bruker slettet'); };
  document.getElementById('modal-confirm').classList.add('open');
}

/* ── ADD USER ── */
function openUserModal() {
  document.getElementById('nu-name').value = '';
  document.getElementById('nu-user').value = '';
  document.getElementById('nu-pass').value = '';
  document.getElementById('nu-role').value = 'Lærer';
  document.getElementById('modal-user').classList.add('open');
  setTimeout(() => document.getElementById('nu-name').focus(), 80);
}
function closeUserModal() { document.getElementById('modal-user').classList.remove('open'); }
function saveUser() {
  const name = document.getElementById('nu-name').value.trim();
  const user = document.getElementById('nu-user').value.trim();
  const pass = document.getElementById('nu-pass').value;
  const role = document.getElementById('nu-role').value;
  if (!name || !user || !pass) { toast('Alle felt er påkrevd', 'error'); return; }
  if (state.users.find(u => u.username === user)) { toast('Brukernavn er allerede i bruk', 'error'); return; }
  state.users.push({ id: Date.now(), name, username: user, password: pass, role });
  closeUserModal(); renderUsersPanel();
  toast('Bruker opprettet!', 'success');
  logActivity(`Ny bruker lagt til: ${name} (${role})`, 'var(--green)');
}

/* ── MARKDOWN EDITOR ── */
function insertMd(before, after = '') {
  const ta = document.getElementById('cp-content');
  const start = ta.selectionStart, end = ta.selectionEnd;
  const sel = ta.value.slice(start, end);
  ta.value = ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
  ta.selectionStart = start + before.length;
  ta.selectionEnd = start + before.length + sel.length;
  ta.focus();
  if (document.getElementById('preview-box').classList.contains('visible')) renderPreview();
}
function togglePreview() {
  const box = document.getElementById('preview-box');
  const btn = document.getElementById('btn-preview');
  box.classList.toggle('visible');
  btn.textContent = box.classList.contains('visible') ? 'Editor' : 'Forhåndsvisning';
  if (box.classList.contains('visible')) renderPreview();
}
function renderPreview() { document.getElementById('preview-content').innerHTML = parseMd(document.getElementById('cp-content').value); }

/* ── STUDENT VIEW ── */
function showStudentView() {
  document.getElementById('view-admin').style.display = 'none';
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-student').style.display = 'block';
  document.getElementById('tb-right').innerHTML = `<button class="btn btn-ghost" onclick="showLogin()">Logg inn</button>`;
  renderStudentView();
}

function renderStudentView() { renderStudentSidebar(); showStudentCat('alle'); }

function renderStudentSidebar() {
  const sb = document.getElementById('student-sidebar-links');
  sb.innerHTML = `<a class="sb-item active" data-cat="alle" onclick="showStudentCat('alle')">
    <span class="sb-dot"></span> Alle sider <span class="sb-count">${state.pages.filter(p => p.published).length}</span>
  </a>` + Object.entries(CATS).map(([name, cfg]) => {
    const count = state.pages.filter(p => p.published && p.cat === name).length;
    return `<a class="sb-item" data-cat="${name}" onclick="showStudentCat('${name}')">
      <span class="sb-dot" style="background:${cfg.color}"></span> ${name} <span class="sb-count">${count}</span>
    </a>`;
  }).join('');
}

function showStudentCat(cat) {
  document.querySelectorAll('#student-sidebar-links .sb-item').forEach(el => el.classList.toggle('active', el.dataset.cat === cat));
  const pub = state.pages.filter(p => p.published && (cat === 'alle' || p.cat === cat));
  const grid = document.getElementById('student-page-grid');
  document.getElementById('student-article-view').style.display = 'none';
  grid.style.display = 'grid';
  document.getElementById('student-cat-title').textContent = cat === 'alle' ? 'Alle sider' : cat;
  if (!pub.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">◈</div>
      <div class="empty-title">// ingen publiserte sider</div>
      <div class="empty-sub">Lærere publiserer sider i admin-panelet</div>
    </div>`;
    return;
  }
  grid.innerHTML = pub.map(p => {
    const cfg = CATS[p.cat] || CATS['Annet'];
    return `<a class="page-card" style="--cat-color:${cfg.color}" onclick="showStudentArticle(${p.id})">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="color:${cfg.color};font-size:14px">${cfg.icon}</span>
        <span class="cat-tag" style="background:${cfg.bg};border-color:${cfg.border};color:${cfg.color}">${p.cat}</span>
      </div>
      <div class="page-card-title">${p.title}</div>
      <div class="page-card-meta">
        <span class="page-card-author">${p.author}</span>
        <span class="page-card-author">· ${p.date}</span>
      </div>
    </a>`;
  }).join('');
}

function showStudentArticle(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  const cfg = CATS[p.cat] || CATS['Annet'];
  document.getElementById('student-page-grid').style.display = 'none';
  const av = document.getElementById('student-article-view');
  av.style.display = 'block';
  av.innerHTML = `
    <div class="article-wrap">
      <div class="article-bc">
        <a href="#" onclick="showStudentCat('alle');return false">hjem</a>
        <span class="sep">/</span>
        <a href="#" onclick="showStudentCat('${p.cat}');return false">${p.cat}</a>
        <span class="sep">/</span>
        <span>${p.slug}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span class="cat-tag" style="background:${cfg.bg};border-color:${cfg.border};color:${cfg.color}">${p.cat}</span>
      </div>
      <h1 class="article-h1">${p.title}</h1>
      <div class="article-meta"><span>av ${p.author}</span><span>${p.date}</span></div>
      <div class="article-body">${parseMd(p.content)}</div>
      ${p.tags.length ? `<div style="margin-top:24px;display:flex;gap:6px;flex-wrap:wrap">${p.tags.map(t => `<span class="badge badge-ghost">${t}</span>`).join('')}</div>` : ''}
    </div>`;
}

function doStudentSearch() {
  const q = document.getElementById('search-input-student').value.trim().toLowerCase();
  if (!q) { renderStudentView(); return; }
  const res = state.pages.filter(p => p.published && (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))));
  document.getElementById('student-page-grid').style.display = 'grid';
  document.getElementById('student-article-view').style.display = 'none';
  document.getElementById('student-cat-title').textContent = `Søk: "${q}"`;
  const grid = document.getElementById('student-page-grid');
  if (!res.length) { grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-title">// ingen treff for "${q}"</div></div>`; return; }
  grid.innerHTML = res.map(p => {
    const cfg = CATS[p.cat] || CATS['Annet'];
    return `<a class="page-card" style="--cat-color:${cfg.color}" onclick="showStudentArticle(${p.id})">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="color:${cfg.color}">${cfg.icon}</span>
        <span class="cat-tag" style="background:${cfg.bg};border-color:${cfg.border};color:${cfg.color}">${p.cat}</span>
      </div>
      <div class="page-card-title">${p.title}</div>
      <div class="page-card-meta"><span class="page-card-author">${p.author} · ${p.date}</span></div>
    </a>`;
  }).join('');
}

/* ── COUNTS ── */
function updateSbCounts() {
  document.getElementById('sb-count-alle').textContent = state.pages.length;
  Object.keys(CATS).forEach(c => {
    const el = document.getElementById('sb-count-' + c.toLowerCase());
    if (el) el.textContent = state.pages.filter(p => p.cat === c).length;
  });
}

/* ── ACTIVITY ── */
function logActivity(msg, color) {
  const time = new Date().toLocaleTimeString('no', { hour: '2-digit', minute: '2-digit' });
  state.activity.push({ msg, color: color || 'var(--accent)', time });
  if (state.activeAdminPanel === 'dashboard') renderDashboard();
}

/* ── TOAST ── */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 2800);
  setTimeout(() => el.remove(), 3200);
}

/* ── MARKDOWN ── */
function parseMd(md) {
  return md
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--mono);font-size:13px;color:var(--text);margin:18px 0 7px;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text);font-weight:500">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .split('\n\n')
    .map(block => (block.startsWith('<h') || block.startsWith('<pre')) ? block : `<p>${block.replace(/\n/g, ' ')}</p>`)
    .join('\n');
}

/* ── HELPERS ── */
function slugify(str) {
  return str.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
}