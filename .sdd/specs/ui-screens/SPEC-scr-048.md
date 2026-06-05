---
id: SPEC-scr-048
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "7149b6f3"
---

# SPEC-scr-048 — Session screen opens target detail in a right-side panel, not a redirect

## Invariant

On the Session screen, clicking a target reveals its detail in a panel that expands from the right side, without navigating away to the Targets screen. The panel renders the target's full detail (reusing the existing target detail view rather than a second implementation) and is dismissible, returning to the plain session view. The session context remains visible while the panel is open.

## Acceptance criteria

- Clicking a target row on the Session screen does not navigate to the Targets screen
- A detail panel expands from the right edge showing the selected target's detail
- The panel reuses the existing target detail view rather than a separate implementation
- The panel can be dismissed/closed to return to the session view
- The session content remains visible alongside the open panel
