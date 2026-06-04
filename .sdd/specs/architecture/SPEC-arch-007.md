---
id: SPEC-arch-007
domain: architecture
abbrev: arch
status: active
aliases: []
version: "64541105"
---

# SPEC-arch-007 — Hub runs entirely on localhost; no authentication required

The server binds exclusively to 127.0.0.1. No remote access, no authentication, and no TLS are required for v1.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-007/008: hub host and port are fixed config constants > SPEC-arch-007: server source binds HOST to 127.0.0.1 only — "the server is configured to bind exclusively to 127.0.0.1"
hub/server/spec-arch.test.ts > SPEC-arch-007/008: hub host and port are fixed config constants > SPEC-arch-007: no authentication middleware token is checked before handling API — "no authentication gate is present in the request path"
