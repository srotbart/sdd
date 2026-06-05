---
id: WI-wf-030
gap-id: GAP-wf-031
domain: workflow
status: done
created: "2026-06-05T10:00:00Z"
abandoned-reason: null
---

# Work Item: Complete sdd-help skill listing and add drift check

**Scope:** `plugin/skills/sdd-help/SKILL.md` and `plugin/scripts/check-skills-drift.js` — update sdd-help to list all 16 skills sourced from SKILL.md frontmatter, add a generator script with --update mode, and extend the drift check so CI fails when sdd-help omits or mismatches a skill.

**Acceptance criteria:**
- `plugin/skills/sdd-help/SKILL.md` lists all 16 skills under `plugin/skills/`, each with name, invocation, and a help blurb derived from that skill's SKILL.md `description` field
- A generator script (`plugin/scripts/gen-sdd-help-skills.js`) reads SKILL.md frontmatter and regenerates the skills section in sdd-help/SKILL.md; supports `--update` flag; run with `--update` so the file is current
- `plugin/scripts/check-skills-drift.js` is extended to also check that sdd-help/SKILL.md is complete and up-to-date (or a companion check script is added and wired into the same CI command)
- `node plugin/scripts/check-skills-drift.js` exits 0 after all changes are applied
- `node plugin/scripts/check-artifact-guides.js` still exits 0
- `SPEC-wf-033.md` has a `**Tests:**` block pointing at the drift check
