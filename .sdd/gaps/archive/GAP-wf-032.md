---
id: GAP-wf-032
spec-item: SPEC-wf-034
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "d08d1084"
closed-by: WI-wf-031
deferred-reason: null
---

# Gap: No skill exists to address projection comments and prune handled entries

**Locations:**
- `plugin/skills/` — no `projection-comments` or equivalent skill directory
- `hub/server/spec-wf-plugin.test.ts` — no tests for SPEC-wf-034

**Reasoning:** SPEC-wf-034 requires a dedicated SDD skill that reads a projection's `<name>.comments.json`, applies clarify/re-evaluate/expand/condense actions to the corresponding `<name>.md` text, removes addressed entries, and leaves unaddressable entries in place. No such skill exists anywhere in the plugin.
