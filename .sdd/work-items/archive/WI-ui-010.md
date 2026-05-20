---
id: WI-ui-010
gap-id: GAP-ui-010
domain: ui-layout
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Remove drop shadows from shell CSS to satisfy no-shadow editorial constraint

**Scope:** `hub/client/src/components/AttachWorkspaceDialog.css:22`, `hub/client/src/components/Sidenav.css:142`, `hub/client/src/components/CommandPalette.css:22` — delete all `box-shadow` declarations from these three files

**Acceptance criteria:**
- `AttachWorkspaceDialog.css` `.dlg` rule contains no `box-shadow` property
- `Sidenav.css` `.sidenav-ws-panel` rule contains no `box-shadow` property
- `CommandPalette.css` rule contains no `box-shadow` property
- `grep -r "box-shadow" hub/client/src/` returns only the `box-shadow: none` reset in `global.css` (no positive shadow values)
- Visual regression: dialog, workspace dropdown panel, and command palette remain visually distinct using border/hairline alone
