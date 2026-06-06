---
id: GAP-ui-026
spec-item: SPEC-ui-023
domain: ui-layout
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "58c87c4c"
closed-by: WI-ui-026
deferred-reason: null
---

# Gap: In-app back/forward navigation stack is not implemented

**Locations:**
- `hub/client/src/App.tsx:149` — no `navHistory`/`navIndex` state, no guard flag, no back/forward handlers, no `Alt+ArrowLeft`/`Alt+ArrowRight` key binding
- `hub/client/src/components/Header.tsx:6` — `HeaderProps` has no `onBack`/`onForward`/`canGoBack`/`canGoForward` props and no back/forward buttons are rendered

**Reasoning:** The spec requires a client-side view-history stack with back/forward buttons in the header and keyboard shortcuts, but neither the App navigation stack nor the Header buttons exist anywhere in the codebase.
