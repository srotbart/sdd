---
id: SPEC-arch-043
domain: architecture
abbrev: arch
status: active
aliases: []
version: "3a3aafc3"
---

# SPEC-arch-043 — Hub server provides a node-pty terminal over a localhost WebSocket

## Invariant

The Hub server provides a pseudo-terminal via `node-pty`, exposed over a WebSocket attached to
the existing http server. On connection the server spawns a PTY running `claude` with its
working directory set to the target workspace's path (falling back to the platform default shell
when `claude` is not on PATH), streams PTY output to the client, writes client input to the PTY,
honors resize messages (cols/rows), and kills the PTY process when the socket closes. The
endpoint inherits the Hub's existing trust boundary: the server binds `127.0.0.1` only (port
22351) and the terminal WebSocket follows the same pattern as the existing `ws-ui` / `ws-agent`
servers with no weaker controls. Because the server is not remotely reachable, arbitrary command
execution within this localhost boundary is accepted — consistent with the Hub already having
full workspace filesystem access and the ability to spawn agents.

## Acceptance criteria

- `node-pty` is added as a dependency in `hub/server`
- A WebSocket endpoint, attached to the existing `127.0.0.1` http server, accepts terminal
  connections (registered alongside the existing `ws-ui` / `ws-agent` attach functions)
- On connect, the server spawns a PTY running `claude` with `cwd` set to the target workspace
  path; if `claude` is not found it falls back to the platform default shell
- PTY output streams to the client; client keystrokes are written to the PTY
- Client resize messages resize the PTY (cols/rows)
- The PTY process is killed when the WebSocket closes
- The endpoint is bound to `127.0.0.1` only (no remote exposure) and adds no auth weaker than the
  existing WebSocket servers

**Tests:**

- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > spawns a PTY on connection` — a node-pty PTY is spawned when a client connects
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > forwards PTY output to the WebSocket client` — PTY output is sent as WebSocket messages to the client
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > writes client text messages to the PTY` — client text messages are written to the PTY input
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > handles resize messages by resizing the PTY` — resize messages call PTY resize with cols/rows
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > kills the PTY when the WebSocket closes` — PTY is killed on WebSocket close
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > closes the socket when the PTY exits` — socket is closed when the PTY process exits
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > resize messages are not written to the PTY as raw input` — JSON resize messages are not forwarded as raw PTY input
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > uses cwd from the query parameter when spawning the PTY` — the cwd query param sets the PTY working directory
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > falls back to process.cwd() when the supplied cwd does not exist` — nonexistent cwd falls back to process.cwd
- `hub/server/ws-pty.test.ts > ws-pty — PTY WebSocket endpoint (SPEC-arch-043) > closes the socket cleanly when spawn throws instead of crashing the hub` — PTY spawn failure closes the socket without crashing the server
