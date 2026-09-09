# Georgia Traditional LEA Roster — Notes

## Summary

| Metric | Count |
|--------|------:|
| Traditional LEAs in roster | **180** |
| Already in `districts.csv` | **42** |
| Missing from `districts.csv` | **138** |
| Marked `in_progress` | **8** |
| `lea_type=charter_system` | 48 |
| `lea_type=city` (non-charter) | 10 |
| `lea_type=county` (non-charter) | 122 |
| Rows with NCES ID | 180 |
| Rows with website (if known) | 49 |

Georgia’s traditional K–12 local education agency universe is **159 county systems + 21 independent city systems = 180**, which matches GaDOE Facilities “System ID” listings (601–759 and the independent city IDs below) and NCES CCD `agency_type=1` agencies mapped via `state_leaid` `GA-NNN`.

## Source URLs used

1. **GaDOE Facilities Database — View School Data (System ID / System Name)**  
   https://app3.doe.k12.ga.us/ows-bin/owa/main_pack_fcl099.entry_form  
   Primary authority for GaDOE system IDs and which entities are county/city systems vs RESAs, state specialty, DOC/DJJ, etc.

2. **NCES CCD Local Education Agency directory (via Urban Institute Education Data API, SY 2023, FIPS=13, agency_type=1)**  
   https://educationdata.urban.org/api/v1/school-districts/ccd/directory/  
   https://nces.ed.gov/ccd/  
   Source of verified **NCES LEAIDs** (`leaid`) and county names; crosswalked to GaDOE via `state_leaid` (e.g. `GA-644`).

3. **U.S. Census school district codes (GA, 2020)**  
   https://www2.census.gov/geo/docs/reference/codes2020/schdist/st13_ga_schdist2020.txt  
   Cross-check of unified district names / LEA codes (Fort Benning/Stewart DoDEA-adjacent entries excluded).

4. **GaDOE District Flexibility (Charter System vs SWSS vs Title 20)**  
   https://gadoe.org/policy/district-flexibility/  
   Context for `lea_type=charter_system` (flexibility model for traditional LEAs — not start-up charter networks).

5. **Charter System Foundation — 48 Charter Systems list / affiliate sites**  
   https://charter-system.org/purpose/  
   Used to mark `lea_type=charter_system` and to fill some `official_website_if_known` values.

6. **GOSA School System Flexibility Update (historical roster totaling 180)**  
   https://gosa.georgia.gov/document/publication/system-flexibility-updatepdf/download  
   Confirms statewide traditional LEA count of **180** (Charter + SWSS + Title 20).

Wikipedia / Ballotpedia were consulted only as secondary name cross-checks, not as sole sources.

## Exclusion rules applied

**Included:** GaDOE System IDs **601–759** (county / county-named systems, including Griffin-Spalding, Savannah-Chatham, Thomaston-Upson) plus independent city systems:

`761 Atlanta, 763 Bremen, 764 Buford, 765 Calhoun City, 766 Carrollton, 767 Cartersville, 769 Chickamauga, 771 Commerce, 772 Dalton, 773 City Schools of Decatur, 774 Dublin, 776 Gainesville, 779 Jefferson City, 781 Marietta, 784 Pelham, 785 Rome, 786 Social Circle, 789 Thomasville, 791 Trion, 792 Valdosta, 793 Vidalia`.

**Excluded:**

- RESAs (850+)
- State Schools (`799`) and State Specialty Schools I/II (`782*`, `783*`) — start-up / state charter campuses and networks that are not traditional county/city LEAs
- Georgia Virtual School (`777`), Scholars Academy (`770`)
- Department of Corrections (`890`), DJJ (`891`), DHR (`892`), Labor (`896`), Bright from the Start (`898`), Babies Can’t Wait / Early Hearing, etc.
- DoDEA / Fort Benning & Fort Stewart census school districts (not GaDOE traditional LEAs)
- Charter *networks* / SCSC schools that appear only under specialty school IDs (not independent city/county systems)

**Note on `lea_type=charter_system`:** These remain traditional county or city LEAs under Georgia’s Charter Systems Act flexibility model (local board + State Board contract). They are *not* start-up charter LEAs. Marking follows the Charter System Foundation’s current ~48 list (cross-checked against GOSA flexibility materials). Non-charter independent cities stay `city`; other county systems stay `county`.

## `districts.csv` coverage

- **42 / 180** traditional LEAs already present in `/workspace/district-ai-intel/districts.csv` (flexible place-name match; all 42 verified GA rows matched uniquely).
- **138** not yet in `districts.csv`.
- **8** flagged `priority_note=in_progress` (intel work started, not yet in CSV): Stephens, Hart, Elbert, Madison, Oglethorpe, Wilkes, Lincoln, Columbia.

NCES IDs are populated only from CCD (Urban API `leaid`); none were invented. Websites are filled only where known from Foundation affiliates or well-established district domains; otherwise left blank.

## Recommended next 3 batches (~8 each)

Continuing the systematic east-Georgia / CSRA → coastal plain sweep after:

**McDuffie → Warren → Glascock → Jefferson → Burke → Richmond → Jenkins → Screven**

### Batch 1 — East-central / Ogeechee–Canoochee (SE of Screven)
1. Bulloch County Schools  
2. Candler County Schools  
3. Emanuel County Schools  
4. Evans County Schools  
5. Tattnall County Schools  
6. Toombs County Schools  
7. Vidalia City Schools *(independent city in Toombs)*  
8. Montgomery County Schools  

### Batch 2 — Lower Savannah / coastal tier
1. Effingham County Schools  
2. Bryan County Schools  
3. Liberty County Schools *(charter system)*  
4. Long County Schools  
5. McIntosh County Schools  
6. Wayne County Schools  
7. Pierce County Schools  
8. Appling County Schools  

### Batch 3 — Southeast interior / Wiregrass edge
1. Bacon County Schools  
2. Ware County Schools  
3. Coffee County Schools *(charter system)*  
4. Atkinson County Schools  
5. Clinch County Schools  
6. Charlton County Schools  
7. Brantley County Schools  
8. Glynn County Schools  

These three batches keep geographic continuity down the eastern half of the state before pivoting west across south-central Georgia (Tift, Colquitt, Thomas, Lowndes/Valdosta, etc.).

## File outputs

- `/workspace/district-ai-intel/ga_lea_roster.csv` — master roster (180 rows + header)
- `/workspace/district-ai-intel/ga_lea_roster_NOTES.md` — this file
