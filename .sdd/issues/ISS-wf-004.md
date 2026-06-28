---
id: ISS-wf-004
domain: workflow
status: open
location: "README.md"
severity: medium
discovered: "2026-06-28T00:35:32Z"
reviewed-by: null
---

# Issue: projection-comments skill is missing from README and sdd-help (docs drift)

**Location:** `README.md` ("## Skills" table) and `plugin/skills/sdd-help/SKILL.md` ("## All Skills")
**Problem:** The `projection-comments` skill has a `SKILL.md` but no entry in the README Skills table or the sdd-help "## All Skills" enumeration, so `bash plugin/scripts/lint-check.sh` and `node plugin/scripts/check-skills-drift.js` both fail.
**Rationale:** This violates SPEC-wf-031 (plugin docs stay in sync with the skills) and SPEC-wf-033 (sdd-help lists every skill, drift-free), and it makes the SPEC-wf-029 active-blocking layer red on `main` (lint-check exits non-zero). Fix is mechanical: `node plugin/scripts/gen-skills-table.js --update` and `node plugin/scripts/gen-sdd-help-skills.js --update`.
**Severity:** medium
