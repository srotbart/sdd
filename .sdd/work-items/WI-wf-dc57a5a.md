---
id: WI-wf-dc57a5a
gap-id: GAP-wf-b861c4b
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: Ephemeral-minting skills mint {7hex} hash IDs instead of scanning for next {seq}

**Scope:** `plugin/skills/spec-audit/SKILL.md`, `plugin/skills/gap-to-work-items/SKILL.md`, `plugin/skills/review-issues/SKILL.md`, `plugin/skills/review-improvements/SKILL.md` — replace the "next available sequence number (max across active + archive/)" instructions with minting `{PREFIX}-{abbrev}-{7hex}` (7 lowercase hex, randomly generated, no lookup, no archive scan) for gaps, work-items, issues, and improvements respectively.

**Note:** Close AFTER WI-wf-1744ccd so the widened test assertions are already in place.

**Acceptance criteria:**
- Each of the four minting skills instructs minting `{PREFIX}-{abbrev}-{7hex}` with no active/archive sequence scan for its ephemeral type
- Skill text no longer depends on `archive/` contents for ID assignment
- Existing sequential IDs are not renamed; guidance notes both forms remain valid
- Test (hub `spec-wf-plugin.test.ts`): assert each minting skill specifies the `{7hex}` hash form and no longer instructs an archive-scan max-seq for its ephemeral type
