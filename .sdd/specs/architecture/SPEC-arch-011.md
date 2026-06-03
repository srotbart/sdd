---
id: SPEC-arch-011
domain: architecture
abbrev: arch
status: active
aliases: []
version: "8cbee415"
---

# SPEC-arch-011 — PATCH /workspaces/:id persists workspace field changes to SQLite

The server handles `PATCH /workspaces/:id` with a partial JSON body containing any subset of `{ name, path, description }`. It updates only the provided fields in the matching SQLite row and returns the updated workspace as JSON. Unknown or missing `:id` returns 404. Invalid body returns 400.
