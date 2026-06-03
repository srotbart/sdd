---
id: WI-wf-005
gap-id: GAP-wf-005
domain: workflow
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix session-start stale-audit procedure to say per-gap warnings, not grouped by domain

**Scope:** `plugin/skills/session-start/SKILL.md:45` — reword the stale-audit reporting sentence to say each warning names the specific gap ID and spec item ID

**Acceptance criteria:**
- The procedure text in step 3 no longer says "grouped by domain"
- The updated text says each stale-audit warning identifies the specific gap ID and the spec item ID it was generated against
- The wording is consistent with the example output at line 110 (`⚠ GAP-auth-001 is stale: audit-spec-version ... ≠ SPEC-auth-001 version ...`)
- Manual review: confirm procedure and example output are now consistent with each other
