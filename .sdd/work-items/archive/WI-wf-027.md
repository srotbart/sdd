---
id: WI-wf-027
gap-id: GAP-wf-028
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add high-level orientation to session-start

**Scope:** `plugin/skills/session-start/SKILL.md` — add a step that emits agent-facing orientation: artifact map, pipeline model, project-specific context

**Acceptance criteria:**
- session-start SKILL.md contains a step emitting high-level orientation for the agent
- Orientation covers: each artifact type's meaning and how to act on it
- Orientation includes spec→code→review→gaps→refactor pipeline mental model
- Orientation surfaces project-specific context: ID conventions, artifact locations, active domains
- Orientation shares source-of-truth with `sdd-help` and SPEC-wf-023 guides (references them, not a divergent copy)
- Test: grep `plugin/skills/session-start/SKILL.md` for "orientation" → found
- Test: grep confirms reference to pipeline model or spec→code→review
