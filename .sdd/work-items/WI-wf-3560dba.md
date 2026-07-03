---
id: WI-wf-3560dba
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from close-domain and work-item-close SKILL.md

**Scope:** `plugin/skills/close-domain/SKILL.md` (3 citations at lines 71, 106, 132 — all SPEC-wf-042) and `plugin/skills/work-item-close/SKILL.md` (3 citations at lines 89, 103, 123 — SPEC-wf-040, SPEC-wf-038, SPEC-wf-035) — replace each parenthetical with inline prose

**Acceptance criteria:**
- Neither skill file contains any match for `SPEC-wf-[0-9]`
- Behavioral meaning of each removed citation is preserved inline at each location
- All existing SPEC-wf-038, SPEC-wf-041, SPEC-wf-042 tests that read these skill files and assert behavior phrases continue to pass
