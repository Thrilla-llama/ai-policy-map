# Georgia State Charter LEAs — Notes (SCSC)

**Date pulled:** 2026-09-06 (America/New_York)  
**Master list updated:** April 13, 2026 (FY26 / 2025–26)  
**Official count:** **56** State Charter School Commission (SCSC) schools on master list  
**Roster open:** 50 | **Pre-opening:** 6 (scheduled 2026–2027)

## Source URLs

1. **SCSC 2025–26 Approved Charter Schools Master List (PDF)** — primary  
   https://scsc.georgia.gov/document/document/2025-2026-master-charter-school-list/download  
   Landing page: https://scsc.georgia.gov/office-charter-school-compliance  
   Totals on PDF: Conversion 2 | Locally approved 47 | **State charter 56** | All approved charters 105

2. **SCSC Find a School (locations directory)** — address / grades / areas served cross-check  
   https://scsc.georgia.gov/locations/school

3. **Approved State Charter School Contracts**  
   https://scsc.georgia.gov/locations/school/approved-state-charter-school-contracts

Raw PDF + text mirror: `/workspace/lea_research/ga-state-charters/raw_scsc_2025-26_master.{pdf,txt}`

## What counts as a state-charter LEA

- Authorized by the **State Charter Schools Commission (SCSC)**.
- Each state charter school is its **own LEA** (system codes typically **782** or **783** on the master list) — **not** a campus under a county/city board.
- **Do not confuse** with traditional LEAs that hold a *Charter System* flexibility contract (e.g. Jasper County Charter System, Hart County Charter System). Those stay `entity_type=traditional` / already covered in the 180 traditional roster and `districts.csv`.

## Tribal schools (GA)

**Confirmed none in Georgia** — no BIE-operated or tribally controlled K–12 schools in GA on Bureau of Indian Education inventories; no GA tribal LEA roster work.

## Locally approved charters (process note)

- Master list also shows **47 locally approved** + **2 conversion** charters.
- These remain under their **host district LEA** (APS, Cobb, Chatham, DeKalb, Fulton, etc.).
- Product treatment: note under the host district only (school-level AI policy only if it **differs** from the host). **Do not** add as new `districts.csv` LEA rows — no double-count.

## Private schools (~830)

**UI greenlit** — lighter schema (`entity_type=private`, head_of_school_*). Atlanta private SAMPLE (8) verified rows now in `districts.csv` (2026-09-06); UI leads with Head of School (see `private_entity_UI_NOTES.md`). Statewide ~830 still HOLD for full fill.

## Mapping into `districts.csv` (append checklist for parent)

When parent appends verified state-charter rows:

| Field | Value |
|-------|--------|
| `entity_type` | **`charter`** (never `traditional`) |
| `metro` | `atlanta` |
| `state` | `GA` |
| `status` | `verified` when FINDINGS filled |
| `last_verified_at` / `people_last_verified_at` / `impact_last_verified_at` | `2026-09-06` for batch1 |
| `outcomes_published` | `no` unless primary evidence found |
| `one_liner` | Lead with **State charter (SCSC)** + AI stance summary |
| `sources` | Include SCSC master URL + school primary URLs |

Schema has `entity_type`; still put “State charter (SCSC)” clearly in `one_liner` and `sources` for product clarity.

**Do not re-add** county “Charter System” traditional LEAs.  
**districts.csv untouched by this research pass** — parent appends.

## Pre-opening flag (not in batch1 deep research)

| School | Status note |
|--------|-------------|
| Academy for Innovation in Medicine | * master list; Fall 2026 |
| Northwest Georgia Charter Academy | * master list; Fall 2026 |
| The Meliora School | * master list; 2026 |
| Dominion Purpose Academy | * master; Find-a-School Fall 2027 |
| Fayette Classical Academy | * master; Find-a-School Fall 2027 |
| The Wright Community School | * master; Find-a-School Fall 2027 |

## Roster files

- `/workspace/district-ai-intel/ga_state_charter_roster.csv`
- `/workspace/lea_research/ga-state-charters/ga_state_charter_roster.csv`
- Notes mirror: `/workspace/lea_research/ga-state-charters/ga_state_charter_NOTES.md`

## Batch1 (~8 open; metro / larger first)

1. Georgia Cyber Academy  
2. Georgia Connections Academy  
3. Academy for Classical Education  
4. Atlanta Heights Charter School  
5. International Charter School of Atlanta  
6. Northwest Classical Academy  
7. Coweta Charter Academy  
8. Ethos Classical Charter School  

FINDINGS: `/workspace/lea_research/ga-state-charters-batch1/FINDINGS.md` (+ district-ai-intel mirror).

## Schema notes (2026-09-06 CoS update)

- `entity_type=charter` for every SCSC state-charter CSV row (never `traditional`).
- Private-only columns added to `districts.csv` for later use — **leave blank** on charter rows: `head_of_school_name`, `head_of_school_title`, `head_of_school_email`, `head_of_school_phone`, `accreditation`.
- Charters use `superintendent_*` and `board_*` the same way as traditional LEAs; put the **actual** title in `superintendent_title` (Head of School / Executive Director / CEO / Principal / Superintendent).
- Private (~830) remains **HOLD** — Atlanta-metro privates are next/parallel with a lighter schema; do not research privates in this pass.

## UI accountability paths (index.html)

Pete greenlit private + charter UI tracks (2026-09-06). Local map only (`http://127.0.0.1:8765/`).

| `entity_type` | Contacts / LEA detail lead | Board framing | Counts in GA /180? |
|---------------|----------------------------|---------------|--------------------|
| `traditional` | Superintendent + elected board | County/city elected board | **Yes** |
| `charter` | Superintendent/CEO + **governing board** | SCSC state charter — not county elected board; Charter badge on rows | **No** |
| `private` | **Head of School** (`head_of_school_*`) + accreditation if present | Hide empty elected-board pressure; not an elected-board page; Private badge | **No** |

- Filter chips: Traditional (default) / Charter / Private / All types.
- Empty Private filter is OK until Intel writes rows; Charter shows existing SCSC seed (~16).
- Do not invent private/charter facts in the UI layer.
