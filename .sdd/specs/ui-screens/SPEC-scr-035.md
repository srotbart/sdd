---
id: SPEC-scr-035
domain: ui-screens
abbrev: ui-screens
status: active
aliases: [SPEC-scr-037]
version: "42b5eb71"
---

# SPEC-scr-035 — App.tsx and Dashboard.tsx guard all ws.counts accesses with optional chaining

Every access to a `counts` field on a workspace object in `App.tsx` and `Dashboard.tsx` — including inside `computeTotals`, JSX, and any helper that receives a workspace — uses optional chaining with a numeric fallback: `ws.counts?.field ?? 0`. No direct `ws.counts.field` dereference is permitted in either file. This prevents a runtime crash when a workspace delivered via WebSocket snapshot or update lacks a `counts` field during startup, partial hydration, or in test fixtures. The `App.test.tsx` snapshot fixture must include a complete `counts: WorkspaceCounts` object on mock workspaces.

**Tests:**
- `hub/client/src/App.test.tsx > ws.counts optional chaining guard (WI-scr-032) > App.tsx workspaces.map does not throw when counts is undefined (optional chaining guard)` — "ws.counts access uses optional chaining — no crash when counts is undefined"
- `hub/client/src/App.test.tsx > Dashboard receives live WorkspaceData (WI-scr-025) > Dashboard renders without throwing when a workspace has counts: undefined (WI-scr-034)` — "Dashboard does not crash when a workspace lacks a counts field"
