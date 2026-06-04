---
id: SPEC-arch-028
domain: architecture
abbrev: arch
status: active
aliases: []
version: "3a953225"
---

# SPEC-arch-028 — Agent register message accepts an optional name field; server stores it

The agent WebSocket register message schema is extended: `{ type: "register", workspace: string, pid: number, host: string, name?: string }`. The `name` field is optional — agents that do not supply it receive a derived display name of `pid@host`. The server stores the resolved name in the agents table. Initials are derived server-side as the first character of each whitespace-separated word in the name, uppercased, max 2 characters (e.g., `"claude-a"` → `"CA"`).

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-006/028: agent WebSocket registration > SPEC-arch-028: register without name derives name pid@host — "an agent that omits name gets a pid@host display name"
hub/server/spec-arch-ws.test.ts > SPEC-arch-006/028: agent WebSocket registration > SPEC-arch-028: register with explicit name stores that name — "an agent that supplies a name has it stored"
hub/server/spec-arch.test.ts > SPEC-arch-028: agent name initials derivation > SPEC-arch-028: computeInitials takes first char of up to two words, uppercased — "initials are derived from the first character of up to two words"
