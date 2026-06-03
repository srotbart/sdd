---
id: WI-ui-019
gap-id: GAP-ui-019
domain: ui-layout
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add CSS rule for .app-empty-state to center the empty-state prompt

**Scope:** `hub/client/src/App.css` — add a `.app-empty-state` rule that centres the empty-state prompt text horizontally and vertically within the main content area.

**Acceptance criteria:**
- `.app-empty-state` CSS rule exists in `App.css`
- The rule centres content (e.g. `display: flex; align-items: center; justify-content: center; height: 100%`)
- Unit test: when `workspaces` is empty, the empty-state element with class `app-empty-state` is rendered
- Unit test: the rendered element contains the expected prompt text
