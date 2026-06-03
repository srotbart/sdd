---
id: GAP-arch-038
spec-item: SPEC-arch-041
domain: architecture
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "5aca4dd3"
closed-by: WI-arch-035
deferred-reason: null
---

# Gap: parseGaps returns empty string domain when domain frontmatter field is absent

**Location:** `hub/server/sdd-parser.ts:233`

**Reasoning:** `parseGapFile` returns `domain: meta["domain"] ?? ""` with no fallback derivation from the `spec-item` field; gap files without a `domain` frontmatter field produce an empty-string domain, causing blank filter tabs in ArtifactList.
