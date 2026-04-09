/* ─────────────────────────────────────────
   proj-loader.js
   Fetches *.proj files, parses them, and
   injects content into [data-proj] cards.
───────────────────────────────────────── */

/** Parse a .proj text into a structured object */
function parseProj(text) {
  const proj = { what: {}, why: {}, how: {}, state: { steps: [] } };
  let section = null;

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;

    // Section headers  ## WHAT / ## WHY / ## HOW / ## STATE
    if (line.startsWith('## ')) {
      section = line.slice(3).split(/\s/)[0].toLowerCase();
      continue;
    }

    // Step lines inside STATE
    if (line.startsWith('- ') && section === 'state') {
      proj.state.steps.push(line.slice(2).trim());
      continue;
    }

    // key : value  (strip inline comments starting with #)
    if (line.includes(':')) {
      const idx = line.indexOf(':');
      const key = line.slice(0, idx).trim().replace(/\s+/g, '_');
      const val = line.slice(idx + 1).split('#')[0].trim();
      if (!key || key.startsWith('#')) continue;

      if      (section === 'what')  proj.what[key]  = val;
      else if (section === 'why')   proj.why[key]   = val;
      else if (section === 'how')   proj.how[key]   = val;
      else if (section === 'state') proj.state[key] = val;
    }
  }

  return proj;
}

/** Build the card footer (status badge + progress bar) */
function buildCardFooter(proj) {
  const status   = proj.state.status   || '';
  const progress = parseInt(proj.state.progress) || 0;

  const statusClass = {
    current : 'badge-current',
    archive : 'badge-archive',
    future  : 'badge-future',
  }[status] || '';

  return `
    <div class="proj-card-footer">
      ${status ? `<span class="proj-badge ${statusClass}">${status}</span>` : ''}
      <div class="proj-progress-track">
        <div class="proj-progress-bar" style="width:${progress}%"></div>
      </div>
      <span class="proj-progress-label">${progress}%</span>
    </div>`;
}

/** Build the full modal content */
function buildModal(proj) {
  const { what, why, how, state } = proj;

  const whyKeys = ['economy_driven', 'ego_driven', 'commun_good_driven', 'pleasure_driven'];
  const whyLabels = {
    economy_driven    : 'Economy',
    ego_driven        : 'Ego',
    commun_good_driven: 'Common good',
    pleasure_driven   : 'Pleasure',
  };

  const whyBars = whyKeys.map(k => {
    const v = Math.min(10, Math.max(0, parseFloat(why[k]) || 0));
    return `
      <div class="modal-why-row">
        <span class="modal-why-label">${whyLabels[k]}</span>
        <div class="modal-why-track">
          <div class="modal-why-fill" style="width:${v * 10}%"></div>
        </div>
        <span class="modal-why-val">${v}</span>
      </div>`;
  }).join('');

  const howRows = Object.entries(how)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td>${k.replace(/_/g,' ')}</td><td>${v}</td></tr>`)
    .join('');

  const steps = state.steps
    .map(s => `<li class="${s.startsWith('[x]') ? 'done' : ''}">${s.replace(/^\[.\]\s*/, '')}</li>`)
    .join('');

  return `
    <div class="modal-header">
      <h2>${what.name || ''}</h2>
      <button class="modal-close" aria-label="Close">✕</button>
    </div>
    <p class="modal-desc">${what.description || '<em>No description yet.</em>'}</p>
    <div class="modal-meta">
      <span>${what.domain || ''}</span>
      <span>${what.type || ''}</span>
    </div>

    <h3 class="modal-section-title">Why</h3>
    <div class="modal-why">${whyBars}</div>

    <h3 class="modal-section-title">How</h3>
    ${howRows ? `<table class="modal-table">${howRows}</table>` : '<p class="muted">Not filled yet.</p>'}

    <h3 class="modal-section-title">Steps</h3>
    ${steps ? `<ul class="modal-steps">${steps}</ul>` : '<p class="muted">No steps yet.</p>'}`;
}

/** Inject data into a card element */
function hydrateCard(card, proj) {
  // Description
  const descEl = card.querySelector('.proj-desc');
  if (descEl && proj.what.description) descEl.textContent = proj.what.description;

  // Footer
  card.insertAdjacentHTML('beforeend', buildCardFooter(proj));

  // Click → modal
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openModal(proj));
}

/** Modal logic */
let overlay = null;

function openModal(proj) {
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'proj-modal-overlay';
    overlay.innerHTML = '<div class="proj-modal-box"></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  }

  overlay.querySelector('.proj-modal-box').innerHTML = buildModal(proj);
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay && overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/** Main — fetch all cards with [data-proj] */
document.querySelectorAll('[data-proj]').forEach(async card => {
  const url = card.dataset.proj;
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    const proj = parseProj(text);
    hydrateCard(card, proj);
  } catch (err) {
    console.warn(`[proj-loader] Could not load ${url}:`, err);
  }
});
