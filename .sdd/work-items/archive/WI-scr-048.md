---
id: WI-scr-048
gap-id: GAP-scr-046
domain: ui-screens
status: done
created: "2026-06-05T01:30:00Z"
abandoned-reason: null
---

# Work Item: Session screen — replace target navigation with inline right-side panel

**Scope:** `hub/client/src/screens/Session.tsx` and `hub/client/src/screens/Targets.tsx` — export `TargetDetail`, add panel state to Session, wire all four target-row onClick handlers to open the panel instead of calling `onNav('targets', ...)`, add close control and Esc dismissal, keep session content visible alongside the panel.

**Acceptance criteria:**
- `TargetDetail` is exported from `Targets.tsx`
- Clicking any target row on the Session screen does NOT call `onNav('targets', ...)`
- A right-side panel renders the selected target's detail using the exported `TargetDetail`
- The panel is dismissible via a close button
- Pressing Esc while the panel is open dismisses the panel
- Session content (pipeline strip, next-action, other rows) remains visible while panel is open
- Non-target rows (gaps, work-items, specs) continue to call `onNav` as before
- Unit test: clicking a target row opens the panel and does not call `onNav('targets', ...)`
- Unit test: clicking the panel close button dismisses the panel
- Unit test: pressing Esc dismisses the panel
- Unit test: clicking a gap/work-item/spec row still calls `onNav`
