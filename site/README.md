# AI Policy Map — site/

Canonical product repo: https://github.com/Thrilla-llama/ai-policy-map

Do **not** deploy to Cloudflare / pages.dev from this checkout without an explicit greenlight.

## Serve locally

```bash
cd /workspace/ai-policy-map-repo/site
python3 -m http.server 8770 --bind 127.0.0.1
```

Open http://127.0.0.1:8770/

- `/` — Codex homepage (hero, pulse map, Explore search) — assets under `/assets/home-*.css`, `/assets/home-app.js`, `/assets/district-map.js`
- `/districts.csv` — full canonical district records (Explore + map)
- `/data/locations.json` — approximate GA map pins
- `/lea/{slug}/`, `/ga/`, `/compare/`, `/about/` — multipage IA (uses `/assets/app.js`)

## Regenerate entity folders

```bash
python3 build_pages.py
```

Creates `/lea/{slug}/` for GA traditional + charter rows and `/private/{slug}/` for private rows.

## Design source

Root-level Codex export (`../index.html`, `../styles.css`, `../steep.css`, `../app.js`, `../district-map.js`, `../assets/`) is the design reference. The live homepage is the adapted copy under this `site/` tree so one server root serves both the new homepage and LEA pages.
