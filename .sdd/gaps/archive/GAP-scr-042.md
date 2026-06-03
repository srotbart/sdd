---
id: GAP-scr-042
spec-item: SPEC-scr-044
domain: ui-screens
status: closed
discovered: "2026-06-02T00:00:00Z"
audit-spec-version: "1b9cdc03"
closed-by: WI-scr-044
deferred-reason: null
---

**Locations:**
- `hub/server/index.ts` — no `GET /plugin-skills` route exists in `handleApi`
- `hub/client/src/screens/PluginReference.tsx:30` — `const SKILLS = [...]` is a hardcoded array; no fetch call to `/plugin-skills`

**Reasoning:** SPEC-scr-044 requires the backend to expose `GET /plugin-skills` (reading SKILL.md frontmatter from installed plugin directories) and the frontend to fetch it on mount, replacing the hardcoded `SKILLS` constant — neither is implemented.
