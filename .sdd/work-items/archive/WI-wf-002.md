---
id: WI-wf-002
gap-id: GAP-wf-001
domain: workflow
status: done
created: "2026-06-01T17:18:22Z"
abandoned-reason: null
---

# Work Item: Add Invariant and Acceptance Criteria section instructions to writing skills and Hub parser

**Scope:** `plugin/skills/spec-audit/SKILL.md`, `plugin/skills/target-engage/SKILL.md`, `plugin/skills/gap-to-work-items/SKILL.md`, `plugin/skills/work-item-close/SKILL.md`, `hub/server/sdd-parser.ts` — add explicit instructions in each writing skill to produce `## Invariant` and `## Acceptance criteria` sections; add `invariant` and `criteria` fields to the `SpecItem` interface and extraction logic in the Hub parser

**Acceptance criteria:**
- `spec-audit/SKILL.md` contains instruction to write `## Invariant` and `## Acceptance criteria` sections when creating or updating spec items
- `target-engage/SKILL.md` contains instruction to write `## Invariant` and `## Acceptance criteria` sections when writing spec items
- `gap-to-work-items/SKILL.md` contains instruction to write `## Invariant` and `## Acceptance criteria` sections when writing spec items
- `work-item-close/SKILL.md` contains instruction to write `## Invariant` and `## Acceptance criteria` sections when writing spec items
- `hub/server/sdd-parser.ts` `SpecItem` interface gains `invariant: string` and `criteria: string[]` fields
- `hub/server/sdd-parser.ts` `parseSpecItemFile()` extracts the `## Invariant` section body into `invariant` and the `## Acceptance criteria` bullet list into `criteria`
- Test: existing `sdd-parser.test.ts` or `sdd-parse-specs.test.ts` covers extraction of `invariant` and `criteria` from a spec item file containing those sections
