---
id: SPEC-scr-012
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "dd2cc706"
---

# SPEC-scr-012 — Targets screen list item background

Active (non-archived) target rows in the Targets screen left list have a white (`#ffffff`) background. Archived rows below the divider may use a muted or slightly dimmed treatment. The current off-white/grey tint applied to the active items area does not match this requirement.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Target row background (WI-scr-014) > .target-row has an explicit background declaration (not inherited)` — "Active target rows have an explicit background rule"
- `hub/client/src/screens/Targets.test.tsx > Target row background (WI-scr-014) > .target-row background token is var(--paper)` — "Active target row background is var(--paper)"
