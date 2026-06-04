---
id: SPEC-arch-014
domain: architecture
abbrev: arch
status: active
aliases: []
version: "0dadc41a"
---

# SPEC-arch-014 — GET /workspaces/:id/targets returns parsed target files as JSON

The server handles `GET /workspaces/:id/targets`. It resolves the workspace path from SQLite, reads all `*.md` files from `{path}/.sdd/targets/` and from `{path}/.sdd/targets/archive/`, parses frontmatter (`id`, `status`, `created`, `domain`) and the Current statement body text, and returns a JSON array of all target objects (both active and archived). The frontend uses the `status` field to categorise targets. Returns 404 if the workspace is unknown, empty array if no target files exist. Response content-type is `application/json`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-014: GET /workspaces/:id/targets > SPEC-arch-014: returns parsed targets as JSON with application/json content-type — "GET targets returns parsed target objects as JSON"
hub/server/spec-arch-http.test.ts > SPEC-arch-014: GET /workspaces/:id/targets > SPEC-arch-014: returns 404 for unknown workspace and empty array when no targets — "GET targets returns 404 for unknown workspace and empty array when none exist"
