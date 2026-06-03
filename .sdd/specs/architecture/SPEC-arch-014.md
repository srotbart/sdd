---
id: SPEC-arch-014
domain: architecture
abbrev: arch
status: active
aliases: []
version: "06342557"
---

# SPEC-arch-014 — GET /workspaces/:id/targets returns parsed target files as JSON

The server handles `GET /workspaces/:id/targets`. It resolves the workspace path from SQLite, reads all `*.md` files from `{path}/.sdd/targets/` and from `{path}/.sdd/targets/archive/`, parses frontmatter (`id`, `status`, `created`, `domain`) and the Current statement body text, and returns a JSON array of all target objects (both active and archived). The frontend uses the `status` field to categorise targets. Returns 404 if the workspace is unknown, empty array if no target files exist. Response content-type is `application/json`.
