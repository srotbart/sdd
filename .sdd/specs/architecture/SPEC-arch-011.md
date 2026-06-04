---
id: SPEC-arch-011
domain: architecture
abbrev: arch
status: active
aliases: []
version: "e7f74dfd"
---

# SPEC-arch-011 — PATCH /workspaces/:id persists workspace field changes to SQLite

The server handles `PATCH /workspaces/:id` with a partial JSON body containing any subset of `{ name, path, description }`. It updates only the provided fields in the matching SQLite row and returns the updated workspace as JSON. Unknown or missing `:id` returns 404. Invalid body returns 400.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-011: PATCH /workspaces/:id > SPEC-arch-011: updates only provided fields and returns the updated workspace JSON — "PATCH updates only the supplied fields and echoes the updated workspace"
hub/server/spec-arch-http.test.ts > SPEC-arch-011: PATCH /workspaces/:id > SPEC-arch-011: returns 404 for an unknown workspace id — "PATCH on an unknown workspace returns 404"
hub/server/spec-arch-http.test.ts > SPEC-arch-011: PATCH /workspaces/:id > SPEC-arch-011: returns 400 for an invalid JSON body — "PATCH with an invalid JSON body returns 400"
