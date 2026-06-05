---
id: GAP-wf-028
spec-item: SPEC-wf-030
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "0747bc89"
closed-by: WI-wf-027
deferred-reason: null
---

# Gap: session-start does not emit high-level pipeline orientation

**Location:** `plugin/skills/session-start/SKILL.md` — no orientation/pipeline-model section
**Reasoning:** session-start SKILL.md contains no step emitting the artifact-map, spec→code→review→gaps→refactor pipeline model, or project-specific essential context (ID conventions, artifact locations, active domains) required by SPEC-wf-030.
