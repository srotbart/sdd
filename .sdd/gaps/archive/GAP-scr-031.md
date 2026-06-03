---
id: GAP-scr-031
spec-item: SPEC-scr-034
domain: ui-screens
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "0ca6648f"
closed-by: WI-scr-031
deferred-reason: null
---

# Gap: Activity.tsx contains LIVE_EXTRAS, tickCount state, and setInterval generating synthetic activity lines

**Locations:**
- `hub/client/src/screens/Activity.tsx:10` — `LIVE_EXTRAS` hardcoded fake activity data constant
- `hub/client/src/screens/Activity.tsx:21` — `tickCount` state drives synthetic line generation
- `hub/client/src/screens/Activity.tsx:25` — `setInterval` fires every 6.5 s to increment `tickCount`
- `hub/client/src/screens/Activity.tsx:40` — `allLines` merges `liveExtras` (fake) with `lines` (real)

**Reasoning:** All four simulation artefacts must be deleted; `allLines` must equal `lines` directly so the screen shows only real agent events and an empty log when no agents have emitted events.
