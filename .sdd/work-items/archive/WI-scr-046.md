---
id: WI-scr-046
gap-id: GAP-scr-043
domain: ui-screens
status: done
created: "2026-06-03T00:00:00Z"
abandoned-reason: null
closed: null
---

# Work Item: Expose per-test results on SpecItem and render breakdown in SpecItemDetail

**Scope:** `hub/server/sdd-parser.ts`, `hub/client/src/types.ts`, `hub/client/src/screens/SpecItemDetail.tsx` — extend `computeTestStatus` and the `SpecItem` type to carry a `tests` array of per-test results (name, status, lastRun), and render each test as its own row in `SpecItemDetail`

**Acceptance criteria:**
- `TestStatus` gains an optional `tests` field: `Array<{ fullName: string; status: 'passing' | 'failing' | 'missing'; lastRun?: string }>`
- `computeTestStatus` populates `tests` with one entry per mapped test name substring: `passing`/`failing` from the matched report result, or `missing` when no report entry matches
- When no report or mapping exists, `tests` is empty and the component renders an empty/not-run state without error
- `SpecItemDetail` renders each entry in `item.testStatus.tests` on its own row showing the test name, a per-test status indicator, and the lastRun timestamp
- The aggregate item-level `TestStatusDot` continues to render the roll-up status unchanged
- Unit test (server): `computeTestStatus` returns `tests` array with correct per-test statuses for a mapping with mixed pass/fail/missing entries
- Unit test (client): `SpecItemDetail` renders one row per test with name, status indicator, and timestamp
- Unit test (client): `SpecItemDetail` renders an empty state when `testStatus.tests` is empty
