---
id: WI-scr-015
gap-id: GAP-scr-015
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix dialog turn bubble font-size from 13px to 14px

**Scope:** `hub/client/src/screens/Targets.css:416` — change `.dialog-turn__body` `font-size` from `13px` to `14px`

**Acceptance criteria:**
- `.dialog-turn__body` CSS rule declares `font-size: 14px`
- `line-height: 1.65` remains unchanged
- Test: component snapshot or CSS unit test confirms `.dialog-turn__body` font-size is 14px
