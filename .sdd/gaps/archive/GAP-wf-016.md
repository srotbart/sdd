---
id: GAP-wf-016
spec-item: SPEC-wf-019
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: 19e13d51
closed-by: WI-wf-016
deferred-reason: null
---

# session-start does not surface designs without corresponding targets

**Location:** `plugin/skills/session-start/SKILL.md:29`

**Reasoning:** The skill's "Collect active artifacts" step reads targets, specs, gaps, and work-items but never scans `.sdd/design/*/` — the output has no "Designs in progress" section and no logic to detect designs that lack corresponding targets.
