---
id: GAP-arch-040
spec-item: SPEC-arch-043
domain: architecture
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "542c72a3"
closed-by: WI-arch-037
deferred-reason: null
---

# Gap: No node-pty PTY WebSocket endpoint exists in the Hub server

**Locations:**
- `hub/server/index.ts:573-574` — only ws-ui and ws-agent are attached; no PTY terminal WebSocket
- `hub/server/` — no ws-pty.ts file and no PTY-related code
- `hub/server/package.json` — node-pty not yet a dependency

**Reasoning:** SPEC-arch-043 requires a WebSocket endpoint attached to the existing http server that spawns a node-pty PTY (running `claude` or fallback shell) per connection, streams output to the client, writes client input to the PTY, handles resize messages, and kills the PTY on socket close. None of this exists.
