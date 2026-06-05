---
id: GAP-scr-048
spec-item: SPEC-scr-050
domain: ui-screens
status: closed
discovered: "2026-06-05T09:15:00Z"
audit-spec-version: "26abb74a"
closed-by: WI-scr-050
deferred-reason: null
---

# Gap: No Issues or Improvements Hub screens exist

**Locations:**
- `hub/client/src/App.tsx:1`
- `hub/client/src/components/Sidenav.tsx:12`
- `hub/server/sdd-parser.ts:1`
- `hub/server/index.ts:1`

**Reasoning:** No Issues screen, no Improvements screen, no nav entries for either, and the server loads neither `.sdd/issues/` nor `.sdd/improvements/` — the invariant is entirely absent.
