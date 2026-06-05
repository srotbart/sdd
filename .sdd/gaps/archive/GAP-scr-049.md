---
id: GAP-scr-049
spec-item: SPEC-scr-051
domain: ui-screens
status: closed
discovered: "2026-06-05T09:15:00Z"
audit-spec-version: "11ed580f"
closed-by: WI-scr-051
deferred-reason: null
---

# Gap: No Standards Hub screen exists

**Locations:**
- `hub/client/src/App.tsx:1`
- `hub/client/src/components/Sidenav.tsx:12`
- `hub/server/index.ts:1`

**Reasoning:** No Standards screen, no nav entry for it, and the server does not serve `.sdd/standards/` content — the invariant is entirely absent.
