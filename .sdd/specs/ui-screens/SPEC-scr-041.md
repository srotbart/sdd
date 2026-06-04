---
id: SPEC-scr-041
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "f5391c0a"
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

**Tests:**
- `hub/client/src/screens/Projections.test.tsx > Sidenav projections entry > projections nav item is positioned between specs and gaps` — "Projections nav item appears in the sidebar between Specs and Gaps"
- `hub/client/src/screens/Projections.test.tsx > Projections screen (SPEC-scr-041) > renders projection rows in the left panel from fetched data` — "left panel lists projections fetched from the backend"
- `hub/client/src/screens/Projections.test.tsx > Projections screen (SPEC-scr-041) > each projection row shows a relative timestamp` — "each row shows a relative timestamp"
- `hub/client/src/screens/Projections.test.tsx > Projections screen (SPEC-scr-041) > right panel renders markdown content of selected projection` — "right panel renders the selected projection as markdown via react-markdown"
- `hub/client/src/screens/Projections.test.tsx > Projections screen (SPEC-scr-041) > shows empty state when no projections exist` — "empty state is shown when no projections exist"
- `hub/client/src/screens/Projections.test.tsx > Projections screen (SPEC-scr-041) > re-fetches projections when refreshToken changes` — "screen re-fetches and re-renders when the refreshToken (driven by sdd-changed) changes"
