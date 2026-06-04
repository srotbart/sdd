---
id: SPEC-arch-024
domain: architecture
abbrev: arch
status: active
aliases: []
version: "a8753068"
---

# SPEC-arch-024 — GET /workspaces/:id/specs includes testStatus on every SpecItem

The response shape of `GET /workspaces/:id/specs` is extended: every item in the `items` array includes a non-optional `testStatus` field of shape `{ status: "passing" | "failing" | "missing" | "not-run", lastRun?: string }`. The server reads the companion `.tests.json` mapping file (if present) and the declared report file, computes status via SPEC-arch-022, and merges the result before serialising. Items belonging to a domain with no mapping file default to `{ status: "not-run" }`.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-013/024: GET /workspaces/:id/specs > SPEC-arch-024: every returned SpecItem includes a testStatus field (default not-run) — "every spec item in the GET specs response carries a testStatus field"
