---
id: GAP-ui-012
spec-item: SPEC-ui-012
domain: ui-layout
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "78abf73e"
closed-by: WI-ui-012
deferred-reason: null
---

# Gap: Empty state prompt not shown when workspaces is empty — Dashboard renders instead

**Location:** `hub/client/src/App.tsx:423-432`

**Reasoning:** When `workspaces.length === 0`, `renderMain()` still returns `<Dashboard workspaces={[]} ...>` (the tile grid area) instead of a centred "No workspace attached" empty-state prompt as required by SPEC-ui-012.
