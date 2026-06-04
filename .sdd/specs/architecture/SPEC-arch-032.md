---
id: SPEC-arch-032
domain: architecture
abbrev: arch
status: active
aliases: []
version: "c7644162"
---

# SPEC-arch-032 — POST /workspaces creates a workspace, validates inputs, starts watcher, returns 201

`POST /workspaces` accepts a JSON body `{ name: string, path: string, description?: string }`. Both `name` and `path` are required strings; missing or non-string values return 400. On success the server inserts the workspace into SQLite, starts a chokidar watcher for the workspace path (storing the cleanup function), and returns 201 with the created workspace as JSON including `id`, `name`, `path`, `description`, and `created_at`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-032/033: POST /workspaces > SPEC-arch-032: creates a workspace, starts a watcher, returns 201 with created row — "POST creates a workspace, starts its watcher and returns 201"
hub/server/spec-arch-http.test.ts > SPEC-arch-032/033: POST /workspaces > SPEC-arch-032: returns 400 when name or path is missing or non-string — "POST with missing name or path returns 400"
