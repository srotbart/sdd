---
id: SPEC-arch-019
domain: architecture
abbrev: arch
status: active
aliases: []
version: "475d5e7d"
---

# SPEC-arch-019 — Per-spec test mapping file declares runner, report path, and item-to-test mappings

Each spec domain may have a companion file at `.sdd/specs/SPEC-{abbrev}.tests.json`. The file has three fields: `runner` (`"vitest"` or `"maven"`), `report` (path to the test report file or Surefire directory, relative to workspace root), and `items` (an object mapping spec item IDs to arrays of test-name substrings). A test matches a spec item if the test's `fullName` contains any listed substring (case-insensitive). If no companion file exists for a domain, all items in that domain receive `testStatus: { status: "not-run" }`.
