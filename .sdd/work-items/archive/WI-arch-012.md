---
id: WI-arch-012
gap-id: GAP-arch-015
domain: architecture
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Switch SQLite driver from node:sqlite to better-sqlite3

**Scope:** `hub/server/db/index.ts` — replace `DatabaseSync` import from `node:sqlite` with `Database` from `better-sqlite3`; `hub/server/package.json` — add `better-sqlite3` and `@types/better-sqlite3` dependencies, remove Node `--experimental-sqlite` flag from dev/start scripts.

**Acceptance criteria:**
- `better-sqlite3` present in `hub/server/package.json` dependencies
- `@types/better-sqlite3` present in devDependencies
- `node:sqlite` import removed from `hub/server/db/index.ts`
- `--experimental-sqlite` flag removed from `NODE_OPTIONS` in package.json scripts
- All existing DB operations (exec, prepare().run(), prepare().all(), prepare().get()) compile without type errors
- Manual test: server starts and workspace CRUD via `GET /workspaces` and `PATCH /workspaces/:id` return correct data
