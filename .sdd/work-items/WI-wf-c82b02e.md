---
id: WI-wf-c82b02e
gap-id: GAP-wf-4d2b706
domain: workflow
status: pending
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove SPEC-wf-* citations from review-issues, review-improvements, review-engage, and target-engage SKILL.md

**Scope:** `plugin/skills/review-issues/SKILL.md` (3 citations at lines 58, 134, 137), `plugin/skills/review-improvements/SKILL.md` (4 citations at lines 59, 140, 143, 155), `plugin/skills/review-engage/SKILL.md` (1 citation at line 74), `plugin/skills/target-engage/SKILL.md` (1 citation at line 99) — replace each parenthetical with inline prose

**Acceptance criteria:**
- None of the four files contains any match for `SPEC-wf-[0-9]`
- Behavioral meaning preserved inline: hash ID minting (7hex, no sequence scan), ephemeral archive is gitignored, archiving convention (commit terminal state before mv)
- All existing SPEC-wf-025, SPEC-wf-026, SPEC-wf-034, SPEC-wf-036, SPEC-wf-037 tests that read these skill files and assert behavior phrases continue to pass
