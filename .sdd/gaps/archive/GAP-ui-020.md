---
id: GAP-ui-020
spec-item: SPEC-ui-015
domain: ui-layout
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "dadde7e1"
closed-by: WI-ui-020
deferred-reason: null
---

# Gap: hasSdd detection always false for paths not in recent folders list

**Location:** `hub/client/src/components/AttachWorkspaceDialog.tsx:54`

**Reasoning:** `hasSdd` is derived from `matched?.hasSdd` where `matched` comes from `recentFolders` lookup; an arbitrary typed path not in recent folders yields `matched === undefined` and `hasSdd === false` even if the path has a `.sdd/` directory, so the "Existing .sdd/ detected" state never triggers.
