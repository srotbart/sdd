---
id: SPEC-arch-033
domain: architecture
abbrev: arch
status: active
aliases: []
version: "0fc40f67"
---

# SPEC-arch-033 — POST /workspaces returns 409 when the submitted path already exists

If the `path` submitted to `POST /workspaces` matches the `path` of an existing workspace row (enforced by the UNIQUE constraint on `path`), the server returns HTTP 409 Conflict with body `{ error: "workspace with this path already exists" }`. The client surfaces this error to the user rather than silently calling `onAttached()`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-032/033: POST /workspaces > SPEC-arch-033: returns 409 with the canonical error when path already exists — "POST with a duplicate path returns 409 with the canonical error message"
