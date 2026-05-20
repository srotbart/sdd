---
id: WI-arch-001
gap-id: [GAP-arch-001, GAP-arch-007]
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Scaffold Node.js server bound to localhost

**Scope:** `server/index.ts` — create the server entry point, bind HTTP server to 127.0.0.1, serve Vite-built static assets from `client/dist/`

**Acceptance criteria:**
- Server starts with `npm run dev` (or equivalent) and listens on 127.0.0.1 only
- Serving a static `index.html` from the client build path returns 200
- Binding to 0.0.0.0 is not present in any configuration
- Test: server startup binds to 127.0.0.1 and rejects connections on other interfaces
