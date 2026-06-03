---
id: GAP-arch-006
spec-item: SPEC-arch-023
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-021
deferred-reason: null
---

# Gap: Watcher does not watch test report files from .tests.json mapping files

**Location:** `hub/server/watcher.ts:14`

**Reasoning:** `startWatcher` only watches `{workspacePath}/.sdd/`; it does not read `SPEC-*.tests.json` files, collect `report` paths, or add those paths to the chokidar watch set as required by SPEC-arch-023.
