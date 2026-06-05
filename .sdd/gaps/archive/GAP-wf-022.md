---
id: GAP-wf-022
spec-item: SPEC-wf-024
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "c997f814"
closed-by: WI-wf-021
deferred-reason: null
---

# Gap: session-start does not emit artifact operating contract

**Location:** `plugin/skills/session-start/SKILL.md` — no operating-contract section
**Reasoning:** session-start SKILL.md contains no step that reads from `references/artifacts/*.md` guides and emits a consolidated per-artifact operating contract for the agent.
