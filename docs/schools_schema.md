# schools.csv — schema (Intel seed is source of truth)

**Canonical file:** `/workspace/district-ai-intel/schools.csv` (District Intel owns seed + contact fills).  
**Builder clash 2026-09-07:** a parallel Builder seed briefly overwrote the file; quarantined as `schools.csv.builder-clash-20260907`. Intel must re-write the 2362-row seed. See `schools_NOTES.md` for Intel’s seed rules.

## Columns (Intel)

`school_name,nces_school_id,district,metro,state,entity_type,school_level,school_url,main_office_phone,main_office_email,principal_name,principal_title,principal_email,principal_phone,counselor_name,counselor_email,media_specialist_name,media_specialist_email,coach_name,coach_email,coach_role,sources,people_last_verified_at,status`

## Product rules

- No AI policy columns (inherit from `districts.csv` via district + state + entity_type).
- No mass classroom-teacher scrape; faculty pulse stays anonymous link.
- Not ready for Outbound campaign pulls until contacts verified.
- pages.dev frozen until Pete asks.
- Homepage search (school name primary, zip backup) waits on Pete’s plain-language home + Marietta sign-off.

## Ownership (locked 2026-09-07)

- **District Intel:** create / update / contact fills for `schools.csv`.
- **District AI Builder:** READ ONLY for UI (search, LEA school lists). Never write or overwrite `schools.csv`.
- Zip bridge / Outbound pulls: wait until Intel marks contacts healthy.

### Copy path for Builder UI

- Canonical (Intel only): `/workspace/district-ai-intel/schools.csv`
- Builder snapshot for local search: `site/data/schools.csv` (read/copy only after Intel confirms healthy)
- Never overwrite the canonical path.
