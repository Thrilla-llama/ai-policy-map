# Monetization + parent path (Pete lock 2026-09-09)

Two products share one dataset. Different surfaces.

## Free — Parent path
**Who:** Parents (and any free visitor acting like one).  
**Cap:** Follow / save **up to 3 districts** (max).  
**Gets:**
- Full plain-language breakdown of *their* district(s) — Safety / Clarity / what helps or hurts kids and teachers
- Contacts they can email (board, superintendent, tech lead as we have them)
- Notifications when *their* district(s) change (policy updates, new Safety language, etc.)
- Language a busy parent can read (~8th grade). No LEA / AUP / CoC / HIB jargon without translation.

**Sources on free:** OK to show basic citations/links on free (Pete 2026-09-09) as long as the **3-district cap** is the gate.

**Does NOT get (Paid unlocks):**
- Unlimited districts, deep compare, MCP, bulk export, agency features
- Full Evidence depth (verbatim quotes + “we checked” audit trails) may still differentiate Paid — confirm with Pete if free shows quote+link or link-only

**Empty Safety state (free):**  
“No public rule found on fake images of students” — plain, honest. No list of searched URLs.

## Paid — Sources + more
**Who:** Districts, agencies, researchers, operators, power parents, anyone who needs to defend a claim.  
**Gets everything free gets, plus:**
- **All cited sources** — Evidence panel: claim → quote → link → verified date
- Broader access (TBD: unlimited districts, compare, state rollups, export, MCP payload `AIPM.safetyEvidencePayload`)
- Same underlying truth; paid unlocks the proof layer

**Empty Safety state (paid):**  
“No public rule found” + optional “We checked:” durable URLs searched.

## Product implication (Builder)
- **Default LEA page for logged-out / free parent:** parent strip, Helps/Hurts, contacts, notify CTA. **Hide** quote/source Evidence panel (or show locked teaser: “See the source → Paid”).
- **Paid / staff view:** full Evidence panel already prototyped on Fulton / Marietta / Gwinnett.
- Do not ship free parent UI that dumps `safety_sources` / quotes. Trust for parents = plain words; trust for buyers = citations.
- Homepage redesign still paused; pages.dev frozen. Prototype freemium gate on local `:8770` when ready.

## Open decisions (Pete can settle later)
1. Price / plan name for Paid (agency vs individual).
2. Whether free account required for the 3-district save + notifications (recommend yes — email magic link).
3. Whether soft-launch free map stays fully open without account (map browse) while LEA deep page is free-with-account.
4. MCP = Paid only (default yes).
