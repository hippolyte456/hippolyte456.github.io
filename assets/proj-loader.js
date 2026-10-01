/* ─────────────────────────────────────────
   proj-loader.js
   Fetches projects/index.json then each .json and renders
   professional projects first, then the others.
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

function buildRow(entry) {
  const status = STATUS_LABEL[entry.status] ? entry.status : 'active';
  const link = entry.link
    ? `<a class="proj-link" href="${escapeHtml(entry.link)}" target="_blank" rel="noopener">${escapeHtml(new URL(entry.link).hostname.replace(/^www\./, ''))}</a>`
    : '';

  return `
    <div class="row">
      <div class="row-side">${STATUS_LABEL[status]}</div>
      <div class="row-main">
        <h3>${escapeHtml(entry.title)}</h3>
        ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ''}
        ${link}
      </div>
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
          <h3 class="proj-group-label">${g.label}</h3>
          ${items.map(buildRow).join('')}
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
