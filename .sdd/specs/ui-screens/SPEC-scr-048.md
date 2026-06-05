---
id: SPEC-scr-048
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "dccf375f"
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
