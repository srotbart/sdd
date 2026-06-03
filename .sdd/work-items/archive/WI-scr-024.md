---
id: WI-scr-024
gap-id: GAP-scr-024
domain: ui-screens
status: done
created: "2026-05-19T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add testStatus to inline mock SpecItem objects

**Scope:** `hub/client/src/App.tsx:173-174` and `hub/client/src/components/CommandPalette.test.tsx:62` and `hub/client/src/screens/Gaps.test.tsx:15` — add `testStatus: { status: 'not-run' }` to every inline mock `SpecItem` object so the TypeScript build is clean.

**Acceptance criteria:**
- All inline mock `SpecItem` literals in `App.tsx`, `CommandPalette.test.tsx`, and `Gaps.test.tsx` include `testStatus: { status: 'not-run' }`
- `npx tsc --noEmit` produces zero new TS2741 errors related to `testStatus`
- Full client test suite passes (`npm test`)
