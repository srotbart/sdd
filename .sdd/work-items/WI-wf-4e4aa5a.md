---
id: WI-wf-4e4aa5a
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from spec-audit and gap-to-work-items SKILL.md

**Scope:** `plugin/skills/spec-audit/SKILL.md` (2 citations at lines 32, 100 — SPEC-wf-017, SPEC-wf-037) and `plugin/skills/gap-to-work-items/SKILL.md` (1 citation at line 59 — SPEC-wf-037) — replace each parenthetical with inline prose

**Acceptance criteria:**
- Neither skill file contains any match for `SPEC-wf-[0-9]`
- Behavioral meaning is preserved inline at each location
- All existing SPEC-wf-039 and other tests that read these skill files and assert behavior phrases continue to pass
