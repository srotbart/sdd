---
id: GAP-ui-010
spec-item: SPEC-ui-005
domain: ui-layout
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "e0a2c55c"
closed-by: WI-ui-010
deferred-reason: null
---

# Gap: Drop shadows present in shell CSS, violating no-shadow constraint

**Locations:**
- `hub/client/src/components/AttachWorkspaceDialog.css:22`
- `hub/client/src/components/Sidenav.css:142`
- `hub/client/src/components/CommandPalette.css:22`

**Reasoning:** All three locations apply `box-shadow` rules; SPEC-ui-005 states the editorial system uses "no drop shadows anywhere" as a structural constraint.
