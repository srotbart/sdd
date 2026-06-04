---
id: SPEC-arch-004
domain: architecture
abbrev: arch
status: active
aliases: []
version: "9541d8ed"
---

# SPEC-arch-004 — Filesystem watching uses chokidar, debounced 150–300 ms

The server watches each workspace's `.sdd/` directory tree using chokidar. Change events are debounced 150–300 ms before triggering a re-parse, so rapid batched file writes (e.g. a git checkout) do not flood the system.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-004: chokidar watcher debounce window > SPEC-arch-004: watcher imports chokidar — "filesystem watching is implemented with chokidar"
hub/server/spec-arch.test.ts > SPEC-arch-004: chokidar watcher debounce window > SPEC-arch-004: debounce constant is within the 150-300ms window — "watcher debounce interval falls inside the 150-300ms window"
hub/server/spec-arch-ws.test.ts > SPEC-arch-004/023: chokidar watcher fires onChange and watches report files > SPEC-arch-004: onChange fires (debounced) when a file under .sdd changes — "a file change under .sdd triggers a debounced onChange callback"
