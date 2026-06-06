---
id: WI-arch-037
gap-id: GAP-arch-040
domain: architecture
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add node-pty PTY WebSocket endpoint to Hub server (SPEC-arch-043)

**Scope:** Create `hub/server/ws-pty.ts` — a WebSocket endpoint attached to the existing http server. On connect, spawn a PTY via node-pty running `claude` (cwd = workspace path from query param; fallback to default shell if claude not on PATH); stream PTY output to client; write client input to PTY; handle `{"type":"resize","cols":N,"rows":N}` messages; kill PTY on socket close. Wire `attachPtyWebSocketServer` into `hub/server/index.ts` alongside existing ws-ui / ws-agent attach calls. Write tests in `hub/server/ws-pty.test.ts`.

**Acceptance criteria:**
- `node-pty` is in hub/server/package.json dependencies
- `hub/server/ws-pty.ts` exports `attachPtyWebSocketServer(httpServer)`
- Endpoint is attached in index.ts alongside ws-ui and ws-agent
- On connect, spawns a PTY with cwd from query param (or process.cwd() as fallback)
- PTY runs `claude` if on PATH, else platform default shell
- PTY output is forwarded to the WebSocket client
- Client text messages are written to the PTY stdin
- `{"type":"resize","cols":N,"rows":N}` messages resize the PTY
- PTY is killed when the WebSocket closes
- Endpoint follows the same 127.0.0.1-only trust boundary as ws-ui/ws-agent
- Tests cover: PTY output forwarded, client input written, resize honored, PTY killed on close
