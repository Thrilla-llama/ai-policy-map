# LEA Safety language callout (product strip)

> Pete lock 2026-09-08/09: Explicitly call out what each LEA has for Safety language. Going deep on Safety is core to the company mission. Site UI paused; CSV + schema first. Sources are critical to trust.
>
> **Intel signed off 2026-09-09** — fields below are final for this pass. Minor guardrails vs CoS draft noted under Rules.

## Purpose
On every `/lea/{slug}/` page (and eventually state rollups), show a plain **Safety strip** that answers:

1. Do they have **deepfake / false-image** language?
2. Do they have **impersonation** language?
3. Do they **link AI misuse to HIB / Title IX / harassment**?
4. **Where** does it live (board policy vs handbook vs guidance)?
5. **Show the quote + source link** — or honestly say **no public rule found**.

Absence must read as **“no public rule found,”** not “safe.”

Clarity/governance policies (approved tools, human oversight, academic integrity) belong under **Clarity**, not this Safety strip — **Fulton IFBI vs CoC Rule 18k.III** is the reference split.

## Data already in `districts.csv` (reuse — do not duplicate)
| Field | Strip use |
|-------|-----------|
| `safety_ai_status` | Instrument badge: `none` / `procedure_handbook` / `guidance` / `board_policy` / `unknown` |
| `deepfake_ban` | Deepfake row: `yes` / `no` / `unknown` |
| `impersonation_ban` | Impersonation row: `yes` / `no` / `unknown` |
| `links_to_hib_titleix` | HIB/Title IX row: `yes` / `no` / `unknown` |
| `approved_tools_only` | Optional secondary Clarity/Safety hygiene flag — **not** the headline Safety strip (can sit under “Related”) |
| `safety_ai_notes` | Plain-language summary (parent-readable) |
| `safety_sources` | Primary URLs `;`-separated — **required** for any `yes` |
| `safety_last_verified_at` | Freshness stamp (updated when quotes verified) |

## New fields for quote-level trust (Intel fills)
| Field | Type | Meaning |
|-------|------|---------|
| `deepfake_quote` | text | Exact short quote (≤280 chars) when `deepfake_ban=yes`; else **empty** |
| `impersonation_quote` | text | Exact short quote when `impersonation_ban=yes`; else **empty** |
| `hib_titleix_quote` | text | Exact short quote when `links_to_hib_titleix=yes`; else **empty** |
| `safety_instrument_label` | text | Human label for where the **Safety** language lives, e.g. `CoC Rule 18k.III`, `Student Handbook Rule 14D` — empty if `safety_ai_status=none` |
| `safety_instrument_url` | url | Best **durable** URL for that instrument (Finalsite / handbook / CoC PDF / permanent policy library). **Never** Simbli TempFolder as sole or primary instrument URL |

### Rules (Intel)
- Any flag `yes` **requires** matching verbatim quote + durable URL in `safety_sources` **and** `safety_instrument_url` when the instrument is the deepfake/impersonation/HIB text.
- Quote fields are **empty** when the matching flag is `no` / `unknown` — do not write “none found” into the quote cell (UI owns empty state).
- Quotes must be verbatim from a primary source — never paraphrased into the quote field (paraphrase belongs in `safety_ai_notes`). Prefer the shortest complete clause ≤280 chars.
- Prefer durable URLs (Finalsite handbook PDFs, board policy library, CoC PDFs). If only a Simbli TempFolder PDF exists, archive a copy under `ga-safety-backfill-2026-09/pdfs/` and keep bulletin + CoC as the durable `safety_instrument_url`.
- Do **not** count IFBI-style governance-only language as deepfake/impersonation unless the text explicitly bans synthetic/false media or impersonation of people.
- `safety_ai_status=board_policy` alone does **not** imply deepfake `yes`. **Fulton:** IFBI = Clarity/governance; CoC Rule 18k.III = Safety instrument for deepfake/false-image.
- CSV commas inside quotes are fine — writer must escape properly; no `|` inside quote text.

### Field tweaks vs CoS draft (accepted as-is + these)
1. Empty quote cells for `no` (not placeholder text).
2. `safety_instrument_url` must be durable; TempFolder never sole source.
3. Instrument label/URL point at the **Safety** instrument (CoC/handbook rule), not a governance policy that merely coexists.

## UI strip (Builder — when site unpaused)
Parent-facing labels (~8th grade):

| Row | If `yes` | If `no` / `none` |
|-----|----------|------------------|
| Fake images / deepfakes | “Yes — public rule” + quote + link | “No public rule found” |
| Impersonation (fake voice/face) | same | same |
| Tied to bullying / harassment rules | same | same |
| Where it lives | instrument label + link | “—” |

Header for strip: **“AI Safety rules”**  
Subhead: **“Can kids create or share fake AI images of real people? Here’s what this district publishes.”**

Never green-wash `none`. Use neutral/warning empty state.

## GA traditional baseline (2026-09-08/09 CSV)
- 180 traditional LEAs
- 15 with any `safety_ai_status` ≠ `none`
- 7 with `deepfake_ban=yes` → **first quote backfill**
- 165 = `safety_ai_status: none`

## Owner
- **District Intel** — fills/verifies CSV fields + quotes; owns writes to `districts.csv`
- **Builder** — renders strip from CSV when UI resumes; pages.dev stays frozen until Pete says go
- **Chief of Staff** — ranking/product copy consistency; no silent demotions without Pete

## Backfill order
1. **Now:** 7 deepfake `yes` LEAs — APS, Catoosa, Clayton, Cobb, Fulton, Henry, Richmond (quotes + instrument label/URL; also fill impersonation/HIB quotes where those flags are already `yes`).
2. **Next:** remaining Safety-hit LEAs without deepfake (Gwinnett, Dawson, Lumpkin, Towns, Ben Hill, Forsyth, Jackson, Cherokee) — impersonation/HIB/tools quotes as applicable.
3. Leave `none` LEAs with empty quote fields.
