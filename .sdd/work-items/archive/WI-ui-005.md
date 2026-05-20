---
id: WI-ui-005
gap-id: [GAP-ui-006, GAP-ui-007]
domain: ui-layout
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Workspace dropdown and Attach Workspace dialog

**Scope:** `client/src/components/Sidenav.tsx` + `Sidenav.css` + new `client/src/components/AttachWorkspaceDialog.tsx` + `AttachWorkspaceDialog.css`

**Acceptance criteria:**
- Active workspace row shows name, alert badge, and `▴` chevron; clicking opens a dropdown panel
- Dropdown lists all workspaces (dot, name, mono path, alert badge); active row has 2px accent left border
- "+ attach workspace" row at the bottom of the dropdown panel
- Clicking outside the dropdown (or another workspace) closes it
- `+` button in WORKSPACE eyebrow and "+ attach workspace" row both open the Attach Workspace modal
- Modal: Newsreader italic title, PROJECT LOCATION input with browse… ghost link, RECENT FOLDERS card with path/description/status-chip rows, footer with Esc hint + cancel + attach buttons
- Clicking a recent folder row populates the path input
- Escape key and backdrop click close the modal
- On submit, calls POST /workspaces with { name (last path segment), path } and closes modal
- Test: clicking the workspace trigger renders the dropdown panel with a workspace list item
