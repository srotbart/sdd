---
id: SPEC-arch-020
domain: architecture
abbrev: arch
status: active
aliases: []
version: "13a3670e"
---

# SPEC-arch-020 — Vitest JSON report is parsed by walking testResults[*].assertionResults

When `runner` is `"vitest"`, the server reads the JSON file at the declared `report` path. It walks `testResults[*].assertionResults` and collects `{ fullName, status }` for every assertion. The top-level `startTime` field (milliseconds since epoch) is converted to an ISO timestamp stored as `runAt`. If the file does not exist, the parser returns `null` and all spec items in the domain receive `testStatus: { status: "not-run" }`.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-020: vitest JSON report parsing > SPEC-arch-020: walks testResults[*].assertionResults collecting fullName/status and converts startTime to runAt ISO — "the vitest report is parsed by walking assertionResults and converting startTime to runAt"
hub/server/spec-arch.test.ts > SPEC-arch-020: vitest JSON report parsing > SPEC-arch-020: returns null when the report file does not exist — "a missing vitest report yields null"
