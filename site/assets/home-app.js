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


  /* Freemium — reuse LEA key/cap from app.js */
  var AIPM_FREE_DISTRICT_KEY = 'aipm_free_district_follows';
  var AIPM_FREE_DISTRICT_CAP = 3;
  var AIPM_VIEW_KEY = 'aipm_view';

  function getViewedDistricts() {
    try {
      var raw = localStorage.getItem(AIPM_FREE_DISTRICT_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function recordDistrictView(districtId) {
    var id = String(districtId || '');
    var list = getViewedDistricts();
    if (id && list.indexOf(id) === -1) {
      list.push(id);
      try {
        localStorage.setItem(AIPM_FREE_DISTRICT_KEY, JSON.stringify(list));
      } catch (e) {}
    }
    return list;
  }

  function isPaidSession() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var q = String(params.get('view') || '').trim().toLowerCase();
      if (q === 'paid') return true;
      if (q === 'free') return false;
    } catch (e) {}
    try {
      var stored = String(sessionStorage.getItem(AIPM_VIEW_KEY) || '')
        .trim()
        .toLowerCase();
      if (stored === 'paid') return true;
    } catch (e2) {}
    return false;
  }

  function setPaidSession(on) {
    var next = on ? 'paid' : 'free';
    try {
      sessionStorage.setItem(AIPM_VIEW_KEY, next);
    } catch (e) {}
    try {
      var url = new URL(window.location.href);
      if (on) url.searchParams.set('view', 'paid');
      else url.searchParams.delete('view');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e2) {}
  }

  function canOpenDistrict(districtId) {
    if (isPaidSession()) return true;
    var id = String(districtId || '');
    var list = getViewedDistricts();
    if (list.indexOf(id) !== -1) return true;
    return list.length < AIPM_FREE_DISTRICT_CAP;
  }

  function updateHomeFreemiumMeta() {
    var el = document.getElementById('home-freemium-meta');
    if (!el) return;
    if (isPaidSession()) {
      el.textContent = 'Paid view on — district opens unlocked in this tab.';
      return;
    }
    var n = getViewedDistricts().length;
    el.textContent =
      n +
      ' of ' +
      AIPM_FREE_DISTRICT_CAP +
      ' free district views used in this browser (map + Explore).';
  }

  function closeHomePaywall() {
    var el = document.getElementById('home-paywall');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function openHomePaywall(districtName, href, districtId) {
    closeHomePaywall();
    var viewed = getViewedDistricts();
    var backdrop = document.createElement('div');
    backdrop.id = 'home-paywall';
    backdrop.className = 'home-paywall-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'home-paywall-title');
    backdrop.innerHTML =
      '<div class="home-paywall">' +
      '<h2 id="home-paywall-title">Free covers 3 districts</h2>' +
      '<p>You’ve opened <strong>' +
      viewed.length +
      ' of ' +
      AIPM_FREE_DISTRICT_CAP +
      '</strong> free district pages in this browser. ' +
      (districtName
        ? '<strong>' + safe(districtName) + '</strong> would be another.'
        : '') +
      '</p>' +
      '<p>Upgrade (Paid) unlocks more districts and deeper Evidence (quotes + audit). Sources stay available on free. Homepage cards stay teasers — scores and status only.</p>' +
      '<div class="home-paywall-actions">' +
      '<button type="button" class="button" data-paywall-action="upgrade">Unlock Paid view</button>' +
      '<button type="button" class="button-ghost" data-paywall-action="close">Keep browsing free</button>' +
      '</div>' +
      '<p class="home-paywall-note">Prototype toggle: Paid is stored in this tab (?view=paid). Already-opened free districts remain available.</p>' +
      '</div>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (ev) {
      if (ev.target === backdrop) closeHomePaywall();
      var btn = ev.target && ev.target.closest && ev.target.closest('[data-paywall-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-paywall-action');
      if (action === 'close') {
        closeHomePaywall();
        return;
      }
      if (action === 'upgrade') {
        setPaidSession(true);
        closeHomePaywall();
        if (href) {
          recordDistrictView(districtId);
          window.location.href = href;
        }
      }
    });
    document.addEventListener(
      'keydown',
      function onKey(ev) {
        if (ev.key === 'Escape') {
          closeHomePaywall();
          document.removeEventListener('keydown', onKey);
        }
      },
      { once: true }
    );
  }

  function handleDistrictOpen(ev, districtId, href, districtName) {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button === 1) {
      /* allow modified clicks through; still count when we can */
      if (canOpenDistrict(districtId)) recordDistrictView(districtId);
      return;
    }
    ev.preventDefault();
    if (canOpenDistrict(districtId)) {
      recordDistrictView(districtId);
      updateHomeFreemiumMeta();
      window.location.href = href;
      return;
    }
    openHomePaywall(districtName, href, districtId);
  }


  /** Plain-language Explore/map blurb — not research one_liner. */
  function cardSummary(d) {
    var status = String(d.ai_policy_status || '').trim();
    var assign = String(d.assignment_framework || '').trim();
    var safety = String(d.safety_ai_status || '').trim().toLowerCase();
    var bits = [];

    var statusLine = {
      board_policy: 'Has a board AI policy parents can find online.',
      procedure_handbook: 'AI rules show up in the student handbook.',
      principles_only: 'Published AI principles for teachers and students.',
      guidance: 'Published AI guidance for schools.',
      resolution: 'The board passed an AI resolution.',
      drafting_IFBG: 'Still drafting AI policy — nothing finished for classrooms yet.',
      drafting_guidance: 'Still drafting AI guidance — nothing finished for classrooms yet.',
      none: 'No public AI policy found.',
      unknown: 'No verified public AI policy yet.',
    }[status];
    if (statusLine) bits.push(statusLine);
    else if (status)
      bits.push('Public AI status: ' + humanize(status) + '.');

    var hasClassroomRules =
      assign === 'traffic_light' ||
      assign === 'required' ||
      assign === 'prohibited' ||
      assign === 'allowed_with_citation';
    if (
      status === 'principles_only' ||
      status.indexOf('drafting') === 0 ||
      (!hasClassroomRules &&
        status !== 'none' &&
        status !== 'unknown' &&
        (assign === 'teacher_discretion' || assign === 'ad_hoc' || !assign))
    ) {
      bits.push('No finished classroom assignment rules yet.');
    } else if (assign === 'traffic_light') {
      bits.push('Classroom AI rules use a traffic-light system.');
    } else if (hasClassroomRules) {
      bits.push('Published classroom rules for student AI use.');
    }

    if (!safety || safety === 'none' || safety === 'unknown') {
      bits.push('No public AI safety rule found.');
    } else {
      bits.push('Published AI safety rules parents can find online.');
    }

    // de-dupe while keeping order
    var seen = {};
    var out = [];
    bits.forEach(function (b) {
      if (!b || seen[b]) return;
      seen[b] = true;
      out.push(b);
    });
    return out.join(' ') || 'Open the district page for what we found.';
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
          const summary = cardSummary(d);
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
          const scoreBlock =
            comp.score != null
              ? `<div class="score-block" aria-label="Overall policy score ${comp.score}, ${safe(
                  comp.label
                )}"><span class="score-kicker">Overall</span><span class="score-value">${
                  comp.score
                }</span><span class="score-band">${safe(comp.label)}</span></div>`
              : '';
          const href = entityHref(d);
          const districtId = slugify(d.district);
          const viewed = getViewedDistricts();
          const opened = viewed.indexOf(districtId) !== -1;
          const paid = isPaidSession();
          const gated = !paid && !opened && viewed.length >= AIPM_FREE_DISTRICT_CAP;
          const viewedChip = opened
            ? '<span class="status-chip viewed-chip">In your free 3</span>'
            : '';
          return `<a class="result-card ${group}${gated ? ' is-gated' : ''}" href="${safe(
            href
          )}" data-district-id="${safe(districtId)}" data-district-name="${safe(
            d.district
          )}" data-gated="${gated ? '1' : '0'}"><div class="result-top"><div class="result-copy"><h3>${safe(
            d.district
          )}</h3><p class="location">${safe(
            locationLine
          )}</p><span class="status-chip policy-stage">${safe(
            humanize(d.ai_policy_status)
          )}</span>${viewedChip}</div>${scoreBlock}</div><p class="summary">${safe(
            summary
          )}</p><div class="signals">${signals
            .map((x) => `<span>${safe(x)}</span>`)
            .join(
              ''
            )}</div><span class="see-more">See more <span aria-hidden="true">→</span></span></a>`;
        })
        .join('') ||
      '<article class="result-card"><h3>No matching district</h3><p class="summary">Try a broader name or change the policy-stage filter.</p></article>';
    showMore.hidden = matched.length <= limit;
    updateHomeFreemiumMeta();
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
  window.cardSummary = cardSummary;
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

  /* Capture-phase: gate ANY /lea/ or /private/ navigation from the homepage
     (Explore cards, map dialog links, tool preview CTAs). */
  if (!window.__AIPM_HOME_FREEMIUM_CAPTURE) {
    window.__AIPM_HOME_FREEMIUM_CAPTURE = true;
    document.addEventListener(
      'click',
      function (ev) {
        var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (!href) return;
        var path = href.split('?')[0].split('#')[0];
        var m = path.match(/^\/(lea|private)\/([^\/]+)\/?$/);
        if (!m) return;
        /* allow modified clicks */
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button === 1) {
          if (canOpenDistrict(m[2])) recordDistrictView(m[2]);
          return;
        }
        var name =
          a.getAttribute('data-district-name') ||
          (a.textContent || '').trim().slice(0, 80) ||
          m[2];
        handleDistrictOpen(ev, m[2], href, name);
      },
      true
    );
  }

  window.AIPM_HOME = window.AIPM_HOME || {};
  window.AIPM_HOME.canOpenDistrict = canOpenDistrict;
  window.AIPM_HOME.recordDistrictView = recordDistrictView;
  window.AIPM_HOME.handleDistrictOpen = handleDistrictOpen;
  window.AIPM_HOME.openHomePaywall = openHomePaywall;
  window.AIPM_HOME.getViewedDistricts = getViewedDistricts;
  window.updateHomeFreemiumMeta = updateHomeFreemiumMeta;
  window.AIPM_HOME.isPaidSession = isPaidSession;



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
