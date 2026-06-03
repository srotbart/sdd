---
id: SPEC-arch-018
domain: architecture
abbrev: arch
status: active
aliases: []
version: "5973c8c2"
---

# SPEC-arch-018 — Server broadcasts sdd-changed events to UI clients when artifacts change

When chokidar detects a file change under a workspace's `.sdd/targets/`, `.sdd/specs/`, `.sdd/gaps/`, or `.sdd/work-items/` directories (including `archive/` subdirectories), the server broadcasts a WebSocket message to all connected UI clients with shape `{ type: "sdd-changed", workspaceId: string, artifact: "targets" | "specs" | "gaps" | "work-items" }`. Changes are debounced at the existing 150–300ms interval. The UI client listens for these messages and re-fetches the affected endpoint (`GET /workspaces/:id/{artifact}`) for the active workspace, replacing the corresponding live state without a full page reload.
