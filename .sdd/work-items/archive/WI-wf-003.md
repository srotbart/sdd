---
id: WI-wf-003
gap-id: GAP-wf-002
domain: workflow
status: done
created: "2026-06-01T17:18:22Z"
abandoned-reason: null
---

# Work Item: Add subject-subdirectory glob pattern to all SDD skills and Hub parser

**Scope:** `plugin/skills/spec-audit/SKILL.md`, `plugin/skills/session-start/SKILL.md`, `plugin/skills/target-engage/SKILL.md`, `plugin/skills/gap-to-work-items/SKILL.md`, `plugin/skills/work-item-close/SKILL.md`, `plugin/skills/spec-test/SKILL.md`, `hub/server/sdd-parser.ts:396` — extend every spec item enumeration to include both `{domain}/SPEC-*.md` and `{domain}/*/SPEC-*.md`, excluding `archive/` at either level

**Acceptance criteria:**
- Each of the six skill SKILL.md files explicitly documents the two-glob pattern (`{domain}/SPEC-*.md` and `{domain}/*/SPEC-*.md`) for enumerating spec items, with the `archive/` exclusion at both levels noted
- `session-start/SKILL.md` additionally documents that stale-audit path resolution must resolve spec item files at both domain-root and subject-subdirectory depth
- `hub/server/sdd-parser.ts` `parseSpecs()` reads spec files from both `{domainDir}/SPEC-*.md` and `{domainDir}/{subject}/SPEC-*.md` (excluding `archive/` subdirectories at either level)
- Test: `sdd-parse-specs.test.ts` (or equivalent) covers the case where a spec item lives under a subject subdirectory and is returned by `parseSpecs()`
- Test: `sdd-parse-specs.test.ts` confirms that `archive/` items at either path depth are excluded
