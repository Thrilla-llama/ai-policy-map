# AI Policy Map — local multi-page IA sketch

Do **not** deploy to Cloudflare / pages.dev from here. Legacy single-page lives at `../index.html`.

## Serve locally

```bash
cd /workspace/district-ai-intel/site
python3 -m http.server 8770
```

Open http://127.0.0.1:8770/ (port 8770 avoids the legacy server on 8765).

## Regenerate entity folders

```bash
python3 build_pages.py
```

Creates `/lea/{slug}/` for all GA traditional + charter rows and `/private/{slug}/` for all private rows.
