---
id: WI-arch-004
gap-id: GAP-arch-004
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement chokidar filesystem watcher with debounce

**Scope:** `server/watcher.ts` — watch a workspace's `.sdd/` directory tree using chokidar; debounce change events 150–300 ms before emitting

**Acceptance criteria:**
- `chokidar` installed; watcher starts for a given workspace path
- Change events are debounced: rapid successive writes produce a single emission
- Debounce delay is between 150 ms and 300 ms (configurable or hardcoded in range)
- Test: writing two files within 50 ms triggers exactly one change event
