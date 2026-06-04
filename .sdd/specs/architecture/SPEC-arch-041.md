---
id: SPEC-arch-041
domain: architecture
abbrev: arch
status: active
aliases: []
version: "9c10a487"
---

# SPEC-arch-041 — parseGaps derives domain from spec-item when domain frontmatter field is absent

When a gap file's frontmatter has no `domain` field (or the field is empty), `parseGaps` derives the domain from the `spec-item` value using the known abbrev→domain mapping: `arch → architecture`, `scr → ui-screens`, `ui → ui-layout`, `uic → ui-components`, `wf → workflow`. The abbrev is the middle segment of the spec-item ID (e.g. `SPEC-scr-023` → abbrev `scr` → domain `ui-screens`). If the abbrev does not match a known domain, the abbrev itself is used as the domain. The domain field must never be returned as an empty string — an empty string causes ArtifactList to produce a filter tab with no visible label.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-041: parseGaps domain derivation > SPEC-arch-041: derives 'architecture' from SPEC-arch-NNN when domain frontmatter absent — "an absent domain is derived as architecture from a SPEC-arch spec item"
hub/server/spec-arch.test.ts > SPEC-arch-041: parseGaps domain derivation > SPEC-arch-041: derives 'ui-screens' from SPEC-scr-NNN abbrev — "an absent domain is derived as ui-screens from a SPEC-scr spec item"
hub/server/spec-arch.test.ts > SPEC-arch-041: parseGaps domain derivation > SPEC-arch-041: unknown abbrev falls back to the abbrev itself, never empty string — "an unknown abbrev falls back to itself and is never empty"
hub/server/spec-arch.test.ts > SPEC-arch-041: parseGaps domain derivation > SPEC-arch-041: explicit domain frontmatter takes precedence over derivation — "an explicit domain frontmatter field overrides derivation"
