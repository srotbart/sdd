---
id: GAP-scr-043
spec-item: SPEC-scr-045
domain: ui-screens
status: closed
discovered: "2026-06-03T00:00:00Z"
audit-spec-version: "15892c1b"
closed-by: WI-scr-046
deferred-reason: null
---

# Gap: SpecItemDetail does not render a per-test breakdown

**Locations:**
- `hub/client/src/screens/SpecItemDetail.tsx:29` — renders a single aggregate `TestStatusDot` for `item.testStatus`; no per-test rows are rendered
- `hub/client/src/types.ts:96` — `SpecItem` type carries only a single `testStatus: TestStatus` field; no per-test array
- `hub/server/sdd-parser.ts:599` — `computeTestStatus` returns a single `TestStatus` with no per-test data; matched tests are not preserved on the item

**Reasoning:** SPEC-scr-045 requires the detail view to list each mapped test on its own row with name, per-test status, and last-run time, but the parser only computes an aggregate status and neither the server type nor the client type carries individual test results.
