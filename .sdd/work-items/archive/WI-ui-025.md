---
id: WI-ui-025
gap-id: GAP-ui-025
domain: ui-layout
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Floating terminal button + xterm.js terminal panel (SPEC-ui-022)

**Scope:** Create `hub/client/src/components/TerminalPanel.tsx` + `TerminalPanel.css` — an xterm.js terminal that connects to `ws://localhost:22351/terminal?cwd=<workspacePath>`, streams I/O, handles resize via fit addon, disposes on close. Add a floating toggle button and panel state to `hub/client/src/App.tsx`. Add test coverage in `hub/client/src/components/TerminalPanel.test.tsx`.

**Acceptance criteria:**
- A floating button is anchored at the bottom of the app shell and available across all screens
- Clicking the button toggles the terminal panel open/closed
- The panel renders an xterm.js terminal
- Terminal connects to the server PTY WebSocket and streams input/output
- Fit addon tracks panel size; size changes send `{"type":"resize","cols":N,"rows":N}`
- Closing the panel disposes the xterm instance and closes the WebSocket
- `xterm` and `@xterm/addon-fit` are in hub/client/package.json
- Tests cover: button renders, panel opens/closes on click, terminal is disposed on panel close
