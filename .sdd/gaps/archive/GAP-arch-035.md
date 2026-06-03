---
id: GAP-arch-035
spec-item: SPEC-arch-040
domain: architecture
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "50f69669"
closed-by: WI-arch-032
deferred-reason: null
---

# Gap: ArtifactStatus union type is missing 'deferred' and 'abandoned' values

**Location:** `hub/client/src/types.ts:1`

**Reasoning:** `ArtifactStatus` does not include `'deferred'` or `'abandoned'`; filtering logic that tries to exclude deferred gaps or abandoned work items (e.g. `g.status !== 'deferred'`) would silently be a no-op since those values cannot be assigned to the type.
