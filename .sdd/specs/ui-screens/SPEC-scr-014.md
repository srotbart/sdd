---
id: SPEC-scr-014
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "220cd504"
---

# SPEC-scr-014 — Targets screen list pane background and archived row opacity

The `.targets-list` container has `background: var(--paper)` (not `var(--paper-2)`). Archived target rows carry `opacity: 0.55` to visually mute them relative to active rows; on hover opacity rises to `0.85`; when selected, opacity is `1` with `var(--paper-2)` background and accent left border.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets list background and archived row opacity (WI-scr-005) > .targets-list has background: var(--paper)` — "Targets list container background is var(--paper)"
- `hub/client/src/screens/Targets.test.tsx > Targets list background and archived row opacity (WI-scr-005) > .artifact-list-archived-row CSS rule sets opacity: 0.55` — "Archived target rows carry opacity: 0.55"
- `hub/client/src/screens/Targets.test.tsx > Targets list background and archived row opacity (WI-scr-005) > .artifact-list-archived-row:hover CSS rule sets opacity: 0.85` — "Archived target rows rise to opacity: 0.85 on hover"
