/* ─────────────────────────────────────────
   proj-loader.js
   Reads from window.PROJECTS (projects.js)
   No fetch — works on file:// and GitHub Pages
───────────────────────────────────────── */

// ── Card HTML ─────────────────────────────
function buildCard(entry, idx) {
  const { icon, title } = entry;
  const desc     = entry.what.description || '';
  const status   = entry.state.status || '';
  const progress = Math.min(100, Math.max(0, parseInt(entry.state.progress) || 0));
  const statusClass = { current: 'badge-current', archive: 'badge-archive', future: 'badge-future' }[status] || '';

  return `
    <div class="project-card" data-entry-id="${idx}">
      <div class="project-card-header">
        <span class="project-icon">${icon}</span>
        <h3>${title}</h3>
      </div>
      <p class="proj-desc">${desc}</p>
      <div class="proj-card-footer">
        ${status ? `<span class="proj-badge ${statusClass}">${status}</span>` : ''}
        <div class="proj-progress-track">
          <div class="proj-progress-bar" style="width:${progress}%"></div>
        </div>
        <span class="proj-progress-label">${progress}%</span>
      </div>
    </div>`;
}

// ── Metadata ──────────────────────────────
const CATEGORY_META = {
  lifestyle   : { label: 'Lifestyle',   color: 'var(--c-lifestyle)'   },
  passion     : { label: 'Passion',     color: 'var(--c-passion)'     },
  psychiatrie : { label: 'Psychiatrie', color: 'var(--c-psychiatrie)' },
};

const STATE_META = {
  current : { label: 'Current', color: 'var(--c-lifestyle)'   },
  future  : { label: 'Future',  color: 'var(--c-psychiatrie)' },
  archive : { label: 'Archive', color: 'var(--muted)'         },
};

// ── Render a view (category or state) ────
function renderView(container, groupKeys, metaMap, keyOf, entries) {
  const groups = {};
  entries.forEach((entry, idx) => {
    const key = keyOf(entry) || '__other';
    (groups[key] = groups[key] || []).push({ entry, idx });
  });

  container.innerHTML = groupKeys
    .filter(k => groups[k])
    .map(k => {
      const meta  = metaMap[k] || { label: k, color: 'var(--muted)' };
      const cards = groups[k].map(({ entry, idx }) => buildCard(entry, idx)).join('');
      return `
        <div class="proj-group">
          <div class="proj-group-label" style="color:${meta.color}">${meta.label}</div>
          <div class="project-cards">${cards}</div>
        </div>`;
    }).join('');

  container.querySelectorAll('.project-card').forEach(card => {
    const entry = entries[parseInt(card.dataset.entryId)];
    if (entry) { card.addEventListener('click', () => openModal(entry)); card.style.cursor = 'pointer'; }
  });
}

// ── Toggle ────────────────────────────────
function initToggle(entries) {
  const viewCategory = document.getElementById('view-category');
  const viewState    = document.getElementById('view-state');
  const buttons      = document.querySelectorAll('.toggle-btn');

  renderView(viewCategory, ['lifestyle', 'passion', 'psychiatrie'], CATEGORY_META, e => e.category, entries);
  renderView(viewState,    ['current', 'future', 'archive'],        STATE_META,    e => e.state.status, entries);

  function show(view) {
    viewCategory.classList.toggle('active', view === 'category');
    viewState.classList.toggle('active',    view === 'state');
    buttons.forEach(b => b.classList.toggle('active', b.dataset.view === view));
  }

  buttons.forEach(btn => btn.addEventListener('click', () => show(btn.dataset.view)));
  show('category');
}

// ── Modal ─────────────────────────────────
let overlay = null;

function buildModal(entry) {
  const { what, why, how, state, title } = entry;

  const whyKeys   = ['economy_driven', 'ego_driven', 'commun_good_driven', 'pleasure_driven'];
  const whyLabels = { economy_driven: 'Economy', ego_driven: 'Ego', commun_good_driven: 'Common good', pleasure_driven: 'Pleasure' };

  const whyBars = whyKeys.map(k => {
    const v = Math.min(10, Math.max(0, parseFloat(why[k]) || 0));
    return `<div class="modal-why-row">
      <span class="modal-why-label">${whyLabels[k]}</span>
      <div class="modal-why-track"><div class="modal-why-fill" style="width:${v * 10}%"></div></div>
      <span class="modal-why-val">${v}</span>
    </div>`;
  }).join('');

  const howRows = Object.entries(how)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td>${k.replace(/_/g, ' ')}</td><td>${v}</td></tr>`)
    .join('');

  const steps = (state.steps || [])
    .map(s => `<li class="${s.startsWith('[x]') ? 'done' : ''}">${s.replace(/^\[.\]\s*/, '')}</li>`)
    .join('');

  return `
    <div class="modal-header">
      <h2>${what.name || title}</h2>
      <button class="modal-close" aria-label="Close">&#x2715;</button>
    </div>
    <p class="modal-desc">${what.description || '<em>No description yet.</em>'}</p>
    <div class="modal-meta">
      ${what.domain ? `<span>${what.domain}</span>` : ''}
      ${what.type   ? `<span>${what.type}</span>`   : ''}
    </div>
    <h3 class="modal-section-title">Why</h3>
    <div class="modal-why">${whyBars}</div>
    <h3 class="modal-section-title">How</h3>
    ${howRows ? `<table class="modal-table">${howRows}</table>` : '<p class="muted">Not filled yet.</p>'}
    <h3 class="modal-section-title">Steps</h3>
    ${steps ? `<ul class="modal-steps">${steps}</ul>` : '<p class="muted">No steps yet.</p>'}`;
}

function openModal(entry) {
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'proj-modal-overlay';
    overlay.innerHTML = '<div class="proj-modal-box"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  }
  overlay.querySelector('.proj-modal-box').innerHTML = buildModal(entry);
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Main ──────────────────────────────────
(function () {
  if (typeof PROJECTS === 'undefined' || !PROJECTS.length) {
    console.warn('[proj-loader] PROJECTS not found. Did you include assets/projects.js?');
    return;
  }
  initToggle(PROJECTS);
})();
