---
id: WI-wf-cabbb90
gap-id: GAP-wf-2435063
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: session-start orphan/reference checks degrade to "unverifiable" for local-only archives

**Scope:** `plugin/skills/session-start/SKILL.md:249` — change the orphaned-work-item / missing-reference check so a reference absent from active files with an empty-or-absent local archive cache is reported as "unverifiable (archive is local-only)", not an error.

**Acceptance criteria:**
- The missing-reference check reads active files plus the local archive cache when present, and reports "unverifiable" rather than an error when the reference is absent and the cache is empty/absent
- Genuine orphans (reference absent while the cache is present and does not contain it) may still be flagged
- Existing "Empty archive dirs are fine" guidance is preserved/consistent
- Test (hub `spec-wf-plugin.test.ts`): assert session-start SKILL.md instructs the "unverifiable (archive is local-only)" degradation and no longer hard-errors on a missing archived reference
