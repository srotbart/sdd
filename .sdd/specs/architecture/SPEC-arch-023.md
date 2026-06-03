---
id: SPEC-arch-023
domain: architecture
abbrev: arch
status: active
aliases: []
version: "5677b8c7"
---

# SPEC-arch-023 — Watcher is extended to watch test report files declared in mapping files

On startup and whenever any `.sdd/specs/*.tests.json` file changes, `startWatcher` reads all mapping files, collects every unique `report` path, and adds those paths to the chokidar watch set alongside `.sdd/`. When a watched report file changes (i.e. tests just finished running), the server fires `broadcastSddChanged` with `artifact: "specs"` for the affected workspace. The UI client re-fetches `GET /workspaces/:id/specs` and the updated `testStatus` values appear live without a page reload.
