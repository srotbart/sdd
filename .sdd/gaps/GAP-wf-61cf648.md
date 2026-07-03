---
id: GAP-wf-61cf648
spec-item: SPEC-wf-039
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "959d9781"
closed-by: WI-wf-b2e06e7
deferred-reason: null
---

# Gap: spec-index.js script does not exist

**Location:** `plugin/scripts/spec-index.js` (does not exist)
**Reasoning:** SPEC-wf-039 requires a mechanical `plugin/scripts/spec-index.js` that globs active spec items (skipping archives) and prints one tab-separated line per item (id, domain, title, scope globs) to stdout; the `plugin/scripts/` directory has no such script.
