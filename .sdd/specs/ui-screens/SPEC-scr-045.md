---
id: SPEC-scr-045
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "a521fa67"
---

# SPEC-scr-045 — Spec-item detail shows a per-test breakdown

## Invariant

The spec-item detail view (`hub/client/src/screens/SpecItemDetail.tsx`) renders the item's linked tests individually rather than collapsing them into a single aggregate dot. For each test mapped to the spec item it shows the test's name (its parsed `fullName`), its own status (`passing` / `failing` / `missing`), and the last-run timestamp. The breakdown is sourced from the parsed test report (via the per-item test mapping), not from the markdown `**Tests:**` block text alone. The existing single aggregate `TestStatusDot` remains as the item-level summary.

## Acceptance criteria

- The detail view lists each mapped test on its own row with name, per-test status, and last-run time
- Per-test status is derived from the parsed report (`parseVitestReport` / `parseSurefireReports`), matched to the item via its mapping entry
- A test named in the mapping but absent from the report renders as `missing`
- When no report or mapping exists for the item, the breakdown renders an empty / "not-run" state without error
- The aggregate item-level status dot continues to reflect the roll-up of the per-test statuses

**Tests:**
- `hub/server/sdd-test-parser.test.ts > computeTestStatus — per-test breakdown (SPEC-scr-045) > returns multiple per-test entries for a mapping with multiple substrings` — "each mapped test substring produces its own per-test result entry"
- `hub/server/sdd-test-parser.test.ts > computeTestStatus — per-test breakdown (SPEC-scr-045) > returns tests array with missing entry when no report test matches the substring` — "a mapped test absent from the report is reported as missing"
- `hub/client/src/screens/SpecItemDetail.test.tsx > SpecItemDetail — per-test breakdown (SPEC-scr-045) > renders one row per test in item.testStatus.tests` — "detail view renders one row per linked test"
- `hub/client/src/screens/SpecItemDetail.test.tsx > SpecItemDetail — per-test breakdown (SPEC-scr-045) > renders empty state when testStatus.tests is empty` — "empty breakdown renders a no-tests state without error"
- `hub/client/src/screens/SpecItemDetail.test.tsx > SpecItemDetail — per-test breakdown (SPEC-scr-045) > aggregate TestStatusDot continues to show the roll-up status` — "the aggregate dot still summarizes the per-test roll-up"
