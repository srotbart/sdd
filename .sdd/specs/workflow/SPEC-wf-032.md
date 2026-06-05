---
id: SPEC-wf-032
domain: workflow
abbrev: wf
status: active
aliases: []
version: "05cc5569"
---

# SPEC-wf-032 — A skill recommends prioritized next steps for the user to choose

## Invariant

SDD provides a skill (`/sdd:next`) that recommends prioritized next steps for the user to choose. On invocation it surveys `.sdd/` state — reusing the `session-start` state-reading rather than maintaining a separate copy — and presents several candidate next actions, each with a short rationale, ranked using three signals: **priority** (urgency from SDD state), **recommendation** (the agent's judgement of what is most valuable next, including cross-artifact moves), and **size** (an effort/scope estimate derived heuristically from the artifact type and counts). The user selects one interactively, and the selection routes into the matching existing skill (e.g. `target-engage`, `spec-audit`, `gap-to-work-items`, `work-item-close`, `spec-test`).

## Acceptance criteria

- A `/sdd:next` skill presents multiple candidate next actions, each with a rationale
- Each candidate carries a priority, a recommendation, and a size signal
- Size is derived heuristically from artifact type and counts
- The user selects an action interactively (the choice is the user's)
- The chosen action routes into the corresponding existing SDD skill
- The skill reuses the `session-start` state model rather than maintaining a separate one

**Tests:**
- `plugin/skills/next/SKILL.md` contains "priority" — "next skill has a priority signal"
- `plugin/skills/next/SKILL.md` contains "size" — "next skill has a size signal derived heuristically"
- `plugin/skills/next/SKILL.md` contains "session-start" — "next skill references session-start state model, not a separate copy"
