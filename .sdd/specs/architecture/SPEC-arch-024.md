---
id: SPEC-arch-024
domain: architecture
abbrev: arch
status: active
aliases: []
version: "621c387c"
---

# SPEC-arch-024 — GET /workspaces/:id/specs includes testStatus on every SpecItem

The response shape of `GET /workspaces/:id/specs` is extended: every item in the `items` array includes a non-optional `testStatus` field of shape `{ status: "passing" | "failing" | "missing" | "not-run", lastRun?: string }`. The server reads the companion `.tests.json` mapping file (if present) and the declared report file, computes status via SPEC-arch-022, and merges the result before serialising. Items belonging to a domain with no mapping file default to `{ status: "not-run" }`.
