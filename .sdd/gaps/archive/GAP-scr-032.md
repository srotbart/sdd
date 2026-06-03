---
id: GAP-scr-032
spec-item: SPEC-scr-035
domain: ui-screens
status: closed
discovered: "2026-05-21T00:00:00Z"
audit-spec-version: "6f46ec1b"
closed-by: WI-scr-032
deferred-reason: null
---

# Gap: ws.counts accessed without optional chaining in App.tsx

**Location:** `hub/client/src/App.tsx:408`

**Reasoning:** `ws.counts.targetsAwaitingUser` dereferences `counts` directly with no optional chaining guard; SPEC-scr-035 requires `ws.counts?.targetsAwaitingUser ?? 0` at every `counts.*` access to prevent crashes when `counts` is undefined on startup or in test fixtures.
