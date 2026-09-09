# zip_lea_bridge NOTES (GA)

**File:** `zip_lea_bridge.csv`  
**Built:** 2026-09-07 (America/New_York calendar date)  
**Scope:** Georgia traditional LEAs (180) + open charter campuses with CCD ZIPs. Private schools **omitted** (no attendance-zone claim from ZIP alone). WA not included this pass.

## Product use

Homepage ZIP backup search: parent enters a 5-digit ZIP → show every `district` row for that ZIP (exact `districts.csv` / `schools.csv` names). Multi-LEA ZIPs return multiple rows — do not pick a single winner.

## Method (priority)

1. **CCD school ZIP (primary, high confidence)**  
   - Source: `/_schools_seed/urban_schools_meta.json` (`zip_location`, fallback `zip_mailing`) joined to `schools.csv` on `nces_school_id` = `ncessch`.  
   - Keep open schools only (`school_status == 1`).  
   - Aggregate unique ZIP → `district` with `n_schools_in_zip`.  
   - Traditional + charter campuses included. Charters noted as choice/campus ZIP, not attendance zones.  
   - Urban Institute CCD API / NCES CCD: https://educationdata.urban.org/api/v1/school-districts/ccd/directory/ · https://nces.ed.gov/ccd/

2. **NCES EDGE School District Geographic Relationship Files — ZCTA∩LEA (gap fill, medium/low)**  
   - File: `GRF24/grf24_lea_zcta5ce20.xlsx` from [NCES EDGE Geographic Relationship Files](https://nces.ed.gov/programs/edge/Geographic/RelationshipFiles) (`GRF24.zip`).  
   - Map `LEAID` → exact `districts.csv` name via CCD `leaid` on joined schools (not GRF display names like “Atlanta City School District”).  
   - Traditional geographic LEAs only (GRF excludes most charters / non-geo agencies).  
   - Drop ZCTA `00000` placeholder rows.  
   - Emit a row only when that (ZIP, district) pair is **not** already covered by CCD.  
   - Confidence: `medium` for meaningful land; `low` for tiny slivers (&lt;0.5 sq mi and &lt;10% of LEA land in the ZCTA).  
   - Cite: https://nces.ed.gov/programs/edge/Geographic/RelationshipFiles · https://nces.ed.gov/programs/edge/data/GRF24.zip

3. **Private:** omitted from this bridge.

4. **Multi-LEA ZIPs:** one row per district; `notes` list sibling LEAs and census land share when available.

5. **Naming:** every `district` value is an exact key in `districts.csv` (GA traditional/charter). GRF names are crosswalked via NCES LEAID, not string-matched.

## Ambiguity rules

| Case | Rule |
|------|------|
| City vs county (e.g. Atlanta / Fulton / DeKalb edges) | Emit all overlapping LEAs; note multi-LEA + land share |
| ZIP with school campus(es) | Prefer `ccd_school_zip` / high |
| ZIP with no campus but inside LEA polygon | `census_zcta_lea` / medium (or low if sliver) |
| Charter | Campus ZIP only; note “choice school” |
| Private | Omit |
| DoD / Fort Benning GRF LEAs | Unmapped to product roster — omitted |
| Newer charters without NCES ID | No ZIP invented — omitted until CCD/NCES ID exists |

## Coverage (this build)

| Metric | Value |
|--------|------:|
| Bridge rows | 1459 |
| Unique ZIPs | 751 |
| Multi-LEA ZIPs | 452 |
| Traditional LEAs with ≥1 ZIP row | 180 / 180 |
| Traditional LEAs with 0 ZIP rows | 0 |
| Charter LEAs with ≥1 ZIP row | 38 / 56 |
| Charter LEAs with 0 ZIP rows | 18 |
| Rows by match_method | {'ccd_school_zip': 573, 'census_zcta_lea': 886} |
| Rows by confidence | {'high': 573, 'medium': 794, 'low': 92} |

Traditional LEAs with 0 rows: *(none)*  

Charter LEAs with 0 rows (no open CCD campus ZIP / no NCES id):  
- Academy for Innovation in Medicine
- Dominion Purpose Academy
- Excelsior Village Academies
- Fayette Classical Academy
- Four Points Preparatory Academy
- Liberation Academy
- Miles Ahead Charter School
- Movement School South Fulton Elementary
- Northwest Georgia Charter Academy
- PEACE Academy
- Rocky Creek Charter Academy
- Sankofa Montessori School
- The Anchor School
- The Meliora School
- The Simple Vue Academy
- The Wright Community School
- Utopian Academy for the Performing Arts - Trilith
- Zest Preparatory Academy Charter School

## QA checks (required)

### Dunwoody / 30338 & 30346
- **30338** districts: ['DeKalb County School District', 'Fulton County Schools']  
  → **DeKalb County School District present** (PASS).  
  Census also associates a small Fulton land sliver with 30338 when present in rows.
- **30346** districts: ['DeKalb County School District']  
  → No CCD campus; gap-filled via GRF → **DeKalb County School District** (PASS).
- **30350** (nearby): ['DeKalb County School District', 'Fulton County Schools', 'Gwinnett County Public Schools']

### Baker County / Newton — not Atlanta
- Baker County Schools ZIPs: ['31721', '39813', '39837', '39841', '39862', '39870']  
- Baker metro (from `districts.csv`): Albany  
- Atlanta* districts on Baker ZIPs: 0 (PASS — none)  
- Baker is **Albany** metro, not Atlanta. Newton County School System is a separate Atlanta-metro LEA with its own ZIPs (e.g. 30014/30016) — not confused with Baker.

### Name integrity
- Rows with district not in `districts.csv`: 0 

## Blockers / limits

- ZCTA ≠ USPS ZIP exactly; commercial/PO-box ZIPs may be missing or odd.  
- Census fills use 2020 ZCTA geography (TIGER 2024 / SY 2023–24 districts in GRF24).  
- 18 charters lack open CCD ZIP (many missing `nces_school_id`) — not invented.  
- WA stretch not built this pass.  
- Did **not** edit `districts.csv` or `schools.csv`.

## Multi-LEA ZIP count detail

Multi-LEA ZIP count: **452**. Examples: 30004, 30005, 30008, 30011, 30012, 30013, 30014, 30016, 30019, 30024, 30025, 30028, 30030, 30032, 30033, 30039, 30040, 30045, 30052, 30054, 30055, 30056, 30058, 30060, 30062….
