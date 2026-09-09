const search = document.querySelector('#districtSearch');
const filter = document.querySelector('#policyFilter');
const results = document.querySelector('#districtResults');
const resultsMeta = document.querySelector('#resultsMeta');
const showMore = document.querySelector('#showMore');
const dotGrid = document.querySelector('#dotGrid');
let districts = [];
let limit = 6;

function parseCSV(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] || ''])));
}

function groupStatus(status) {
  if (['board_policy', 'procedure_handbook'].includes(status)) return 'formal';
  if (['guidance', 'principles_only', 'resolution', 'drafting_IFBG', 'drafting_guidance'].includes(status)) return 'emerging';
  return 'none';
}

function humanize(value) {
  const labels = { board_policy: 'Board policy', procedure_handbook: 'Handbook rule', principles_only: 'Principles only', drafting_IFBG: 'Policy drafting', drafting_guidance: 'Guidance drafting', guidance: 'Published guidance', resolution: 'Board resolution', none: 'None found', unknown: 'Not verified', traffic_light: 'Traffic-light assignments', teacher_discretion: 'Teacher discretion', required: 'Required PD', offered: 'PD offered', cohort: 'PD cohort', ad_hoc: 'Ad hoc PD' };
  return labels[value] || value.replaceAll('_', ' ');
}

function safe(text) {
  const el = document.createElement('span'); el.textContent = text; return el.innerHTML;
}

function render() {
  const q = search.value.trim().toLowerCase();
  const status = filter.value;
  const matched = districts.filter(d => (!q || `${d.district} ${d.metro}`.toLowerCase().includes(q)) && (status === 'all' || groupStatus(d.ai_policy_status) === status));
  resultsMeta.textContent = `${matched.length} ${matched.length === 1 ? 'district' : 'districts'} found`;
  results.innerHTML = matched.slice(0, limit).map(d => {
    const group = groupStatus(d.ai_policy_status);
    const summary = d.one_liner || (group === 'none' ? 'No public AI policy or guidance was found in the reviewed sources.' : 'Public AI guidance has been identified and coded.');
    const signals = [humanize(d.assignment_framework), humanize(d.teacher_pd), d.safety_ai_status && `Safety: ${humanize(d.safety_ai_status)}`].filter(x => x && !x.includes('unknown'));
    return `<article class="result-card ${group}"><div class="result-top"><div><h3>${safe(d.district)}</h3><p class="location">${safe(d.metro || 'Georgia')} · ${safe(humanize(d.entity_type))}</p></div><span class="status-chip">${safe(humanize(d.ai_policy_status))}</span></div><p class="summary">${safe(summary)}</p><div class="signals">${signals.map(x => `<span>${safe(x)}</span>`).join('')}</div></article>`;
  }).join('') || '<article class="result-card"><h3>No matching district</h3><p class="summary">Try a broader name or change the policy-stage filter.</p></article>';
  showMore.hidden = matched.length <= limit;
}

function buildPulse() {
  buildDistrictMap(districts);
  return;
  const counts = { formal: 0, emerging: 0, none: 0 };
  districts.forEach(d => counts[groupStatus(d.ai_policy_status)]++);
  const order = [...Array(counts.formal).fill('adopted'), ...Array(counts.emerging).fill('emerging'), ...Array(counts.none).fill('none')];
  dotGrid.innerHTML = order.map((type, i) => `<i class="${type}" title="District ${i + 1}: ${type === 'adopted' ? 'formal policy or handbook' : type === 'emerging' ? 'guidance or policy in progress' : 'none found / not verified'}"></i>`).join('');
  document.querySelector('#silenceCount').textContent = districts.filter(d => d.ai_policy_status === 'none').length;
  document.querySelector('#formalCount').textContent = counts.formal;
  const safety = districts.filter(d => ['guidance', 'board_policy', 'procedure_handbook'].includes(d.safety_ai_status)).length;
  document.querySelector('#safetyCount').textContent = safety;
  document.querySelector('#pulse-title').textContent = `${districts.length} districts`;
}

search.addEventListener('input', () => { limit = 6; render(); });
filter.addEventListener('change', () => { limit = 6; render(); });
showMore.addEventListener('click', () => { limit += 12; render(); });

fetch('data/districts.csv')
  .then(r => { if (!r.ok) throw new Error('Data unavailable'); return r.text(); })
  .then(async text => { districts = parseCSV(text); await loadLocations(); buildPulse(); render(); })
  .catch(() => { resultsMeta.textContent = 'District data could not be loaded.'; results.innerHTML = '<article class="result-card"><h3>Data temporarily unavailable</h3><p class="summary">Please refresh the page to try again.</p></article>'; });
