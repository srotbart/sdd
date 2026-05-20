---
id: GAP-scr-019
spec-item: SPEC-scr-023
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "ee8a7ad1"
closed-by: WI-scr-019
deferred-reason: null
---

**Location:** `hub/client/src/App.tsx:195-288`

**Reasoning:** App.tsx uses only `localStorage` for workspace and tab state — no `URLSearchParams` read on mount, no `history.replaceState` calls on navigation, and no `?w=`, `?v=`, or `&id=` query params — so refreshing the page cannot restore workspace, tab, or selected item.
