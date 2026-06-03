---
id: SPEC-scr-043
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "71dbf37b"
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
