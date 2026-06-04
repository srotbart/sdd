---
id: WI-scr-047
gap-id: GAP-scr-044
domain: ui-screens
status: done
created: "2026-06-03T00:00:00Z"
abandoned-reason: null
closed: null
---

# Work Item: Add per-domain coverage summary strip to Specs screen

**Scope:** `hub/client/src/screens/Specs.tsx` — add a summary strip below the title bar that shows, for each domain in `specs`, the covered/total fraction and counts of items by status (passing / failing / missing / not-run / skipped), computed from each item's `testStatus.status`

**Acceptance criteria:**
- A summary strip is rendered on the Specs screen (not a separate route) showing one row per domain
- Each domain row displays `covered / total` where covered = items with at least one mapped test (status is not `not-run` or `skipped`)
- Each domain row displays counts broken down as: passing, failing, missing, not-run, skipped (skipped is counted separately, not merged with not-run)
- Summary figures are derived from `item.testStatus.status` values — the same data driving the per-item dots — not from a second source
- The strip updates when `specs` prop changes (live WebSocket / refresh path flows through unchanged)
- Unit test (client): `Specs` renders the summary strip with correct covered/total and status counts for a fixture with mixed-status items including skipped
- Unit test (client): summary strip shows skipped count separately from not-run count
