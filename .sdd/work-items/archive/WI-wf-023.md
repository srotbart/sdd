---
id: WI-wf-023
gap-id: GAP-wf-024
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create improvements artifact type, directories, and team skill

**Scope:** `plugin/skills/review-improvements/` (new), `.sdd/improvements/`, `.sdd/improvements/archive/` — create 3-agent TeamCreate improvements skill SKILL.md and improvement artifact storage

**Acceptance criteria:**
- `plugin/skills/review-improvements/SKILL.md` exists describing a 3-agent TeamCreate improvements team
- `.sdd/improvements/` and `.sdd/improvements/archive/` directories exist (with .gitkeep)
- SKILL.md specifies `IMP-{domain}-{seq}` ID convention
- SKILL.md requires each improvement to record: what to improve, where, expected benefit, effort/impact estimate
- SKILL.md specifies de-duplication step across 3 agents
- SKILL.md focuses on enhancements/refactors/simplifications, not defects
- Test: `ls .sdd/improvements/` exits 0 and `ls .sdd/improvements/archive/` exits 0
- Test: grep `plugin/skills/review-improvements/SKILL.md` for "TeamCreate" → found
