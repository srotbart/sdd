---
id: GAP-ui-019
spec-item: SPEC-ui-012
domain: ui-layout
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "dadde7e1"
closed-by: WI-ui-019
deferred-reason: null
---

# Gap: Empty-state div has no CSS styling

**Location:** `hub/client/src/App.tsx:361`

**Reasoning:** Empty-state `<div>` is rendered when `workspaces.length === 0` but no `.app-empty-state` rule exists in `App.css`, so the required centred empty-state prompt has no layout or visual treatment.
