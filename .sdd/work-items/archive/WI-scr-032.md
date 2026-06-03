---
id: WI-scr-032
gap-id: GAP-scr-032
domain: ui-screens
status: done
created: "2026-05-21T00:00:00Z"
abandoned-reason: null
---

# Work Item: Guard ws.counts access with optional chaining in App.tsx

**Scope:** `hub/client/src/App.tsx:408` — change `ws.counts.targetsAwaitingUser` to `ws.counts?.targetsAwaitingUser ?? 0`

**Acceptance criteria:**
- `ws.counts.targetsAwaitingUser` is replaced with `ws.counts?.targetsAwaitingUser ?? 0` at line 408
- No other bare `ws.counts.*` dereferences exist in `App.tsx` (grep confirms zero remaining)
- Existing App tests pass after the change
