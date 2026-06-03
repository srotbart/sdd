---
id: WI-wf-017
gap-id: GAP-wf-017
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# Create sdd:explain skill that spawns sdd-explainer agent

**Scope:** `plugin/skills/explain/SKILL.md` — create the skill directory and SKILL.md implementing the full sdd:explain procedure: derive team name, create team `sdd-explain-{project-slug}`, spawn `sdd-explainer` agent, write skeleton to `.sdd/projections/<subject>.md` immediately, then proceed interactively or autonomously

**Acceptance criteria:**
- `plugin/skills/explain/SKILL.md` exists with correct frontmatter (`name: explain`, appropriate description)
- Skill creates team `sdd-explain-{project-slug}` using `basename "$PWD"` for the slug
- Skill spawns agent named `sdd-explainer` with `subagent_type: general-purpose` and the team name
- Agent prompt instructs: ask interactive vs non-interactive first, write skeleton to `.sdd/projections/<subject>.md` immediately, consult `.sdd/specs/` before reading code
- Agent prompt covers both interactive mode (write section, ask what's next, repeat) and non-interactive mode (traverse autonomously, write complete document, shut down)
- Skill creates `.sdd/projections/` directory if it does not exist
- Test: skill file is parseable and contains all required procedure sections
- Test: team name derivation uses `basename "$PWD"` pattern producing `sdd-explain-{slug}`
