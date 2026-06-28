---
id: SPEC-ui-022
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "c44cc92d"
---

# SPEC-ui-022 — Floating terminal button toggles an xterm.js terminal panel

## Invariant

The app shell renders an always-available floating button anchored at the bottom of the page
that toggles a terminal panel open and closed. When open, the panel renders an interactive
terminal using xterm.js (with the fit addon so the terminal tracks the panel size), connected
over a WebSocket to a server-side pseudo-terminal (SPEC-arch-043) that surfaces the Claude
session for the active workspace. The button is present across screens of the shell; toggling
opens/closes the panel; closing the panel disposes the xterm instance and closes the socket so
the backing PTY is torn down. Terminal resizes propagate to the PTY.

## Acceptance criteria

- A floating button is anchored at the bottom of the page and available across the app shell
- Clicking the button toggles the terminal panel open/closed
- The panel renders an interactive terminal using xterm.js
- The terminal connects to the server PTY over a WebSocket and streams input/output both ways
- The terminal tracks the panel size via the xterm fit addon, and size changes drive a PTY
  resize (cols/rows)
- Closing the panel disposes the xterm instance and closes the WebSocket (PTY torn down)
- `xterm` and its fit addon are added as dependencies in `hub/client`

**Tests:**

- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > renders the terminal panel container and close button` — the panel container and close button render
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > opens a WebSocket to the PTY endpoint on mount` — a WebSocket is opened to the /terminal path on mount
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > includes the workspacePath as cwd in the WebSocket URL` — workspacePath is passed as cwd query param in the WebSocket URL
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > writes incoming WebSocket messages to the terminal` — server output is written to the xterm instance
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > forwards terminal key input to the WebSocket` — user keystrokes are sent over the WebSocket
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > calls onClose when the close button is clicked` — clicking the close button fires the onClose callback
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > disposes the terminal and closes the WebSocket on unmount` — unmount disposes the xterm instance and closes the socket
- `hub/client/src/components/TerminalPanel.test.tsx > TerminalPanel — floating terminal (SPEC-ui-022) > opens an xterm Terminal instance and calls open() on the container element` — xterm Terminal is opened on the container DOM element
