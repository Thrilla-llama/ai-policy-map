/* Homepage explorer — Codex design adapted for site/ (served on :8770).
   Loads full /districts.csv. Composite = Safety 70 · Clarity 30 (null parts renormalize).
   Does not replace /assets/app.js (LEA multipage). */
(function () {
  const search = document.querySelector('#districtSearch');
  const filter = document.querySelector('#policyFilter');
  const results = document.querySelector('#districtResults');
  const resultsMeta = document.querySelector('#resultsMeta');
  const showMore = document.querySelector('#showMore');
  let districts = [];
  let limit = 6;

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (quoted && text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = !quoted;
      } else if (char === ',' && !quoted) {
        row.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = '';
      } else field += char;
    }
    if (field || row.length) {
      row.push(field);
      rows.push(row);
    }
    const headers = rows.shift();
    return rows.map((values) =>
      Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
    );
  }

  function slugify(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function entityHref(row) {
    const slug = slugify(row.district);
    if (row.entity_type === 'private') return '/private/' + slug + '/';
    return '/lea/' + slug + '/';
  }

  function groupStatus(status) {
    if (['board_policy', 'procedure_handbook'].includes(status)) return 'formal';
    if (
      [
        'guidance',
        'principles_only',
        'resolution',
        'drafting_IFBG',
        'drafting_guidance',
      ].includes(status)
    )
      return 'emerging';
    return 'none';
  }

  function hasVal(v) {
    return v != null && String(v).trim() !== '';
  }

  function filledBonusField(v) {
    if (!hasVal(v)) return false;
    const s = String(v).trim().toLowerCase();
    return s !== 'none' && s !== 'unknown';
  }

  function clarityStatusBase(status) {
    const s = status || 'unknown';
    if (s === 'unknown') return null;
    if (s === 'board_policy') return 40;
    if (s === 'guidance') return 30;
    if (s === 'procedure_handbook' || s === 'resolution') return 20;
    if (
      s === 'principles_only' ||
      s === 'drafting_guidance' ||
      s === 'drafting_IFBG'
    )
      return 10;
    if (s === 'none') return 0;
    return 0;
  }

  function safetyStatusBase(status) {
    const s = status || 'unknown';
    if (s === 'unknown') return null;
    if (s === 'board_policy') return 40;
    if (s === 'guidance') return 25;
    if (s === 'procedure_handbook' || s === 'resolution') return 20;
    if (
      s === 'principles_only' ||
      s === 'drafting_guidance' ||
      s === 'drafting_IFBG'
    )
      return 10;
    if (s === 'none') return 0;
    return 0;
  }

  function scoreBand(score) {
    if (score == null) return { label: 'Not scored yet', band: 'na' };
    if (score >= 70) return { label: 'Strong', band: 'good' };
    if (score >= 40) return { label: 'Some rules', band: 'mid' };
    return { label: 'Weak', band: 'bad' };
  }

  function clarityScore(row) {
    const base = clarityStatusBase(row.ai_policy_status);
    if (base == null) {
      const b = scoreBand(null);
      return { score: null, label: b.label, band: b.band };
    }
    let score = base;
    ['assignment_framework', 'teacher_pd', 'student_literacy', 'parent_comms'].forEach(
      function (k) {
        if (filledBonusField(row[k])) score += 12;
      }
    );
    if (String(row.outcomes_published || '').trim().toLowerCase() === 'yes') score += 12;
    score = Math.min(100, score);
    const b = scoreBand(score);
    return { score: score, label: b.label, band: b.band };
  }

  function safetyScore(row) {
    const base = safetyStatusBase(row.safety_ai_status);
    if (base == null) {
      const b = scoreBand(null);
      return { score: null, label: b.label, band: b.band };
    }
    let score = base;
    ['deepfake_ban', 'impersonation_ban', 'links_to_hib_titleix', 'approved_tools_only'].forEach(
      function (k) {
        if (String(row[k] || '').trim().toLowerCase() === 'yes') score += 15;
      }
    );
    score = Math.min(100, score);
    const b = scoreBand(score);
    return { score: score, label: b.label, band: b.band };
  }

  var COMPOSITE_WEIGHTS = { safety: 70, clarity: 30 };

  function compositeScore(row) {
    const safety = safetyScore(row);
    const clarity = clarityScore(row);
    const keyed = [
      ['safety', safety],
      ['clarity', clarity],
    ];
    let weightSum = 0;
    let weighted = 0;
    keyed.forEach(function (pair) {
      const key = pair[0];
      const part = pair[1];
      if (part && part.score != null) {
        const w = COMPOSITE_WEIGHTS[key];
        weightSum += w;
        weighted += part.score * w;
      }
    });
    if (weightSum === 0) {
      const b = scoreBand(null);
      return { score: null, label: b.label, band: b.band, parts: { safety: safety, clarity: clarity } };
    }
    const score = Math.round(weighted / weightSum);
    const b = scoreBand(score);
    return {
      score: score,
      label: b.label,
      band: b.band,
      parts: { safety: safety, clarity: clarity },
    };
  }

  /** Parent-facing labels — never cryptic "None found". */
  function humanize(value, field) {
    const labels = {
      board_policy: 'Board policy',
      procedure_handbook: 'Handbook rule',
      principles_only: 'Principles only',
      drafting_IFBG: 'Policy drafting',
      drafting_guidance: 'Guidance drafting',
      guidance: 'Published guidance',
      resolution: 'Board resolution',
      none:
        field === 'safety'
          ? 'No public AI safety rule found'
          : 'No public AI policy found',
      unknown: field === 'safety' ? 'No public AI safety rule found' : 'Not verified',
      traffic_light: 'Traffic-light assignments',
      teacher_discretion: 'Teacher discretion',
      required: 'Required PD',
      offered: 'PD offered',
      cohort: 'PD cohort',
      ad_hoc: 'Ad hoc PD',
    };
    if (labels[value]) return labels[value];
    return String(value || '').replaceAll('_', ' ');
  }

  function metroParentLabel(row) {
    const raw = row && row.metro != null ? String(row.metro).trim() : '';
    if (!raw) return '';
    const low = raw.toLowerCase();
    if (
      low === 'none' ||
      low === 'none found' ||
      low === 'unknown' ||
      low === 'n/a' ||
      low === 'na' ||
      low === '—' ||
      low === '-'
    ) {
      return '';
    }
    return raw;
  }

  function safe(text) {
    const el = document.createElement('span');
    el.textContent = text;
    return el.innerHTML;
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const status = filter.value;
    const matched = districts.filter(
      (d) =>
        (!q || `${d.district} ${d.metro}`.toLowerCase().includes(q)) &&
        (status === 'all' || groupStatus(d.ai_policy_status) === status)
    );
    resultsMeta.textContent = `${matched.length} ${
      matched.length === 1 ? 'district' : 'districts'
    } found`;
    results.innerHTML =
      matched
        .slice(0, limit)
        .map((d) => {
          const group = groupStatus(d.ai_policy_status);
          const summary =
            d.one_liner ||
            (group === 'none'
              ? 'No public AI policy or guidance was found in the reviewed sources.'
              : 'Public AI guidance has been identified and coded.');
          const metro = metroParentLabel(d);
          const locationParts = [metro, humanize(d.entity_type)]
            .filter(Boolean)
            .join(' · ');
          const locationLine = locationParts || 'Georgia';
          const safetyRaw = String(d.safety_ai_status || '').trim().toLowerCase();
          const safetyLabel =
            !safetyRaw || safetyRaw === 'none' || safetyRaw === 'unknown'
              ? 'No public AI safety rule found'
              : 'Safety: ' + humanize(d.safety_ai_status, 'safety');
          const signals = [
            humanize(d.assignment_framework),
            humanize(d.teacher_pd),
            safetyLabel,
          ].filter((x) => x && !String(x).toLowerCase().includes('unknown'));
          const comp = compositeScore(d);
          const scoreChip =
            comp.score != null
              ? `<span class="status-chip score-chip">Score ${comp.score} · ${safe(
                  comp.label
                )}</span>`
              : '';
          const href = entityHref(d);
          return `<a class="result-card ${group}" href="${safe(
            href
          )}"><div class="result-top"><div><h3>${safe(
            d.district
          )}</h3><p class="location">${safe(locationLine)}</p></div><div class="chip-stack"><span class="status-chip">${safe(
            humanize(d.ai_policy_status)
          )}</span>${scoreChip}</div></div><p class="summary">${safe(
            summary
          )}</p><div class="signals">${signals
            .map((x) => `<span>${safe(x)}</span>`)
            .join('')}</div></a>`;
        })
        .join('') ||
      '<article class="result-card"><h3>No matching district</h3><p class="summary">Try a broader name or change the policy-stage filter.</p></article>';
    showMore.hidden = matched.length <= limit;
  }

  function buildPulse() {
    if (typeof buildDistrictMap === 'function') {
      buildDistrictMap(districts);
      return;
    }
    const counts = { formal: 0, emerging: 0, none: 0 };
    districts.forEach((d) => counts[groupStatus(d.ai_policy_status)]++);
    document.querySelector('#silenceCount').textContent = districts.filter(
      (d) => d.ai_policy_status === 'none'
    ).length;
    document.querySelector('#formalCount').textContent = counts.formal;
    const safety = districts.filter((d) =>
      ['guidance', 'board_policy', 'procedure_handbook'].includes(d.safety_ai_status)
    ).length;
    document.querySelector('#safetyCount').textContent = safety;
    document.querySelector('#pulse-title').textContent = `${districts.length} districts`;
    const entityEl = document.querySelector('#entityCount');
    if (entityEl) entityEl.textContent = String(districts.length);
    const asOf = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
    const pulseAsOf = document.querySelector('#pulseAsOf');
    if (pulseAsOf) pulseAsOf.textContent = 'Live from canonical data · as of ' + asOf;
  }

  // Expose helpers district-map.js expects from the Codex root app.
  window.groupStatus = groupStatus;
  window.humanize = function (value) {
    return humanize(value);
  };
  window.metroParentLabel = metroParentLabel;
  window.compositeScore = compositeScore;
  window.slugify = slugify;
  window.entityHref = entityHref;

  search.addEventListener('input', () => {
    limit = 6;
    render();
  });
  filter.addEventListener('change', () => {
    limit = 6;
    render();
  });
  showMore.addEventListener('click', () => {
    limit += 12;
    render();
  });

  fetch('/districts.csv')
    .then((r) => {
      if (!r.ok) throw new Error('Data unavailable');
      return r.text();
    })
    .then(async (text) => {
      districts = parseCSV(text);
      if (typeof loadLocations === 'function') await loadLocations();
      buildPulse();
      render();
    })
    .catch(() => {
      resultsMeta.textContent = 'District data could not be loaded.';
      results.innerHTML =
        '<article class="result-card"><h3>Data temporarily unavailable</h3><p class="summary">Please refresh the page to try again.</p></article>';
    });
})();
