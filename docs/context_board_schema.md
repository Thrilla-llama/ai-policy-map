# Context metrics + board calendar/emails (Pete queue 2026-09-09)

> Homepage / pages.dev frozen. CSV + schema first. **District Intel owns writes.**

## 1) Context metrics (NOT AI proof)

State-published graduation and attendance figures for parent context only.  
**Do not** copy these into `graduation_evidence` / `attendance_evidence` (those stay AI-linked; currently `unknown`).

| Field | Type | Meaning |
|-------|------|---------|
| `grad_rate_pct` | number text | 4-year cohort graduation rate percent, e.g. `87.2` (no `%` sign) |
| `grad_rate_year` | text | School year or report year label, e.g. `2023-24` or `2024` as published |
| `attendance_metric_type` | enum | `chronic_absenteeism` \| `average_daily_attendance` \| `other` \| `unknown` |
| `attendance_or_chronic_abs_pct` | number text | Percent as published (interpret via `attendance_metric_type` — chronic abs higher = worse) |
| `attendance_metric_year` | text | Year label matching the attendance figure |
| `context_metrics_source` | text | Durable state/district URL(s) `;`-separated (GaDOE CCRPI / GOSA / district report card preferred) |
| `context_metrics_last_verified_at` | date | YYYY-MM-DD |

### Rules
- Prefer **state** published figures (GaDOE / GOSA / CCRPI) over district marketing.
- Never invent. Blank + `unknown` type until verified.
- Label in UI: **“Context (not AI evidence)”**.

### Tweak vs CoS ask
Added `attendance_metric_type` + `context_metrics_last_verified_at` so Builder doesn’t reverse chronic-abs vs ADA.

## 2) Board calendar

| Field | Type | Meaning |
|-------|------|---------|
| `board_calendar_url` | url | Public board meetings / calendar / livestream schedule page |
| `next_board_meeting_at` | date | Next known public meeting as `YYYY-MM-DD` (date only; time optional in notes) |
| `next_board_meeting_notes` | text | Time, location, “regular”, “special”, livestream link, or “see calendar” |
| `board_calendar_last_verified_at` | date | YYYY-MM-DD |

### Rules
- Prefer district board calendar / BoardDocs / Simbli meetings list (permanent page, not a single TempFolder PDF).
- If only a recurring pattern is published (“2nd Thursday”), put that in notes and leave `next_board_meeting_at` blank unless a concrete next date is listed.

## 3) Board emails (parent CTA)

Existing `board_members` stays `name|role|seat|term;` — **do not break** that format.

| Field | Type | Meaning |
|-------|------|---------|
| `board_office_email` | email | Board office / clerk / `board@` / secretary — primary “email the board” CTA |
| `board_member_emails` | text | Optional per-member public emails as `Name|email;` (names should match `board_members` when possible) |
| `board_emails_source` | text | Roster / contact page URL(s) `;`-separated |
| `board_emails_last_verified_at` | date | YYYY-MM-DD |

### Rules
- Public roster pages only — no login walls, no purchase lists, no guessing `@district.org` patterns.
- Prefer `board_office_email` when individual member emails aren’t published.
- Empty is honest; never fabricate addresses.

## Owner / order
- **Intel** fills GA traditional first; Atlanta-metro sample unblocks Builder.
- **Builder** wires UI when Pete unpauses; pages.dev frozen.
- Backfill order: Atlanta-metro traditional sample → remaining GA traditional → charter/private later if Pete asks.

## 4) Freshness (Pete lock 2026-09-09 — stale dates kill trust)

**UI (Builder):** Compare `next_board_meeting_at` to today (America/New_York, date-only).
- Date ≥ today → label **Next board meeting**
- Date in the past → label **Last listed meeting** + helper **“Next date not updated yet — check the board calendar.”** + calendar link. Never call a past date “Next.”
- Blank → “Board meeting date not listed yet” + calendar link when present.

**Data (Intel):** Weekly pass (routine) advances past/near-term dates from public calendars; clear next date if unknown; stamp `board_calendar_last_verified_at`. Prefer calendar URL always.
