---
id: SPEC-ui-013
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "01eb247e"
---

# SPEC-ui-013 — Header clock updates every minute and displays time in UTC

The Header component uses `setInterval` (cleared on unmount via `useEffect` cleanup) to update the displayed time once per minute. The time is formatted as `HH:mm UTC` using `Date.prototype.toISOString().slice(11, 16) + ' UTC'`. The date portion updates at midnight. The clock displays the current time at the moment of each tick, not the time of initial render.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-013 — header clock updates every minute and displays UTC > SPEC-ui-013: clock displays HH:mm UTC matching the ISO time at render` — "Clock renders the current UTC HH:mm derived from the ISO time."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-013 — header clock updates every minute and displays UTC > SPEC-ui-013: after advancing 60s the displayed time updates off the initial render time` — "The minute interval re-reads the clock so the displayed time advances."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-013 — header clock updates every minute and displays UTC > SPEC-ui-013: unmounting clears the interval (no pending timers)` — "Unmounting the header clears the minute interval."
