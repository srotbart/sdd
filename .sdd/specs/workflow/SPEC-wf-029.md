---
id: SPEC-wf-029
domain: workflow
abbrev: wf
status: active
aliases: []
version: "90106502"
---

# SPEC-wf-029 — Plugin documentation stays in sync with the skills

## Invariant

The plugin's user-facing documentation stays in sync with the actual set of skills. Each skill's `SKILL.md` frontmatter (`name`, `description`) is canonical; documentation surfaces that enumerate or describe skills — the root `README.md` "## Skills" table and getting-started examples, the `plugin.json` description, and the `sdd-help` enumeration — must agree with it. Divergence (a skill with no documentation entry, a documented skill that no longer exists, or a stale description) is detectable and is not shipped unnoticed. When skills are added, removed, renamed, or re-described, the documentation is regenerated or verified rather than relying on memory.

## Acceptance criteria

- `SKILL.md` frontmatter is treated as the source of truth for each skill's name and description
- The README "## Skills" table lists exactly the skills present under `plugin/skills/`
- A mechanism detects drift: undocumented skills, documented-but-missing skills, and stale descriptions
- Detected drift is surfaced (e.g. a check fails) rather than shipping silently
- The `sdd-help` skill enumeration is kept consistent by the same mechanism
