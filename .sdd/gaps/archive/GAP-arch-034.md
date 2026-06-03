---
id: GAP-arch-034
spec-item: SPEC-arch-039
domain: architecture
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "50f69669"
closed-by: WI-arch-031
deferred-reason: null
---

# Gap: GET /recent-workspaces endpoint is not implemented on the server

**Location:** `hub/server/index.ts:186`

**Reasoning:** No route handler for `GET /recent-workspaces` exists in `handleApi()`; the client (`AttachWorkspaceDialog.tsx:29`) calls the endpoint but the server will fall through to `serveStatic()` and return HTML instead of the expected JSON array.
