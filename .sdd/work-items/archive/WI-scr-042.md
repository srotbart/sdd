---
id: WI-scr-042
gap-id: GAP-scr-041
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# WI-scr-042 — Create Designs screen and wire into App.tsx sidenav

**Scope:** `hub/client/src/screens/Designs.tsx`, `hub/client/src/screens/Designs.css`, and `hub/client/src/App.tsx` — create a two-pane Designs screen (left panel lists `.sdd/design/` directories sorted by last modified, right panel renders selected `design.md` via `react-markdown`); add `designs` tab between projections and gaps in the sidenav; wire `sdd-changed` auto-refresh; show empty state when no designs exist

**Acceptance criteria:**
- `Designs` component renders a left panel listing design directories with name and relative timestamp
- Right panel renders selected `design.md` content via `react-markdown`, full width
- `designs` tab appears between projections and gaps in the sidenav
- `App.tsx` imports and renders `<Designs>` with a `designsRefreshToken` incremented on `sdd-changed` artifact `"designs"`
- Empty state shown when no designs exist
- Unit test: Designs renders left panel rows for mock design list
- Unit test: Designs renders empty state when designs list is empty
- Unit test: App sidenav includes the designs entry between projections and gaps
