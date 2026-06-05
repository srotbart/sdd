---
id: SPEC-wf-031
domain: workflow
abbrev: wf
status: active
aliases: []
version: "a652a81d"
---

# SPEC-wf-031 — Plugin documentation stays in sync with the skills

## Invariant

The plugin's user-facing documentation stays in sync with the actual set of skills. Each skill's `SKILL.md` frontmatter (`name`, `description`) is canonical. The documentation surfaces that enumerate or describe skills — the root `README.md` "## Skills" table, the `plugin.json` description, and the `sdd-help` enumeration — are kept in agreement with it by a generator that rebuilds the skills table from `SKILL.md` frontmatter, plus a CI check that fails when documentation drifts from the actual skills (a skill with no documentation entry, a documented skill that no longer exists, or a stale description).

## Acceptance criteria

- `SKILL.md` frontmatter is the source of truth for each skill's name and description
- A generator rebuilds the README "## Skills" table from the `SKILL.md` frontmatter of the skills under `plugin/skills/`
- A CI check fails on drift: undocumented skills, documented-but-missing skills, or stale descriptions
- The `sdd-help` skill enumeration is kept consistent by the same mechanism
- After running the generator, the README table lists exactly the skills present under `plugin/skills/`
