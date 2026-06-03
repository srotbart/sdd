---
id: SPEC-arch-020
domain: architecture
abbrev: arch
status: active
aliases: []
version: "67d29c18"
---

# SPEC-arch-020 — Vitest JSON report is parsed by walking testResults[*].assertionResults

When `runner` is `"vitest"`, the server reads the JSON file at the declared `report` path. It walks `testResults[*].assertionResults` and collects `{ fullName, status }` for every assertion. The top-level `startTime` field (milliseconds since epoch) is converted to an ISO timestamp stored as `runAt`. If the file does not exist, the parser returns `null` and all spec items in the domain receive `testStatus: { status: "not-run" }`.
