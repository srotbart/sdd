---
id: WI-scr-031
gap-id: GAP-scr-031
domain: ui-screens
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Remove simulation code from Activity.tsx; set allLines equal to lines prop directly

**Scope:** `hub/client/src/screens/Activity.tsx` — delete `LIVE_EXTRAS`, `tickCount` state, the `setInterval` effect, and the `liveExtras` useMemo; set `allLines` (or equivalent) equal to the `lines` prop directly.

**Acceptance criteria:**
- `LIVE_EXTRAS` constant is deleted
- `tickCount` state and the `setInterval` effect are deleted
- `liveExtras` and the `useMemo` that computes it are deleted
- The filtered lines variable is derived from `lines` prop only (no synthetic injection)
- An empty `lines` prop renders an empty activity log (no fake events appear)
- TypeScript compiles without errors after the change
- Client test: Activity renders with empty lines and shows no fake activity entries
- Client test: Activity renders with provided lines and shows only those entries
