---
id: SPEC-scr-013
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "6e9d530e"
---

# SPEC-scr-013 — Targets screen statement body uses 16px serif

The current statement body in the Targets detail pane renders in `font-family: var(--serif)` (Newsreader italic) at `font-size: 16px` with `line-height: 1.55`. This is the editorial prose treatment — the statement is reader content, not UI chrome. The `.statement-block__text` rule must declare both properties.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets statement body serif font (WI-scr-004) > .statement-block__text declares font-family: var(--serif)` — "Statement body uses Newsreader serif font-family"
- `hub/client/src/screens/Targets.test.tsx > Targets statement body serif font (WI-scr-004) > .statement-block__text declares font-size: 16px` — "Statement body font-size is 16px"
