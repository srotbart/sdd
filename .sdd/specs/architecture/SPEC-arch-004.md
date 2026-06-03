---
id: SPEC-arch-004
domain: architecture
abbrev: arch
status: active
aliases: []
version: "f20a4abf"
---

# SPEC-arch-004 — Filesystem watching uses chokidar, debounced 150–300 ms

The server watches each workspace's `.sdd/` directory tree using chokidar. Change events are debounced 150–300 ms before triggering a re-parse, so rapid batched file writes (e.g. a git checkout) do not flood the system.
