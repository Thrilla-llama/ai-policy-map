# Georgia Schools Outreach Roster — Notes

**Seeded:** 2026-09-07 (America/New_York)  
**Re-seeded:** 2026-09-07 17:01 EDT (Builder clash recovery — identity roster restored from CCD/roster assets; Builder clash file NOT used)  
**File:** `/workspace/district-ai-intel/schools.csv`  
**Ownership:** **District Intel owns** this file (create / update / contact fills). **District AI Builder: READ ONLY** — never write or overwrite `schools.csv`. Clash artifact quarantined as `schools.csv.builder-clash-20260907` (wrong schema, 2308 rows).  
**Scope this pass:** GA only (WA out of scope). Identity **SEED** for outreach — not classroom-teacher scrape.  
**`districts.csv`:** not modified.

## Counts

| Metric | Count |
|--------|------:|
| Total school rows | **2362** |
| `entity_type=traditional` | **2242** |
| `entity_type=charter` | **56** |
| `entity_type=private` | **64** |
| Rows with NCES school ID | 2287 |
| Rows with CCD directory phone | 2287 |
| Rows with `school_url` | 115 |
| `status=stub` | 2362 |
| People contacts verified | 0 |
| Emails invented | **0** |
| GA LEAs in `districts.csv` with 0 schools | **0** |
| WA rows | **0** |

### School level (seed)

| `school_level` | Count |
|----------------|------:|
| elementary | 1319 |
| middle | 480 |
| high | 452 |
| other | 47 |
| unknown | 64 |

Unknown is almost entirely private single-campus stubs (no CCD level).

### Parent LEA coverage

| Parent set | In `districts.csv` | Schools seeded | Notes |
|------------|-------------------:|---------------:|-------|
| Traditional | 180 | 2242 | All LEAs matched via `ga_lea_roster.csv` NCES LEAID |
| Charter (SCSC) | 56 | 56 | 45 CCD-matched; 11 identity stubs |
| Private | 64 | 64 | One stub row per private LEA (`school_name` ≈ district) |

Traditional name crosswalk: 173 exact / `districts_csv_name_match`; **7** manual overrides (Burke, Glascock, Jenkins, McDuffie, Richmond, Screven, Warren) where roster short name ≠ `districts.csv` display name.

## Schema

| Column | Seed rule |
|--------|-----------|
| `school_name` | CCD `school_name` (public/charter) or LEA/district display name (private + unmatched charter) |
| `nces_school_id` | CCD `ncessch` when known; blank for private + newer/pre-opening charters |
| `district` | Exact match to `districts.csv` `district` |
| `metro` | Copied from parent LEA after geographic rebuild (Title Case / preserved metro labels) |
| `state` | `GA` |
| `entity_type` | From parent LEA: `traditional` \| `charter` \| `private` |
| `school_level` | CCD level map (1→elementary, 2→middle, 3→high, 4→other) or SCSC grades; private=`unknown` |
| `school_url` | Blank for traditional this pass; SCSC roster website for charters when present; homepage guessed from private LEA `sources` |
| `main_office_phone` | CCD directory phone only (not invented); blank otherwise |
| `main_office_email` / principal_* / counselor_* / media_* / coach_* | **Blank** until public page verification |
| `sources` | Pipe-separated PRIMARY URLs |
| `people_last_verified_at` | Blank until contacts verified |
| `status` | `stub` for all seed rows |

## Sources used

1. **NCES CCD Public School Directory SY2023** via Urban Institute Education Data API (`fips=13`)  
   https://educationdata.urban.org/api/v1/schools/ccd/directory/2023/?fips=13  
   https://nces.ed.gov/ccd/  
   Identity seed for traditional LEA campuses + matched state-charter campuses (open + new; `school_status` 1 or 3).

2. **`ga_lea_roster.csv`** — NCES LEAID ↔ traditional LEA ↔ `districts.csv` name.

3. **GaDOE Facilities (system context)**  
   https://app3.doe.k12.ga.us/ows-bin/owa/main_pack_fcl099.entry_form

4. **SCSC 2025–26 Master Charter School List + `ga_state_charter_roster.csv`**  
   https://scsc.georgia.gov/document/document/2025-2026-master-charter-school-list/download  
   Charter LEA identity, websites, grades; stubs for campuses not yet in CCD.

5. **Parent `districts.csv`** — metro, entity_type, private `sources` (read-only).

Raw API mirror: `/workspace/district-ai-intel/_schools_seed/urban_schools_meta.json` (2335 CCD rows / GA).

## Charter CCD match notes

- **45 / 56** charter LEAs matched to CCD `charter=1` schools (prefer State Specialty Schools I/II LEAs over host-district local charters).
- Aliases applied (examples): BIA ↔ Brookhaven Innovation Academy; Genesis Academy for Boys/Girls ↔ Genesis Innovation Academy…; Southwest Georgia STEM ↔ S.T.E.M. Charter Academy; Utopian … Trilith ↔ Utopian Academy for the Arts Trilith; Cherokee Classical ↔ Cherokee Charter Academy; etc.
- **11 stub-only** (no NCES id yet):  
  Excelsior Village Academies; Four Points Preparatory Academy; Movement School South Fulton Elementary; Rocky Creek Charter Academy; The Simple Vue Academy;  
  plus pre-opening: Academy for Innovation in Medicine; Dominion Purpose Academy; Fayette Classical Academy; Northwest Georgia Charter Academy; The Meliora School; The Wright Community School.
- Locally approved charters under county/city boards (e.g. Atlanta Classical Academy under APS) remain **traditional** host-LEA campus rows — not duplicate charter LEA rows (per SCSC notes).

## Private stub rule

One row per private LEA already in `districts.csv`: `school_name` = district name, `school_level=unknown`, contacts blank. Multi-campus private lists deferred.

## Explicit non-goals (this pass)

- No mass teacher directory scrape.
- No invented emails/phones.
- No WA schools.
- No edits to `districts.csv`.
- No people-contact verification (`people_last_verified_at` stays blank).

## Next contact-fill plan

1. **Priority metros first:** Atlanta traditional LEAs (APS, Fulton, DeKalb, Cobb, Gwinnett, City Schools of Decatur, Marietta) — school “About / Contact / Staff” pages for principal + main office email only.
2. **State charters with websites:** fill principal/Head of School from primary school site; confirm CCD phone.
3. **Backfill charter NCES ids** for the 11 stub-only when next CCD year lands (or GaDOE school codes).
4. **Private:** Head of School already often on LEA row — copy to school stub only when school-page public contact differs or multi-campus appears.
5. **Optional roles** (counselor / media specialist / coach): only when clearly published on the school’s primary page; otherwise leave blank.
6. Flip `status` to `verified` and set `people_last_verified_at` only after at least one public people contact is confirmed.

## Sample Atlanta rows (traditional — APS)

| school_name | nces_school_id | school_level |
|-------------|----------------|--------------|
| Atlanta Classical Academy | 130012004145 | other |
| Atlanta Neighborhood Charter - Elementary | 130012002615 | elementary |
| Atlanta Neighborhood Charter - Middle | 130012003541 | middle |
| B.E.S.T Academy | 130012003558 | high |
| Barack and Michelle Obama Academy | 130012000077 | elementary |
| Bazoline E. Usher/Collier Heights Elementary School | 130012003030 | elementary |
| Beecher Hills Elementary School | 130012000118 | elementary |
| Benjamin E. Mays High School | 130012001865 | high |

## Sample Atlanta charter / private

| school_name | district | nces_school_id |
|-------------|----------|----------------|
| Atlanta Heights Charter School | Atlanta Heights Charter School | 130022104021 |
| Amana Academy West Atlanta | Amana Academy West Atlanta | 130026504428 |
| The Westminster Schools | The Westminster Schools | (private stub) |
| Pace Academy | Pace Academy | (private stub) |

## File outputs

- `/workspace/district-ai-intel/schools.csv`
- `/workspace/district-ai-intel/schools_NOTES.md` (this file)
- `/workspace/district-ai-intel/_schools_seed/urban_schools_meta.json` (CCD pull)
- `/workspace/district-ai-intel/_schools_seed/seed_stats.json` (machine stats)

## Ownership lock (2026-09-07 re-seed)

- **District Intel:** sole writer of canonical `/workspace/district-ai-intel/schools.csv`.
- **District AI Builder:** read-only for UI (search, LEA school lists). Snapshot copy only to `site/data/schools.csv` after Intel confirms healthy — never overwrite the canonical path.
- Builder clash of 2026-09-07 quarantined as `schools.csv.builder-clash-20260907`; do not merge or restore from it.
