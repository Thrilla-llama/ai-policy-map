(function () {
  const chooser = document.getElementById('role-chooser');
  const teacherFlow = document.getElementById('teacher-flow');
  const parentFlow = document.getElementById('parent-flow');
  const studentFlow = document.getElementById('student-flow');
  const thanks = document.getElementById('thanks');
  const form = document.getElementById('teacher-form');
  const districtInput = document.getElementById('districtSearch');
  const suggest = document.getElementById('districtSuggest');
  const entityPath = document.getElementById('entityPath');
  const privateField = document.getElementById('privateSchoolField');
  const privateBtn = document.getElementById('privatePath');
  const roleOther = document.getElementById('roleOther');
  const formError = document.getElementById('formError');

  const DEFAULT_STEP_NAMES = ['Screener', 'Published vs practice', 'Google vs ChatGPT'];
  const TOTAL_STEPS = 3;

  let leas = [];

  function show(name) {
    chooser.hidden = name !== 'chooser';
    teacherFlow.hidden = name !== 'teacher';
    parentFlow.hidden = name !== 'parent';
    studentFlow.hidden = name !== 'student';
    thanks.hidden = name !== 'thanks';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function normalizeRole(role) {
    const r = (role || '').toLowerCase().trim();
    if (r === 'teacher' || r === 'teacher/admin' || r === 'teacher-admin') return 'teacher';
    if (r === 'admin' || r === 'administrator') return 'admin';
    if (r === 'parent') return 'parent';
    if (r === 'student') return 'student';
    return null;
  }

  function fromBucket() {
    const params = new URLSearchParams(window.location.search);
    const from = (params.get('from') || '').toLowerCase();
    if (from === 'staff' || from === 'family') return from;
    return null;
  }

  function syncChooserGrids() {
    const bridge = document.getElementById('category-bridge');
    const staff = document.getElementById('role-grid-staff');
    const family = document.getElementById('role-grid-family');
    if (!bridge || !staff || !family) return;
    const from = fromBucket();
    bridge.hidden = !!from;
    staff.hidden = from !== 'staff';
    family.hidden = from !== 'family';
  }

  function chooserUrl(extra) {
    const params = new URLSearchParams();
    const from = fromBucket();
    if (from) params.set('from', from);
    if (extra) {
      Object.keys(extra).forEach((k) => {
        if (extra[k] != null) params.set(k, extra[k]);
      });
    }
    const q = params.toString();
    return q ? '/pulse/?' + q : '/pulse/';
  }

  function setRole(role, pushQuery) {
    const normalized = normalizeRole(role);
    if (normalized === 'teacher' || normalized === 'admin') {
      show('teacher');
      resetWizard(form);
      const adminRadio = document.querySelector('input[name="role_detail"][value="administrator"]');
      const teacherRadios = document.querySelectorAll('input[name="role_detail"]');
      if (normalized === 'admin' && adminRadio) {
        adminRadio.checked = true;
        teacherRadios.forEach((r) => {
          if (r !== adminRadio) r.checked = false;
        });
      }
      if (pushQuery) history.replaceState(null, '', chooserUrl({ role: normalized }));
    } else if (normalized === 'parent') {
      show('parent');
      resetWizard(document.getElementById('parent-form'));
      if (pushQuery) history.replaceState(null, '', chooserUrl({ role: 'parent' }));
    } else if (normalized === 'student') {
      show('student');
      resetWizard(document.getElementById('student-form'));
      if (pushQuery) history.replaceState(null, '', chooserUrl({ role: 'student' }));
    } else {
      show('chooser');
      syncChooserGrids();
      if (pushQuery) history.replaceState(null, '', chooserUrl());
    }
  }

  function roleFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return normalizeRole(params.get('role'));
  }

  document.querySelectorAll('.role-card[data-role]').forEach((btn) => {
    btn.addEventListener('click', () => setRole(btn.dataset.role, true));
  });

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => setRole(null, true));
  });

  const initial = roleFromQuery();
  if (initial) setRole(initial, false);
  else {
    show('chooser');
    syncChooserGrids();
  }

  fetch('/assets/ga-leas.json')
    .then((r) => r.json())
    .then((data) => {
      leas = Array.isArray(data) ? data : [];
    })
    .catch(() => {
      leas = [];
    });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function wireDistrictTypeahead(opts) {
    const input = opts.input;
    const list = opts.list;
    const entity = opts.entity;
    const privateFieldEl = opts.privateField;
    const privateBtnEl = opts.privateBtn;
    const privateSchoolInput = opts.privateSchoolInput;
    const multi = !!opts.multi;
    const pillsEl = opts.pills;
    const valueEl = opts.valueInput;
    if (!input || !list || !entity) return;

    let activeIndex = -1;
    let selected = [];

    function tokenize(s) {
      return String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    }

    function tokenHitsName(nameLower, nameTokens, tok) {
      if (nameLower.includes(tok)) return true;
      return nameTokens.some((nt) => nt === tok || nt.startsWith(tok) || (tok.length >= 4 && tok.startsWith(nt)));
    }

    // Partial / out-of-order: "district schools of decatur" → City Schools of Decatur
    // Distinctive tokens (e.g. Decatur) must match; soft words (district/schools) only rank.
    function scoreDistrict(name, query) {
      const n = name.toLowerCase();
      const q = query.toLowerCase().trim();
      if (!q) return 0;
      if (n.includes(q)) return 100;
      const stop = { of: 1, the: 1, and: 1, a: 1, an: 1, in: 1, for: 1 };
      const soft = {
        district: 1,
        school: 1,
        schools: 1,
        county: 1,
        city: 1,
        public: 1,
        system: 1,
        systems: 1,
        board: 1,
        independent: 1,
        charter: 1,
      };
      let tokens = tokenize(q).filter((tok) => tok.length >= 2 && !stop[tok]);
      if (!tokens.length) tokens = tokenize(q).filter((tok) => tok.length >= 2);
      if (!tokens.length) return 0;
      const nameTokens = tokenize(n);
      const distinctive = tokens.filter((tok) => tok.length >= 4 && !soft[tok]);
      const softToks = tokens.filter((tok) => !distinctive.includes(tok));
      if (distinctive.length && !distinctive.every((tok) => tokenHitsName(n, nameTokens, tok))) {
        return 0;
      }
      let softHits = 0;
      softToks.forEach((tok) => {
        if (tokenHitsName(n, nameTokens, tok)) softHits += 1;
      });
      const softScore = softToks.length ? softHits / softToks.length : 1;
      const distScore = distinctive.length ? 1 : softScore;
      // Prefer distinctive hits; soft words break ties.
      return distScore * 10 + softScore;
    }

    function syncMultiValue() {
      if (!multi) return;
      if (valueEl) valueEl.value = selected.join(';');
      input.required = false;
      if (pillsEl) {
        pillsEl.innerHTML = selected
          .map(
            (name) =>
              `<span class="district-pill"><span>${escapeHtml(name)}</span>` +
              `<button type="button" class="district-pill-remove" data-name="${escapeAttr(
                name
              )}" aria-label="Remove ${escapeAttr(name)}">×</button></span>`
          )
          .join('');
      }
    }

    function renderSuggest(q) {
      const query = (q || '').trim().toLowerCase();
      if (!query || query.length < 1) {
        list.hidden = true;
        list.innerHTML = '';
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      const selectedSet = new Set(selected.map((n) => n.toLowerCase()));
      const matches = leas
        .map((d) => ({ d, score: scoreDistrict(d.name, query) }))
        .filter((x) => x.score > 0 && !selectedSet.has(x.d.name.toLowerCase()))
        .sort((a, b) => b.score - a.score || a.d.name.length - b.d.name.length)
        .slice(0, 8)
        .map((x) => x.d);
      if (!matches.length) {
        list.hidden = true;
        list.innerHTML = '';
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      list.innerHTML = matches
        .map(
          (d, i) =>
            `<li role="option" data-name="${escapeAttr(d.name)}" aria-selected="${
              i === activeIndex ? 'true' : 'false'
            }">${escapeHtml(d.name)}<span class="suggest-type">${
              d.type === 'charter' ? 'charter' : 'LEA'
            }</span></li>`
        )
        .join('');
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function pickDistrict(name) {
      if (!name) return;
      entity.value = 'lea';
      if (privateFieldEl) privateFieldEl.hidden = true;
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      if (multi) {
        if (!selected.some((n) => n.toLowerCase() === name.toLowerCase())) {
          selected.push(name);
        }
        input.value = '';
        syncMultiValue();
        input.focus();
        return;
      }
      input.value = name;
      input.required = true;
    }

    function removeDistrict(name) {
      selected = selected.filter((n) => n.toLowerCase() !== String(name).toLowerCase());
      syncMultiValue();
      if (input.value.trim()) renderSuggest(input.value);
    }

    input.addEventListener('input', () => {
      activeIndex = -1;
      if (entity.value === 'private') {
        entity.value = 'lea';
        if (privateFieldEl) privateFieldEl.hidden = true;
        if (!multi) input.required = true;
        if (multi) {
          selected = [];
          syncMultiValue();
        }
      }
      renderSuggest(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('li')];
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        renderSuggest(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        renderSuggest(input.value);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        pickDistrict(items[activeIndex].dataset.name);
      } else if (e.key === 'Escape') {
        list.hidden = true;
      }
    });

    list.addEventListener('mousedown', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      e.preventDefault();
      pickDistrict(li.dataset.name);
    });

    if (pillsEl) {
      pillsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.district-pill-remove');
        if (!btn) return;
        e.preventDefault();
        removeDistrict(btn.dataset.name);
      });
    }

    document.addEventListener('click', (e) => {
      if (!list.contains(e.target) && e.target !== input) {
        list.hidden = true;
      }
    });

    if (privateBtnEl) {
      privateBtnEl.addEventListener('click', () => {
        entity.value = 'private';
        if (multi) {
          selected = [];
          syncMultiValue();
          input.value = '';
        } else {
          input.value = 'Private / independent';
        }
        input.required = false;
        if (privateFieldEl) privateFieldEl.hidden = false;
        list.hidden = true;
        if (privateSchoolInput) privateSchoolInput.focus();
      });
    }

    if (multi) syncMultiValue();

    return {
      validateLea() {
        if (entity.value === 'private') return true;
        if (multi) return selected.length > 0;
        const name = input.value.trim();
        const known = leas.some((d) => d.name.toLowerCase() === name.toLowerCase());
        return !!(name && known);
      },
      focus() {
        input.focus();
      },
    };
  }

  const teacherDistrict = wireDistrictTypeahead({
    input: districtInput,
    list: suggest,
    entity: entityPath,
    privateField: privateField,
    privateBtn: privateBtn,
    privateSchoolInput: document.getElementById('privateSchool'),
  });

  const parentDistrict = wireDistrictTypeahead({
    input: document.getElementById('parentDistrictSearch'),
    list: document.getElementById('parentDistrictSuggest'),
    entity: document.getElementById('parentEntityPath'),
    privateField: document.getElementById('parentPrivateSchoolField'),
    privateBtn: document.getElementById('parentPrivatePath'),
    privateSchoolInput: document.getElementById('parentPrivateSchool'),
  });

  const studentDistrict = wireDistrictTypeahead({
    input: document.getElementById('studentDistrictSearch'),
    list: document.getElementById('studentDistrictSuggest'),
    entity: document.getElementById('studentEntityPath'),
    privateField: document.getElementById('studentPrivateSchoolField'),
    privateBtn: document.getElementById('studentPrivatePath'),
    privateSchoolInput: document.getElementById('studentPrivateSchool'),
  });


  if (form) {
    form.querySelectorAll('input[name="role_detail"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const isOther = radio.value === 'other' && radio.checked;
        roleOther.hidden = !isOther;
        roleOther.required = isOther;
        if (!isOther) roleOther.value = '';
      });
    });
  }

  // Parent: optional one-liner when Yes / Suspected on AI issues
  (function wireParentAiIssuesNote() {
    const noteField = document.getElementById('parentAiIssuesNoteField');
    const noteInput = document.getElementById('parentAiIssuesNote');
    const parentForm = document.getElementById('parent-form');
    if (!parentForm || !noteField) return;
    parentForm.querySelectorAll('input[name="ai_issues"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const show = radio.checked && (radio.value === 'yes' || radio.value === 'suspected');
        noteField.hidden = !show;
        if (!show && noteInput) noteInput.value = '';
      });
    });
  })();

  /* ---- Wizard helpers ---- */

  function stepNamesFor(formEl) {
    const panel = formEl && formEl.closest('.pulse-panel');
    const progress = panel && panel.querySelector('[data-wizard-progress]');
    const raw = progress && progress.getAttribute('data-step-names');
    if (raw) return raw.split('|');
    return DEFAULT_STEP_NAMES;
  }

  function getStep(formEl) {
    return Number(formEl.dataset.wizardStep || '1');
  }

  function setStep(formEl, step) {
    const s = Math.max(1, Math.min(TOTAL_STEPS, step));
    formEl.dataset.wizardStep = String(s);
    formEl.querySelectorAll('.wizard-step').forEach((fs) => {
      const n = Number(fs.dataset.step);
      fs.hidden = n !== s;
    });
    const panel = formEl.closest('.pulse-panel');
    const progress = panel && panel.querySelector('[data-wizard-progress]');
    const names = stepNamesFor(formEl);
    if (progress) {
      const numEl = progress.querySelector('[data-step-num]');
      const nameEl = progress.querySelector('[data-step-name]');
      const bar = progress.querySelector('[data-wizard-bar]');
      const fill = progress.querySelector('.wizard-bar-fill');
      if (numEl) numEl.textContent = String(s);
      if (nameEl) nameEl.textContent = names[s - 1] || '';
      if (bar) bar.setAttribute('aria-valuenow', String(s));
      if (fill) fill.style.width = (s / TOTAL_STEPS) * 100 + '%';
    }
    const backBtn = formEl.querySelector('[data-wizard-back]');
    const nextBtn = formEl.querySelector('[data-wizard-next]');
    const submitBtn = formEl.querySelector('[data-wizard-submit]');
    if (backBtn) backBtn.hidden = s === 1;
    if (nextBtn) nextBtn.hidden = s === TOTAL_STEPS;
    if (submitBtn) submitBtn.hidden = s !== TOTAL_STEPS;
    const err = formEl.querySelector('.form-error');
    if (err) err.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetWizard(formEl) {
    if (!formEl) return;
    setStep(formEl, 1);
  }

  function validateStep(formEl, step) {
    const fs = formEl.querySelector('.wizard-step[data-step="' + step + '"]');
    if (!fs) return true;

    if (formEl.id === 'teacher-form' && step === 1 && teacherDistrict) {
      if (!teacherDistrict.validateLea()) {
        if (formError) {
          formError.textContent =
            'Please pick a Georgia district from the suggestions (or choose Private / independent).';
          formError.hidden = false;
        }
        teacherDistrict.focus();
        return false;
      }
    }

    if (formEl.id === 'parent-form' && step === 1 && parentDistrict) {
      if (!parentDistrict.validateLea()) {
        const err = formEl.querySelector('.form-error');
        if (err) {
          err.textContent =
            'Please pick a Georgia district from the suggestions (or choose Private / independent).';
          err.hidden = false;
        }
        parentDistrict.focus();
        return false;
      }
    }

    if (formEl.id === 'student-form' && step === 1 && studentDistrict) {
      if (!studentDistrict.validateLea()) {
        const err = formEl.querySelector('.form-error');
        if (err) {
          err.textContent =
            'Please pick a Georgia district from the suggestions (or choose Private / independent).';
          err.hidden = false;
        }
        studentDistrict.focus();
        return false;
      }
    }

    const required = fs.querySelectorAll('input[required], select[required], textarea[required]');
    const groups = {};
    let ok = true;
    const checkboxGroups = {};
    required.forEach((el) => {
      if (el.type === 'radio') {
        const key = el.name;
        // Only the first option is marked required in HTML; collect the whole group.
        if (!groups[key]) {
          groups[key] = [...fs.querySelectorAll('input[type="radio"][name="' + key + '"]')];
        }
      } else if (el.type === 'checkbox') {
        // handled via data-required-group below
      } else if (!el.value || !String(el.value).trim()) {
        ok = false;
        el.reportValidity();
      }
    });
    fs.querySelectorAll('input[type="checkbox"][data-required-group]').forEach((el) => {
      const key = el.getAttribute('data-required-group') || el.name;
      if (!checkboxGroups[key]) checkboxGroups[key] = [];
      checkboxGroups[key].push(el);
    });
    Object.keys(groups).forEach((name) => {
      const radios = groups[name];
      if (!radios.some((r) => r.checked)) {
        ok = false;
        radios[0].reportValidity();
      }
    });
    Object.keys(checkboxGroups).forEach((name) => {
      const boxes = checkboxGroups[name];
      if (!boxes.some((b) => b.checked)) {
        ok = false;
        boxes[0].reportValidity();
      }
    });

    if (formEl.id === 'teacher-form' && step === 1 && roleOther && !roleOther.hidden && roleOther.required) {
      if (!roleOther.value.trim()) {
        ok = false;
        roleOther.reportValidity();
      }
    }

    if (!ok) {
      const err = formEl.querySelector('.form-error');
      if (err) {
        err.textContent = 'Please complete the required questions above.';
        err.hidden = false;
      }
    }
    return ok;
  }

  function wireWizard(formEl) {
    if (!formEl) return;
    setStep(formEl, 1);
    const nextBtn = formEl.querySelector('[data-wizard-next]');
    const backBtn = formEl.querySelector('[data-wizard-back]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const step = getStep(formEl);
        if (!validateStep(formEl, step)) return;
        setStep(formEl, step + 1);
      });
    }
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        setStep(formEl, getStep(formEl) - 1);
      });
    }
  }

  function formPayload(formEl) {
    const fd = new FormData(formEl);
    const data = {};
    fd.forEach((value, key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (Array.isArray(data[key])) data[key].push(value);
        else data[key] = [data[key], value];
      } else {
        data[key] = value;
      }
    });
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) data[key] = data[key].join(';');
    });
    return data;
  }

  function resolveRole(pathName, payload) {
    if (pathName === 'teacher') {
      if (payload.role_detail === 'administrator') return 'admin';
      return 'teacher';
    }
    if (pathName === 'parent' || pathName === 'student' || pathName === 'admin') return pathName;
    return pathName || 'teacher';
  }

  function getSupabaseClient() {
    const cfg = window.APM_PULSE || {};
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
    if (!window.supabase || !window.supabase.createClient) return null;
    return window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  function newResponseId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function renderPeerMirror(mirror) {
    const scopeEl = document.getElementById('peer-scope');
    const cardsEl = document.getElementById('peer-cards');
    if (!scopeEl || !cardsEl) return;
    cardsEl.innerHTML = '';
    if (!mirror || !mirror.ok) {
      scopeEl.hidden = true;
      cardsEl.innerHTML = '';
      return;
    }
    // Simple pool label only — never “you’re early” / sample-size apology
    scopeEl.textContent = mirror.scope_label ? ('Among ' + mirror.scope_label) : '';
    scopeEl.hidden = !mirror.scope_label;
    const cards = Array.isArray(mirror.cards) ? mirror.cards : [];
    cardsEl.innerHTML = cards
      .map((card) => {
        const text = String(card.text || '').replace(/^(\d+)%/, '<span class="peer-pct">$1%</span>');
        return '<div class="peer-card">' + text + '</div>';
      })
      .join('');
  }

  async function savePulse(formEl, pathName) {
    const payload = formPayload(formEl);
    const role = resolveRole(pathName, payload);
    const districtKey = (payload.district || '').trim() || null;
    const gradeBand = (payload.grade_band || '').trim() || null;
    const params = new URLSearchParams(window.location.search);
    const source = (params.get('source') || 'web').slice(0, 64);
    const id = newResponseId();
    const row = {
      id: id,
      role: role,
      state: 'GA',
      district_key: districtKey,
      grade_band: gradeBand,
      payload: payload,
      form_version: (window.APM_PULSE && window.APM_PULSE.formVersion) || 'v1-2026-09-13',
      source: source,
    };
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Pulse backend is not configured.');
    }
    const { error } = await client.from('pulse_responses').insert([row]);
    if (error) throw error;
    let mirror = null;
    try {
      const { data, error: rpcErr } = await client.rpc('pulse_peer_mirror', { p_response_id: id });
      if (!rpcErr) mirror = data;
    } catch (_) {
      /* peer mirror is best-effort */
    }
    return { row: row, mirror: mirror };
  }

  if (form) {
    wireWizard(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formError.hidden = true;
      const step = getStep(form);
      if (step !== TOTAL_STEPS) {
        if (validateStep(form, step)) setStep(form, step + 1);
        return;
      }
      for (let s = 1; s <= TOTAL_STEPS; s++) {
        if (!validateStep(form, s)) {
          setStep(form, s);
          return;
        }
      }
      const submitBtn = form.querySelector('[data-wizard-submit]');
      if (submitBtn) submitBtn.disabled = true;
      savePulse(form, 'teacher')
        .then((result) => {
          renderPeerMirror(result && result.mirror);
          show('thanks');
          const role = resolveRole('teacher', formPayload(form));
          history.replaceState(null, '', '/pulse/?role=' + role + '&done=1');
        })
        .catch((err) => {
          if (formError) {
            formError.textContent = 'Couldn’t save your answers. Check your connection and try again.';
            formError.hidden = false;
          }
          console.error('pulse save failed', err);
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function wireSimplePulseForm(formId, errorId, pathName) {
    const f = document.getElementById(formId);
    const err = document.getElementById(errorId);
    if (!f) return;
    wireWizard(f);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (err) err.hidden = true;
      const step = getStep(f);
      if (step !== TOTAL_STEPS) {
        if (validateStep(f, step)) setStep(f, step + 1);
        return;
      }
      for (let s = 1; s <= TOTAL_STEPS; s++) {
        if (!validateStep(f, s)) {
          setStep(f, s);
          return;
        }
      }
      const submitBtn = f.querySelector('[data-wizard-submit]');
      if (submitBtn) submitBtn.disabled = true;
      savePulse(f, pathName)
        .then((result) => {
          renderPeerMirror(result && result.mirror);
          // Parent share CTA; others get a generic share line
          const share = document.querySelector('#thanks .pulse-actions .text-link');
          if (share) {
            share.textContent = pathName === 'parent'
              ? 'Share the pulse with another parent'
              : 'Invite someone else to take the pulse';
            share.setAttribute('href', '/pulse/');
          }
          show('thanks');
          history.replaceState(null, '', '/pulse/?role=' + pathName + '&done=1');
        })
        .catch((saveErr) => {
          if (err) {
            err.textContent = 'Couldn’t save your answers. Check your connection and try again.';
            err.hidden = false;
          }
          console.error('pulse save failed', saveErr);
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
  wireSimplePulseForm('parent-form', 'parentFormError', 'parent');
  wireSimplePulseForm('student-form', 'studentFormError', 'student');

})();
