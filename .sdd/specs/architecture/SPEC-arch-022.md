---
id: SPEC-arch-022
domain: architecture
abbrev: arch
status: active
aliases: []
version: "04a2179b"
---

# SPEC-arch-022 — Test status per spec item is computed as one of four states

The server computes `testStatus: { status: "passing" | "failing" | "missing" | "not-run", lastRun?: string }` for every spec item on every `GET /workspaces/:id/specs` call. Rules in precedence order: `not-run` — the report file/directory does not exist; `missing` — the spec item has no entry in `items`, or none of its mapped substrings match any test in the report; `failing` — at least one matched test has a failed status; `passing` — at least one matched test found and all matched tests passed. `lastRun` is the ISO timestamp from the parsed report; absent only for `not-run`.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-022: four-state testStatus computation > SPEC-arch-022: 'not-run' when report is null — "test status is not-run when no report exists"
hub/server/spec-arch.test.ts > SPEC-arch-022: four-state testStatus computation > SPEC-arch-022: 'missing' when item has no matching test, with lastRun set — "test status is missing when no mapped test matches"
hub/server/spec-arch.test.ts > SPEC-arch-022: four-state testStatus computation > SPEC-arch-022: 'passing' when all matched tests passed — "test status is passing when all matched tests pass"
hub/server/spec-arch.test.ts > SPEC-arch-022: four-state testStatus computation > SPEC-arch-022: 'failing' when at least one matched test failed — "test status is failing when any matched test fails"
