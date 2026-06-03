---
id: SPEC-ui-013
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "6b716698"
---

# SPEC-ui-013 — Header clock updates every minute and displays time in UTC

The Header component uses `setInterval` (cleared on unmount via `useEffect` cleanup) to update the displayed time once per minute. The time is formatted as `HH:mm UTC` using `Date.prototype.toISOString().slice(11, 16) + ' UTC'`. The date portion updates at midnight. The clock displays the current time at the moment of each tick, not the time of initial render.
