---
id: SPEC-arch-010
domain: architecture
abbrev: arch
status: active
aliases: []
version: "1c04e0e4"
---

# SPEC-arch-010 — GET /workspaces returns all workspaces from SQLite

The server handles `GET /workspaces` and returns a JSON array of all workspace rows (`id`, `name`, `path`, `description`, `created_at`). Response content-type is `application/json`.
