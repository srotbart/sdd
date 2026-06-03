---
id: WI-scr-040
gap-id: GAP-scr-039
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# WI-scr-040 — Add projections to sdd-artifact.ts artifact resolver

**Scope:** `hub/server/sdd-artifact.ts` — add `[path.join(".sdd", "projections"), "projections"]` to `SDD_ARTIFACT_DIRS` so that projection file changes resolve to the `"projections"` artifact and trigger `broadcastSddChanged`

**Acceptance criteria:**
- `SDD_ARTIFACT_DIRS` in `sdd-artifact.ts` includes an entry mapping `.sdd/projections` to `"projections"`
- `resolveArtifact` returns `"projections"` for a path containing `.sdd/projections/`
- Unit test: `resolveArtifact` with a `.sdd/projections/foo.md` path returns `"projections"`
- Unit test: existing artifact resolutions (targets, specs, gaps, work-items) are unaffected
