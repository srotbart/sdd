---
id: GAP-wf-0caacc4
spec-item: SPEC-wf-035
domain: workflow
status: closed
discovered: "2026-07-03T00:00:00Z"
audit-spec-version: "c5ea5aff"
closed-by: WI-wf-a33a598
deferred-reason: null
---

# Gap: spec tests depend on ephemeral archive directories being present on disk

**Locations:**
- `hub/server/spec-wf-plugin.test.ts:393` — `SPEC-wf-025: issues storage and archive directories are scaffolded` asserts `fs.existsSync(.sdd/issues/archive)` is true.
- `hub/server/spec-wf-plugin.test.ts:423` — `SPEC-wf-026: improvements storage and archive directories are scaffolded` asserts `fs.existsSync(.sdd/improvements/archive)` is true.

**Reasoning:** SPEC-wf-035 states "no skill or tool may depend on archive contents being present" (tests included) and that fresh clones/worktrees start with empty archives; `.sdd/issues/archive/` and `.sdd/improvements/archive/` are gitignored empty dirs not materialized on a clean checkout, so these two `fs.existsSync` assertions fail there — a tool (the test suite) depending on ephemeral archive presence. The invariant they should assert is the ISS/IMP artifact shape and storage-path convention (including the documented `archive/` subdirectory), not local directory existence.
