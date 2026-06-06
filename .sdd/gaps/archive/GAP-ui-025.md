---
id: GAP-ui-025
spec-item: SPEC-ui-022
domain: ui-layout
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "fbacc456"
closed-by: WI-ui-025
deferred-reason: null
---

# Gap: No floating terminal button or xterm.js terminal panel in the app shell

**Locations:**
- `hub/client/src/App.tsx` — no floating terminal button, no terminal panel state
- `hub/client/src/components/` — no TerminalPanel component
- `hub/client/src/App.css` — no terminal panel or floating button styles
- `hub/client/package.json` — xterm and @xterm/addon-fit not yet in dependencies

**Reasoning:** SPEC-ui-022 requires an always-available floating button anchored at the bottom of the app shell that toggles an xterm.js terminal panel. The panel connects over a WebSocket to the Hub PTY endpoint (SPEC-arch-043). None of this exists.
