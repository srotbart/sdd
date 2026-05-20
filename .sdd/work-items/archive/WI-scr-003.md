---
id: WI-scr-003
gap-id: GAP-scr-003
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Targets composer: correct "mark ready" visibility and hint text

**Scope:** `hub/client/src/screens/Targets.tsx` — update `TargetDetail` composer section: move "mark ready" ghost button outside the `awaiting-user`-only guard so it renders for all applicable statuses; update `actionMap` `hint` for `awaiting-user` to `"sets status → awaiting-agent"` as required.

**Acceptance criteria:**
- "mark ready" ghost button is present in the toolbar row when `target.status === 'awaiting-user'` (verify it was already conditional — spec says it should be in the toolbar row)
- Muted one-line hint beneath toolbar reads `"sets status → awaiting-agent"` for `awaiting-user` status
- `⌘ + ↵ to send` hint is left-aligned; action buttons are right-aligned in the toolbar row
- Test: render `<TargetDetail>` with `status='awaiting-user'` and assert hint text equals `"sets status → awaiting-agent"`
- Test: render with `status='awaiting-agent'` and assert "mark ready" button is not present
