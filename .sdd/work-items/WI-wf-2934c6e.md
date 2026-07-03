---
id: WI-wf-2934c6e
gap-id: GAP-wf-ed8f339
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add scope backfill step to work-item-close and scope-drift flagging to close-domain Phase 4

**Scope:** `plugin/skills/work-item-close/SKILL.md` and `plugin/skills/close-domain/SKILL.md` — add (a) a scope backfill step to work-item-close (after implementing the change, back-fill/refine the spec item's `scope:` field from the closing diff — globs + version-hash recomputation only, a permitted mechanical write); (b) a scope-vs-diff drift flagging step to close-domain Phase 4 (for each changed file, if the governing spec item has a `scope:` glob that does not cover that file, flag as scope drift for correction)

**Acceptance criteria:**
- `work-item-close/SKILL.md` contains a step (after step 4 "Implement the change" or before step 7 "Mark done") instructing the worker to back-fill/refine `scope:` from the actual diff as a mechanical write (globs + version hash only — never touching invariant or acceptance-criteria content)
- `close-domain/SKILL.md` Phase 4 contains an instruction to flag scope-vs-diff drift: when a file changed by this run is not covered by the governing spec item's `scope:` glob, flag that as drift for correction (not as a violation that blocks completion)
- Both skills distinguish the mechanical scope write from edits to invariant/AC content
- Test: `spec-wf-plugin.test.ts` — new `it` in the SPEC-wf-042 describe block asserting work-item-close documents scope backfill from the closing diff
- Test: `spec-wf-plugin.test.ts` — new `it` asserting close-domain Phase 4 documents scope-drift flagging
- Both new tests pass; all existing SPEC-wf-042 tests continue to pass
