---
id: GAP-scr-024
spec-item: SPEC-scr-027
domain: ui-screens
status: closed
discovered: "2026-05-19T00:00:00Z"
audit-spec-version: "db5de7c3"
closed-by: WI-scr-024
deferred-reason: null
---

# Gap: MOCK_SPECS items missing required testStatus field cause TypeScript type errors

**Locations:**
- `hub/client/src/App.tsx:173`
- `hub/client/src/App.tsx:174`
- `hub/client/src/components/CommandPalette.test.tsx:62`
- `hub/client/src/screens/Gaps.test.tsx:15`

**Reasoning:** `SpecItem.testStatus` is now non-optional but inline mock spec items in App.tsx and test files omit it, producing TS2741 compile errors that prevent a clean build.
