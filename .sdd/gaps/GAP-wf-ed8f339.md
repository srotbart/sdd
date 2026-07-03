---
id: GAP-wf-ed8f339
spec-item: SPEC-wf-042
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "2adea2b9"
closed-by: WI-wf-2934c6e
deferred-reason: null
---

# Gap: scope backfill and scope-drift flagging absent from work-item-close and close-domain

**Locations:**
- `plugin/skills/work-item-close/SKILL.md` (entire procedure) — no step to back-fill/refine the spec item's `scope:` field from the closing diff as a mechanical write (globs + version-hash recomputation only)
- `plugin/skills/close-domain/SKILL.md` (Phase 4) — no instruction to flag scope-vs-diff drift (files changed for an item not covered by its scope glob) for correction

**Reasoning:** SPEC-wf-042 AC 5+6 require work-item-close to back-fill `scope:` from the closing diff and the guardian audit to flag scope-vs-diff drift; both are absent from their respective skill files.
