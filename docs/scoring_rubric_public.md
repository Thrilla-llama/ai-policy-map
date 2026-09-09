# How AI Policy Map scores a school district

*Public rubric — Pete lock 2026-09-09. Rank what we can see boards doing (and not doing). Don’t let empty Grad/Attend AI evidence dilute or pad the score.*

## Core rule
**The headline rank is based on published actions and gaps we can measure today** — mostly **Safety** and **Clarity** in public rules, handbooks, and board policies.

Districts still care about Safety / Graduation / Attendance as operating priorities. We show those as **context** (including state grad and attendance rates when we have them). We do **not** let missing *AI→graduation* or *AI→attendance* evidence swing the composite while those fields are empty/`unknown`.

## Headline score (what ranks the map)

| Component | Role in headline | Plain meaning |
|-----------|------------------|---------------|
| **Safety** | **Heaviest** | Public rules against harmful AI uses: fake images/videos of real students, impersonation, tie to bullying/harassment rules. Gaps count. |
| **Clarity** | **Second** | Findable written AI rules: approved tools, classroom use, teacher training, parent communication, board vs handbook vs none. |

**Provisional blend (until Pete tunes):** Safety **~70%** · Clarity **~30%** of the headline composite.

### What “gaming” should mean
If a district publishes a real deepfake/false-image rule, ties it to bullying rules, and posts clear classroom/tool rules parents can find — **the school gets safer and clearer.** That should raise the score.  
A vague “we value AI” poster without Safety language should not.

### What does *not* enter the headline (for now)
| Signal | How we treat it |
|--------|-----------------|
| `graduation_evidence` / `attendance_evidence` (AI-linked) | Show on the page when present; **weight = 0** in composite while nearly all rows are `unknown` |
| State graduation rate / chronic absenteeism | **Context only** — labeled “not AI proof”; never used as a fake AI outcome score |
| Marketing claims without a primary source | Ignore |

When we actually have measurable AI→learning or AI→attendance evidence for many LEAs, Pete can re-open Grad/Attend weights. Until then, empty fields must not move the rank.

## Safety detail
Instrument ladder: none → handbook/code of conduct → guidance → board policy.  
Flags: deepfake/false-image · impersonation · bullying/harassment link · approved-tools-only (secondary).  
Empty state: **“No public rule found”** — not “safe.”

## Clarity detail
Policy status parents can understand: no written AI rules found · principles only · guidance · handbook/code of conduct · board-approved AI policy.  
Plus: tools, PD, literacy, parent comms when published.

## Gaps are the product
Leaders/laggards = relative to this Safety+Clarity composite.  
Showing **what the board has not done** (no fake-image rule, no board AI policy, no parent-facing link) is as important as celebrating hits.

## Version
2026-09-09 — Georgia traditional first. Supersedes earlier 50/20/15/15 Safety/Grad/Attend/Clarity composite.
