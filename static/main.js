const state = {
  isAdmin: false,
  currentUser: null,
  pages: [],
  users: [
    { id: 1, username: 'admin', password: 'im2026', name: 'Admin' },
    { id: 2, username: 'Toast', password: 'Toast1', name: 'Tord' },
  ],
  editingId: null,
  confirmCallback: null,
  activePanel: 'dashboard',
  activeCat: 'alle',
};

/* ── INITIALIZER SIDEN ── */
document.addEventListener('DOMContentLoaded', () => {
  showLogin();
  document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('login-pass').focus(); });
  document.getElementById('modal-create').addEventListener('click', e => { if (e.target.id === 'modal-create') closeCreate(); });
  document.getElementById('modal-confirm').addEventListener('click', e => { if (e.target.id === 'modal-confirm') cancelConfirm(); });
});

/* ── DISPLAY FUNKSJONER ── */
function showLogin() {
  document.getElementById('view-login').style.display = '';
  document.getElementById('view-admin').style.display = 'none';
  document.getElementById('view-student').style.display = 'none';
  document.getElementById('tb-right').innerHTML = `<button onclick="showLogin()">Logg inn</button>`;
  setTimeout(() => document.getElementById('login-user').focus(), 50);
}
/* ── ADMIN SIDEN ── */
function showAdmin() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-admin').style.display = 'block';
  document.getElementById('view-student').style.display = 'none';
  document.getElementById('strip-username').textContent = state.currentUser.name;
  document.getElementById('tb-right').innerHTML = `<button onclick="doLogout()">Logg ut</button>`;
  switchPanel('dashboard');
}
/* ── STUDENT SIDEN ── */
function showStudentView() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-admin').style.display = 'none';
  document.getElementById('view-student').style.display = 'block';
  document.getElementById('tb-right').innerHTML = `<button onclick="showLogin()">Logg inn</button>`;
  document.getElementById('search-input').value = '';
  showCat('alle');
}

/* ── LOGIN FUNKSJON── */
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
    toast('Velkommen, ' + match.name + '!', 'success');
  } else {
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
}
/* --LOGOUT -- */
function doLogout() {
  state.isAdmin = false;
  state.currentUser = null;
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  showLogin();
}

/* ── ADMIN PANELS ── */
function switchPanel(panel) {
  state.activePanel = panel;
  document.querySelectorAll('#sidebar .sb-link').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('#sidebar .sb-link').forEach(el => {
    if (el.textContent.trim().startsWith(panel === 'dashboard' ? 'Dashboard' : 'Wiki')) el.classList.add('active');
  });
  document.getElementById('panel-dashboard').style.display = panel === 'dashboard' ? 'block' : 'none';
  document.getElementById('panel-pages').style.display = panel === 'pages' ? 'block' : 'none';
  if (panel === 'dashboard') renderDashboard();
  if (panel === 'pages') renderPages();
}

function renderDashboard() {
  document.getElementById('dash-total').textContent = state.pages.length;
  document.getElementById('dash-published').textContent = state.pages.filter(p => p.published).length;
  document.getElementById('sb-total').textContent = state.pages.length;
}

function renderPages() {
  document.getElementById('sb-total').textContent = state.pages.length;
  const tbody = document.getElementById('pages-tbody');
  const list = state.activeCat === 'alle' ? state.pages : state.pages.filter(p => p.cat === state.activeCat);
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">Ingen sider ennå. Klikk «+ Ny side» for å komme i gang.</div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><b>${p.title}</b></td>
      <td>${p.cat}</td>
      <td>${p.date}</td>
      <td><span class="badge ${p.published ? 'badge-green' : 'badge-gray'}">${p.published ? 'Publisert' : 'Utkast'}</span></td>
      <td><div class="td-actions">
        <button onclick="editPage(${p.id})">Rediger</button>
        <button onclick="togglePublish(${p.id})">${p.published ? 'Avpubliser' : 'Publiser'}</button>
        <button class="btn-danger" onclick="confirmDelete(${p.id})">Slett</button>
      </div></td>
    </tr>`).join('');
}

function filterCat(cat) {
  state.activeCat = cat;
  document.querySelectorAll('#cat-filters .filter').forEach(b => b.classList.toggle('active-filter', b.dataset.cat === cat));
  renderPages();
}

function togglePublish(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  p.published = !p.published;
  renderPages();
  renderDashboard();
  toast(p.published ? 'Side publisert' : 'Side avpublisert', p.published ? 'success' : '');
}

/* ── CREATE / EDIT ── */
function openCreate() {
  state.editingId = null;
  document.getElementById('cp-title').value = '';
  document.getElementById('cp-cat').value = 'Programmering';
  document.getElementById('cp-content').value = '';
  document.getElementById('cp-published').checked = false;
  document.getElementById('modal-title').textContent = 'Ny side';
  document.getElementById('modal-create').classList.add('open');
  setTimeout(() => document.getElementById('cp-title').focus(), 80);
}

function editPage(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  state.editingId = id;
  document.getElementById('cp-title').value = p.title;
  document.getElementById('cp-cat').value = p.cat;
  document.getElementById('cp-content').value = p.content;
  document.getElementById('cp-published').checked = p.published;
  document.getElementById('modal-title').textContent = 'Rediger side';
  document.getElementById('modal-create').classList.add('open');
  setTimeout(() => document.getElementById('cp-title').focus(), 80);
}

function closeCreate() {
  document.getElementById('modal-create').classList.remove('open');
  state.editingId = null;
}

function savePage() {
  const title   = document.getElementById('cp-title').value.trim();
  const cat     = document.getElementById('cp-cat').value;
  const content = document.getElementById('cp-content').value.trim();
  const pub     = document.getElementById('cp-published').checked;
  if (!title)   { toast('Tittel er påkrevd', 'error'); return; }
  if (!content) { toast('Innhold er påkrevd', 'error'); return; }
  const today = new Date().toISOString().split('T')[0];
  if (state.editingId) {
    const p = state.pages.find(x => x.id === state.editingId);
    Object.assign(p, { title, cat, content, published: pub });
    toast('Side oppdatert', 'success');
  } else {
    state.pages.unshift({ id: Date.now(), title, cat, content, published: pub, author: state.currentUser.name, date: today });
    toast('Side opprettet!', 'success');
  }
  closeCreate();
  renderPages();
  renderDashboard();
}

/* ── DELETE ── */
function confirmDelete(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  document.getElementById('confirm-msg').textContent = `Er du sikker på at du vil slette «${p.title}»?`;
  state.confirmCallback = () => {
    state.pages = state.pages.filter(x => x.id !== id);
    renderPages();
    renderDashboard();
    toast('Side slettet');
  };
  document.getElementById('modal-confirm').classList.add('open');
}

function doConfirm() {
  if (state.confirmCallback) state.confirmCallback();
  state.confirmCallback = null;
  document.getElementById('modal-confirm').classList.remove('open');
}

function cancelConfirm() {
  state.confirmCallback = null;
  document.getElementById('modal-confirm').classList.remove('open');
}

/* ── STUDENT VIEW ── */
function showCat(cat) {
  document.querySelectorAll('#student-sidebar .sb-link').forEach(el => el.classList.remove('active'));
  const links = document.querySelectorAll('#student-sidebar .sb-link');
  links.forEach(el => { if (el.textContent.trim() === (cat === 'alle' ? 'Alle sider' : cat)) el.classList.add('active'); });
  document.getElementById('cat-title').textContent = cat === 'alle' ? 'Alle sider' : cat;
  const pub = state.pages.filter(p => p.published && (cat === 'alle' || p.cat === cat));
  document.getElementById('article-view').style.display = 'none';
  document.getElementById('page-grid').style.display = 'grid';
  renderPageGrid(pub);
}

function renderPageGrid(pages) {
  const grid = document.getElementById('page-grid');
  if (!pages.length) {
    grid.innerHTML = `<div class="empty-state">Ingen publiserte sider i denne kategorien.</div>`;
    return;
  }
  grid.innerHTML = pages.map(p => `
    <div class="page-card" onclick="showArticle(${p.id})">
      <div class="page-card-cat">${p.cat}</div>
      <div class="page-card-title">${p.title}</div>
      <div class="page-card-meta">${p.author} · ${p.date}</div>
    </div>`).join('');
}

function showArticle(id) {
  const p = state.pages.find(x => x.id === id);
  if (!p) return;
  document.getElementById('page-grid').style.display = 'none';
  const av = document.getElementById('article-view');
  av.style.display = 'block';
  av.innerHTML = `
    <span class="article-back" onclick="showCat('alle')">← Tilbake</span>
    <div class="page-card-cat">${p.cat}</div>
    <h1 class="article-h1">${p.title}</h1>
    <div class="article-meta">Av ${p.author} · ${p.date}</div>
    <div class="article-body">${parseMd(p.content)}</div>`;
}

function doSearch() {
  const q = document.getElementById('search-input').value.trim().toLowerCase();
  if (!q) { showCat('alle'); return; }
  const res = state.pages.filter(p => p.published && (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)));
  document.getElementById('cat-title').textContent = `Søk: "${q}"`;
  document.getElementById('article-view').style.display = 'none';
  document.getElementById('page-grid').style.display = 'grid';
  renderPageGrid(res);
}

/* ── TOAST ── */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast-item ${type}`;
  el.textContent = msg;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 2500);
  setTimeout(() => el.remove(), 3000);
}

/* ── MARKDOWN ── */
function parseMd(md) {
  return md
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .split('\n\n')
    .map(block => (block.startsWith('<h') || block.startsWith('<pre')) ? block : `<p>${block.replace(/\n/g, ' ')}</p>`)
    .join('\n');
}