---
id: GAP-wf-017
spec-item: SPEC-wf-020
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: af3f9730
closed-by: WI-wf-017
deferred-reason: null
---

# sdd:explain skill does not exist in the plugin

**Location:** `plugin/skills/` (directory)

**Reasoning:** No `explain/` skill directory or `SKILL.md` exists under `plugin/skills/` — the `sdd:explain <subject>` skill that spawns `sdd-explainer` and writes `.sdd/projections/<subject>.md` is entirely unimplemented.
