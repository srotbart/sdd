---
id: SPEC-wf-033
domain: workflow
abbrev: wf
status: active
aliases: []
version: "4b09ee60"
---

# SPEC-wf-033 — sdd-help lists and explains every skill, kept drift-free

## Invariant

The `sdd-help` skill lists **and** provides help on **every** skill under `plugin/skills/` — each skill appears with help content (what it does and when to invoke it), sourced from its `SKILL.md` so there is a single source of truth. Coverage stays in sync with the actual skill set: the docs-sync drift check (SPEC-wf-031) is extended to also fail when `sdd-help` is missing a skill, lists a skill that no longer exists, or carries a stale description. This makes `sdd-help` complete, informative, and drift-free by the same mechanism that guards the README skills table.

## Acceptance criteria

- `sdd-help` lists every skill present under `plugin/skills/`, each with help content (not just a name)
- Each skill's help content is sourced from its `SKILL.md` (single source of truth)
- The docs-sync drift check fails when `sdd-help` omits a skill, lists a nonexistent one, or has a stale description
- The `sdd-help` coverage check is part of the same docs-sync mechanism as SPEC-wf-031
