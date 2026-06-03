---
id: WI-arch-026
gap-id: GAP-arch-028
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Return 409 on duplicate workspace path in POST /workspaces

**Scope:** `hub/server/index.ts` and `hub/server/db/index.ts` — (1) change `insertWorkspace` from `INSERT OR IGNORE` to a plain `INSERT` so the UNIQUE constraint on `path` throws; (2) in the `POST /workspaces` handler wrap the insert in a try/catch and return 409 `{ error: "workspace with this path already exists" }` when a UNIQUE constraint error is caught

**Acceptance criteria:**
- `POST /workspaces` with a duplicate `path` returns HTTP 409
- Response body is `{ "error": "workspace with this path already exists" }`
- First-time `POST /workspaces` still returns 201 with the created workspace
- Unit test: duplicate path returns 409 with the required error body
- Unit test: unique path returns 201
