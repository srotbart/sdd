---
id: WI-ui-013
gap-id: GAP-ui-013
domain: ui-layout
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add per-minute setInterval clock to Header component

**Scope:** `hub/client/src/components/Header.tsx` — add `useState` for current time (init to `new Date()`), add `useEffect` that sets `setInterval` ticking once per minute updating the time state and clearing the interval on unmount; derive `dateStr` and `timeStr` from the state value

**Acceptance criteria:**
- Header uses `useState` for time and `useEffect` with `setInterval` (60 000 ms interval)
- Interval is cleared in the `useEffect` cleanup function
- `timeStr` is formatted as `HH:mm UTC` from the state time
- Unit test: after advancing fake timers by 60 s, the displayed time updates
- Unit test: unmounting Header clears the interval (no pending timers)
