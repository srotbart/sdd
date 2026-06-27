---
id: WI-arch-041
gap-id: GAP-arch-044
domain: architecture
status: done
created: "2026-06-27T23:18:20Z"
abandoned-reason: null
---

# Work Item: Broadcast and handle live refresh for issues/improvements/standards

**Scope:** `hub/server/sdd-artifact.ts`, `hub/server/ws-ui.ts`, `hub/client/src/App.tsx`, `hub/client/src/screens/Standards.tsx` — wire the three missing artifact types through the live-refresh path.

**Acceptance criteria:**
- `SddArtifact` type (ws-ui.ts) includes `issues`, `improvements`, `standards`
- `resolveArtifact` maps `.sdd/issues/`, `.sdd/improvements/`, `.sdd/standards/` to their artifact names
- Client `onmessage` refetches issues → `setLiveIssues`, improvements → `setLiveImprovements`, and bumps a standards refresh token + refetches the standards count
- The Standards screen re-fetches its content when the standards refresh token changes
- Test: `resolveArtifact` returns `issues`/`improvements`/`standards` for paths under those dirs (including `archive/`)
