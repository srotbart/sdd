---
id: SPEC-ui-015
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "5ed8e4df"
---

# SPEC-ui-015 — AttachWorkspaceDialog shows SDD detection preview and command peek

After a valid path is entered, the dialog shows a preview panel below the path field: "Existing `.sdd/` detected" (with a count of spec files found) if `.sdd/specs/` exists at the path, or "No `.sdd/` here yet" otherwise. When no `.sdd/` exists, a command peek block shows the `/sdd:init` command that would initialize the workspace. The primary button label is "attach workspace" when `.sdd/` is detected and "initialize & attach" when it is not.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-015 — SDD detection preview and command peek > SPEC-ui-015: detected .sdd shows "attach workspace" label and an "Existing .sdd/ detected" preview` — "Detected .sdd yields the attach label and a detection preview with no command peek."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-015 — SDD detection preview and command peek > SPEC-ui-015: missing .sdd shows "initialize & attach" label and a /sdd:init command peek` — "Missing .sdd yields the initialize label and a /sdd:init command peek."
