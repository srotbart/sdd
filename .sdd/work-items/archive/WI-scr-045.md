---
id: WI-scr-045
gap-id: GAP-scr-045
domain: ui-screens
status: done
created: "2026-06-03T00:00:00Z"
abandoned-reason: null
closed: null
---

# Work Item: Add skipped spec-item state to parser, types, and TestStatusDot

**Scope:** `hub/server/sdd-parser.ts`, `hub/client/src/types.ts`, `hub/client/src/components/TestStatusDot.tsx`, `hub/client/src/screens/SpecItemDetail.tsx` — add a `skipped` variant to `TestStatus`/`TestStatusKind`, parse the `**Tests:** skipped — <reason>` convention in `parseSpecItemFile`, expose `skipReason` on `SpecItem`, and render `skipped` distinctly from `not-run` in `TestStatusDot` and `SpecItemDetail`

**Acceptance criteria:**
- `parseSpecItemFile` reads a `**Tests:** skipped — <reason>` line in the spec item body and sets `testStatus.status = 'skipped'` and `testStatus.skipReason = <reason>` on the parsed item
- A spec item with no `**Tests:**` block still gets `testStatus.status = 'not-run'` as before
- `TestStatus` (server and client) includes a `skipped` variant and an optional `skipReason: string` field
- `SpecItem` (client `types.ts`) is updated to reflect the `skipped` status variant
- `TestStatusDot` renders `skipped` with a distinct color (not the same gray as `not-run`) and a tooltip/aria-label of `"skipped"`
- `SpecItemDetail` shows the skip reason text when `item.testStatus.status === 'skipped'`
- Unit test (server): `parseSpecItemFile` correctly parses `**Tests:** skipped — no code boundary` and returns `{ status: 'skipped', skipReason: 'no code boundary' }`
- Unit test (client): `TestStatusDot` renders a distinct element for `status="skipped"` that is visually different from `status="not-run"`
- Unit test (client): `SpecItemDetail` displays the skip reason when item has `skipped` status
