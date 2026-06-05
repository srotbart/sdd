---
id: GAP-wf-021
spec-item: SPEC-wf-023
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "e3f507ce"
closed-by: WI-wf-020
deferred-reason: null
---

# Gap: Artifact operating guides and CI check do not exist

**Location:** `plugin/references/` — no `artifacts/` subdirectory exists
**Reasoning:** `plugin/references/artifacts/{type}.md` guides are absent; no CI/grep check for six-section completeness exists; `schemas.md` does not link to per-type guides.
