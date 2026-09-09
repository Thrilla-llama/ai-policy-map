/* Minimal CSV + slug helpers for AI Policy Map static site */
(function (global) {
  function parseCSV(text) {
    const rows = [];
    let i = 0;
    const len = text.length;
    function peek() {
      return i < len ? text[i] : '';
    }
    function readField() {
      let field = '';
      if (peek() === '"') {
        i++;
        while (i < len) {
          if (text[i] === '"') {
            if (text[i + 1] === '"') {
              field += '"';
              i += 2;
              continue;
            }
            i++;
            break;
          }
          field += text[i++];
        }
        if (peek() === ',') i++;
        return field;
      }
      while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
        field += text[i++];
      }
      if (peek() === ',') i++;
      return field;
    }
    function readRow() {
      if (i >= len) return null;
      // skip blank lines
      while (i < len && (text[i] === '\r' || text[i] === '\n')) {
        if (text[i] === '\r') i++;
        if (text[i] === '\n') i++;
        if (i >= len) return null;
        // if next is also blank, loop
        if (text[i] === '\r' || text[i] === '\n') continue;
        break;
      }
      if (i >= len) return null;
      const row = [];
      while (i < len) {
        row.push(readField());
        if (text[i] === '\r') i++;
        if (text[i] === '\n') {
          i++;
          break;
        }
        if (i >= len) break;
      }
      // If line ended with a comma, readField already consumed it and returned
      // the following empty field in the push above — OK.
      return row;
    }
    const header = readRow();
    if (!header || !header.length) return [];
    let row;
    while ((row = readRow()) !== null) {
      if (row.length === 1 && row[0] === '') continue;
      const obj = {};
      for (let c = 0; c < header.length; c++) {
        obj[header[c]] = c < row.length && row[c] != null ? row[c] : '';
      }
      rows.push(obj);
    }
    return rows;
  }

  function slugify(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function buildSlugMap(rows) {
    const map = Object.create(null);
    rows.forEach(function (r) {
      const slug = slugify(r.district);
      if (!slug) return;
      if (!map[slug]) map[slug] = r;
    });
    return map;
  }

  let cache = null;
  let pending = null;

  function loadDistricts(csvUrl) {
    const ver = global.AIPM_DATA_VER || String(Date.now());
    const base = csvUrl || '/districts.csv';
    const url = base.indexOf('?') >= 0 ? base : base + '?v=' + ver;
    if (cache && cache._url === url) return Promise.resolve(cache);
    if (pending) return pending;
    pending = fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
        return res.text();
      })
      .then(function (text) {
        const rows = parseCSV(text);
        cache = {
          rows: rows,
          bySlug: buildSlugMap(rows),
          slugify: slugify,
          _url: url,
        };
        pending = null;
        return cache;
      })
      .catch(function (err) {
        pending = null;
        throw err;
      });
    return pending;
  }

  global.AIPM = global.AIPM || {};
  global.AIPM.parseCSV = parseCSV;
  global.AIPM.slugify = slugify;
  global.AIPM.buildSlugMap = buildSlugMap;
  global.AIPM.loadDistricts = loadDistricts;
  global.AIPM.clearDistrictsCache = function () {
    cache = null;
    pending = null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
