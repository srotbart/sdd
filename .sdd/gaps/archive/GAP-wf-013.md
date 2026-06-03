---
id: GAP-wf-013
spec-item: SPEC-wf-008
domain: workflow
status: closed
discovered: "2026-05-21T00:00:00Z"
audit-spec-version: "b56c0b34"
closed-by: WI-wf-013
deferred-reason: null
---

# Gap: target-engage SKILL.md has no next-step footer after accepting a target

**Location:** `plugin/skills/target-engage/SKILL.md:99-129`

**Reasoning:** The No-op, Extension, and New domain outcomes each instruct Claude to "Report: ..." but none include a `---` divider followed by `"Run /sdd:spec-audit {domain}"` as required by SPEC-wf-008 for the after-accepting next step.
