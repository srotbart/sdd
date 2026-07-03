---
id: GAP-wf-4d2b706
spec-item: SPEC-wf-043
domain: workflow
status: open
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "ef419ccc"
closed-by: null
deferred-reason: null
---

# Gap: plugin/ files contain SPEC-wf-* ID citations (43 sites, 16 files)

**Locations:**
- `plugin/scripts/spec-index.js:5,15,21` — 3 citations (SPEC-wf-039, SPEC-wf-039, SPEC-wf-042)
- `plugin/scripts/lint-check.sh:99,114` — 2 citations (SPEC-wf-035 ×2)
- `plugin/references/sdd-pipeline.md:20,66,70` — 3 citations (SPEC-wf-038, SPEC-wf-035, SPEC-wf-037)
- `plugin/references/schemas.md:23,24,105,152,162,305` — 6 citations (SPEC-wf-035/036/042/042/040/041/037)
- `plugin/references/artifacts/spec.md:25,30` — 2 citations (SPEC-wf-042 ×2)
- `plugin/references/artifacts/target.md:109,112` — 2 citations (SPEC-wf-036, SPEC-wf-035)
- `plugin/references/artifacts/work-item.md:95,99,125` — 3 citations (SPEC-wf-036, SPEC-wf-035, SPEC-wf-036)
- `plugin/skills/close-domain/SKILL.md:71,106,132` — 3 citations (SPEC-wf-042 ×3)
- `plugin/skills/work-item-close/SKILL.md:89,103,123` — 3 citations (SPEC-wf-040, SPEC-wf-038, SPEC-wf-035)
- `plugin/skills/spec-audit/SKILL.md:32,100` — 2 citations (SPEC-wf-017, SPEC-wf-037)
- `plugin/skills/gap-to-work-items/SKILL.md:59` — 1 citation (SPEC-wf-037)
- `plugin/skills/review-issues/SKILL.md:58,134,137` — 3 citations (SPEC-wf-037, SPEC-wf-035, SPEC-wf-037)
- `plugin/skills/review-improvements/SKILL.md:59,140,143,155` — 4 citations (SPEC-wf-037, SPEC-wf-035, SPEC-wf-037, SPEC-wf-025)
- `plugin/skills/review-engage/SKILL.md:74` — 1 citation (SPEC-wf-035/036)
- `plugin/skills/target-engage/SKILL.md:99` — 1 citation (SPEC-wf-035/036)
- `plugin/skills/session-start/SKILL.md:80,167,251` — 3 citations (SPEC-wf-023, SPEC-wf-029, SPEC-wf-035)
- `plugin/statusline.test.sh:71` — 1 citation (SPEC-wf-001 in test fixture)

**Reasoning:** SPEC-wf-043 requires that no file under plugin/ references this repository's own spec item IDs; every citation must be replaced with inline behavioral text and a mechanical lint check must enforce the boundary; all 43 citations across 16 files violate the invariant.
