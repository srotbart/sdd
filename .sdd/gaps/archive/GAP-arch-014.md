---
id: GAP-arch-014
spec-item: SPEC-arch-013
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "2484d0c2"
closed-by: WI-arch-011
deferred-reason: null
---

# Gap: GET /workspaces/:id/specs endpoint does not exist

**Locations:**
- `server/index.ts` — no handler for GET /workspaces/:id/specs
- `client/src/screens/Specs.tsx` — uses mock MOCK_SPECS from App.tsx, never fetches live data

**Reasoning:** No spec-file parser or API endpoint exists; the Specs screen renders hardcoded mock data.
