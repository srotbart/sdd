---
id: WI-uic-006
gap-id: GAP-uic-003
domain: ui-components
status: done
created: "2026-05-19T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement TestStatusDot component

**Scope:** `hub/client/src/components/TestStatusDot.tsx` — create the component with props `status: "passing" | "failing" | "missing" | "not-run"` and `lastRun?: string`; render a filled circle in the correct color and an always-visible dimmed timestamp; render it inline on every spec item ID line in the Specs screen.

**Acceptance criteria:**
- `TestStatusDot.tsx` exists and exports `TestStatusDot` with the specified props
- Colors: passing → `#4caf50`, failing → `#f44336`, missing → `#ff9800`, not-run → `#9e9e9e`
- Timestamp formatted as `YYYY-MM-DD HH:mm` in local time; omitted when `status` is `not-run`
- Component is rendered inline on the spec item ID line (between spec ID and StatusPill) in `Specs.tsx` for every item regardless of status
- Unit test: all four status colors render correctly
- Unit test: timestamp is shown for passing/failing/missing and omitted for not-run
