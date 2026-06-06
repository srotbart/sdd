---
id: WI-ui-026
gap-id: GAP-ui-026
domain: ui-layout
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# WI-ui-026 — Add in-app back/forward navigation stack and header buttons

**Scope:** `hub/client/src/App.tsx` and `hub/client/src/components/Header.tsx` — add
`navHistory`/`navIndex` state + guard ref to App, wire all user-navigation paths to push
entries (dedup consecutive duplicates, truncate forward on new nav), implement `handleBack`/
`handleForward` handlers, add `Alt+ArrowLeft`/`Alt+ArrowRight` keyboard shortcuts, pass
`onBack`/`onForward`/`canGoBack`/`canGoForward` props to Header, and render back/forward
buttons in the header.

**Acceptance criteria:**
- `App` maintains `navHistory: ViewState[]` and `navIndex: number` in state; a `ViewState`
  captures `{ activeWorkspaceId, activeTab, selectedItemId, pluginRefActive }`
- User navigations (tab change, item selection, workspace switch, plugin-ref toggle) push a
  new entry and truncate any forward entries; navigating to the same state as current is a no-op
- `handleBack` decrements `navIndex` and re-applies the stored state without pushing a new entry
  (guard flag prevents the state-change effect from re-pushing); `handleForward` increments
- `canGoBack` is false at index 0; `canGoForward` is false at the last index
- Back/forward buttons are rendered in the app-shell header; each is disabled when the
  corresponding flag is false
- `Alt+ArrowLeft` triggers back; `Alt+ArrowRight` triggers forward (no-ops when disabled)
- URL (`pushUrlState`) is called after a back/forward navigation so the address bar reflects
  the restored view state
- `npm test` in `hub/client` passes green
