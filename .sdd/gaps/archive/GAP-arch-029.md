---
id: GAP-arch-029
spec-item: SPEC-arch-034
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-027
deferred-reason: null
---

# Gap: PATCH /workspaces/:id never stops the old watcher or starts a new one when path changes

**Location:** `hub/server/index.ts:206-239`

**Reasoning:** The PATCH handler calls `updateWorkspace` to persist the new path but has no watcher registry lookup, no call to the old watcher's cleanup function, and no `startWatcher` call for the new path, violating SPEC-arch-034.
