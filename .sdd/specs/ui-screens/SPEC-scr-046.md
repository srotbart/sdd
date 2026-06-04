---
id: SPEC-scr-046
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "435dc225"
---

# SPEC-scr-046 — Specs screen shows a per-domain test-coverage summary

## Invariant

The Specs screen (`hub/client/src/screens/Specs.tsx`) renders a per-domain coverage rollup as a summary strip on the existing screen — not a separate screen or route. For each domain it shows the covered fraction (items with at least one mapped test / total active items) together with counts of items by status: passing, failing, missing, and not-run. The summary is computed from the same parsed `SpecItem.testStatus` data the rows already use, so it stays consistent with the per-item dots.

## Acceptance criteria

- Each domain displays `covered / total` where "covered" counts active items that have at least one mapped test
- Each domain displays counts of items broken down as passing / failing / missing / not-run
- The summary renders on the existing Specs screen (e.g. a header or summary strip), not as a new screen
- Summary figures are derived from the same `testStatus` values rendered on the item rows (no divergent second source)
- Counts update when the underlying spec/test data changes (live WebSocket / refresh path)

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen coverage summary strip (SPEC-scr-046) > renders a coverage strip with one row per domain` — "Specs screen renders a per-domain coverage strip"
- `hub/client/src/screens/Specs.test.tsx > Specs screen coverage summary strip (SPEC-scr-046) > covered/total fraction counts passing + failing + missing as covered` — "covered fraction counts items with a resolved test result"
- `hub/client/src/screens/Specs.test.tsx > Specs screen coverage summary strip (SPEC-scr-046) > not-run and skipped are not counted as covered` — "not-run and skipped items are excluded from covered"
- `hub/client/src/screens/Specs.test.tsx > Specs screen coverage summary strip (SPEC-scr-046) > shows correct not-run count separately from skipped` — "per-status counts, including not-run vs skipped, are shown per domain"
