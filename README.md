# AI Policy Map

Georgia-first district AI policy scoreboard for students and teachers.

**One-liner:** See how each district’s AI rules hit students and teachers — and who’s accountable.

## Repo layout

| Path | What’s here |
|------|-------------|
| `site/` | Product site: Codex homepage + LEA/GA/compare pages (serve `site/` on `:8770`) |
| `data/` | Canonical CSVs (`districts`, `schools`, `zip_lea_bridge`, GA LEA + state charter rosters) |
| `docs/` | Schemas, public scoring rubric, parent copy, Safety-lag article draft |

## Scoring (locked)

Headline rank = **Safety (~70%) + Clarity (~30%)** only. See `docs/scoring_rubric_public.md`.

## What is *not* in this repo

Research batch folders, FINDINGS dumps, `.bak` CSVs, and raw PDF scrapes stay on the workshop machine — not in git.

## Soft-launch

Public soft-launch (frozen until greenlight): https://ai-policy-map.pages.dev/

## Local site

The homepage under `site/` is adapted from the Codex root design (`index.html`, `styles.css`, `steep.css`, `app.js`, `district-map.js`). Root files remain the design reference; do not serve the repo root for the product preview.

```bash
cd site && python3 -m http.server 8770 --bind 127.0.0.1
```
