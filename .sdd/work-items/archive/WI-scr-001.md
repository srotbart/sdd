---
id: WI-scr-001
gap-id: GAP-scr-001
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Map API response fields to frontend Target type after live fetch

**Scope:** `hub/client/src/App.tsx` — after `fetch(/workspaces/${activeWorkspaceId}/targets)` resolves, map the raw API fields (`id`, `status`, `created`, `domain`, `statement`) to the frontend `Target` type before calling `setLiveTargets`.

**Acceptance criteria:**
- API response is mapped to `Target` type (all required fields populated: `id`, `status`, `created`, `domain`, `statement`, `title`, `dialog`, `foldedInto`, `domainAbbrev`)
- Missing optional API fields default gracefully (empty `dialog: []`, `foldedInto: null`, `title` from statement or empty string)
- Test: render `<Targets>` with a live-fetched payload and confirm target rows display without TypeScript errors
- Test: confirm that a target with only API-required fields (`id`, `status`, `created`, `domain`, `statement`) renders without crashing
