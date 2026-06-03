---
id: GAP-ui-017
spec-item: SPEC-ui-008
domain: ui-layout
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "dadde7e1"
closed-by: WI-ui-017
deferred-reason: null
---

# Gap: AttachWorkspaceDialog status chips render lowercase instead of uppercase

**Location:** `hub/client/src/components/AttachWorkspaceDialog.tsx:127`

**Reasoning:** Status chips render as `sdd ready` / `fresh` in lowercase; spec requires uppercase `● FRESH` / `● SDD READY` text.
