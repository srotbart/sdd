---
id: GAP-scr-001
spec-item: SPEC-scr-009
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-001
deferred-reason: null
---

# Targets live fetch: API fields not mapped to frontend Target type

**Location:** `hub/client/src/App.tsx:153`

**Reasoning:** `fetch(/workspaces/${activeWorkspaceId}/targets)` stores raw API response directly into `liveTargets` via `setLiveTargets(data)` without mapping API fields (`id`, `status`, `created`, `domain`, `statement`) to the frontend `Target` type as required by the spec.
