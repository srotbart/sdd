---
id: WI-scr-021
gap-id: GAP-scr-021
domain: ui-screens
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Use live spec count for sidenav specs badge

**Scope:** `hub/client/src/App.tsx:424` — replace `MOCK_SPECS.length` with `liveSpecs.length` in the `tabCounts` object passed to `Sidenav`

**Acceptance criteria:**
- `tabCounts.specs` is set to `liveSpecs.length` (not `MOCK_SPECS.length`)
- When `liveSpecs` is empty (no workspace selected or fetch pending), the badge shows `0` or is absent — not the mock count
- Component test: when `liveSpecs` has N items, the sidenav specs count badge shows N
