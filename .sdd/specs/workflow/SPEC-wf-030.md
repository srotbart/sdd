---
id: SPEC-wf-030
domain: workflow
abbrev: wf
status: active
aliases: []
version: "ef31661b"
---

# SPEC-wf-030 — A skill recommends prioritized next steps for the user to choose

## Invariant

SDD provides a skill that recommends prioritized next steps for the user to choose. On invocation it surveys `.sdd/` state and presents several candidate next actions, each with a short rationale, ranked using three signals: **priority** (urgency from SDD state), **recommendation** (the agent's judgement of what is most valuable next, including cross-artifact moves), and **size** (an estimate of the action's effort/scope). The user selects one interactively, and the selection routes into the matching existing skill (e.g. `target-engage`, `spec-audit`, `gap-to-work-items`, `work-item-close`, `spec-test`). The skill reuses `session-start`'s state-reading rather than maintaining a separate copy of that logic.

## Acceptance criteria

- The skill presents multiple candidate next actions, each with a rationale
- Each candidate carries a priority, a recommendation, and a size signal
- The user selects an action interactively (the choice is the user's)
- The chosen action routes into the corresponding existing SDD skill
- The skill reuses the `session-start` state model rather than maintaining a separate one
