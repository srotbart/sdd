---
id: WI-arch-023
gap-id: [GAP-arch-024, GAP-arch-025]
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add name/initials to agents — schema, DB layer, and WS register handler

**Scope:** `hub/server/db/schema.ts`, `hub/server/db/index.ts`, `hub/server/ws-agent.ts` — (1) add `name TEXT NOT NULL DEFAULT ''` column to `CREATE_AGENTS`; (2) update `upsertAgent` to accept and store `name`, compute initials server-side; (3) update `getAllAgents` to return `name` and computed `initials`; (4) update `RegisterMessage` type to include optional `name?: string` and the register handler to derive `name = message.name ?? "${pid}@${host}"` before upserting

**Acceptance criteria:**
- `agents` table DDL includes a `name` column
- `getAllAgents()` return type includes `name: string` and `initials: string`
- `initials` is max 2 chars, first char of each whitespace-separated word, uppercased
- Agents registering without `name` get derived name `pid@host`
- Agents registering with `name` get that name stored
- Unit test: `computeInitials("claude-a")` returns `"CA"`
- Unit test: agent registered without name stores `"<pid>@<host>"` as name
- Unit test: `getAllAgents()` returns initials field for each agent
