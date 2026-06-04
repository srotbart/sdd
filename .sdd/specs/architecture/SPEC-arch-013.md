---
id: SPEC-arch-013
domain: architecture
abbrev: arch
status: active
aliases: []
version: "409f80f2"
---

# SPEC-arch-013 — GET /workspaces/:id/specs returns parsed spec files as JSON

The server handles `GET /workspaces/:id/specs`. It resolves the workspace path from SQLite, reads all `SPEC-*.md` files from `{path}/.sdd/specs/`, parses frontmatter (`id`, `domain`, `abbrev`, `version`) and each `## SPEC-{abbrev}-{seq}` item (title, active/deprecated status, body text, ref IDs from trailing ref pills), and returns a JSON array of spec objects. Returns 404 if the workspace is unknown, empty array if no spec files exist.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-013/024: GET /workspaces/:id/specs > SPEC-arch-013: returns parsed spec items as JSON for a known workspace — "GET specs returns parsed spec items for a known workspace"
hub/server/spec-arch-http.test.ts > SPEC-arch-013/024: GET /workspaces/:id/specs > SPEC-arch-013: returns 404 for an unknown workspace — "GET specs returns 404 for an unknown workspace"
hub/server/spec-arch-http.test.ts > SPEC-arch-013/024: GET /workspaces/:id/specs > SPEC-arch-013: returns empty array when no spec files exist — "GET specs returns an empty array when no spec files exist"
