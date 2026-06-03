---
id: WI-ui-016
gap-id: GAP-ui-016
domain: ui-layout
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add 2px accent left border to active workspace trigger in sidenav

**Scope:** `hub/client/src/components/Sidenav.css` — add a `border-left: 2px solid transparent` base and an active-state `border-left-color: var(--accent)` modifier class to `.sidenav-ws-trigger` so the active workspace row displays the required accent border.

**Acceptance criteria:**
- `.sidenav-ws-trigger` has a `border-left: 2px solid transparent` rule as its base
- An active-state class (e.g. `.sidenav-ws-trigger--active`) sets `border-left-color: var(--accent)`
- The active class is applied to the trigger in `Sidenav.tsx` when this workspace is the active one
- Unit test: the trigger renders with the accent border class when the workspace is active
- Unit test: the trigger renders without the accent border class when the workspace is not active
