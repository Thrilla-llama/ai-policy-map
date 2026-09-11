(function () {
  const AIPM = window.AIPM;

  /* Plain-English labels for UI. Codes stay in data; never show raw codes here.
     Authoritative: parent_badge_copy.md */
  const STATUS_LABELS = {
    none: 'No public AI rules found',
    unknown: 'No public AI rules found',
    principles_only: 'Principles only — few classroom details',
    resolution: 'Board resolution (not a full policy yet)',
    guidance: 'Written AI rules online',
    drafting_guidance: 'Drafting / not adopted yet',
    drafting_IFBG: 'Drafting / not adopted yet',
    board_policy: 'Written AI rules online',
    procedure_handbook: 'Rules in the student handbook or code of conduct',
  };

  const STATUS_HELP = {
    board_policy:
      'This district published written AI rules parents can find on its website or in the student handbook.',
    guidance:
      'This district published written AI rules parents can find on its website or in the student handbook.',
    none: 'We looked for public AI rules parents can read. We didn’t find them.',
    unknown: 'We looked for public AI rules parents can read. We didn’t find them.',
    principles_only: 'Principles published; few classroom details parents can use day to day.',
    procedure_handbook: 'AI rules appear in the student handbook or code of conduct.',
    drafting_guidance: 'Leaders are drafting AI rules; nothing finished is posted yet.',
    drafting_IFBG: 'Leaders are drafting AI rules; nothing finished is posted yet.',
    resolution: 'The board voted on AI guidance; it may not be a full board policy yet.',
  };

  const IMPACT_LABELS = {
    positive: 'Mostly helpful',
    mixed: 'Mixed',
    negative: 'Mostly hurts / gaps',
    unclear: 'Not enough public info',
    unknown: 'Not enough public info',
    na: 'Not enough info yet',
  };

  const CLEAR_STATUSES = new Set(['board_policy', 'guidance']);
  const SOME_STATUSES = new Set([
    'procedure_handbook',
    'principles_only',
    'resolution',
    'drafting_guidance',
    'drafting_IFBG',
  ]);

  /* Parent-facing meaning of each strength bucket (S/G/A). Empathetic on "none". */
  const STATUS_MEANING = {
    clear: {
      title: 'What “written AI rules online” means for families',
      helps: [
        'Students: easier to know what AI is allowed on homework and tests.',
        'Teachers: a shared playbook instead of guessing room by room.',
        'Accountability: you can point to a public page when you ask questions.',
      ],
      hurts: [
        'Written rules can still be strict or limited to approved tools.',
        'Public pages can lag behind what happens in class.',
      ],
    },
    some: {
      title: 'What “some rules” means for families',
      helps: [
        'Shows the school is working on AI — not silent.',
        'Handbooks or drafts can give teachers a starting point.',
        'Families can ask when finished rules will be posted.',
      ],
      hurts: [
        'Drafts can change; kids may still face uneven rules.',
        'Handbook language is easy to miss in a long PDF.',
        'Teachers may still lack shared training.',
      ],
    },
    values: {
      title: 'What “values only” means for families',
      helps: [
        'Signals leaders care about AI and student voice.',
        'Leaves room for careful classroom pilots.',
      ],
      hurts: [
        'Without classroom rules, day-to-day choices fall to each teacher.',
        'Harder for a student to know what is fair across classes.',
      ],
    },
    none: {
      title: 'What “no public AI rules” means for families',
      helps: [
        'Many districts are still deciding. Delay does not mean they do not care.',
        'A blank public page is a chance to ask for a clear family FAQ.',
      ],
      hurts: [
        'Families and teachers may not know what is allowed.',
        'Rules can differ classroom to classroom.',
        'Harder to hold anyone to a shared standard until something is posted.',
      ],
    },
  };

  function statusBucket(code) {
    const c = code || 'unknown';
    if (CLEAR_STATUSES.has(c)) return 'clear';
    if (c === 'principles_only') return 'values';
    if (SOME_STATUSES.has(c)) return 'some';
    return 'none';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hasVal(v) {
    return v != null && String(v).trim() !== '';
  }

  /** Parent-facing metro: never show none / None found / unknown. */
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

  function metroBadgeHtml(row) {
    const m = metroParentLabel(row);
    return m ? ' <span class="badge">' + esc(m) + '</span>' : '';
  }

  /** City systems / blank metro: map dots may be ZIP-approximated. Fine print only — never a headline chip. */
  function locationApproxFinePrint(row) {
    const metro = metroParentLabel(row);
    const name = String((row && row.district) || '');
    const looksCity = /\bcity\b/i.test(name);
    if (metro && !looksCity) return '';
    return (
      '<p class="location-approx-note">Approximate location from linked school ZIP codes.</p>'
    );
  }


  function statusLabel(code) {
    return STATUS_LABELS[code] || 'No public AI rules found';
  }

  function statusHelp(code) {
    const c = code || 'unknown';
    return STATUS_HELP[c] || '';
  }

  function statusBadge(code) {
    const c = code || 'unknown';
    const help = statusHelp(c);
    const titleAttr = help ? ' title="' + esc(help) + '"' : '';
    return (
      '<span class="badge status-' +
      esc(c) +
      '"' +
      titleAttr +
      '>' +
      esc(statusLabel(c)) +
      '</span>'
    );
  }

  function entityBadge(type) {
    const t = type || 'traditional';
    const label =
      t === 'charter' ? 'Charter' : t === 'private' ? 'Private' : 'District';
    return '<span class="badge ' + esc(t) + '">' + label + '</span>';
  }

  function impactLabel(val) {
    if (!hasVal(val)) return IMPACT_LABELS.na;
    const v = String(val).trim().toLowerCase();
    return IMPACT_LABELS[v] || val;
  }

  function impactBadge(val) {
    if (!hasVal(val)) {
      return '<span class="impact na">' + esc(IMPACT_LABELS.na) + '</span>';
    }
    const v = String(val).trim().toLowerCase();
    return '<span class="impact ' + esc(v) + '">' + esc(impactLabel(v)) + '</span>';
  }

  function kv(label, value, opts) {
    opts = opts || {};
    if (!hasVal(value) && !opts.keepEmpty) {
      return (
        '<div class="kv-row"><div class="kv-label">' +
        esc(label) +
        '</div><div class="kv-value empty">We don’t have enough public info yet</div></div>'
      );
    }
    if (!hasVal(value)) {
      return (
        '<div class="kv-row"><div class="kv-label">' +
        esc(label) +
        '</div><div class="kv-value empty">—</div></div>'
      );
    }
    const display = opts.html ? value : esc(value);
    return (
      '<div class="kv-row"><div class="kv-label">' +
      esc(label) +
      '</div><div class="kv-value">' +
      display +
      '</div></div>'
    );
  }

  function personCard(role, name, title, email, phone) {
    if (!hasVal(name) && !hasVal(email) && !hasVal(phone)) return '';
    let html =
      '<div class="person"><p class="role">' +
      esc(role) +
      '</p><p class="name">' +
      (hasVal(name) ? esc(name) : '<span class="empty">Name not listed</span>') +
      '</p>';
    if (hasVal(title)) html += '<p class="detail">' + esc(title) + '</p>';
    if (hasVal(email))
      html +=
        '<p class="detail"><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></p>';
    if (hasVal(phone)) html += '<p class="detail">' + esc(phone) + '</p>';
    html += '</div>';
    return html;
  }

  function sourceLinks(sources) {
    if (!hasVal(sources)) return '<p class="note">No sources listed yet.</p>';
    const parts = String(sources)
      .split(/[|;]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (!parts.length) return '<p class="note">No sources listed yet.</p>';
    return (
      '<div class="sources">' +
      parts
        .map(function (u) {
          const href = /^https?:\/\//i.test(u) ? u : '#';
          const label = u.length > 64 ? u.slice(0, 61) + '…' : u;
          if (href === '#') return '<span>' + esc(label) + '</span>';
          return (
            '<a href="' +
            esc(href) +
            '" rel="noopener noreferrer" target="_blank">' +
            esc(label) +
            '</a>'
          );
        })
        .join(' ') +
      '</div>'
    );
  }

  function splitField(val) {
    if (!hasVal(val)) return [];
    return String(val)
      .split(/[;|]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function listOrEmpty(items, emptyMsg) {
    if (!items.length) return '<p class="note empty-msg">' + esc(emptyMsg) + '</p>';
    return (
      '<ul>' +
      items
        .map(function (t) {
          return '<li>' + esc(t) + '</li>';
        })
        .join('') +
      '</ul>'
    );
  }



  /* ---------- AI Safety rules evidence strip ---------- */
  /* Parent “Where it lives” labels (parent_badge_copy.md). */
  var SAFETY_WHERE_LABELS = {
    none: 'No public AI safety rule found',
    unknown: 'No public AI safety rule found',
    procedure_handbook: 'Student handbook / code of conduct',
    guidance: 'District guidance (not board policy yet)',
    board_policy: 'Board-approved AI policy',
    resolution: 'Board resolution',
    principles_only: 'Principles only',
  };

  function safetyInstrumentBadgeLabel(code) {
    const c = String(code || 'none').trim().toLowerCase() || 'none';
    return SAFETY_WHERE_LABELS[c] || c.replace(/_/g, ' ');
  }

  /** Keep instrument label; prefix jargon (CoC/AUP/HIB) with plain words when needed. */
  function plainSafetyInstrumentLabel(raw) {
    if (!hasVal(raw)) return '';
    const s = String(raw).trim();
    if (/^student code of conduct\b/i.test(s) || /^handbook\b/i.test(s) || /^admin\b/i.test(s)) {
      return s;
    }
    if (/^CoC\b/i.test(s)) {
      const rest = s.replace(/^CoC\s*/i, '').trim();
      return rest ? 'Student code of conduct — ' + rest : 'Student code of conduct';
    }
    if (/^AUP\b/i.test(s)) {
      const rest = s.replace(/^AUP\s*/i, '').trim();
      return rest ? 'Acceptable use policy — ' + rest : 'Acceptable use policy';
    }
    if (/^HIB\b/i.test(s)) {
      const rest = s.replace(/^HIB\s*/i, '').trim();
      return rest
        ? 'Bullying / harassment rules — ' + rest
        : 'Bullying / harassment rules';
    }
    return s;
  }

  function safetySourceList(row) {
    return splitField(row.safety_sources);
  }

  function safetyEvidencePayload(row) {
    const statusRaw = String(row.safety_ai_status || '').trim().toLowerCase();
    const status = statusRaw || 'none';
    const statusNone = status === 'none';
    const verifiedAt = hasVal(row.safety_last_verified_at)
      ? String(row.safety_last_verified_at).trim()
      : '';
    const instrumentLabel = plainSafetyInstrumentLabel(row.safety_instrument_label);
    const instrumentUrl = hasVal(row.safety_instrument_url)
      ? String(row.safety_instrument_url).trim()
      : '';
    const sources = safetySourceList(row);

    function claim(key, claimLabel, flagField, quoteField) {
      const flag = String(row[flagField] || '')
        .trim()
        .toLowerCase();
      const quoteRaw = hasVal(row[quoteField]) ? String(row[quoteField]).trim() : '';
      /* Empty-state when flag is not yes OR instrument status is none — never invent quotes. */
      const found = flag === 'yes' && !statusNone;
      const urls = [];
      if (found) {
        if (instrumentUrl) urls.push(instrumentUrl);
        sources.forEach(function (u) {
          if (urls.indexOf(u) === -1) urls.push(u);
        });
      }
      return {
        key: key,
        claim: claimLabel,
        flag: flag || 'unknown',
        found: found,
        quote: found ? quoteRaw : '',
        urls: found ? urls : [],
        instrumentLabel: found ? instrumentLabel : '',
        instrumentUrl: found ? instrumentUrl : '',
        verifiedAt: verifiedAt,
        checkedUrls: !found ? sources.slice() : [],
        emptyLabel: 'No public rule found',
      };
    }

    return {
      title: 'AI Safety rules',
      subhead:
        'Can kids create or share fake AI images of real people? Here’s what this district publishes.',
      safetyAiStatus: status,
      instrumentBadge: safetyInstrumentBadgeLabel(status),
      instrumentLabel: instrumentLabel,
      instrumentUrl: instrumentUrl,
      verifiedAt: verifiedAt,
      sources: sources,
      claims: [
        claim(
          'deepfake',
          'Fake images of students',
          'deepfake_ban',
          'deepfake_quote'
        ),
        claim(
          'impersonation',
          'Fake voice or face of someone',
          'impersonation_ban',
          'impersonation_quote'
        ),
        claim(
          'hib_titleix',
          'Tied to bullying / harassment rules',
          'links_to_hib_titleix',
          'hib_titleix_quote'
        ),
      ],
    };
  }

  function renderSafetyLink(url, preferredLabel) {
    if (!hasVal(url)) return '';
    const href = /^https?:\/\//i.test(url) ? String(url).trim() : '';
    if (!href) return '<span>' + esc(url) + '</span>';
    let label = preferredLabel || '';
    if (!label) {
      try {
        const u = new URL(href);
        const path = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
        label = path.length > 48 ? path.slice(0, 45) + '…' : path;
      } catch (e) {
        label = href.length > 48 ? href.slice(0, 45) + '…' : href;
      }
    }
    return (
      '<a href="' +
      esc(href) +
      '" rel="noopener noreferrer" target="_blank">' +
      esc(label) +
      '</a>'
    );
  }

  function renderSafetyClaimRow(c) {
    const flagClass = c.found ? 'yes' : 'empty';
    const yesPill =
      c.key === 'hib_titleix' ? 'Yes — linked in writing' : 'Yes — public rule';
    const noPill =
      c.key === 'hib_titleix' ? 'Not linked in writing we found' : 'No public rule found';
    let body = '';
    if (c.found) {
      body +=
        '<p class="safety-evidence-verdict"><span class="safety-evidence-pill yes">' +
        esc(yesPill) +
        '</span></p>';
      if (hasVal(c.quote)) {
        body +=
          '<blockquote class="safety-evidence-quote" cite="' +
          esc(c.instrumentUrl || (c.urls[0] || '')) +
          '">' +
          esc(c.quote) +
          '</blockquote>';
      }
      if (hasVal(c.instrumentLabel)) {
        const labelHtml = c.instrumentUrl
          ? renderSafetyLink(c.instrumentUrl, c.instrumentLabel)
          : esc(c.instrumentLabel);
        body +=
          '<p class="safety-evidence-instrument"><span class="safety-evidence-meta-label">Where it lives:</span> ' +
          labelHtml +
          '</p>';
      }
      if (c.urls && c.urls.length) {
        const extra = c.urls.filter(function (u) {
          return u !== c.instrumentUrl;
        });
        const linkBits = [];
        if (c.instrumentUrl && !hasVal(c.instrumentLabel)) {
          linkBits.push(renderSafetyLink(c.instrumentUrl, 'Open rule'));
        }
        extra.forEach(function (u) {
          linkBits.push(renderSafetyLink(u));
        });
        if (linkBits.length) {
          body +=
            '<p class="safety-evidence-links"><span class="safety-evidence-meta-label">Sources:</span> ' +
            linkBits.join(' · ') +
            '</p>';
        }
      }
      if (hasVal(c.verifiedAt)) {
        body +=
          '<p class="safety-evidence-verified">Verified: ' +
          esc(c.verifiedAt) +
          '</p>';
      }
    } else {
      body +=
        '<p class="safety-evidence-verdict"><span class="safety-evidence-pill empty">' +
        esc(noPill) +
        '</span></p>';
      body +=
        '<p class="safety-evidence-empty-note">This does not mean the district is safe — only that we did not find a public rule on this point.</p>';
      if (c.checkedUrls && c.checkedUrls.length) {
        body +=
          '<p class="safety-evidence-links"><span class="safety-evidence-meta-label">We checked:</span> ' +
          c.checkedUrls
            .map(function (u) {
              return renderSafetyLink(u);
            })
            .join(' · ') +
          '</p>';
      }
      if (hasVal(c.verifiedAt)) {
        body +=
          '<p class="safety-evidence-verified">Checked: ' +
          esc(c.verifiedAt) +
          '</p>';
      }
    }
    return (
      '<li class="safety-evidence-row" data-claim="' +
      esc(c.key) +
      '" data-flag="' +
      esc(c.flag) +
      '" data-found="' +
      (c.found ? 'yes' : 'no') +
      '">' +
      '<p class="safety-evidence-claim">' +
      esc(c.claim) +
      '</p>' +
      '<div class="safety-evidence-body ' +
      flagClass +
      '">' +
      body +
      '</div>' +
      '</li>'
    );
  }

  function renderSafetyEvidence(row) {
    const payload = safetyEvidencePayload(row);
    const rowsHtml = payload.claims.map(renderSafetyClaimRow).join('');
    const badge =
      '<span class="safety-evidence-badge status-' +
      esc(payload.safetyAiStatus) +
      '" title="Where the Safety rule lives">' +
      esc(payload.instrumentBadge) +
      '</span>';
    let footer = '';
    if (hasVal(payload.verifiedAt)) {
      footer =
        '<p class="note safety-evidence-footer">Safety fields last verified: ' +
        esc(payload.verifiedAt) +
        '</p>';
    }
    /* JSON payload for MCP / tooling — never invent; mirrors CSV only */
    const jsonAttr = esc(JSON.stringify(payload));
    return (
      '<section class="section card safety-evidence" aria-label="AI Safety rules" data-safety-status="' +
      esc(payload.safetyAiStatus) +
      '" data-safety-payload="' +
      jsonAttr +
      '">' +
      '<div class="section-head safety-evidence-head">' +
      '<div><h2>AI Safety rules</h2>' +
      '<p class="safety-evidence-subhead">' +
      esc(payload.subhead) +
      '</p></div>' +
      badge +
      '</div>' +
      '<ul class="safety-evidence-list">' +
      rowsHtml +
      '</ul>' +
      footer +
      '</section>'
    );
  }

  /* ---------- Freemium: free parent strip vs paid Evidence ---------- */
  var AIPM_VIEW_KEY = 'aipm_view';

  function getSafetyViewMode() {
    /* Pete 2026-09-10: all free — show full Evidence until monetization */
    return 'paid';
  }

  function setSafetyViewMode(mode) {
    var next = mode === 'paid' ? 'paid' : 'free';
    try {
      sessionStorage.setItem(AIPM_VIEW_KEY, next);
    } catch (e) {}
    try {
      var url = new URL(window.location.href);
      if (next === 'paid') url.searchParams.set('view', 'paid');
      else url.searchParams.delete('view');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e2) {}
    return next;
  }

  /** Plain parent claim copy — sources OK on free; quotes/audit stay paid. */
  var SAFETY_PARENT_CLAIMS = [
    {
      key: 'deepfake',
      flagField: 'deepfake_ban',
      label: 'Fake images of students',
      yesPill: 'Yes — public rule',
      noPill: 'No public rule found',
    },
    {
      key: 'impersonation',
      flagField: 'impersonation_ban',
      label: 'Fake voice or face of someone',
      yesPill: 'Yes — public rule',
      noPill: 'No public rule found',
    },
    {
      key: 'hib_titleix',
      flagField: 'links_to_hib_titleix',
      label: 'Tied to bullying / harassment rules',
      yesPill: 'Yes — linked in writing',
      noPill: 'Not linked in writing we found',
    },
  ];

  function renderFreeSafetySources(row) {
    const statusRaw = String(row.safety_ai_status || '').trim().toLowerCase();
    const instrumentUrl = hasVal(row.safety_instrument_url)
      ? String(row.safety_instrument_url).trim()
      : '';
    const instrumentLabel = plainSafetyInstrumentLabel(row.safety_instrument_label);
    const sources = safetySourceList(row);
    const bits = [];
    if (instrumentUrl) {
      bits.push(
        renderSafetyLink(
          instrumentUrl,
          hasVal(instrumentLabel) ? instrumentLabel : 'Open Safety rule'
        )
      );
    }
    sources.forEach(function (u) {
      if (u !== instrumentUrl) bits.push(renderSafetyLink(u));
    });
    if (!bits.length) {
      if (statusRaw === 'none' || !statusRaw) {
        return (
          '<p class="safety-parent-sources note">No public AI safety rule found — no source link to show yet.</p>'
        );
      }
      return '';
    }
    const where = safetyInstrumentBadgeLabel(statusRaw || 'none');
    return (
      '<div class="safety-parent-sources">' +
      '<p class="safety-evidence-instrument"><span class="safety-evidence-meta-label">Where it lives:</span> ' +
      esc(where) +
      '</p>' +
      '<p class="safety-evidence-links"><span class="safety-evidence-meta-label">Sources:</span> ' +
      bits.join(' · ') +
      '</p>' +
      '</div>'
    );
  }

  function renderSafetyParentStrip(row) {
    const statusRaw = String(row.safety_ai_status || '').trim().toLowerCase();
    const statusNone = statusRaw === 'none' || !statusRaw;
    const rowsHtml = SAFETY_PARENT_CLAIMS.map(function (meta) {
      const flag = String(row[meta.flagField] || '')
        .trim()
        .toLowerCase();
      const found = flag === 'yes' && !statusNone;
      let body = '';
      if (found) {
        body =
          '<p class="safety-parent-verdict"><span class="safety-evidence-pill yes">' +
          esc(meta.yesPill) +
          '</span></p>';
      } else {
        body =
          '<p class="safety-parent-verdict"><span class="safety-evidence-pill empty">' +
          esc(meta.noPill) +
          '</span></p>';
      }
      return (
        '<li class="safety-parent-row" data-claim="' +
        esc(meta.key) +
        '" data-found="' +
        (found ? 'yes' : 'no') +
        '">' +
        '<p class="safety-parent-claim">' +
        esc(meta.label) +
        '</p>' +
        '<div class="safety-parent-body ' +
        (found ? 'yes' : 'empty') +
        '">' +
        body +
        '</div>' +
        '</li>'
      );
    }).join('');

    const teaser =
      '<p class="safety-locked-teaser">' +
      '<button type="button" class="safety-locked-teaser-btn" data-aipm-view="paid">' +
      'Unlock quotes + “We checked” audit → Paid' +
      '</button>' +
      '<span class="safety-locked-teaser-note"> Free keeps source links. Paid adds verbatim quotes and the audit list.</span>' +
      '</p>';

    return (
      '<section class="section card safety-parent" aria-label="AI Safety rules for parents" data-safety-view="free">' +
      '<div class="section-head safety-parent-head">' +
      '<div><h2>AI Safety rules</h2>' +
      '<p class="safety-parent-subhead">' +
      'Can kids create or share fake AI images of real people? Here’s what this district publishes — in plain words. Source links stay free.' +
      '</p></div>' +
      '</div>' +
      '<ul class="safety-parent-list">' +
      rowsHtml +
      '</ul>' +
      renderFreeSafetySources(row) +
      teaser +
      '</section>'
    );
  }

  function renderSafetyViewToggle(mode) {
    /* Pete 2026-09-10: all free — no Free|Paid toggle */
    return '';
    const isPaid = mode === 'paid';
    return (
      '<div class="aipm-view-toggle" role="group" aria-label="Prototype view mode">' +
      '<span class="aipm-view-toggle-label">Viewing:</span> ' +
      '<button type="button" class="aipm-view-toggle-btn' +
      (isPaid ? '' : ' is-active') +
      '" data-aipm-view="free" aria-pressed="' +
      (isPaid ? 'false' : 'true') +
      '">Free (≤3 districts)</button>' +
      '<span class="aipm-view-toggle-sep" aria-hidden="true">|</span>' +
      '<button type="button" class="aipm-view-toggle-btn' +
      (isPaid ? ' is-active' : '') +
      '" data-aipm-view="paid" aria-pressed="' +
      (isPaid ? 'true' : 'false') +
      '">Paid (more districts + quotes/audit)</button>' +
      '</div>'
    );
  }

  function renderSafetySurface(row) {
    const mode = getSafetyViewMode();
    const panel =
      mode === 'paid' ? renderSafetyEvidence(row) : renderSafetyParentStrip(row);
    return (
      '<div class="safety-freemium" data-aipm-safety-view="' +
      esc(mode) +
      '">' +
      renderSafetyViewToggle(mode) +
      panel +
      '</div>'
    );
  }

  var _safetyRepaint = null;

  function bindSafetyViewControls(root, repaint) {
    if (!root) return;
    _safetyRepaint = typeof repaint === 'function' ? repaint : null;
    if (root.getAttribute('data-aipm-view-bound') === '1') return;
    root.setAttribute('data-aipm-view-bound', '1');
    root.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var btn = t.closest('[data-aipm-view]');
      if (!btn || !root.contains(btn)) return;
      ev.preventDefault();
      var mode = btn.getAttribute('data-aipm-view') === 'paid' ? 'paid' : 'free';
      setSafetyViewMode(mode);
      if (_safetyRepaint) _safetyRepaint();
    });
  }

  /* ---------- Clarity | Safety dual score (prototype) ---------- */
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
    const bonusFields = [
      'assignment_framework',
      'teacher_pd',
      'student_literacy',
      'parent_comms',
    ];
    bonusFields.forEach(function (k) {
      if (filledBonusField(row[k])) score += 12;
    });
    /* outcomes_published: only yes counts as a clarity signal */
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

  /* Evidence ladder for Grad/Attend (provisional): unknown→null, none→0, narrative→40, metrics→80 */
  function evidenceLadderScore(raw) {
    const v = String(raw || '').trim().toLowerCase();
    if (!v || v === 'unknown') return null;
    if (v === 'none') return 0;
    if (v === 'narrative') return 40;
    if (v === 'metrics') return 80;
    return null;
  }

  function componentScoreGrad(row) {
    const score = evidenceLadderScore(row.graduation_evidence);
    const b = scoreBand(score);
    return { score: score, label: b.label, band: b.band };
  }

  function componentScoreAttend(row) {
    const score = evidenceLadderScore(row.attendance_evidence);
    const b = scoreBand(score);
    return { score: score, label: b.label, band: b.band };
  }

  /** Pete lock 2026-09-09: headline = Safety ~70 · Clarity ~30. Grad/Attend weight 0 (context only). */
  var COMPOSITE_WEIGHTS = {
    safety: 70,
    clarity: 30,
    graduation: 0,
    attendance: 0,
  };

  function compositeScore(row) {
    const safety = safetyScore(row);
    const clarity = clarityScore(row);
    const graduation = componentScoreGrad(row);
    const attendance = componentScoreAttend(row);
    const parts = {
      safety: safety,
      clarity: clarity,
      graduation: graduation,
      attendance: attendance,
    };
    /* Headline uses Safety + Clarity only — never Grad/Attend while weights are 0. */
    const keyed = [
      ['safety', safety],
      ['clarity', clarity],
    ];
    let weightSum = 0;
    let weighted = 0;
    const weightsUsed = {};
    keyed.forEach(function (pair) {
      const key = pair[0];
      const part = pair[1];
      if (part && part.score != null) {
        const w = COMPOSITE_WEIGHTS[key];
        weightSum += w;
        weighted += part.score * w;
        weightsUsed[key] = w;
      }
    });
    if (weightSum === 0) {
      const b = scoreBand(null);
      return {
        score: null,
        label: b.label,
        band: b.band,
        parts: parts,
        weightsUsed: {},
      };
    }
    const score = Math.round(weighted / weightSum);
    const b = scoreBand(score);
    return {
      score: score,
      label: b.label,
      band: b.band,
      parts: parts,
      weightsUsed: weightsUsed,
    };
  }

  function flagChip(label, val) {
    const v = String(val || '').trim().toLowerCase();
    const cls = v === 'yes' ? 'yes' : v === 'no' ? 'no' : 'unk';
    const show = v === 'yes' ? 'yes' : v === 'no' ? 'no' : 'unknown';
    return (
      '<span class="sga-flag ' +
      cls +
      '">' +
      esc(label) +
      ': <strong>' +
      esc(show) +
      '</strong></span>'
    );
  }

  function renderClaritySafety(row) {
    const comp = compositeScore(row);
    const c = comp.parts.clarity;
    const s = comp.parts.safety;
    const g = comp.parts.graduation;
    const a = comp.parts.attendance;
    const cWhy = [];
    cWhy.push('Policy status: ' + statusLabel(row.ai_policy_status));
    if (filledBonusField(row.assignment_framework)) {
      cWhy.push('Assignment framework: ' + String(row.assignment_framework).trim());
    } else {
      cWhy.push('Assignment framework: not set');
    }
    if (filledBonusField(row.teacher_pd)) cWhy.push('Teacher PD: ' + String(row.teacher_pd).trim());
    if (filledBonusField(row.student_literacy))
      cWhy.push('Student literacy: ' + String(row.student_literacy).trim());
    if (filledBonusField(row.parent_comms))
      cWhy.push('Parent comms: ' + String(row.parent_comms).trim());
    if (String(row.outcomes_published || '').trim().toLowerCase() === 'yes') {
      cWhy.push('Outcomes published: yes');
    }

    const sWhyFlags =
      '<div class="sga-flags">' +
      flagChip('Deepfake ban', row.deepfake_ban) +
      flagChip('Impersonation ban', row.impersonation_ban) +
      flagChip('HIB / Title IX link', row.links_to_hib_titleix) +
      flagChip('Approved tools only', row.approved_tools_only) +
      '</div>';

    const cScoreHtml = c.score == null ? '—' : String(c.score);
    const sScoreHtml = s.score == null ? '—' : String(s.score);
    const headlineHtml = comp.score == null ? '—' : String(comp.score);

    let safetyNotes = '';
    if (hasVal(row.safety_ai_notes)) {
      safetyNotes =
        '<p class="sga-notes">' + esc(row.safety_ai_notes) + '</p>';
    }

    const notScored =
      '<p class="sga-band na">Not scored yet</p><p class="note" style="margin:0">Evidence still unknown.</p>';

    return (
      '<section class="section card sga-dual" aria-label="District AI Policy Map score">' +
      '<div class="section-head"><h2>AI Policy Map score</h2></div>' +
      '<div class="sga-headline">' +
      '<p class="sga-kicker">District score</p>' +
      '<p class="sga-headline-score ' +
      esc(comp.band) +
      '">' +
      headlineHtml +
      '</p>' +
      '<p class="sga-band">' +
      esc(comp.label) +
      '</p>' +
      '<p class="note" style="margin:0.35rem 0 0">One score from Safety (~70) and Clarity (~30). Grad/attendance rates are context only — not AI proof.</p>' +
      '</div>' +
      '<div class="sga-grid">' +
      '<div class="sga-card">' +
      '<p class="sga-kicker">Clarity</p>' +
      '<p class="sga-score ' +
      esc(c.band) +
      '">' +
      cScoreHtml +
      '</p>' +
      '<p class="sga-band">' +
      esc(c.label) +
      '</p>' +
      '<ul class="sga-why">' +
      cWhy
        .map(function (t) {
          return '<li>' + esc(t) + '</li>';
        })
        .join('') +
      '</ul>' +
      '</div>' +
      '<div class="sga-card">' +
      '<p class="sga-kicker">Safety</p>' +
      '<p class="sga-score ' +
      esc(s.band) +
      '">' +
      sScoreHtml +
      '</p>' +
      '<p class="sga-band">' +
      esc(s.label) +
      '</p>' +
      '<p class="note" style="margin:0 0 0.4rem">Safety status: ' +
      esc(statusLabel(row.safety_ai_status || 'unknown')) +
      '</p>' +
      sWhyFlags +
      safetyNotes +
      '</div>' +
      '<div class="sga-card sga-context">' +
      '<p class="sga-kicker">Graduation <span class="note">(context)</span></p>' +
      '<p class="note" style="margin:0 0 0.35rem">Not AI proof — does not move the district score.</p>' +
      (hasVal(row.grad_rate_pct)
        ? '<p class="sga-band">State grad rate: <strong>' +
          esc(String(row.grad_rate_pct).trim()) +
          '%</strong>' +
          (hasVal(row.grad_rate_year) ? ' <span class="note">(' + esc(String(row.grad_rate_year).trim()) + ')</span>' : '') +
          '</p>'
        : '<p class="sga-band na">No state rate on file</p>') +
      '<p class="note" style="margin:0.35rem 0 0">AI→graduation evidence: ' +
      esc(hasVal(row.graduation_evidence) ? String(row.graduation_evidence).trim() : 'unknown') +
      '</p>' +
      '</div>' +
      '<div class="sga-card sga-context">' +
      '<p class="sga-kicker">Attendance <span class="note">(context)</span></p>' +
      '<p class="note" style="margin:0 0 0.35rem">Not AI proof — does not move the district score.</p>' +
      (hasVal(row.attendance_or_chronic_abs_pct)
        ? '<p class="sga-band">' +
          esc(hasVal(row.attendance_metric_type) ? String(row.attendance_metric_type).trim().replace(/_/g, ' ') : 'Attendance metric') +
          ': <strong>' +
          esc(String(row.attendance_or_chronic_abs_pct).trim()) +
          '%</strong>' +
          (hasVal(row.attendance_metric_year) ? ' <span class="note">(' + esc(String(row.attendance_metric_year).trim()) + ')</span>' : '') +
          '</p>'
        : '<p class="sga-band na">No attendance rate on file</p>') +
      '<p class="note" style="margin:0.35rem 0 0">AI→attendance evidence: ' +
      esc(hasVal(row.attendance_evidence) ? String(row.attendance_evidence).trim() : 'unknown') +
      '</p>' +
      '</div>' +
      '</div>' +
      '<p class="note sga-proto">Provisional weights · Safety ~70 · Clarity ~30 · Grad/Attend context only (weight 0) · local only</p>' +
      '</section>'
    );
  }

  function scoreBar(kind, result) {
    const pct = result.score == null ? 0 : result.score;
    const display = result.score == null ? '—' : String(result.score);
    return (
      '<div class="sga-bar-row">' +
      '<div class="sga-bar-label"><span>' +
      esc(kind) +
      '</span><strong class="sga-score ' +
      esc(result.band) +
      '">' +
      display +
      '</strong></div>' +
      '<div class="sga-bar-track" aria-hidden="true"><div class="sga-bar-fill ' +
      esc(result.band) +
      '" style="width:' +
      pct +
      '%"></div></div>' +
      '<p class="sga-band">' +
      esc(result.label) +
      '</p>' +
      '</div>'
    );
  }

  function isFultonLea(row) {
    return (
      AIPM.slugify(row.district) === 'fulton-county-schools' ||
      row.district === 'Fulton County Schools'
    );
  }

  /** Pros/cons from real fields only — never invent. */
  function renderProsCons(row, opts) {
    opts = opts || {};
    const helps = splitField(row.use_cases_working);
    const hurts = splitField(row.use_cases_not_working);
    const empty = 'We don’t have enough public info yet';

    // Fold verified impact notes into the same cards when present
    if (hasVal(row.student_impact_notes)) {
      const tag = opts.private ? 'Students: ' : 'Students: ';
      // Put notes with the matching polarity when we can; otherwise list under both context
      if (row.student_impact === 'positive') helps.push(tag + row.student_impact_notes);
      else if (row.student_impact === 'negative') hurts.push(tag + row.student_impact_notes);
      else {
        // mixed/unclear: show under hurts only if we already have hurts, else as context in helps note
        // Better: add as context lines under a third "Notes" — but request wants helps/hurts.
        // Put mixed notes in both? No — put in a "Context" under the grid.
      }
    }
    if (hasVal(row.teacher_impact_notes)) {
      const tag = 'Teachers: ';
      if (row.teacher_impact === 'positive') helps.push(tag + row.teacher_impact_notes);
      else if (row.teacher_impact === 'negative') hurts.push(tag + row.teacher_impact_notes);
    }

    let mixedNotes = '';
    const mixedBits = [];
    if (
      hasVal(row.student_impact_notes) &&
      row.student_impact !== 'positive' &&
      row.student_impact !== 'negative'
    ) {
      mixedBits.push('<p class="note"><strong>Students:</strong> ' + esc(row.student_impact_notes) + '</p>');
    }
    if (
      hasVal(row.teacher_impact_notes) &&
      row.teacher_impact !== 'positive' &&
      row.teacher_impact !== 'negative'
    ) {
      mixedBits.push('<p class="note"><strong>Teachers:</strong> ' + esc(row.teacher_impact_notes) + '</p>');
    }
    if (mixedBits.length) {
      mixedNotes =
        '<div class="mixed-notes" style="margin-top:0.85rem"><h3>More context</h3>' +
        mixedBits.join('') +
        '</div>';
    }

    const bucket = statusBucket(row.ai_policy_status);
    const meaning = STATUS_MEANING[bucket];

    return (
      '<section class="section card proscons">' +
      '<div class="section-head"><h2>' +
      esc(meaning.title) +
      '</h2></div>' +
      '<div class="proscons-grid">' +
      '<div class="pros-block"><h3>What helps</h3>' +
      listOrEmpty(meaning.helps, empty) +
      '</div>' +
      '<div class="cons-block"><h3>What hurts</h3>' +
      listOrEmpty(meaning.hurts, empty) +
      '</div>' +
      '</div>' +
      '<p class="note" style="margin-top:0.75rem">That box is about this kind of policy strength in general — not unique facts we invented for this school.</p>' +
      '</section>' +
      '<section class="section card proscons">' +
      '<div class="section-head"><h2>What we found for this school</h2></div>' +
      '<div class="proscons-grid">' +
      '<div class="pros-block"><h3>What helps</h3>' +
      listOrEmpty(helps, empty) +
      '</div>' +
      '<div class="cons-block"><h3>What hurts</h3>' +
      listOrEmpty(hurts, empty) +
      '</div>' +
      '</div>' +
      mixedNotes +
      '</section>'
    );
  }

  function entityHref(row) {
    const slug = AIPM.slugify(row.district);
    if (row.entity_type === 'private') return '/private/' + slug + '/';
    return '/lea/' + slug + '/';
  }

  function pathSlug() {
    const parts = location.pathname.replace(/\/+$/, '').split('/');
    return parts[parts.length - 1] || '';
  }

  function gaLeas(rows) {
    return rows.filter(function (r) {
      return r.state === 'GA' && (r.entity_type === 'traditional' || r.entity_type === 'charter');
    });
  }

  function privates(rows) {
    return rows.filter(function (r) {
      return r.entity_type === 'private';
    });
  }

  function countByStatus(rows) {
    const counts = {};
    rows.forEach(function (r) {
      const s = r.ai_policy_status || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }

  function clearSomeNone(rows) {
    let clear = 0,
      some = 0,
      noneHeavy = 0;
    rows.forEach(function (r) {
      const s = r.ai_policy_status || 'unknown';
      if (CLEAR_STATUSES.has(s)) clear++;
      else if (SOME_STATUSES.has(s)) some++;
      else noneHeavy++;
    });
    return { clear: clear, some: some, noneHeavy: noneHeavy, total: rows.length };
  }

  /* ---------- Homepage search ---------- */
  /* Homepage map bands (document in index.html too): Leaders ≥55, Mid-pack 20–54, Laggards <20 */
  function compositeMapBand(score) {
    if (score == null) return { key: 'lag', label: 'Laggards' };
    if (score >= 55) return { key: 'leader', label: 'Leaders' };
    if (score >= 20) return { key: 'mid', label: 'Mid-pack' };
    return { key: 'lag', label: 'Laggards' };
  }

  function shortDistrictLabel(name) {
    return String(name || '')
      .replace(/\s+County\s+(School(s| System| District)|Public Schools)\s*$/i, '')
      .replace(/\s+Public Schools\s*$/i, '')
      .replace(/\s+School District\s*$/i, '')
      .replace(/\s+School System\s*$/i, '')
      .replace(/\s+City Schools\s*$/i, '')
      .trim()
      .toUpperCase();
  }

  function loadZipBridge() {
    if (window.__AIPM_ZIP_BRIDGE) return Promise.resolve(window.__AIPM_ZIP_BRIDGE);
    return fetch('/data/zip_lea_bridge.csv')
      .then(function (res) {
        if (!res.ok) throw new Error('ZIP bridge failed (' + res.status + ')');
        return res.text();
      })
      .then(function (text) {
        const rows = AIPM.parseCSV(text);
        const byZip = Object.create(null);
        rows.forEach(function (r) {
          const z = String(r.zip || '').trim();
          if (!z) return;
          if (!byZip[z]) byZip[z] = [];
          byZip[z].push(r);
        });
        window.__AIPM_ZIP_BRIDGE = { rows: rows, byZip: byZip };
        return window.__AIPM_ZIP_BRIDGE;
      });
  }

  function paintHomeMap(trad) {
    const badge = document.getElementById('home-map-badge');
    const chips = document.getElementById('home-map-chips');
    let safetyHits = 0;
    const scored = [];
    trad.forEach(function (r) {
      const status = String(r.safety_ai_status || '')
        .trim()
        .toLowerCase();
      if (status && status !== 'none' && status !== 'unknown') safetyHits += 1;
      const c = compositeScore(r);
      scored.push({
        row: r,
        score: c.score,
        band: compositeMapBand(c.score),
      });
    });
    if (badge) {
      badge.textContent =
        trad.length + ' districts · Safety hits: ' + safetyHits;
    }

    const leaders = scored
      .filter(function (x) {
        return x.band.key === 'leader';
      })
      .sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      });
    const mid = scored
      .filter(function (x) {
        return x.band.key === 'mid';
      })
      .sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      });
    const show = leaders.concat(mid).slice(0, 16);
    if (chips) {
      chips.innerHTML = show
        .map(function (x) {
          return (
            '<a href="' +
            esc(entityHref(x.row)) +
            '" title="' +
            esc(x.row.district) +
            ' · score ' +
            (x.score == null ? '—' : x.score) +
            '"><span class="chip-dot ' +
            esc(x.band.key) +
            '"></span>' +
            esc(shortDistrictLabel(x.row.district)) +
            '</a>'
          );
        })
        .join('');
    }

    const bySlug = Object.create(null);
    scored.forEach(function (x) {
      bySlug[AIPM.slugify(x.row.district)] = x;
    });

    function colorSvgDoc(doc) {
      if (!doc) return;
      const links = doc.querySelectorAll('a[data-slug]');
      links.forEach(function (a) {
        const slug = a.getAttribute('data-slug');
        const hit = bySlug[slug];
        const band = hit ? hit.band.key : 'lag';
        const cls =
          band === 'leader' ? 'c-leader' : band === 'mid' ? 'c-mid' : 'c-lag';
        a.querySelectorAll('.county-poly, .dot-city').forEach(function (el) {
          el.setAttribute(
            'class',
            (el.classList.contains('dot-city') ? 'dot-city ' : 'county-poly ') +
              cls
          );
        });
        if (hit && hit.score != null) {
          a.setAttribute(
            'title',
            hit.row.district + ' · composite ' + hit.score + ' · ' + hit.band.label
          );
        }
      });
    }

    const obj = document.getElementById('ga-map-object');
    if (obj) {
      const apply = function () {
        try {
          colorSvgDoc(obj.contentDocument);
        } catch (e) {
          /* cross-origin unlikely on local static host */
        }
      };
      if (obj.contentDocument && obj.contentDocument.readyState === 'complete') {
        apply();
      }
      obj.addEventListener('load', apply);
    }
  }

  function initHome(data) {
    const lea = gaLeas(data.rows);
    const trad = lea.filter(function (r) {
      return r.entity_type === 'traditional';
    });
    paintHomeMap(trad);

    const byName = Object.create(null);
    data.rows.forEach(function (r) {
      byName[String(r.district).trim().toLowerCase()] = r;
    });

    const zipInput = document.getElementById('zip-input');
    const zipForm = document.getElementById('zip-form');
    const zipOut = document.getElementById('zip-results');

    function renderZipHits(zip, bridgeRows) {
      if (!zipOut) return;
      const z = String(zip || '').replace(/\D/g, '').slice(0, 5);
      if (z.length !== 5) {
        zipOut.hidden = false;
        zipOut.innerHTML =
          '<p class="empty">Enter a 5-digit ZIP code to find matching districts.</p>';
        return;
      }
      const hits = (bridgeRows || []).slice();
      if (!hits.length) {
        zipOut.hidden = false;
        zipOut.innerHTML =
          '<p class="empty">No Georgia districts matched ZIP <strong>' +
          esc(z) +
          '</strong> in our bridge file. Try another ZIP, or search by name below.</p>';
        return;
      }
      /* Multi-LEA ZIPs: list all — no single winner */
      const seen = Object.create(null);
      const items = [];
      hits.forEach(function (h) {
        const name = String(h.district || '').trim();
        const key = name.toLowerCase();
        if (!name || seen[key]) return;
        seen[key] = true;
        const row = byName[key];
        const conf = String(h.confidence || '').trim();
        const href = row ? entityHref(row) : '/lea/' + AIPM.slugify(name) + '/';
        items.push({ name: name, href: href, conf: conf, row: row });
      });
      zipOut.hidden = false;
      zipOut.innerHTML =
        '<h3>' +
        items.length +
        ' district' +
        (items.length === 1 ? '' : 's') +
        ' for ZIP ' +
        esc(z) +
        '</h3><ul>' +
        items
          .map(function (it) {
            const meta = [];
            if (it.row && it.row.entity_type)
              meta.push(
                it.row.entity_type === 'charter'
                  ? 'Charter'
                  : it.row.entity_type === 'private'
                    ? 'Private'
                    : 'District'
              );
            if (it.conf) meta.push(it.conf + ' match');
            if (it.row) {
              const c = compositeScore(it.row);
              if (c.score != null) meta.push('score ' + c.score);
            }
            return (
              '<li><a href="' +
              esc(it.href) +
              '"><span>' +
              esc(it.name) +
              '</span><span class="meta">' +
              esc(meta.join(' · ')) +
              '</span></a></li>'
            );
          })
          .join('') +
        '</ul>';
    }

    loadZipBridge()
      .then(function (bridge) {
        function runZipLookup(raw) {
          const z = String(raw || '')
            .replace(/\D/g, '')
            .slice(0, 5);
          renderZipHits(z, bridge.byZip[z] || []);
        }
        if (zipForm) {
          zipForm.addEventListener('submit', function (e) {
            e.preventDefault();
            runZipLookup(zipInput && zipInput.value);
          });
        }
        if (zipInput) {
          zipInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              runZipLookup(zipInput.value);
            }
          });
        }
      })
      .catch(function (err) {
        if (zipOut) {
          zipOut.hidden = false;
          zipOut.innerHTML =
            '<p class="empty">Could not load ZIP lookup (' +
            esc(err.message || err) +
            ').</p>';
        }
      });

    /* Secondary name typeahead (kept from prior homepage) */
    const input = document.getElementById('district-search');
    const list = document.getElementById('district-results');
    const hint = document.getElementById('search-hint');
    if (!input || !list) return;

    const priv = privates(data.rows).filter(function (r) {
      return r.state === 'GA' || !r.state;
    });
    const privatePool = priv.length ? priv : privates(data.rows);
    const pool = lea
      .map(function (r) {
        return { row: r, kind: 'lea' };
      })
      .concat(
        privatePool.map(function (r) {
          return { row: r, kind: 'private' };
        })
      );

    if (hint) {
      hint.textContent =
        'Or type a name · ' +
        lea.length +
        ' Georgia districts and ' +
        privatePool.length +
        ' private schools';
    }

    function render(q) {
      const query = (q || '').trim().toLowerCase();
      list.innerHTML = '';
      if (!query) {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      const hits = pool
        .filter(function (item) {
          return String(item.row.district).toLowerCase().indexOf(query) !== -1;
        })
        .slice(0, 12);
      if (!hits.length) {
        list.innerHTML = '<li><button type="button" disabled>No matches</button></li>';
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        return;
      }
      hits.forEach(function (item) {
        const r = item.row;
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        const kindLabel =
          item.kind === 'private'
            ? 'Private'
            : r.entity_type === 'charter'
              ? 'Charter'
              : 'District';
        btn.innerHTML =
          '<span>' +
          esc(r.district) +
          '</span><span class="meta">' +
          kindLabel +
          ' · ' +
          esc(statusLabel(r.ai_policy_status)) +
          '</span>';
        btn.addEventListener('click', function () {
          location.href = entityHref(r);
        });
        li.appendChild(btn);
        list.appendChild(li);
      });
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }
      if (e.key === 'Enter') {
        const first = list.querySelector('button:not([disabled])');
        if (first) {
          e.preventDefault();
          first.click();
        }
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- GA hub ---------- */
  function initGa(data) {
    const lea = gaLeas(data.rows);
    const stats = clearSomeNone(lea);
    const counts = countByStatus(lea);

    const set = function (id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    set('ga-total', stats.total);
    set('ga-leaders', stats.clear);
    set('ga-mid', stats.some);
    set('ga-none', stats.noneHeavy);

    const breakdown = document.getElementById('ga-status-breakdown');
    if (breakdown) {
      const order = [
        'board_policy',
        'guidance',
        'procedure_handbook',
        'resolution',
        'principles_only',
        'drafting_guidance',
        'drafting_IFBG',
        'none',
        'unknown',
      ];
      breakdown.innerHTML = order
        .filter(function (k) {
          return counts[k];
        })
        .map(function (k) {
          return (
            '<li><strong>' +
            esc(statusLabel(k)) +
            '</strong> <span class="note">' +
            counts[k] +
            '</span></li>'
          );
        })
        .join('');
    }

    const sorted = lea.slice().sort(function (a, b) {
      return a.district.localeCompare(b.district);
    });

    const top = sorted
      .filter(function (r) {
        return CLEAR_STATUSES.has(r.ai_policy_status) || r.ai_policy_status === 'resolution';
      })
      .slice(0, 12);
    const topEl = document.getElementById('ga-top-links');
    if (topEl) {
      topEl.innerHTML = (top.length ? top : sorted.slice(0, 8))
        .map(function (r) {
          return (
            '<li><a href="' +
            esc(entityHref(r)) +
            '"><span>' +
            esc(r.district) +
            ' ' +
            entityBadge(r.entity_type) +
            '</span><span class="meta">' +
            statusBadge(r.ai_policy_status) +
            '</span></a></li>'
          );
        })
        .join('');
    }

    const input = document.getElementById('ga-search');
    const list = document.getElementById('ga-list');
    function paint(q) {
      if (!list) return;
      const query = (q || '').trim().toLowerCase();
      const hits = sorted
        .filter(function (r) {
          return !query || String(r.district).toLowerCase().indexOf(query) !== -1;
        })
        .slice(0, query ? 80 : 40);
      list.innerHTML = hits
        .map(function (r) {
          return (
            '<li><a href="' +
            esc(entityHref(r)) +
            '"><span>' +
            esc(r.district) +
            ' ' +
            entityBadge(r.entity_type) +
            '</span><span class="meta">' +
            statusBadge(r.ai_policy_status) +
            '</span></a></li>'
          );
        })
        .join('');
    }
    paint('');
    if (input) {
      input.addEventListener('input', function () {
        paint(input.value);
      });
    }

    /* Georgia headline score (local prototype) */
    const trad = lea.filter(function (r) {
      return r.entity_type === 'traditional';
    });
    const scored = [];
    trad.forEach(function (r) {
      const c = compositeScore(r);
      if (c.score != null) scored.push(c.score);
    });
    let rollup = null;
    let rollupN = 0;
    let rollupNote = '';
    if (scored.length) {
      rollupN = scored.length;
      rollup = Math.round(
        scored.reduce(function (sum, n) {
          return sum + n;
        }, 0) / scored.length
      );
      rollupNote =
        'Mean of ' +
        rollupN +
        ' traditional LEAs with a district score (Safety ~70 + Clarity ~30; Grad/Attend context only).';
    }
    const gaScoreEl = document.getElementById('ga-composite-score');
    const gaBandEl = document.getElementById('ga-composite-band');
    const gaSubEl = document.getElementById('ga-composite-sub');
    if (gaScoreEl) {
      if (rollup == null) {
        gaScoreEl.textContent = '—';
        gaScoreEl.className = 'stat-value sga-headline-score na';
        if (gaBandEl) gaBandEl.textContent = 'Not scored yet';
        if (gaSubEl)
          gaSubEl.textContent =
            'Too few districts have Safety + Clarity yet. State roll-up formula still locking.';
      } else {
        const b = scoreBand(rollup);
        gaScoreEl.textContent = String(rollup);
        gaScoreEl.className = 'stat-value sga-headline-score ' + b.band;
        if (gaBandEl) gaBandEl.textContent = b.label + ' · provisional';
        if (gaSubEl)
          gaSubEl.textContent =
            rollupNote + ' State roll-up formula still locking. Local only.';
      }
    }
  }

  /* ---------- Shared policy / impact blocks ---------- */
  function renderPolicySnapshot(row) {
    return (
      '<div class="kv">' +
      kv('Public AI rules', statusBadge(row.ai_policy_status), { html: true, keepEmpty: true }) +
      kv('Elementary AI', row.elementary_ai) +
      kv('Secondary AI', row.secondary_ai) +
      kv('Homework / assignment rules', row.assignment_framework) +
      kv('Main AI tools', row.primary_edtech_ai) +
      kv('Teacher training', row.teacher_pd) +
      kv('Student AI literacy', row.student_literacy) +
      kv('Parent updates', row.parent_comms) +
      kv('Outcomes published', row.outcomes_published) +
      kv('Last checked', row.last_verified_at) +
      '</div>'
    );
  }

  function renderImpact(row) {
    const has =
      hasVal(row.student_impact) ||
      hasVal(row.teacher_impact) ||
      hasVal(row.student_impact_notes) ||
      hasVal(row.teacher_impact_notes);
    if (!has) {
      return (
        '<div class="stub">We don’t have enough public info yet on student or teacher impact. We do not invent scores.</div>'
      );
    }
    return (
      '<div class="kv">' +
      kv(
        'For students',
        impactBadge(row.student_impact) +
          (hasVal(row.student_impact_notes)
            ? '<div class="note" style="margin-top:0.35rem">' +
              esc(row.student_impact_notes) +
              '</div>'
            : ''),
        { html: true, keepEmpty: true }
      ) +
      kv(
        'For teachers',
        impactBadge(row.teacher_impact) +
          (hasVal(row.teacher_impact_notes)
            ? '<div class="note" style="margin-top:0.35rem">' +
              esc(row.teacher_impact_notes) +
              '</div>'
            : ''),
        { html: true, keepEmpty: true }
      ) +
      '</div>'
    );
  }

  /* ---------- Board meeting freshness (America/New_York date-only) ---------- */
  function todayYmdAmericaNewYork(now) {
    /* Test hook: window.AIPM_TODAY_YMD = "2026-09-11" forces "today" for local checks. */
    if (typeof window !== 'undefined' && hasVal(window.AIPM_TODAY_YMD)) {
      return String(window.AIPM_TODAY_YMD).trim().slice(0, 10);
    }
    const d = now instanceof Date ? now : new Date();
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    } catch (e) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }
  }

  function normalizeBoardMeetingYmd(raw) {
    if (!hasVal(raw)) return '';
    const s = String(raw).trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }

  function daysBetweenYmd(earlier, later) {
    /* Whole calendar days between YYYY-MM-DD strings (UTC noon to avoid DST edge). */
    const a = Date.parse(earlier + 'T12:00:00Z');
    const b = Date.parse(later + 'T12:00:00Z');
    if (!isFinite(a) || !isFinite(b)) return null;
    return Math.round((b - a) / 86400000);
  }

  function boardMeetingFreshness(whenRaw, todayYmd) {
    const when = normalizeBoardMeetingYmd(whenRaw);
    const today = normalizeBoardMeetingYmd(todayYmd) || todayYmdAmericaNewYork();
    if (!when) return { kind: 'blank', when: '', today: today, daysPast: null };
    if (when >= today) return { kind: 'upcoming', when: when, today: today, daysPast: 0 };
    const daysPast = daysBetweenYmd(when, today);
    return {
      kind: 'past',
      when: when,
      today: today,
      daysPast: daysPast == null ? 0 : daysPast,
    };
  }

  function boardCalendarLinkHtml(calUrl, rosterUrl) {
    if (calUrl) {
      return (
        '<p class="note"><a href="' +
        esc(calUrl) +
        '" target="_blank" rel="noopener noreferrer">Board calendar</a></p>'
      );
    }
    if (rosterUrl) {
      return (
        '<p class="note"><a href="' +
        esc(rosterUrl) +
        '" target="_blank" rel="noopener noreferrer">Board page / calendar</a></p>'
      );
    }
    return '';
  }

  function renderNextBoardMeeting(row) {
    const whenRaw = hasVal(row.next_board_meeting_at)
      ? String(row.next_board_meeting_at).trim()
      : '';
    const calUrl = hasVal(row.board_calendar_url)
      ? String(row.board_calendar_url).trim()
      : '';
    const rosterUrl = hasVal(row.board_roster_url)
      ? String(row.board_roster_url).trim()
      : '';
    const notes = hasVal(row.next_board_meeting_notes)
      ? String(row.next_board_meeting_notes).trim()
      : '';
    const fresh = boardMeetingFreshness(whenRaw);
    const staleHard = fresh.kind === 'past' && fresh.daysPast > 14;

    let heading = 'Next board meeting';
    let aria = 'Next board meeting';
    let sectionClass = 'section card board-meeting';
    let body = '';

    if (fresh.kind === 'upcoming') {
      body +=
        '<p class="board-meeting-when"><strong>' +
        esc(fresh.when) +
        '</strong></p>';
      if (notes) body += '<p class="note">' + esc(notes) + '</p>';
      body += boardCalendarLinkHtml(calUrl, rosterUrl);
    } else if (fresh.kind === 'past') {
      heading = 'Last listed meeting';
      aria = 'Last listed meeting';
      sectionClass += ' board-meeting-past';
      if (staleHard) sectionClass += ' board-meeting-stale';
      body +=
        '<p class="board-meeting-when"><strong>' +
        esc(fresh.when) +
        '</strong></p>';
      if (notes) body += '<p class="note">' + esc(notes) + '</p>';
      body +=
        '<p class="board-meeting-stale-help note">Next date not updated yet — check the board calendar.</p>';
      if (staleHard) {
        body +=
          '<p class="board-meeting-stale-warn note">May be outdated.</p>';
      }
      const cal = boardCalendarLinkHtml(calUrl, rosterUrl);
      body += cal
        ? cal
        : '<p class="note">Calendar link coming when districts publish it.</p>';
    } else {
      body +=
        '<p class="board-meeting-empty">Board meeting date not listed yet</p>';
      if (notes) body += '<p class="note">' + esc(notes) + '</p>';
      const cal = boardCalendarLinkHtml(calUrl, rosterUrl);
      body += cal
        ? cal
        : '<p class="note">Calendar link coming when districts publish it.</p>';
    }

    return (
      '<section class="' +
      sectionClass +
      '" aria-label="' +
      esc(aria) +
      '">' +
      '<div class="section-head"><h2>' +
      esc(heading) +
      '</h2></div>' +
      body +
      '</section>'
    );
  }

  /* ---------- Outbound: parent → board email (stub — no live sends) ---------- */
  var AIPM_CONSENT_VERSION = 'parent-board-email-v1-2026-09-09';
  var AIPM_FREE_DISTRICT_KEY = 'aipm_free_district_follows';
  var AIPM_FREE_DISTRICT_CAP = 3;
  var AIPM_BOARD_EMAIL_SUBJECT_DEFAULT =
    'AI plan for our schools — please put this on a board agenda';
  var _aipmData = null;
  var _boardEmailCtx = null;

  function districtIdFromRow(row) {
    return AIPM.slugify(row.district);
  }

  function setAipmData(data) {
    _aipmData = data || null;
  }

  function findRowByDistrictId(districtId) {
    if (!_aipmData) return null;
    const id = String(districtId || '').trim();
    if (!id) return null;
    if (_aipmData.bySlug && _aipmData.bySlug[id]) return _aipmData.bySlug[id];
    return (
      (_aipmData.rows || []).find(function (r) {
        return AIPM.slugify(r.district) === id;
      }) || null
    );
  }

  function plainStatusOneLiner(row) {
    if (!row) return null;
    const code = String(row.ai_policy_status || '')
      .trim()
      .toLowerCase();
    if (!code || code === 'none' || code === 'unknown') return null;
    const map = {
      board_policy: 'board AI policy on the books',
      guidance: 'guidance for staff, no finished board policy yet',
      principles_only: 'principles published; classroom rules still unfinished',
      procedure_handbook: 'rules in the student handbook or code of conduct',
      drafting_guidance: 'drafting / not adopted yet',
      drafting_IFBG: 'drafting / not adopted yet',
      resolution: 'board resolution on AI (not a full policy yet)',
    };
    return map[code] || null;
  }

  function getFollowedDistricts() {
    try {
      const raw = localStorage.getItem(AIPM_FREE_DISTRICT_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch (e) {
      return [];
    }
  }

  function canFollowDistrict(districtId) {
    /* Pete 2026-09-10: all free until monetization is decided */
    return true;
  }

  function recordDistrictFollow(districtId) {
    const id = String(districtId || '');
    const list = getFollowedDistricts();
    if (id && list.indexOf(id) === -1) {
      list.push(id);
      try {
        localStorage.setItem(AIPM_FREE_DISTRICT_KEY, JSON.stringify(list));
      } catch (e) {}
    }
    return list;
  }

  function parseBoardMemberEmails(row) {
    const out = [];
    if (!row || !hasVal(row.board_member_emails)) return out;
    const source = hasVal(row.board_emails_source)
      ? String(row.board_emails_source)
          .split(/[|;]/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)[0]
      : undefined;
    String(row.board_member_emails)
      .split(';')
      .forEach(function (part) {
        const p = String(part || '').trim();
        if (!p) return;
        const bits = p.split('|').map(function (s) {
          return s.trim();
        });
        const name = bits[0] || '';
        const email = bits[1] || '';
        if (email && /@/.test(email)) {
          const item = {
            email: email,
            role: 'board_member',
          };
          if (name) item.name = name;
          if (source) item.source = source;
          out.push(item);
        }
      });
    return out;
  }

  function previewRecipients(districtId) {
    const row =
      typeof districtId === 'object' && districtId
        ? districtId
        : findRowByDistrictId(districtId);
    if (!row) {
      return {
        districtId: String(districtId || ''),
        districtName: '',
        to: [],
        cc: [],
        mode: 'copy_only',
        rosterUrl: undefined,
        plainStatusOneLiner: null,
      };
    }
    const id = districtIdFromRow(row);
    const members = parseBoardMemberEmails(row);
    const to = [];
    if (members.length) {
      members.forEach(function (m) {
        to.push(m);
      });
    } else if (hasVal(row.board_office_email)) {
      const office = {
        email: String(row.board_office_email).trim(),
        role: 'board_office',
      };
      if (hasVal(row.board_emails_source)) {
        office.source = String(row.board_emails_source)
          .split(/[|;]/)[0]
          .trim();
      }
      to.push(office);
    }
    const cc = [];
    if (hasVal(row.superintendent_email)) {
      const ccItem = {
        email: String(row.superintendent_email).trim(),
        role: 'superintendent',
      };
      if (hasVal(row.superintendent_name)) {
        ccItem.name = String(row.superintendent_name).trim();
      }
      cc.push(ccItem);
    }
    const rosterUrl = hasVal(row.board_roster_url)
      ? String(row.board_roster_url).trim()
      : undefined;
    return {
      districtId: id,
      districtName: row.district || '',
      to: to,
      cc: cc,
      mode: to.length ? 'send' : 'copy_only',
      rosterUrl: rosterUrl,
      plainStatusOneLiner: plainStatusOneLiner(row),
    };
  }

  function buildParentBoardEmailBody(row, parentName, parentEmail) {
    const district = row.district || 'our district';
    const name = hasVal(parentName) ? String(parentName).trim() : 'A parent';
    const email = String(parentEmail || '').trim();
    let body =
      'Hello,\n\n' +
      'I’m a parent in ' +
      district +
      '. I’d like our board to talk about AI at a coming meeting.\n\n' +
      'Please put two items on the agenda:\n' +
      '1) What AI tools students and teachers may use, and how families will hear about those rules.\n' +
      '2) Where is our written rule on AI-generated or fake images of students? Can you share the link from the handbook, student code of conduct, or board policy?\n\n';
    const oneLiner = plainStatusOneLiner(row);
    if (oneLiner) {
      body +=
        'From public sources, our district currently looks like: ' +
        oneLiner +
        '.\n' +
        'If that’s outdated, I still want the written fake-image rule and the classroom AI plan on a meeting agenda.\n\n';
    }
    body += 'Thank you,\n' + name + '\n' + email + '\n\n';
    const pageUrl =
      (typeof window !== 'undefined' && window.location
        ? window.location.origin
        : '') +
      '/lea/' +
      districtIdFromRow(row) +
      '/';
    body +=
      'Sent via AI Policy Map with the parent’s confirmation.\n' +
      'District page: ' +
      pageUrl +
      '\n' +
      'This is not a district official message.\n' +
      'Unsubscribe / stop parent sends from this address: (coming soon)\n';
    return body;
  }

  function sendParentBoardEmail(payload) {
    payload = payload || {};
    const districtId = String(payload.districtId || '').trim();
    const parentEmail = String(payload.parentEmail || '').trim();
    const consentVersion = String(payload.consentVersion || '').trim();
    const snapshot = payload.recipientSnapshot || previewRecipients(districtId);

    if (!parentEmail || !/@/.test(parentEmail)) {
      return { status: 'rejected', reason: 'missing_parent_email' };
    }
    if (!consentVersion || !payload.consentAt) {
      return { status: 'rejected', reason: 'missing_consent' };
    }
    if (!canFollowDistrict(districtId)) {
      return { status: 'rejected', reason: 'freemium_cap' };
    }
    if (!snapshot || !snapshot.to || !snapshot.to.length) {
      return { status: 'rejected', reason: 'no_recipients' };
    }
    /* Until Pete/CoS greenlight: NEVER SMTP — always stubbed success path. */
    recordDistrictFollow(districtId);
    return {
      status: 'stubbed',
      reason: 'outbound_not_connected',
      messageId: 'stub-' + Date.now(),
    };
  }

  function formatRecipientLine(list, emptyMsg) {
    if (!list || !list.length) return esc(emptyMsg);
    return list
      .map(function (r) {
        /* Parent UI: names + roles only — keep emails out of the list */
        const name = hasVal(r.name) ? r.name : 'Board contact';
        const role = r.role ? ' (' + r.role.replace(/_/g, ' ') + ')' : '';
        return esc(name + role);
      })
      .join('<br>');
  }

  function closeBoardEmailModal() {
    const el = document.getElementById('aipm-board-email-modal');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    _boardEmailCtx = null;
  }

  function copyBoardEmailDraft(subject, body) {
    const text = 'Subject: ' + subject + '\n\n' + body;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () {
          return true;
        },
        function () {
          return false;
        }
      );
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function openBoardEmailConfirm(row, parentEmail, parentName) {
    const preview = previewRecipients(row);
    const subject = AIPM_BOARD_EMAIL_SUBJECT_DEFAULT;
    const body = buildParentBoardEmailBody(row, parentName, parentEmail);
    closeBoardEmailModal();

    let toHtml = formatRecipientLine(preview.to, 'No public board email on file');
    let ccHtml = '';
    if (preview.cc && preview.cc.length) {
      ccHtml = formatRecipientLine(preview.cc, '');
    } else {
      ccHtml = esc('Superintendent: no public email on file — not CC’d.');
    }

    let modeNote = '';
    if (preview.mode === 'copy_only') {
      modeNote =
        '<p class="board-email-warn">We don’t have a public board email for this district yet. You can copy the draft and send it yourself.</p>';
      if (preview.rosterUrl) {
        modeNote +=
          '<p class="note"><a href="' +
          esc(preview.rosterUrl) +
          '" target="_blank" rel="noopener noreferrer">Open board roster / contacts</a></p>';
      }
    } else if (
      preview.to.length === 1 &&
      preview.to[0].role === 'board_office'
    ) {
      modeNote =
        '<p class="note">We’ll send this to the board office email on file (individual member emails aren’t public yet).</p>';
    }

    const sendBtn =
      preview.mode === 'send'
        ? '<button type="button" class="btn primary" data-board-email-action="send">Send</button>'
        : '';

    const modal =
      '<div class="aipm-modal-backdrop" id="aipm-board-email-modal" role="dialog" aria-modal="true" aria-labelledby="aipm-board-email-title">' +
      '<div class="aipm-modal card">' +
      '<h2 id="aipm-board-email-title">Confirm email to the board</h2>' +
      '<p class="note">We’ll email the board using the contacts we have. You can edit the message before it goes out.</p>' +
      modeNote +
      '<div class="board-email-meta">' +
      '<p><strong>To:</strong><br>' +
      toHtml +
      '</p>' +
      '<p><strong>CC:</strong><br>' +
      ccHtml +
      '</p>' +
      '</div>' +
      '<label class="board-email-field"><span>Subject</span>' +
      '<input type="text" id="aipm-board-email-subject" value="' +
      esc(subject) +
      '" /></label>' +
      '<label class="board-email-field"><span>Message</span>' +
      '<textarea id="aipm-board-email-body" rows="12">' +
      esc(body) +
      '</textarea></label>' +
      '<p class="board-email-status note" id="aipm-board-email-status" hidden></p>' +
      '<div class="cta-row">' +
      sendBtn +
      '<button type="button" class="btn" data-board-email-action="copy">Copy draft</button>' +
      '<button type="button" class="btn" data-board-email-action="cancel">Cancel</button>' +
      '</div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', modal);
    _boardEmailCtx = {
      row: row,
      parentEmail: parentEmail,
      parentName: parentName,
      preview: preview,
      consentAt: new Date().toISOString(),
      consentVersion: AIPM_CONSENT_VERSION,
    };

    const root = document.getElementById('aipm-board-email-modal');
    root.addEventListener('click', function (ev) {
      const t = ev.target;
      if (!t) return;
      if (t === root) {
        closeBoardEmailModal();
        return;
      }
      const btn = t.closest ? t.closest('[data-board-email-action]') : null;
      if (!btn) return;
      const action = btn.getAttribute('data-board-email-action');
      const statusEl = document.getElementById('aipm-board-email-status');
      const subjEl = document.getElementById('aipm-board-email-subject');
      const bodyEl = document.getElementById('aipm-board-email-body');
      const subj = subjEl ? subjEl.value : subject;
      const bod = bodyEl ? bodyEl.value : body;

      if (action === 'cancel') {
        closeBoardEmailModal();
        return;
      }
      if (action === 'copy') {
        copyBoardEmailDraft(subj, bod).then(function (ok) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = ok
              ? 'Draft copied to clipboard.'
              : 'Could not copy — select the text and copy manually.';
          }
        });
        return;
      }
      if (action === 'send') {
        const result = sendParentBoardEmail({
          districtId: preview.districtId,
          parentEmail: parentEmail,
          parentName: parentName,
          subject: subj,
          body: bod,
          consentVersion: AIPM_CONSENT_VERSION,
          consentAt: _boardEmailCtx.consentAt,
          recipientSnapshot: preview,
        });
        if (statusEl) {
          statusEl.hidden = false;
          if (result.status === 'stubbed') {
            statusEl.textContent =
              'Draft confirmed — Outbound send not connected yet. This counts toward your 3-district parent follows.';
          } else if (result.reason === 'freemium_cap') {
            statusEl.textContent =
              'Free plan covers 3 districts. Upgrade (Paid) to follow more — send blocked.';
          } else if (result.reason === 'no_recipients') {
            statusEl.textContent =
              'No public board email on file — use Copy draft instead.';
          } else if (result.reason === 'missing_consent') {
            statusEl.textContent = 'Consent required before send.';
          } else {
            statusEl.textContent =
              'Could not send (' + (result.reason || result.status) + ').';
          }
        }
      }
    });
  }

  function renderEmailBoardCta(row) {
    const district = row.district || 'this district';
    const followed = getFollowedDistricts();
    const id = districtIdFromRow(row);
    const used = followed.length;
    const preview = previewRecipients(row);
    let contactNote = '';
    if (preview.mode === 'copy_only') {
      contactNote =
        '<p class="note">No public board email on file yet — you can still write a draft and copy it' +
        (preview.rosterUrl ? ', or use the board roster link.' : '.') +
        '</p>';
    } else {
      contactNote =
        '<div class="board-email-to-preview" data-board-to-list="1">' +
        '<p class="note"><strong>To (' +
        preview.to.length +
        '):</strong></p>' +
        '<p class="board-email-to-lines">' +
        formatRecipientLine(preview.to, 'No public board email on file') +
        '</p></div>';
    }

    return (
      '<section class="section card board-email-cta" aria-label="Email the board about AI" data-district-id="' +
      esc(id) +
      '">' +
      '<div class="section-head"><h2>Email the board about AI</h2></div>' +
      '<p class="note">Ask leaders to put a short AI plan update on a board agenda. Free parents can follow up to 3 districts (' +
      used +
      ' of ' +
      AIPM_FREE_DISTRICT_CAP +
      ' used in this browser).</p>' +
      contactNote +
      '<form class="board-email-preform" data-board-email-preform="1">' +
      '<label class="board-email-field"><span>Your email</span>' +
      '<input type="email" name="parent_email" required autocomplete="email" placeholder="you@example.com" /></label>' +
      '<label class="board-email-field"><span>Your name <span class="note">(optional)</span></span>' +
      '<input type="text" name="parent_name" autocomplete="name" placeholder="Jordan Lee" /></label>' +
      '<label class="board-email-consent">' +
      '<input type="checkbox" name="consent" value="1" required /> ' +
      '<span>I want AI Policy Map to email board contacts for ' +
      esc(district) +
      ' using the message I confirm next. I can edit it before it goes out.</span>' +
      '</label>' +
      '<p class="board-email-prestatus note" hidden></p>' +
      '<div class="cta-row">' +
      '<button type="submit" class="btn primary">Continue to confirm</button>' +
      '</div>' +
      '</form>' +
      '</section>'
    );
  }

  function bindEmailBoardControls(root, row) {
    if (!root) return;
    const form = root.querySelector('[data-board-email-preform]');
    if (!form || form.getAttribute('data-bound') === '1') return;
    form.setAttribute('data-bound', '1');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const fd = new FormData(form);
      const parentEmail = String(fd.get('parent_email') || '').trim();
      const parentName = String(fd.get('parent_name') || '').trim();
      const consented = form.querySelector('[name="consent"]');
      const status = form.querySelector('.board-email-prestatus');
      const id = districtIdFromRow(row);

      if (!parentEmail || !/@/.test(parentEmail)) {
        if (status) {
          status.hidden = false;
          status.textContent = 'Enter a valid email to continue.';
        }
        return;
      }
      if (!consented || !consented.checked) {
        if (status) {
          status.hidden = false;
          status.textContent = 'Please check the consent box to continue.';
        }
        return;
      }
      if (!canFollowDistrict(id)) {
        if (status) {
          status.hidden = false;
          status.textContent =
            'Free plan covers 3 districts. Switch to Paid (prototype toggle) for more — email blocked for new districts.';
        }
        return;
      }
      if (status) status.hidden = true;
      openBoardEmailConfirm(row, parentEmail, parentName);
    });
  }

  /* ---------- District (LEA route) page ---------- */
  function initLea(data) {
    const slug = pathSlug();
    const root = document.getElementById('entity-root');
    if (!root) return;
    const row = data.bySlug[slug];
    if (!row || row.entity_type === 'private' || row.state !== 'GA') {
      const alt = data.rows.find(function (r) {
        return AIPM.slugify(r.district) === slug && r.state === 'GA' && r.entity_type !== 'private';
      });
      if (!alt) {
        root.innerHTML =
          '<div class="card"><h1>District not found</h1><p class="lead">No Georgia district or charter match for this page.</p><p><a href="/ga/">Browse Georgia</a></p></div>';
        document.title = 'Not found · AI Policy Map';
        return;
      }
      paintLea(root, alt, data);
      return;
    }
    if (row.entity_type !== 'traditional' && row.entity_type !== 'charter') {
      root.innerHTML =
        '<div class="card"><h1>Wrong page</h1><p class="lead">This looks like a private school. Try the private school link from search.</p></div>';
      return;
    }
    paintLea(root, row, data);
  }

  function paintLea(root, row, data) {
    document.title = row.district + ' · AI Policy Map';
    const people =
      personCard(
        'Superintendent',
        row.superintendent_name,
        row.superintendent_title,
        row.superintendent_email,
        row.superintendent_phone
      ) +
      personCard(
        'Tech lead',
        row.tech_lead_name,
        row.tech_lead_title,
        row.tech_lead_email,
        row.tech_lead_phone
      ) +
      personCard('Board chair', row.board_chair_name, '', '', '');

    let boardBlock = '';
    if (hasVal(row.board_members)) {
      boardBlock =
        '<p class="note" style="margin-top:0.75rem"><strong>Board roster (from public data):</strong> ' +
        esc(row.board_members) +
        '</p>';
    }
    if (hasVal(row.board_roster_url)) {
      boardBlock +=
        '<p class="note"><a href="' +
        esc(row.board_roster_url) +
        '" target="_blank" rel="noopener noreferrer">Board roster link</a></p>';
    }

    const peers = gaLeas(data.rows)
      .filter(function (r) {
        return r.district !== row.district && r.metro && row.metro && r.metro === row.metro;
      })
      .slice(0, 5);

    const typeLabel = row.entity_type === 'charter' ? 'Charter school' : 'School district';

    /* Free parent order: hero → Email board → Safety → Board meeting → Impact → rest */
    root.innerHTML =
      '<div class="hero">' +
      '<p class="kicker"><span class="dot"></span> ' +
      typeLabel +
      ' · Georgia</p>' +
      '<h1>' +
      esc(row.district) +
      '</h1>' +
      '<p class="lead">' +
      (hasVal(row.one_liner)
        ? esc(row.one_liner)
        : 'A plain snapshot of this district’s published AI rules.') +
      '</p>' +
      '<div>' +
      entityBadge(row.entity_type) +
      ' ' +
      statusBadge(row.ai_policy_status) +
      metroBadgeHtml(row) +
      ' ' +
      (function () {
        const st = String(row.safety_ai_status || '')
          .trim()
          .toLowerCase();
        if (!st || st === 'none' || st === 'unknown') {
          return (
            '<span class="badge status-none">' +
            esc('No public AI safety rule found') +
            '</span>'
          );
        }
        return '';
      })() +
      '</div>' +
      locationApproxFinePrint(row) +
      '</div>' +
      renderEmailBoardCta(row) +
      renderSafetySurface(row) +
      renderNextBoardMeeting(row) +
      '<section class="section card"><div class="section-head"><h2>Student &amp; teacher impact</h2></div>' +
      renderImpact(row) +
      '</section>' +
      (isFultonLea(row) ? renderClaritySafety(row) : '') +
      renderProsCons(row) +
      '<section class="section card"><div class="section-head"><h2>Policy snapshot</h2></div>' +
      renderPolicySnapshot(row) +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Who to contact</h2></div>' +
      (people
        ? '<div class="people-grid">' + people + '</div>' + boardBlock
        : '<div class="stub">No contact names filled for this district yet.</div>') +
      (hasVal(row.people_last_verified_at)
        ? '<p class="note" style="margin-top:0.75rem">Contacts last checked: ' +
          esc(row.people_last_verified_at) +
          '</p>'
        : '') +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Nearby districts</h2></div>' +
      (peers.length
        ? '<ul class="entity-list">' +
          peers
            .map(function (p) {
              return (
                '<li><a href="' +
                esc(entityHref(p)) +
                '"><span>' +
                esc(p.district) +
                '</span><span class="meta">' +
                statusBadge(p.ai_policy_status) +
                '</span></a></li>'
              );
            })
            .join('') +
          '</ul><p class="note" style="margin-top:0.75rem"><a href="/compare/">Compare page (coming soon)</a></p>'
        : '<div class="stub">No same-area peers listed yet. <a href="/compare/">Compare page (coming soon)</a></div>') +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Stay updated</h2></div>' +
      '<div class="stub">Placeholder: monthly updates when this district’s AI rules change. No signup on this local preview.</div>' +
      '<div class="cta-row"><a class="btn primary" href="/about/">How we score</a><a class="btn" href="/ga/">All Georgia districts</a></div>' +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Sources</h2></div>' +
      sourceLinks(row.sources) +
      (hasVal(row.people_sources)
        ? '<h3 style="margin-top:1rem">Contact sources</h3>' + sourceLinks(row.people_sources)
        : '') +
      (hasVal(row.impact_sources)
        ? '<h3 style="margin-top:1rem">Impact sources</h3>' + sourceLinks(row.impact_sources)
        : '') +
      (hasVal(row.safety_sources)
        ? '<h3 style="margin-top:1rem">Safety sources</h3>' + sourceLinks(row.safety_sources)
        : '') +
      '</section>';

    bindSafetyViewControls(root, function () {
      paintLea(root, row, data);
    });
    bindEmailBoardControls(root, row);
  }

  /* ---------- Compare: Fulton vs Marietta (local prototype) ---------- */
  function findGaLeaBySlug(data, slug) {
    return (
      data.rows.find(function (r) {
        return (
          AIPM.slugify(r.district) === slug &&
          r.state === 'GA' &&
          r.entity_type !== 'private'
        );
      }) || null
    );
  }

  function renderCompareColumn(row, tagline) {
    const comp = compositeScore(row);
    const c = comp.parts.clarity;
    const s = comp.parts.safety;
    const href = '/lea/' + AIPM.slugify(row.district) + '/';
    let notes = '';
    if (hasVal(row.safety_ai_notes)) {
      notes = '<p class="sga-notes">' + esc(row.safety_ai_notes) + '</p>';
    }
    const headlineHtml = comp.score == null ? '—' : String(comp.score);
    return (
      '<div class="sga-card compare-col">' +
      '<p class="sga-kicker">' +
      esc(tagline) +
      '</p>' +
      '<h2 style="margin-top:0.15rem"><a href="' +
      esc(href) +
      '">' +
      esc(row.district) +
      '</a></h2>' +
      '<div class="sga-headline" style="margin:0.5rem 0 0.85rem">' +
      '<p class="sga-kicker">District score</p>' +
      '<p class="sga-headline-score ' +
      esc(comp.band) +
      '">' +
      headlineHtml +
      '</p>' +
      '<p class="sga-band">' +
      esc(comp.label) +
      '</p>' +
      '</div>' +
      '<p class="note" style="margin:0 0 0.75rem">' +
      esc(hasVal(row.one_liner) ? row.one_liner : 'AI rules snapshot') +
      '</p>' +
      scoreBar('Clarity', c) +
      scoreBar('Safety', s) +
      '<p class="note" style="margin:0.35rem 0 0.5rem">Graduation / Attendance: context only — not AI proof (do not move this score)</p>' +
      '<div class="sga-flags" style="margin-top:0.75rem">' +
      flagChip('Deepfake ban', row.deepfake_ban) +
      flagChip('Impersonation ban', row.impersonation_ban) +
      flagChip('HIB / Title IX link', row.links_to_hib_titleix) +
      flagChip('Approved tools only', row.approved_tools_only) +
      '</div>' +
      notes +
      '<p class="note" style="margin-top:0.75rem"><a href="' +
      esc(href) +
      '">Open full page →</a></p>' +
      '</div>'
    );
  }

  function initCompareFultonMarietta(data) {
    const root = document.getElementById('compare-root');
    if (!root) return;
    document.title = 'Fulton vs Marietta · One score each · AI Policy Map';
    const fulton = findGaLeaBySlug(data, 'fulton-county-schools');
    const marietta = findGaLeaBySlug(data, 'marietta-city-schools');
    if (!fulton || !marietta) {
      root.innerHTML =
        '<div class="card"><h1>Compare not ready</h1><p class="lead">Could not load both districts from the local CSV.</p></div>';
      return;
    }
    const fComp = compositeScore(fulton);
    const mComp = compositeScore(marietta);
    const fNum = fComp.score == null ? '—' : String(fComp.score);
    const mNum = mComp.score == null ? '—' : String(mComp.score);
    let gapLine =
      'One score each. Safety counts most — that is why the gap shows up in the headline numbers (' +
      fNum +
      ' vs ' +
      mNum +
      ').';
    if (fComp.score != null && mComp.score != null) {
      const diff = Math.abs(fComp.score - mComp.score);
      gapLine =
        'One score each. Safety counts most. Fulton leads Marietta by ' +
        diff +
        ' points on the district score (' +
        fNum +
        ' vs ' +
        mNum +
        ') because Fulton has board AI safety rules and Marietta does not (yet) in public sources we reviewed.';
    }
    root.innerHTML =
      '<section class="hero">' +
      '<p class="kicker"><span class="dot"></span> Local prototype · Side-by-side</p>' +
      '<h1>Fulton vs Marietta</h1>' +
      '<p class="lead">' +
      esc(gapLine) +
      '</p>' +
      '</section>' +
      '<section class="section card sga-dual">' +
      '<div class="section-head"><h2>One score each</h2></div>' +
      '<div class="sga-grid">' +
      renderCompareColumn(fulton, 'Safety hit') +
      renderCompareColumn(marietta, 'Safety none') +
      '</div>' +
      '<p class="note sga-proto">Provisional weights · Safety ~70 · Clarity ~30 · Grad/Attend context only · local only. Scores — Fulton ' +
      fNum +
      ' (Clarity ' +
      (fComp.parts.clarity.score == null ? '—' : fComp.parts.clarity.score) +
      ' / Safety ' +
      (fComp.parts.safety.score == null ? '—' : fComp.parts.safety.score) +
      '); Marietta ' +
      mNum +
      ' (Clarity ' +
      (mComp.parts.clarity.score == null ? '—' : mComp.parts.clarity.score) +
      ' / Safety ' +
      (mComp.parts.safety.score == null ? '—' : mComp.parts.safety.score) +
      ').</p>' +
      '</section>' +
      '<section class="card"><div class="cta-row">' +
      '<a class="btn primary" href="/lea/fulton-county-schools/">Fulton page</a>' +
      '<a class="btn" href="/lea/marietta-city-schools/">Marietta page</a>' +
      '<a class="btn" href="/compare/">All compare</a>' +
      '</div></section>';
  }

  /* ---------- Private page ---------- */
  function initPrivate(data) {
    const slug = pathSlug();
    const root = document.getElementById('entity-root');
    if (!root) return;
    let row = data.bySlug[slug];
    if (!row || row.entity_type !== 'private') {
      row = data.rows.find(function (r) {
        return AIPM.slugify(r.district) === slug && r.entity_type === 'private';
      });
    }
    if (!row) {
      root.innerHTML =
        '<div class="card"><h1>Private school not found</h1><p class="lead">No private school match for this page.</p><p><a href="/">Find your school</a></p></div>';
      document.title = 'Not found · AI Policy Map';
      return;
    }
    paintPrivate(root, row);
  }

  function paintPrivate(root, row) {
    document.title = row.district + ' · AI Policy Map';
    const people = personCard(
      'Head of school',
      row.head_of_school_name,
      row.head_of_school_title,
      row.head_of_school_email,
      row.head_of_school_phone
    );

    root.innerHTML =
      '<div class="hero">' +
      '<p class="kicker"><span class="dot"></span> Private school · Head of School</p>' +
      '<h1>' +
      esc(row.district) +
      '</h1>' +
      '<p class="lead">' +
      (hasVal(row.one_liner)
        ? esc(row.one_liner)
        : 'A plain snapshot of this school’s published AI rules. Private schools answer to a head of school, not an elected board.') +
      '</p>' +
      '<div>' +
      entityBadge('private') +
      ' ' +
      statusBadge(row.ai_policy_status) +
      metroBadgeHtml(row) +
      '</div>' +
      locationApproxFinePrint(row) +
      '</div>' +
      renderProsCons(row, { private: true }) +
      '<section class="section card"><div class="section-head"><h2>Head of school</h2></div>' +
      (people
        ? '<div class="people-grid">' + people + '</div>'
        : '<div class="stub">Head of school not listed yet.</div>') +
      '<div class="kv" style="margin-top:0.75rem">' +
      kv('Accreditation', row.accreditation) +
      '</div>' +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Policy snapshot</h2></div>' +
      renderPolicySnapshot(row) +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Student &amp; teacher impact</h2></div>' +
      renderImpact(row) +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Coming up</h2></div>' +
      '<div class="stub">Tip for families: ask the Head of School for a short written AI FAQ you can share. Private schools are not run by an elected board packet.</div>' +
      '</section>' +
      '<section class="section card"><div class="section-head"><h2>Sources</h2></div>' +
      sourceLinks(row.sources) +
      (hasVal(row.impact_sources)
        ? '<h3 style="margin-top:1rem">Impact sources</h3>' + sourceLinks(row.impact_sources)
        : '') +
      '</section>';
  }

  /* ---------- Static LEA pages (custom copy; paint Safety strip only) ---------- */
  function initLeaStatic(data) {
    const root = document.getElementById('safety-evidence-root');
    if (!root) return;
    const slug = pathSlug();
    let row = data.bySlug[slug];
    if (!row || row.entity_type === 'private' || row.state !== 'GA') {
      row = data.rows.find(function (r) {
        return (
          AIPM.slugify(r.district) === slug &&
          r.state === 'GA' &&
          r.entity_type !== 'private'
        );
      });
    }
    if (!row) {
      root.innerHTML =
        '<section class="section card safety-evidence"><p class="note">Safety evidence unavailable for this page.</p></section>';
      return;
    }
    function paintStaticSafety() {
      /* Match free parent priority: Email → Safety → Board meeting */
      root.innerHTML =
        renderEmailBoardCta(row) +
        renderSafetySurface(row) +
        renderNextBoardMeeting(row);
      bindEmailBoardControls(root, row);
    }
    paintStaticSafety();
    bindSafetyViewControls(root, paintStaticSafety);
  }

  function boot() {
    const page = document.body.getAttribute('data-page') || '';
    AIPM.loadDistricts('/districts.csv?v=' + (window.AIPM_DATA_VER || String(Date.now())))
      .then(function (data) {
        window.AIPM_SLUG_MAP = data.bySlug;
        setAipmData(data);
        if (page === 'home') initHome(data);
        else if (page === 'ga') initGa(data);
        else if (page === 'lea') initLea(data);
        else if (page === 'lea-static') initLeaStatic(data);
        else if (page === 'private') initPrivate(data);
        else if (page === 'compare-fulton-marietta') initCompareFultonMarietta(data);
      })
      .catch(function (err) {
        const root =
          document.getElementById('entity-root') || document.getElementById('boot-error');
        const msg =
          '<div class="card"><p class="lead">Could not load district data. From the <code>site/</code> folder run: <code>python3 -m http.server 8770 --bind 127.0.0.1</code>.</p><p class="note">' +
          esc(err.message || err) +
          '</p></div>';
        if (root) root.innerHTML = msg;
        console.error(err);
      });
  }


  if (AIPM) {
    AIPM.clarityScore = clarityScore;
    AIPM.safetyScore = safetyScore;
    AIPM.componentScoreGrad = componentScoreGrad;
    AIPM.componentScoreAttend = componentScoreAttend;
    AIPM.compositeScore = compositeScore;
    AIPM.renderClaritySafety = renderClaritySafety;
    AIPM.safetyEvidencePayload = safetyEvidencePayload;
    AIPM.renderSafetyEvidence = renderSafetyEvidence;
    AIPM.renderSafetyParentStrip = renderSafetyParentStrip;
    AIPM.renderSafetySurface = renderSafetySurface;
    AIPM.getSafetyViewMode = getSafetyViewMode;
    AIPM.setSafetyViewMode = setSafetyViewMode;
    AIPM.previewRecipients = previewRecipients;
    AIPM.sendParentBoardEmail = sendParentBoardEmail;
    AIPM.plainStatusOneLiner = plainStatusOneLiner;
    AIPM.renderNextBoardMeeting = renderNextBoardMeeting;
    AIPM.todayYmdAmericaNewYork = todayYmdAmericaNewYork;
    AIPM.boardMeetingFreshness = boardMeetingFreshness;
    AIPM.statusLabel = statusLabel;
    AIPM.statusHelp = statusHelp;
    AIPM.metroParentLabel = metroParentLabel;
    AIPM.metroBadgeHtml = metroBadgeHtml;
    AIPM.locationApproxFinePrint = locationApproxFinePrint;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
