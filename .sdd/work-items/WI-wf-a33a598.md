---
id: WI-wf-a33a598
gap-id: GAP-wf-0caacc4
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Reframe issues/improvements archive tests off local dir existence

**Scope:** `hub/server/spec-wf-plugin.test.ts` — the two `...storage and archive directories are scaffolded` tests (SPEC-wf-025 ~line 393, SPEC-wf-026 ~line 423). Replace the `fs.existsSync(.sdd/issues/archive)` / `fs.existsSync(.sdd/improvements/archive)` assertions with assertions on the documented artifact shape + storage-path convention (the storage path `.sdd/issues/` / `.sdd/improvements/` and the `archive/` subdirectory convention, sourced from the review-issues / review-improvements SKILL.md), so the tests no longer depend on ephemeral archive contents being present (SPEC-wf-035). Do NOT scaffold the dirs in sdd-init/session-start — that would re-introduce a dependency on local state.

**Acceptance criteria:**
- Neither SPEC-wf-025 nor SPEC-wf-026 asserts the physical existence of `.sdd/issues/archive` or `.sdd/improvements/archive` (no `fs.existsSync` on an ephemeral archive dir)
- The reframed tests assert the storage-path + `archive/` subdirectory convention from the documented source of truth (the respective SKILL.md), covering the ISS/IMP artifact storage shape
- Test: `spec-wf-plugin.test.ts` runs fully green in this worktree (where the ephemeral archive dirs are absent), including the two reframed tests
