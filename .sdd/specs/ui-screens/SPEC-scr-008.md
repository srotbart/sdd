---
id: SPEC-scr-008
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "19b92eb3"
---

# SPEC-scr-008 — Workspace Settings screen

`client/src/screens/Settings.tsx` renders a workspace settings form. Page title is `○ workspace settings` in Newsreader italic with a circle bullet and a hairline separator below. A WORKSPACE section eyebrow precedes a hairline-bordered card with four rows (inner hairlines between rows): `name` (text input), `path` (text input), `description` (text input), `.sdd location` (read-only computed value in muted mono, no input box). Labels are left-aligned in `var(--ink-2)`; inputs use `var(--hair-2)` borders; `.sdd location` value uses `var(--ink-3)` and JetBrains Mono. No explicit save button — changes persist on blur.

**Tests:**
- `hub/client/src/screens/Settings.test.tsx > Settings blur-persist > renders no save button` — "Settings form has no explicit save button — changes persist on blur"
- `hub/client/src/screens/Settings.test.tsx > Settings blur-persist > calls PATCH /workspaces/:id with only the changed name field on blur` — "Settings POATCHes only the changed field on blur, not the full form"
