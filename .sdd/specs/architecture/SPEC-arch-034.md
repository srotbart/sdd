---
id: SPEC-arch-034
domain: architecture
abbrev: arch
status: active
aliases: []
version: "1158b215"
---

# SPEC-arch-034 — PATCH /workspaces/:id stops the old watcher and starts a new one when path changes

When `PATCH /workspaces/:id` includes a `path` field that differs from the workspace's current path, the server stops the existing chokidar watcher for the old path (calling its cleanup function) and starts a new watcher for the updated path. The new cleanup function replaces the old one in the server's watcher registry. If `path` is not in the PATCH body, the existing watcher is left unchanged.
