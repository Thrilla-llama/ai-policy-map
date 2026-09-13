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
    if (!input || !list || !entity) return;

    let activeIndex = -1;

    function renderSuggest(q) {
      const query = (q || '').trim().toLowerCase();
      if (!query || query.length < 1) {
        list.hidden = true;
        list.innerHTML = '';
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      const matches = leas
        .filter((d) => d.name.toLowerCase().includes(query))
        .slice(0, 8);
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
      input.value = name;
      entity.value = 'lea';
      if (privateFieldEl) privateFieldEl.hidden = true;
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.required = true;
    }

    input.addEventListener('input', () => {
      activeIndex = -1;
      if (entity.value === 'private') {
        entity.value = 'lea';
        if (privateFieldEl) privateFieldEl.hidden = true;
        input.required = true;
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

    document.addEventListener('click', (e) => {
      if (!list.contains(e.target) && e.target !== input) {
        list.hidden = true;
      }
    });

    if (privateBtnEl) {
      privateBtnEl.addEventListener('click', () => {
        entity.value = 'private';
        input.value = 'Private / independent';
        input.required = false;
        if (privateFieldEl) privateFieldEl.hidden = false;
        list.hidden = true;
        if (privateSchoolInput) privateSchoolInput.focus();
      });
    }

    return {
      validateLea() {
        if (entity.value === 'private') return true;
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
    required.forEach((el) => {
      if (el.type === 'radio') {
        const key = el.name;
        if (!groups[key]) groups[key] = [];
        groups[key].push(el);
      } else if (el.type === 'checkbox') {
        if (!el.checked) ok = false;
      } else if (!el.value || !String(el.value).trim()) {
        ok = false;
        el.reportValidity();
      }
    });
    Object.keys(groups).forEach((name) => {
      const radios = groups[name];
      if (!radios.some((r) => r.checked)) {
        ok = false;
        radios[0].reportValidity();
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

  function stubSave(formEl, pathName) {
    try {
      const data = Object.fromEntries(new FormData(formEl).entries());
      data.submitted_at = new Date().toISOString();
      data.path = pathName;
      const prev = JSON.parse(localStorage.getItem('apm_pulse_stubs') || '[]');
      prev.push(data);
      localStorage.setItem('apm_pulse_stubs', JSON.stringify(prev.slice(-20)));
    } catch (_) {
      /* ignore storage errors */
    }
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
      stubSave(form, 'teacher');
      show('thanks');
      history.replaceState(null, '', '/pulse/?role=teacher&done=1');
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
      stubSave(f, pathName);
      show('thanks');
      history.replaceState(null, '', '/pulse/?role=' + pathName + '&done=1');
    });
  }
  wireSimplePulseForm('parent-form', 'parentFormError', 'parent');
  wireSimplePulseForm('student-form', 'studentFormError', 'student');

})();
