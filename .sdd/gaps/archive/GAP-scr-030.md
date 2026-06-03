---
id: GAP-scr-030
spec-item: SPEC-scr-033
domain: ui-screens
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "0ca6648f"
closed-by: WI-scr-030
deferred-reason: null
---

# Gap: MOCK_SPECS, MOCK_GAPS, and MOCK_WORK_ITEMS still exist in App.tsx and are passed to Session, Gaps, WorkItems, and CommandPalette

**Locations:**
- `hub/client/src/App.tsx:130` — `MOCK_SPECS` constant declared (should be deleted)
- `hub/client/src/App.tsx:143` — `MOCK_GAPS` constant declared (should be deleted)
- `hub/client/src/App.tsx:167` — `MOCK_WORK_ITEMS` constant declared (should be deleted)
- `hub/client/src/App.tsx:443` — `Session` receives `specs={MOCK_SPECS}` instead of `liveSpecs`
- `hub/client/src/App.tsx:449` — `Gaps` receives `specs={MOCK_SPECS}` instead of `liveSpecs`
- `hub/client/src/App.tsx:451` — `WorkItems` receives `specs={MOCK_SPECS}` instead of `liveSpecs`
- `hub/client/src/App.tsx:500` — `CommandPalette` receives `specs={MOCK_SPECS}` instead of `liveSpecs`

**Reasoning:** All three mock constants remain as live dead code and are still wired into four render sites instead of the already-maintained `liveSpecs`, `liveGaps`, and `liveWorkItems` state.
