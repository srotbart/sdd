---
id: GAP-wf-002
spec-item: SPEC-wf-018
domain: workflow
status: closed
discovered: "2026-06-01T17:18:22Z"
audit-spec-version: "f38d0ad5"
closed-by: WI-wf-003
deferred-reason: null
---

# Gap: Skills and Hub parser do not enumerate spec items in subject subdirectories

**Locations:**
- `hub/server/sdd-parser.ts:396` — `parseSpecs()` reads only `{domainDir}/SPEC-*.md`; subject subdirectory files at `{domainDir}/{subject}/SPEC-*.md` are silently skipped
- `plugin/skills/spec-audit/SKILL.md:27` — globs only `.sdd/specs/{domain}/SPEC-*.md`, missing `{domain}/*/SPEC-*.md`
- `plugin/skills/session-start/SKILL.md:33` — globs only `.sdd/specs/{domain}/SPEC-*.md`, missing `{domain}/*/SPEC-*.md`; stale-audit path lookup also resolves at domain root only
- `plugin/skills/target-engage/SKILL.md:81` — enumerates active spec items with `.sdd/specs/{domain}/SPEC-*.md` only
- `plugin/skills/gap-to-work-items/SKILL.md` — no mention of subject subdirectory glob pattern
- `plugin/skills/work-item-close/SKILL.md` — no mention of subject subdirectory glob pattern
- `plugin/skills/spec-test/SKILL.md:29` — globs only `.sdd/specs/{domain}/SPEC-*.md`, missing `{domain}/*/SPEC-*.md`

**Reasoning:** SPEC-wf-018 requires all SDD skills, tools, and the Hub API parser to glob both `{domain}/SPEC-*.md` and `{domain}/*/SPEC-*.md` excluding `archive/` at either level; every enumeration point reads only the domain-root pattern.
