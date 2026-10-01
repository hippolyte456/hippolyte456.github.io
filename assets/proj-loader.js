/* ─────────────────────────────────────────
   proj-loader.js
   Fetches projects/index.json then each .json,
   renders professional projects first, then the others.
───────────────────────────────────────── */

const STATUS_LABEL = { active: 'Active', past: 'Past', future: 'Future' };

const GROUPS = [
  { key: 'pro',   label: 'Professional projects' },
  { key: 'perso', label: 'Other projects' },
];

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function buildCard(entry) {
  const status = STATUS_LABEL[entry.status] ? entry.status : 'active';
  const title  = escapeHtml(entry.title);
  const visual = entry.logo
    ? `<img src="${escapeHtml(entry.logo)}" alt="${title}" class="project-logo" />`
    : (entry.icon ? `<span class="project-icon">${entry.icon}</span>` : '');
  const link = entry.link
    ? `<a class="proj-link" href="${escapeHtml(entry.link)}" target="_blank" rel="noopener">${escapeHtml(entry.link)}</a>`
    : '';

  return `
    <div class="project-card">
      <div class="project-card-header">
        ${visual}
        <h3>${title}</h3>
        <span class="proj-badge badge-${status}">${STATUS_LABEL[status]}</span>
      </div>
      ${entry.description ? `<p class="proj-desc">${escapeHtml(entry.description)}</p>` : ''}
      ${link ? `<div class="proj-card-footer">${link}</div>` : ''}
    </div>`;
}

function renderProjects(entries) {
  const container = document.getElementById('projects-list');
  container.innerHTML = GROUPS
    .map(g => {
      const items = entries.filter(e => e.group === g.key);
      if (!items.length) return '';
      return `
        <div class="proj-group">
          <div class="proj-group-label">${g.label}</div>
          <div class="project-cards">${items.map(buildCard).join('')}</div>
        </div>`;
    })
    .join('');
}

(async function () {
  try {
    const filenames = await (await fetch('projects/index.json')).json();
    const entries = await Promise.all(
      filenames.map(async file => {
        try { return await (await fetch('projects/' + file)).json(); }
        catch (e) { console.warn('[proj-loader] Could not load', file, e); return null; }
      })
    );
    renderProjects(entries.filter(Boolean));
  } catch (e) {
    console.warn('[proj-loader] Could not load projects/index.json', e);
  }
})();
