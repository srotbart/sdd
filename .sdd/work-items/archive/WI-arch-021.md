---
id: WI-arch-021
gap-id: GAP-arch-021
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Fix activity broadcast message shape to match SPEC-arch-025

**Scope:** `hub/server/ws-agent.ts` — change the activity broadcast in the `message.type === "activity"` handler to emit `{ type: "activity", agentId, workspaceId, kind, msg, t }` instead of `{ type: "activity", agentId, event, detail }`; update `ActivityMessage` input type to carry `kind: "in" | "note" | "err"` and `msg: string`

**Acceptance criteria:**
- Activity broadcast payload contains `workspaceId`, `kind`, `msg`, and `t` (ISO timestamp) fields
- `event` and `detail` fields are removed from the broadcast
- `ActivityMessage` interface updated to match the new inbound agent wire format
- Unit test: activity message sent by agent produces broadcast with correct `kind`/`msg`/`t`/`workspaceId` fields
