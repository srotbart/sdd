---
id: GAP-scr-038
spec-item: SPEC-scr-041
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: d3576a85
closed-by: WI-scr-039
deferred-reason: null
---

# Projections screen does not exist in the Hub client

**Locations:**
- `hub/client/src/App.tsx` (no Projections import or route)
- `hub/client/src/components/Sidenav.tsx` (no Projections nav item)

**Reasoning:** No `Projections.tsx` screen file exists; the sidebar has no Projections entry and there is no two-pane layout rendering projection markdown — the screen is entirely unimplemented.
