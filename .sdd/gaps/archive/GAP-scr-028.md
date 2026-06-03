---
id: GAP-scr-028
spec-item: SPEC-scr-031
domain: ui-screens
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b97bcf38"
closed-by: WI-scr-028
deferred-reason: null
---

# Gap: Screens rendered without initialXxxId — URL-parsed selectedItemId is not forwarded

**Locations:**
- `hub/client/src/App.tsx:469`
- `hub/client/src/App.tsx:471`
- `hub/client/src/App.tsx:473`
- `hub/client/src/App.tsx:475`

**Reasoning:** `<Targets>`, `<Specs>`, `<Gaps>`, and `<WorkItems>` are rendered without passing `selectedItemId` as `initialTargetId`/`initialSpecId`/`initialGapId`/`initialWiId`; refreshing with `?id=GAP-arch-001` in the URL does not pre-select that item.
