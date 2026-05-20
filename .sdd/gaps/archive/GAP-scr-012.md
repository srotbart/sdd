---
id: GAP-scr-012
spec-item: SPEC-scr-009
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "daf0230e"
closed-by: WI-scr-012
deferred-reason: null
---

# Gap: App.tsx passes MOCK_TARGETS to Targets instead of fetching from the backend

**Locations:**
- `hub/client/src/App.tsx:53`
- `hub/client/src/App.tsx:198`

**Reasoning:** `MOCK_TARGETS` is a hardcoded constant (line 53) passed directly to `<Targets>` (line 198); no `fetch('/workspaces/:id/targets')` call exists anywhere in App.tsx, so the component never receives live data.
