---
id: SPEC-arch-013
domain: architecture
abbrev: arch
status: active
aliases: []
version: "120a6391"
---

# SPEC-arch-013 — GET /workspaces/:id/specs returns parsed spec files as JSON

The server handles `GET /workspaces/:id/specs`. It resolves the workspace path from SQLite, reads all `SPEC-*.md` files from `{path}/.sdd/specs/`, parses frontmatter (`id`, `domain`, `abbrev`, `version`) and each `## SPEC-{abbrev}-{seq}` item (title, active/deprecated status, body text, ref IDs from trailing ref pills), and returns a JSON array of spec objects. Returns 404 if the workspace is unknown, empty array if no spec files exist.
