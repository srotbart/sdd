---
id: GAP-wf-029
spec-item: SPEC-wf-031
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "a652a81d"
closed-by: WI-wf-028
deferred-reason: null
---

# Gap: No skills-table generator and README Skills table is stale

**Locations:**
- `plugin/` — no generator script rebuilding README Skills table from SKILL.md frontmatter
- `README.md:48` — Skills table lists 9 skills; `plugin/skills/` has 11 directories (explain, gap-to-work-items, install-statusline, sdd-help, sdd-init, session-start, spawn-sdd-worker, spec-audit, spec-collapse, spec-test, target-engage, work-item-close)
- No CI check for drift between SKILL.md files and README

**Reasoning:** README Skills table is stale (missing skills); no generator script exists to rebuild it from SKILL.md frontmatter; no CI drift check exists, violating SPEC-wf-031.
