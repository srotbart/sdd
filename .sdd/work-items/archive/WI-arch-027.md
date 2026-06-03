---
id: WI-arch-027
gap-id: GAP-arch-029
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Stop old watcher and start new one when PATCH /workspaces/:id changes path

**Scope:** `hub/server/index.ts` — (1) introduce a `Map<string, () => void>` watcher registry keyed by workspace ID; (2) populate it in `startWatchers()` and `POST /workspaces`; (3) in the `PATCH` handler, if `updates.path` differs from `existing.path`, call the old cleanup function and call `startWatcher` for the new path, storing the new cleanup in the registry

**Acceptance criteria:**
- PATCH request that changes `path` stops the chokidar watcher for the old path
- PATCH request that changes `path` starts a new chokidar watcher for the new path
- PATCH request that does not include `path` leaves the existing watcher unchanged
- Unit test: PATCH with new path triggers cleanup of old watcher
- Unit test: PATCH without path field does not touch watcher registry
