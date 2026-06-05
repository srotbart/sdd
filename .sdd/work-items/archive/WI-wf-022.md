---
id: WI-wf-022
gap-id: GAP-wf-023
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create issues artifact type, directories, and reviewer skill

**Scope:** `plugin/skills/review-issues/` (new), `.sdd/issues/`, `.sdd/issues/archive/` — create 3-agent TeamCreate reviewer skill SKILL.md and issue artifact storage

**Acceptance criteria:**
- `plugin/skills/review-issues/SKILL.md` exists describing a 3-agent TeamCreate reviewer
- `.sdd/issues/` and `.sdd/issues/archive/` directories exist (with .gitkeep)
- SKILL.md specifies `ISS-{domain}-{seq}` ID convention
- SKILL.md requires each issue to record: location, problem, rationale, severity (low/medium/high)
- SKILL.md specifies de-duplication step across 3 reviewers
- SKILL.md explicitly states reviewers do not auto-fix
- Test: `ls .sdd/issues/` exits 0 and `ls .sdd/issues/archive/` exits 0
- Test: grep `plugin/skills/review-issues/SKILL.md` for "TeamCreate" → found
