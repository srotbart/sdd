---
id: GAP-scr-016
spec-item: SPEC-scr-020
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "379b301b"
closed-by: WI-scr-016
deferred-reason: null
---

# Gap: Gaps screen uses mock data instead of fetching live data

**Location:** hub/client/src/App.tsx:243

**Reasoning:** The `gaps` case passes `MOCK_GAPS` to `<Gaps>` with no `fetch('/workspaces/:id/gaps')` call triggered by `activeWorkspaceId` changes, so the screen never shows real gap data.
