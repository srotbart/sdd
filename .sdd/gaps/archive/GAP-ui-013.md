---
id: GAP-ui-013
spec-item: SPEC-ui-013
domain: ui-layout
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "78abf73e"
closed-by: WI-ui-013
deferred-reason: null
---

# Gap: Header clock is computed once at render — no setInterval ticks every minute

**Location:** `hub/client/src/components/Header.tsx:9-12`

**Reasoning:** `now`, `dateStr`, and `timeStr` are computed from `new Date()` at render time with no `useState`/`setInterval`/`useEffect` to update them; the clock freezes at the time of the last parent re-render, violating SPEC-ui-013's requirement for a per-minute tick.
