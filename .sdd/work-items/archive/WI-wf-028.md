---
id: WI-wf-028
gap-id: GAP-wf-029
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create skills-table generator and fix README, add CI drift check

**Scope:** `plugin/scripts/gen-skills-table.js` (new), `README.md` Skills section — generator that reads SKILL.md frontmatter and rebuilds the Skills table; CI drift check script; updated README

**Acceptance criteria:**
- `plugin/scripts/gen-skills-table.js` exists and reads `plugin/skills/*/SKILL.md` frontmatter
- Running the generator produces the correct Skills table covering all skills in `plugin/skills/`
- `README.md` Skills table updated to include all 12 skills (including: explain, install-statusline, spawn-sdd-worker, spec-test, and any new skills from this branch)
- `plugin/scripts/check-skills-drift.js` or equivalent exits non-zero if README drifts from SKILL.md files
- Test: `node plugin/scripts/gen-skills-table.js` exits 0 and outputs a markdown table
- Test: `node plugin/scripts/check-skills-drift.js` exits 0 after README is updated
- Test: modifying README Skills table to remove a skill causes drift check to exit non-zero
