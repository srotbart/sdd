---
id: GAP-wf-031
spec-item: SPEC-wf-033
domain: workflow
status: closed
discovered: "2026-06-05T10:00:00Z"
audit-spec-version: "4b09ee60"
closed-by: WI-wf-030
deferred-reason: null
---

# Gap: sdd-help lists only 7 of 16 skills and no drift check enforces completeness

**Locations:**
- `plugin/skills/sdd-help/SKILL.md` — "## The Six Skills" section covers only 7 skills; explain, install-statusline, next, review-engage, review-improvements, review-issues, spawn-sdd-worker, and spec-test are absent or undocumented
- `plugin/scripts/check-skills-drift.js` — checks README.md only; does not verify that sdd-help/SKILL.md lists every skill under plugin/skills/ or that its descriptions are current

**Reasoning:** sdd-help omits 9 of 16 skills and no automated drift check enforces that sdd-help stays complete when skills are added or removed.
