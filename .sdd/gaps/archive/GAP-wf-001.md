---
id: GAP-wf-001
spec-item: SPEC-wf-017
domain: workflow
status: closed
discovered: "2026-06-01T17:18:22Z"
audit-spec-version: "3b75790b"
closed-by: WI-wf-001
deferred-reason: null
---

# Gap: Spec item files lack required Invariant and Acceptance Criteria sections

**Locations:**
- `.sdd/specs/workflow/SPEC-wf-001.md` through `.sdd/specs/workflow/SPEC-wf-016.md` and `.sdd/specs/workflow/SPEC-wf-018.md` — 17 of 18 workflow spec item files have no `## Invariant` or `## Acceptance criteria` sections
- `plugin/skills/spec-audit/SKILL.md:27` — spec-audit skill does not instruct writing `## Invariant` and `## Acceptance criteria` when creating spec items
- `plugin/skills/target-engage/SKILL.md` — no instruction to produce the required sections when writing spec items
- `plugin/skills/gap-to-work-items/SKILL.md` — no instruction to produce the required sections when writing spec items
- `plugin/skills/work-item-close/SKILL.md` — no instruction to produce the required sections when writing spec items
- `plugin/references/schemas.md:87` — spec item template in schemas.md does not document `## Invariant` or `## Acceptance criteria` sections
- `hub/server/sdd-parser.ts:8` — `SpecItem` interface has no `invariant` or `criteria` fields; Hub API does not extract or expose these sections

**Reasoning:** SPEC-wf-017 requires every spec item to contain `## Invariant` and `## Acceptance criteria` sections and requires all writing skills, schemas.md, and the Hub API parser to produce and expose them; none of these locations implement the requirement.
