---
id: SPEC-arch-028
domain: architecture
abbrev: arch
status: active
aliases: []
version: "e22dc18b"
---

# SPEC-arch-028 — Agent register message accepts an optional name field; server stores it

The agent WebSocket register message schema is extended: `{ type: "register", workspace: string, pid: number, host: string, name?: string }`. The `name` field is optional — agents that do not supply it receive a derived display name of `pid@host`. The server stores the resolved name in the agents table. Initials are derived server-side as the first character of each whitespace-separated word in the name, uppercased, max 2 characters (e.g., `"claude-a"` → `"CA"`).
