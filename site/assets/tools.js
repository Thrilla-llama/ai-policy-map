/* School AI tools — product grid + deployment detail from public CSV */
(function () {
  'use strict';

  var CLASS_LABELS = {
    classroom_genai: 'Classroom GenAI',
    camera_ai_gun_detect: 'Camera gun-detect AI',
    device_account_monitor: 'Device / account monitoring',
    ai_tutoring_platform: 'AI tutoring platform',
    entry_portal_weapons: 'Entry portal weapons AI',
    vape_aggression_sensor: 'Vape / aggression sensor',
    alpr_vehicle_ai: 'ALPR / vehicle AI'
  };

  var SCOPE_LABELS = {
    districtwide: 'Districtwide',
    single_campus: 'Single campus',
    multi_campus: 'Multi-campus',
    pilot: 'Pilot',
    unknown: 'Unknown'
  };

  var CSV_URL = '/data/school_ai_tools.csv?v=1789417564';

  var state = {
    rows: [],
    products: [],
    activeClass: 'all',
    query: '',
    selectedKey: null
  };

  function slugify(name) {
    if (window.AIPM && typeof window.AIPM.slugify === 'function') {
      return window.AIPM.slugify(name);
    }
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function parseCSV(text) {
    if (window.AIPM && typeof window.AIPM.parseCSV === 'function') {
      return window.AIPM.parseCSV(text);
    }
    throw new Error('csv.js not loaded');
  }

  function humanClass(code) {
    if (!code) return 'Other';
    if (CLASS_LABELS[code]) return CLASS_LABELS[code];
    return String(code)
      .split('_')
      .map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  }

  function humanScope(code) {
    if (!code) return '—';
    if (SCOPE_LABELS[code]) return SCOPE_LABELS[code];
    return String(code).replace(/_/g, ' ');
  }

  function humanStatus(code) {
    if (!code) return '—';
    return String(code).replace(/_/g, ' ');
  }

  function productKey(row) {
    return (row.vendor || '').trim() + '||' + (row.product_name || '').trim();
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function splitSources(raw) {
    if (!raw) return [];
    return String(raw)
      .split(';')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function sourceHost(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
      return 'source';
    }
  }

  function buildProducts(rows) {
    var map = Object.create(null);
    rows.forEach(function (row) {
      var key = productKey(row);
      if (!key || key === '||') return;
      if (!map[key]) {
        map[key] = {
          key: key,
          product_name: (row.product_name || '').trim() || 'Unnamed product',
          vendor: (row.vendor || '').trim() || 'Unknown vendor',
          tool_class: row.tool_class || '',
          deployments: [],
          states: Object.create(null)
        };
      }
      map[key].deployments.push(row);
      if (row.state) map[key].states[row.state] = true;
      // Prefer a non-empty class if first row lacked one
      if (!map[key].tool_class && row.tool_class) map[key].tool_class = row.tool_class;
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .sort(function (a, b) {
        if (b.deployments.length !== a.deployments.length) {
          return b.deployments.length - a.deployments.length;
        }
        return a.product_name.localeCompare(b.product_name);
      });
  }

  function filteredProducts() {
    var q = state.query.trim().toLowerCase();
    return state.products.filter(function (p) {
      if (state.activeClass !== 'all' && p.tool_class !== state.activeClass) return false;
      if (!q) return true;
      if (p.product_name.toLowerCase().indexOf(q) >= 0) return true;
      if (p.vendor.toLowerCase().indexOf(q) >= 0) return true;
      return p.deployments.some(function (d) {
        var name = (d.lea_or_school_name || '').toLowerCase();
        var match = (d.districts_csv_match || '').toLowerCase();
        var host = (d.host_lea_districts_csv_match || '').toLowerCase();
        return name.indexOf(q) >= 0 || match.indexOf(q) >= 0 || host.indexOf(q) >= 0;
      });
    });
  }

  function setStats() {
    var classes = Object.create(null);
    var states = Object.create(null);
    state.rows.forEach(function (r) {
      if (r.tool_class) classes[r.tool_class] = true;
      if (r.state) states[r.state] = true;
    });
    document.getElementById('statDeployments').textContent = String(state.rows.length);
    document.getElementById('statProducts').textContent = String(state.products.length);
    document.getElementById('statStates').textContent = String(Object.keys(states).length);
    document.getElementById('statClasses').textContent = String(Object.keys(classes).length);
  }

  function renderChips() {
    var counts = Object.create(null);
    state.rows.forEach(function (r) {
      var c = r.tool_class || 'other';
      counts[c] = (counts[c] || 0) + 1;
    });
    var order = Object.keys(CLASS_LABELS).concat(
      Object.keys(counts).filter(function (k) {
        return !CLASS_LABELS[k];
      })
    );
    var seen = Object.create(null);
    var html =
      '<button type="button" class="tools-chip" data-class="all" aria-pressed="' +
      (state.activeClass === 'all' ? 'true' : 'false') +
      '">All (' +
      state.rows.length +
      ')</button>';
    order.forEach(function (code) {
      if (seen[code] || !counts[code]) return;
      seen[code] = true;
      html +=
        '<button type="button" class="tools-chip" data-class="' +
        escapeHtml(code) +
        '" aria-pressed="' +
        (state.activeClass === code ? 'true' : 'false') +
        '">' +
        escapeHtml(humanClass(code)) +
        ' (' +
        counts[code] +
        ')</button>';
    });
    var el = document.getElementById('classChips');
    el.innerHTML = html;
    el.querySelectorAll('.tools-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeClass = btn.getAttribute('data-class') || 'all';
        renderChips();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    var list = filteredProducts();
    var meta = document.getElementById('toolsMeta');
    var grid = document.getElementById('productGrid');
    meta.textContent =
      list.length === 1
        ? '1 product'
        : list.length + ' products' + (state.query || state.activeClass !== 'all' ? ' (filtered)' : '');

    if (!list.length) {
      grid.innerHTML = '<p class="tools-empty">No products match this filter.</p>';
      return;
    }

    grid.innerHTML = list
      .map(function (p) {
        var states = Object.keys(p.states).sort();
        var places = p.deployments.length;
        var placesLabel = places === 1 ? '1 place' : places + ' places';
        var statesLabel =
          states.length <= 4
            ? states.join(', ')
            : states.slice(0, 3).join(', ') + ' +' + (states.length - 3);
        var active = state.selectedKey === p.key ? ' is-active' : '';
        return (
          '<button type="button" class="tools-card' +
          active +
          '" data-key="' +
          escapeHtml(p.key) +
          '">' +
          '<p class="tools-card-class">' +
          escapeHtml(humanClass(p.tool_class)) +
          '</p>' +
          '<h3>' +
          escapeHtml(p.product_name) +
          '</h3>' +
          '<p class="tools-card-vendor">' +
          escapeHtml(p.vendor) +
          '</p>' +
          '<p class="tools-card-foot">' +
          escapeHtml(placesLabel) +
          ' · ' +
          escapeHtml(statesLabel || '—') +
          '</p>' +
          '</button>'
        );
      })
      .join('');

    grid.querySelectorAll('.tools-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openDetail(card.getAttribute('data-key'));
      });
    });
  }

  function findProduct(key) {
    for (var i = 0; i < state.products.length; i++) {
      if (state.products[i].key === key) return state.products[i];
    }
    return null;
  }

  function leaHref(row) {
    var match = (row.districts_csv_match || '').trim();
    if (!match) return null;
    var slug = slugify(match);
    if (!slug) return null;
    return '/lea/' + slug + '/';
  }

  function entityCell(row) {
    var name = row.lea_or_school_name || '—';
    var href = leaHref(row);
    if (href) {
      return '<a href="' + escapeHtml(href) + '">' + escapeHtml(name) + '</a>';
    }
    return escapeHtml(name);
  }

  function sourcesCell(row) {
    var urls = splitSources(row.sources);
    if (!urls.length) return '—';
    return (
      '<div class="tools-source-links">' +
      urls
        .map(function (u, i) {
          return (
            '<a href="' +
            escapeHtml(u) +
            '" target="_blank" rel="noopener noreferrer">' +
            escapeHtml(sourceHost(u)) +
            (urls.length > 1 ? ' ' + (i + 1) : '') +
            '</a>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function openDetail(key) {
    var product = findProduct(key);
    if (!product) return;
    state.selectedKey = key;
    renderGrid();

    var panel = document.getElementById('productDetail');
    panel.hidden = false;
    document.getElementById('detailClass').textContent = humanClass(product.tool_class);
    document.getElementById('detailTitle').textContent = product.product_name;
    var states = Object.keys(product.states).sort();
    document.getElementById('detailMeta').textContent =
      product.vendor +
      ' · ' +
      product.deployments.length +
      (product.deployments.length === 1 ? ' place' : ' places') +
      ' · ' +
      states.join(', ');

    // Shared notes from first deployment with content (not invented)
    var sample = product.deployments.find(function (d) {
      return (d.data_collected_summary || '').trim();
    });
    var extras = document.getElementById('detailExtras');
    extras.innerHTML = '';
    if (sample && sample.data_collected_summary) {
      extras.innerHTML +=
        '<p><strong>What it collects (from public sources)</strong>' +
        escapeHtml(sample.data_collected_summary) +
        '</p>';
    }
    if (sample && sample.pii_or_student_content) {
      extras.innerHTML +=
        '<p><strong>PII / student content</strong>' +
        escapeHtml(sample.pii_or_student_content) +
        '</p>';
    }
    if (sample && sample.lockdown_or_law_enforcement_notify) {
      extras.innerHTML +=
        '<p><strong>Lockdown / LE notify</strong>' +
        escapeHtml(sample.lockdown_or_law_enforcement_notify) +
        '</p>';
    }

    var body = document.getElementById('detailBody');
    var sorted = product.deployments.slice().sort(function (a, b) {
      var sa = (a.state || '').localeCompare(b.state || '');
      if (sa) return sa;
      return (a.lea_or_school_name || '').localeCompare(b.lea_or_school_name || '');
    });

    body.innerHTML = sorted
      .map(function (row) {
        return (
          '<tr>' +
          '<td>' +
          entityCell(row) +
          '</td>' +
          '<td>' +
          escapeHtml(row.state || '—') +
          '</td>' +
          '<td>' +
          escapeHtml(humanScope(row.scope)) +
          '</td>' +
          '<td>' +
          escapeHtml(humanStatus(row.status)) +
          '</td>' +
          '<td>' +
          escapeHtml(row.last_verified_at || '—') +
          '</td>' +
          '<td>' +
          sourcesCell(row) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    var list = document.getElementById('detailList');
    list.innerHTML = sorted
      .map(function (row) {
        return (
          '<li>' +
          '<strong>' +
          entityCell(row) +
          '</strong>' +
          '<p class="meta">' +
          escapeHtml(row.state || '—') +
          ' · ' +
          escapeHtml(humanScope(row.scope)) +
          ' · ' +
          escapeHtml(humanStatus(row.status)) +
          ' · verified ' +
          escapeHtml(row.last_verified_at || '—') +
          '</p>' +
          sourcesCell(row) +
          '</li>'
        );
      })
      .join('');
    var hash = '#product=' + encodeURIComponent(key);
    if (location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeDetail() {
    state.selectedKey = null;
    document.getElementById('productDetail').hidden = true;
    renderGrid();
    if (location.hash.indexOf('#product=') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function readHash() {
    var h = location.hash || '';
    if (h.indexOf('#product=') === 0) {
      var key = decodeURIComponent(h.slice('#product='.length));
      if (findProduct(key)) openDetail(key);
    }
  }

  function bindControls() {
    var input = document.getElementById('toolsSearch');
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        state.query = input.value || '';
        renderGrid();
      }, 120);
    });
    document.getElementById('detailClose').addEventListener('click', closeDetail);
    window.addEventListener('hashchange', readHash);
  }

  function init() {
    bindControls();
    var meta = document.getElementById('toolsMeta');
    fetch(CSV_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load tools CSV (' + res.status + ')');
        return res.text();
      })
      .then(function (text) {
        state.rows = parseCSV(text).filter(function (r) {
          return (r.product_name || r.vendor || r.lea_or_school_name || '').trim();
        });
        state.products = buildProducts(state.rows);
        setStats();
        renderChips();
        renderGrid();
        readHash();
      })
      .catch(function (err) {
        console.error(err);
        meta.textContent = 'Could not load school AI tools data.';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
