---
id: SPEC-scr-045
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "15892c1b"
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
