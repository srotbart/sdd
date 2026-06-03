---
id: WI-arch-032
gap-id: GAP-arch-035
domain: architecture
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Add 'deferred' and 'abandoned' to ArtifactStatus union type

**Scope:** `hub/client/src/types.ts` — add `'deferred'` and `'abandoned'` to the `ArtifactStatus` union type so that filtering logic for deferred gaps and abandoned work items compiles correctly and executes as intended.

**Acceptance criteria:**
- `ArtifactStatus` union includes `'deferred'` and `'abandoned'`
- Existing filter expressions `g.status !== 'deferred'` and `w.status !== 'abandoned'` in `App.tsx` (sidenav tab counts) compile without type errors
- No existing usage of `ArtifactStatus` is broken by the addition
- Client test: sidenav gap count excludes gaps with `status: 'deferred'`
- Client test: sidenav work-items count excludes items with `status: 'abandoned'`
