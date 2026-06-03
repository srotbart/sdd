---
id: SPEC-scr-016
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "853ca19b"
---

# SPEC-scr-016 — Targets screen dialog layout matches design

The dialog region in the Targets detail pane uses `padding: 24px 36px 120px` and `gap: 22px` between turns. Dialog turn WHO labels use `font-size: 10px` and `letter-spacing: 0.18em`. Turn bubbles use `padding: 0 0 0 20px` (left-only) with `font-size: 14px` and `line-height: 1.65`; vertical rhythm is provided entirely by the gap between turns, not by bubble padding.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets dialog layout (WI-scr-007) > .dialog has padding: 24px 36px 120px` — "Dialog region uses padding 24px 36px 120px"
- `hub/client/src/screens/Targets.test.tsx > Targets dialog layout (WI-scr-007) > .dialog has gap: 22px for vertical rhythm between turns` — "Dialog turns are separated by 22px gap"
