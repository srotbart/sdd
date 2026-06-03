---
id: WI-scr-030
gap-id: GAP-scr-030
domain: ui-screens
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Delete MOCK_SPECS, MOCK_GAPS, MOCK_WORK_ITEMS from App.tsx and wire liveSpecs to all render sites

**Scope:** `hub/client/src/App.tsx` — delete the three mock constants and replace every usage of `MOCK_SPECS`, `MOCK_GAPS`, and `MOCK_WORK_ITEMS` with `liveSpecs`, `liveGaps`, and `liveWorkItems` respectively in the `Session`, `Gaps`, `WorkItems`, and `CommandPalette` render calls.

**Acceptance criteria:**
- `MOCK_SPECS`, `MOCK_GAPS`, and `MOCK_WORK_ITEMS` constants are deleted — no dead code remains
- `<Session>` receives `specs={liveSpecs}`, `gaps={liveGaps}`, `workItems={liveWorkItems}`
- `<Gaps>` receives `specs={liveSpecs}`
- `<WorkItems>` receives `specs={liveSpecs}`
- `<CommandPalette>` receives `specs={liveSpecs}`
- TypeScript compiles without errors after the change
- Client test: App renders without importing or referencing any mock spec/gap/work-item constant
