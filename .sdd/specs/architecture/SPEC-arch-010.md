---
id: SPEC-arch-010
domain: architecture
abbrev: arch
status: active
aliases: []
version: "6e451ef2"
---

# SPEC-arch-010 — GET /workspaces returns all workspaces from SQLite

The server handles `GET /workspaces` and returns a JSON array of all workspace rows (`id`, `name`, `path`, `description`, `created_at`). Response content-type is `application/json`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-010/030/037: GET /workspaces > SPEC-arch-010: returns a JSON array of workspaces from SQLite with application/json content-type — "GET /workspaces returns the SQLite workspace rows as a JSON array"
hub/server/spec-arch.test.ts > SPEC-arch-010: GET /workspaces underlying store returns all workspaces from SQLite > SPEC-arch-010: getAllWorkspaces returns every inserted workspace row with id/name/path/created_at — "the workspace store returns every persisted workspace row"
