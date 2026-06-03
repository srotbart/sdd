---
id: SPEC-scr-041
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "8f11443e"
---

# SPEC-scr-041 — Hub Projections screen renders live markdown with auto-refresh

## Invariant

A Projections screen is added to the Hub sidebar between Specs and Gaps. The left panel lists `.sdd/projections/*.md` files sorted by last modified, each row showing the subject name and relative timestamp. The right panel renders the selected projection as markdown via `react-markdown`, full width. When the backend broadcasts an `sdd-changed` event the frontend re-fetches the affected projection and re-renders without a manual page refresh. The screen follows the same two-pane layout pattern as the Gaps and Specs screens.

## Acceptance criteria

- Projections nav item appears in the sidebar between Specs and Gaps
- Left panel lists all projections sorted by last modified descending
- Each row shows subject name and a relative timestamp (e.g. "2m ago")
- Right panel renders selected projection markdown via `react-markdown`
- When `sdd-changed` is received over WebSocket, the current projection content re-fetches and re-renders automatically
- Empty state shown when no projections exist yet
- Screen follows the existing two-pane layout (`specs-root` / `specs-layout` pattern or equivalent)
