/* ─────────────────────────────────────────
   project-page.js
   Renders one project from projects/<id>.json
   (page URL: project.html?id=<id>)
───────────────────────────────────────── */

const STATUS_LABEL = { active: 'Active', past: 'Past', future: 'Future' };

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function render(entry) {
  const status = STATUS_LABEL[entry.status] ? entry.status : 'active';
  const title  = escapeHtml(entry.title);
  const visual = entry.logo
    ? `<img src="${escapeHtml(entry.logo)}" alt="" class="pp-logo" />`
    : (entry.icon ? `<span class="pp-icon">${entry.icon}</span>` : '');

  const details = (entry.details || []).map(t => `<p>${escapeHtml(t)}</p>`).join('');

  const link = entry.link
    ? `<p><a class="proj-link pp-link" href="${escapeHtml(entry.link)}" target="_blank" rel="noopener">${escapeHtml(entry.link)}</a></p>`
    : '';

  const videos = (entry.videos || [])
    .map(url => {
      const id = youtubeId(url);
      if (!id) return '';
      return `
        <div class="video-item">
          <div class="video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${title} video"
                    loading="lazy" allowfullscreen
                    allow="accelerometer; encrypted-media; picture-in-picture; web-share"></iframe>
          </div>
          <a class="proj-link" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">Watch on YouTube</a>
        </div>`;
    })
    .join('');

  document.title = `${entry.title} – Hippolyte Dreyfus`;
  document.getElementById('project-content').innerHTML = `
    <div class="pp-header">
      ${visual}
      <h1>${title}</h1>
      <span class="proj-badge badge-${status}">${STATUS_LABEL[status]}</span>
    </div>
    ${entry.description ? `<p class="pp-desc">${escapeHtml(entry.description)}</p>` : ''}
    ${details}
    ${link}
    ${videos ? `<div class="video-grid">${videos}</div>` : ''}`;
}

(async function () {
  const box = document.getElementById('project-content');
  const id = new URLSearchParams(window.location.search).get('id') || '';
  if (!/^[\w-]+$/.test(id)) {
    box.innerHTML = '<p class="pp-desc">Project not found.</p>';
    return;
  }
  try {
    const res = await fetch(`projects/${id}.json`);
    if (!res.ok) throw new Error(res.status);
    render(await res.json());
  } catch (e) {
    box.innerHTML = '<p class="pp-desc">Project not found.</p>';
  }
})();
