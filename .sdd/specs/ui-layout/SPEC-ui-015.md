---
id: SPEC-ui-015
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "c571b2d8"
---

# SPEC-ui-015 — AttachWorkspaceDialog shows SDD detection preview and command peek

After a valid path is entered, the dialog shows a preview panel below the path field: "Existing `.sdd/` detected" (with a count of spec files found) if `.sdd/specs/` exists at the path, or "No `.sdd/` here yet" otherwise. When no `.sdd/` exists, a command peek block shows the `/sdd:init` command that would initialize the workspace. The primary button label is "attach workspace" when `.sdd/` is detected and "initialize & attach" when it is not.
