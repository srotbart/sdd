---
id: SPEC-scr-043
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "3e06c3b8"
---

# SPEC-scr-043 — Hub Designs screen lists design directories and renders selected design.md

## Invariant

A Designs screen is added to the Hub sidebar between Projections and Gaps. The left panel lists design directories from `.sdd/design/` sorted by last modified, each row showing the design name and a relative timestamp. The right panel renders the `design.md` of the selected design via `react-markdown`, full width. When the backend broadcasts an `sdd-changed` event the frontend re-fetches and re-renders the current design automatically. The screen follows the same two-pane layout pattern as Projections and Specs. An empty state is shown when no designs exist.

## Acceptance criteria

- Designs nav item appears in the sidebar between Projections and Gaps
- Left panel lists all designs sorted by last modified descending, showing name and relative timestamp
- Right panel renders selected `design.md` via `react-markdown`
- `sdd-changed` WebSocket event triggers automatic re-fetch and re-render of the current design
- Empty state shown when `.sdd/design/` is empty or does not exist
- Two-pane layout consistent with Projections and Specs screens

**Tests:**
- `hub/client/src/screens/Designs.test.tsx > Sidenav designs entry > designs nav item is positioned between projections and gaps` — "Designs nav item appears in the sidebar between Projections and Gaps"
- `hub/client/src/screens/Designs.test.tsx > Designs screen (SPEC-scr-043) > renders design rows in the left panel from fetched data` — "left panel lists design directories fetched from the backend"
- `hub/client/src/screens/Designs.test.tsx > Designs screen (SPEC-scr-043) > each design row shows a relative timestamp` — "each row shows the design name and a relative timestamp"
- `hub/client/src/screens/Designs.test.tsx > Designs screen (SPEC-scr-043) > right panel renders markdown content of selected design` — "right panel renders the selected design.md as markdown via react-markdown"
- `hub/client/src/screens/Designs.test.tsx > Designs screen (SPEC-scr-043) > shows empty state when no designs exist` — "empty state is shown when no designs exist"
- `hub/client/src/screens/Designs.test.tsx > Designs screen (SPEC-scr-043) > re-fetches designs when refreshToken changes` — "screen re-fetches and re-renders the current design when the refreshToken (driven by sdd-changed) changes"
