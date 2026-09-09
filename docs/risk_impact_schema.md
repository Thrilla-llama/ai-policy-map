# Risk / impact column (student vs teacher)

> Schema note: `districts.csv` also has `entity_type` (`traditional` | `charter` | `private`; blank/missing treated as `traditional` in UI). GA coverage target 180 is traditional-only.

## Purpose
Call out how a district’s AI stance may help or hurt **students** and **teachers** separately. A setup can benefit teachers (time, planning) while weakening student learning (or the reverse).

## New CSV fields
| Field | Type | Meaning |
|-------|------|---------|
| `student_impact` | enum | Net directional call for learners |
| `teacher_impact` | enum | Net directional call for educators |
| `student_impact_notes` | text | Plain-language why (1–3 sentences) |
| `teacher_impact_notes` | text | Plain-language why (1–3 sentences) |
| `use_cases_working` | text | Evidence/examples of what’s working (URLs ok, `;`-separated) |
| `use_cases_not_working` | text | Evidence/examples of friction/harm/gaps |
| `impact_sources` | text | Citations for impact claims |
| `impact_last_verified_at` | date | YYYY-MM-DD |

### Impact enums
- `positive` — clear published supports that likely help this group
- `mixed` — both helpful and harmful signals
- `negative` — clear constraints/harms or vacuum that creates risk
- `unclear` — not enough public evidence
- `na` — not applicable / insufficient district data yet (stubs)

## Heuristic starters (override with district evidence)
| Pattern | Student lean | Teacher lean |
|---------|--------------|--------------|
| `none` / thin public rules | `negative` (ambiguity, honesty risk) | `mixed`/`negative` (each invents rules) |
| `principles_only` | `mixed`/`negative` (no classroom clarity) | `mixed` (freedom without backup) |
| `guidance` + `traffic_light` or `citation_required` | `positive`/`mixed` | `positive` |
| `banned` elementary + no literacy supports | `mixed` (safety vs skill gap) | `mixed` |
| `teacher_discretion` only | `mixed`/`negative` (inconsistency) | `positive`/`mixed` (autonomy) |
| Strong PD (`required`/`cohort`) + parent `faq` | `positive` lean | `positive` lean |
| ChatGPT banned but MagicSchool allowed | `mixed` (tool channel matters) | `mixed` |

## Use-case discipline
- Prefer primary district docs, board packets, published outcomes.
- Separate **teacher productivity** wins from **student learning** wins.
- “Working” needs a concrete practice (e.g. citation protocol, traffic-light labels, required PD).
- “Not working” includes vacuums, contradictory rules, banned tools with no alternative literacy path, unpublished boards, etc.

---

# AI safety policy (deepfakes / impersonation / HIB)

> Pete lock 2026-09-07: AI **safety** (deepfakes, impersonation, harassment via AI) must rank heavily — separate from assignment/citation clarity. Dual **Clarity | Safety** product score comes later (Builder). `pages.dev` frozen; fill CSV + schema now.

## Purpose
Capture whether a LEA publishes rules against **harmful AI uses** (not just “cite ChatGPT on homework”). Most GA LEAs will be `none` — that vacuum should hurt Safety rank.

## CSV fields (`districts.csv`)
| Field | Type | Meaning |
|-------|------|---------|
| `safety_ai_status` | enum | Highest public instrument that addresses AI safety harms |
| `deepfake_ban` | enum | Explicit ban on AI deepfakes / false AI images / synthetic media of people |
| `impersonation_ban` | enum | Explicit ban on AI impersonation / voice/image cloning to pose as someone |
| `links_to_hib_titleix` | enum | Safety language explicitly ties AI misuse to HIB / Title IX / harassment policy |
| `approved_tools_only` | enum | Safety or AUP requires district-approved AI tools only (not open ChatGPT free-for-all) |
| `safety_ai_notes` | text | Plain-language what the rule covers (1–3 sentences) |
| `safety_sources` | text | Primary URLs `;`-separated |
| `safety_last_verified_at` | date | YYYY-MM-DD |

### `safety_ai_status` enums
Same ladder as assignment policy instruments, scoped to **safety harms**:
- `none` — no public deepfake / impersonation / AI-harassment rule found
- `procedure_handbook` — Student Code of Conduct / handbook / JCDA-style procedure
- `guidance` — staff/student guidance or position statement with safety section
- `board_policy` — adopted board policy (IFBG/IFBI/AUP) with safety language
- `unknown` — not yet safety-verified

### Flag enums (`deepfake_ban`, `impersonation_ban`, `links_to_hib_titleix`, `approved_tools_only`)
- `yes` — explicit in a primary source
- `no` — reviewed primary AI/handbook/AUP sources; not stated
- `unknown` — not yet checked

### Scoring note (for Builder later)
- Clarity score ≈ existing `ai_policy_status` + assignment framework + PD/literacy/parent.
- Safety score ≈ `safety_ai_status` weight + flag hits (`deepfake_ban`, `impersonation_ban`, `links_to_hib_titleix`, `approved_tools_only`).
- `none` / all-`no` should **hurt** Safety rank even if Clarity is strong.

### Backfill priority (GA traditional)
Known hits first: APS, Cobb, Henry, Catoosa, Fulton, Jackson; check Cherokee / Clayton. Remaining ~180 → mostly `none` after pass.

---

# S / G / A ranking evidence (Pete lock 2026-09-07)

Product rank weight order:
1. **Safety** (heaviest) — existing `safety_*` fields
2. **Graduation** — integrity/clarity is NOT enough; need *learning evidence*
3. **Attendance** — only when published evidence exists; never invent

## Minimal CSV fields
| Field | Type | Meaning |
|-------|------|---------|
| `graduation_evidence` | enum | Strength of public evidence that AI work ties to learning/grad recovery (not theater) |
| `graduation_evidence_notes` | text | What was published (pathway, credit recovery, literacy → outcomes) |
| `graduation_evidence_sources` | text | Primary URLs `;`-separated |
| `attendance_evidence` | enum | Strength of public evidence that AI work ties to attendance/engagement |
| `attendance_evidence_notes` | text | What was published |
| `attendance_evidence_sources` | text | Primary URLs `;`-separated |
| `sga_evidence_last_verified_at` | date | YYYY-MM-DD (shared stamp for G+A pass) |

### Evidence enums (`graduation_evidence`, `attendance_evidence`)
- `none` — searched; no public AI→grad/attendance claim or metric
- `narrative` — district *claims* AI helps grad recovery / attendance / engagement, but no published metrics
- `metrics` — published numbers or board-reported outcomes linking AI literacy/tools/pathways to recovery, completion, attendance, or engagement
- `unknown` — not yet checked

### Discipline
- Grad-*rate dashboards alone* without an AI link → still `none` for these fields (state CCRPI ≠ AI graduation evidence).
- Credit-recovery / AI pathway / literacy outcome reports with numbers → `metrics`.
- “We’re using SchoolAI to boost engagement” with no data → `narrative`.
- Do **not** invent attendance or graduation figures.

### Relation to existing columns
- `outcomes_published` (yes/no) stays as coarse AI-outcomes flag.
- `graduation_evidence` / `attendance_evidence` are the S/G/A-specific signals Builder weights under G and A.
- Clarity (assignment/policy) remains separate from Safety and from G/A evidence.

---

# Safety callout quotes
See `safety_callout_schema.md` — quote fields `deepfake_quote` / `impersonation_quote` / `hib_titleix_quote` + `safety_instrument_label` / `safety_instrument_url` for the product Safety strip. Any flag=yes requires verbatim quote + durable URL.
