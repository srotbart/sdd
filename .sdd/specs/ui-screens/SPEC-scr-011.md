---
id: SPEC-scr-011
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "8ebe385b"
---

# SPEC-scr-011 — Targets screen sticky composer

The sticky composer at the bottom of the Targets detail pane contains: a textarea with the contextual placeholder "answer the agent's questions, or revise the current statement…"; a toolbar row below the textarea with `⌘ + ↵ to send` hint aligned left, and a "mark ready" ghost button plus a "send reply" filled primary button aligned right; and a muted one-line hint beneath the toolbar reading "sets status → awaiting-agent". The composer replaces the current "add a note…" / single "send" implementation.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets composer hint and mark-ready button (WI-scr-003) > hint text reads "sets status → awaiting-agent" when status is awaiting-user` — "Composer hint reads 'sets status → awaiting-agent'"
- `hub/client/src/screens/Targets.test.tsx > Targets composer hint and mark-ready button (WI-scr-003) > "mark ready" button is present in the toolbar when status is awaiting-user` — "Mark ready button appears when target is awaiting-user"
