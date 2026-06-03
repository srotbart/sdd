---
id: GAP-ui-016
spec-item: SPEC-ui-002
domain: ui-layout
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "dadde7e1"
closed-by: WI-ui-016
deferred-reason: null
---

# Gap: Active workspace row missing 2px accent left border

**Location:** `hub/client/src/components/Sidenav.css:1`

**Reasoning:** `.sidenav-ws-trigger` renders as a rounded bordered box with no `border-left` accent; the spec requires the active workspace row to display a 2px left accent border.
