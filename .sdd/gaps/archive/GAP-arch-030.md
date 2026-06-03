---
id: GAP-arch-030
spec-item: SPEC-arch-035
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-028
deferred-reason: null
---

# Gap: parseTargets reads archive directory but does not override status to 'archived'

**Location:** `hub/server/sdd-parser.ts:188-193`

**Reasoning:** Archive targets are appended to the result array using the frontmatter status unchanged; SPEC-arch-035 requires setting `status: 'archived'` for all targets read from the archive directory regardless of frontmatter.
