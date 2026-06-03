---
id: WI-scr-028
gap-id: GAP-scr-028
domain: ui-screens
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Forward selectedItemId to each screen as the appropriate initialXxxId prop

**Scope:** `hub/client/src/App.tsx:469-475` — pass `selectedItemId ?? undefined` as `initialTargetId` to `<Targets>`, `initialGapId` to `<Gaps>`, `initialWiId` to `<WorkItems>`, and `initialSpecId` to `<Specs>`

**Acceptance criteria:**
- `<Targets initialTargetId={selectedItemId ?? undefined}>` is rendered in the targets case
- `<Gaps initialGapId={selectedItemId ?? undefined}>` is rendered in the gaps case
- `<WorkItems initialWiId={selectedItemId ?? undefined}>` is rendered in the work items case
- `<Specs initialSpecId={selectedItemId ?? undefined}>` is rendered in the specs case
- Unit test: loading URL `?w=ws-1&v=gaps&id=GAP-arch-001` causes Gaps to open with GAP-arch-001 pre-selected
