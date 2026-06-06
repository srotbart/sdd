---
id: SPEC-ui-022
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "fbacc456"
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
