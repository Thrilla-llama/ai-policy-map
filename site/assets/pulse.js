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

  let leas = [];
  let activeIndex = -1;

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
    // Old combined deep links: teacher/admin → teacher; parent/student → respective if present
    if (r === 'teacher' || r === 'admin' || r === 'teacher/admin' || r === 'teacher-admin') {
      return 'teacher';
    }
    if (r === 'parent' || r === 'parent/student' || r === 'parent-student') {
      return 'parent';
    }
    if (r === 'student' || r === 'student/parent' || r === 'student-parent') {
      return 'student';
    }
    return null;
  }

  function roleFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return normalizeRole(params.get('role'));
  }

  function setRole(role, pushQuery) {
    const normalized = normalizeRole(role);
    if (normalized === 'teacher') {
      show('teacher');
      if (pushQuery) history.replaceState(null, '', '/pulse/?role=teacher');
    } else if (normalized === 'parent') {
      show('parent');
      if (pushQuery) history.replaceState(null, '', '/pulse/?role=parent');
    } else if (normalized === 'student') {
      show('student');
      if (pushQuery) history.replaceState(null, '', '/pulse/?role=student');
    } else {
      show('chooser');
      if (pushQuery) history.replaceState(null, '', '/pulse/');
    }
  }

  document.querySelectorAll('.role-card').forEach((btn) => {
    btn.addEventListener('click', () => setRole(btn.dataset.role, true));
  });

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => setRole(null, true));
  });

  // Deep-link on load
  const initial = roleFromQuery();
  if (initial) setRole(initial, false);
  else {
    show('chooser');
    const from = new URLSearchParams(window.location.search).get('from');
    if (from === 'staff') {
      document.querySelector('.role-card[data-role="teacher"]')?.classList.add('is-suggested');
    } else if (from === 'family') {
      document.querySelector('.role-card[data-role="parent"]')?.classList.add('is-suggested');
      document.querySelector('.role-card[data-role="student"]')?.classList.add('is-suggested');
    }
  }

  fetch('/assets/ga-leas.json')
    .then((r) => r.json())
    .then((data) => {
      leas = Array.isArray(data) ? data : [];
    })
    .catch(() => {
      leas = [];
    });

  function renderSuggest(q) {
    const query = (q || '').trim().toLowerCase();
    if (!query || query.length < 1) {
      suggest.hidden = true;
      suggest.innerHTML = '';
      districtInput.setAttribute('aria-expanded', 'false');
      return;
    }
    const matches = leas
      .filter((d) => d.name.toLowerCase().includes(query))
      .slice(0, 8);
    if (!matches.length) {
      suggest.hidden = true;
      suggest.innerHTML = '';
      districtInput.setAttribute('aria-expanded', 'false');
      return;
    }
    suggest.innerHTML = matches
      .map(
        (d, i) =>
          `<li role="option" data-name="${escapeAttr(d.name)}" aria-selected="${
            i === activeIndex ? 'true' : 'false'
          }">${escapeHtml(d.name)}<span class="suggest-type">${
            d.type === 'charter' ? 'charter' : 'LEA'
          }</span></li>`
      )
      .join('');
    suggest.hidden = false;
    districtInput.setAttribute('aria-expanded', 'true');
  }

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

  function pickDistrict(name) {
    districtInput.value = name;
    entityPath.value = 'lea';
    privateField.hidden = true;
    suggest.hidden = true;
    districtInput.setAttribute('aria-expanded', 'false');
    districtInput.required = true;
  }

  districtInput.addEventListener('input', () => {
    activeIndex = -1;
    if (entityPath.value === 'private') {
      entityPath.value = 'lea';
      privateField.hidden = true;
      districtInput.required = true;
    }
    renderSuggest(districtInput.value);
  });

  districtInput.addEventListener('keydown', (e) => {
    const items = [...suggest.querySelectorAll('li')];
    if (suggest.hidden || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      renderSuggest(districtInput.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      renderSuggest(districtInput.value);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      pickDistrict(items[activeIndex].dataset.name);
    } else if (e.key === 'Escape') {
      suggest.hidden = true;
    }
  });

  suggest.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    pickDistrict(li.dataset.name);
  });

  document.addEventListener('click', (e) => {
    if (!suggest.contains(e.target) && e.target !== districtInput) {
      suggest.hidden = true;
    }
  });

  privateBtn.addEventListener('click', () => {
    entityPath.value = 'private';
    districtInput.value = 'Private / independent';
    districtInput.required = false;
    privateField.hidden = false;
    suggest.hidden = true;
    document.getElementById('privateSchool').focus();
  });

  form.querySelectorAll('input[name="role_detail"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const isOther = radio.value === 'other' && radio.checked;
      roleOther.hidden = !isOther;
      roleOther.required = isOther;
      if (!isOther) roleOther.value = '';
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.hidden = true;

    if (entityPath.value === 'lea') {
      const name = districtInput.value.trim();
      const known = leas.some((d) => d.name.toLowerCase() === name.toLowerCase());
      if (!name || !known) {
        formError.textContent =
          'Please pick a Georgia district from the suggestions (or choose Private / independent).';
        formError.hidden = false;
        districtInput.focus();
        return;
      }
    }

    if (!form.checkValidity()) {
      formError.textContent = 'Please complete the required questions above.';
      formError.hidden = false;
      form.reportValidity();
      return;
    }

    // Stub only — no backend. Keep a local copy for debugging.
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      data.submitted_at = new Date().toISOString();
      data.path = 'teacher';
      const prev = JSON.parse(localStorage.getItem('apm_pulse_stubs') || '[]');
      prev.push(data);
      localStorage.setItem('apm_pulse_stubs', JSON.stringify(prev.slice(-20)));
    } catch (_) {
      /* ignore storage errors */
    }

    show('thanks');
    history.replaceState(null, '', '/pulse/?role=teacher&done=1');
  });

  function wireSimplePulseForm(formId, errorId, pathName) {
    const f = document.getElementById(formId);
    const err = document.getElementById(errorId);
    if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (err) err.hidden = true;
      if (!f.checkValidity()) {
        if (err) {
          err.textContent = 'Please complete the required questions above.';
          err.hidden = false;
        }
        f.reportValidity();
        return;
      }
      try {
        const data = Object.fromEntries(new FormData(f).entries());
        data.submitted_at = new Date().toISOString();
        data.path = pathName;
        const prev = JSON.parse(localStorage.getItem('apm_pulse_stubs') || '[]');
        prev.push(data);
        localStorage.setItem('apm_pulse_stubs', JSON.stringify(prev.slice(-20)));
      } catch (_) {}
      show('thanks');
      history.replaceState(null, '', '/pulse/?role=' + pathName + '&done=1');
    });
  }
  wireSimplePulseForm('parent-form', 'parentFormError', 'parent');
  wireSimplePulseForm('student-form', 'studentFormError', 'student');

})();
