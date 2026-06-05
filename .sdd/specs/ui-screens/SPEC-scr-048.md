---
id: SPEC-scr-048
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "112a41f6"
---

# SPEC-scr-048 — Session screen opens target detail in a right-side panel, not a redirect

## Invariant

On the Session screen, clicking a target reveals its detail in a panel that expands from the right side, without navigating away to the Targets screen. The panel renders the target's full detail by reusing the existing target detail view (`TargetDetail`) rather than a second implementation, and is dismissible (close button and `Esc`), returning to the plain session view. The session context remains visible while the panel is open. Scope is targets only; other Session row types (gaps, work-items, specs) continue to navigate as before.

## Acceptance criteria

- Clicking a target row on the Session screen does not navigate to the Targets screen
- A detail panel expands from the right edge showing the selected target's detail
- The panel reuses the existing `TargetDetail` view rather than a separate implementation
- The panel can be dismissed via a close control and `Esc`, returning to the session view
- The session content remains visible alongside the open panel
- Non-target Session rows (gaps, work-items, specs) keep their existing navigation

**Tests:**
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 clicking an awaiting-user target row opens the panel without calling onNav targets` — "clicking a target opens the detail panel instead of navigating away"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 the panel shows the selected target detail view` — "panel renders the TargetDetail view"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 clicking the panel close button dismisses the panel` — "panel is dismissible via close button"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 pressing Esc dismisses the panel` — "panel is dismissible via Esc key"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 session content (pipeline strip) remains visible when panel is open` — "session content stays visible alongside the open panel"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 clicking a gap row still calls onNav gaps and does not open a panel` — "non-target rows keep their existing navigation"
- `hub/client/src/screens/Session.test.tsx::SPEC-scr-048 clicking a work item row still calls onNav work and does not open a panel` — "non-target rows keep their existing navigation"
