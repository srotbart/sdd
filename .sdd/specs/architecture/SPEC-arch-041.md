---
id: SPEC-arch-041
domain: architecture
abbrev: arch
status: active
aliases: []
version: "5a8bdad6"
---

# SPEC-arch-041 — parseGaps derives domain from spec-item when domain frontmatter field is absent

When a gap file's frontmatter has no `domain` field (or the field is empty), `parseGaps` derives the domain from the `spec-item` value using the known abbrev→domain mapping: `arch → architecture`, `scr → ui-screens`, `ui → ui-layout`, `uic → ui-components`, `wf → workflow`. The abbrev is the middle segment of the spec-item ID (e.g. `SPEC-scr-023` → abbrev `scr` → domain `ui-screens`). If the abbrev does not match a known domain, the abbrev itself is used as the domain. The domain field must never be returned as an empty string — an empty string causes ArtifactList to produce a filter tab with no visible label.
