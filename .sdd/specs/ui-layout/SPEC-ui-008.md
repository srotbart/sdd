---
id: SPEC-ui-008
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "4677c198"
---

# SPEC-ui-008 — Attach Workspace modal dialog

Clicking the `+` button or the "+ attach workspace" dropdown row opens a modal dialog: Newsreader italic title *Attach workspace*, hairline separator, PROJECT LOCATION section with a full-width path input and a `browse…` ghost link, RECENT FOLDERS section (paper-2 card) listing recently seen paths with description and a `● FRESH` / `● SDD READY` status chip. Footer has an Esc-to-cancel hint, `cancel` ghost button, and a solid `attach workspace` primary button. Escape and backdrop click close the dialog. On submit calls `POST /workspaces` with `{ name, path }`.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-008 — attach workspace modal dialog > SPEC-ui-008: clicking the + button opens a modal dialog titled "Attach workspace"` — "The + affordance opens an aria-modal Attach workspace dialog with a path input and browse link."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-008 — attach workspace modal dialog > SPEC-ui-008: Escape closes the dialog (onClose invoked)` — "Pressing Escape requests the dialog close."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-008 — attach workspace modal dialog > SPEC-ui-008: backdrop click closes the dialog (onClose invoked)` — "Clicking the backdrop overlay requests the dialog close."
