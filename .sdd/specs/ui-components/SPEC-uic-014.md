---
id: SPEC-uic-014
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "61669cd9"
---

# SPEC-uic-014 — Artifact IDs in markdown content auto-render as ArtifactPeeker links

## Invariant

The shared `Markdown` component (SPEC-uic-013) automatically renders artifact IDs found in markdown text as links that open the artifact in the `ArtifactPeeker`. A remark plugin rewrites text matching the artifact-ID pattern (`TGT-`/`SPEC-`/`GAP-`/`WI-`/`ISS-`/`IMP-`) into link nodes carrying an `artifact:` sentinel URL, and the component's `a` renderer maps `artifact:` links to `ArtifactIdLink`. IDs inside code spans/blocks are not linkified, and the existing plain-text fallback applies to unknown or unloaded IDs. Because it lives in the shared component, every markdown-rendering surface gets this automatically with no per-call-site wiring.

## Acceptance criteria

- Artifact IDs in markdown body text render as clickable peeker links via the shared `Markdown` component
- A remark plugin rewrites matching IDs into link nodes (`artifact:` sentinel) and `components.a` maps them to `ArtifactIdLink`
- IDs inside code spans / fenced code blocks are NOT linkified
- Unknown or unloaded IDs fall back to plain text (existing `ArtifactIdLink` behavior)
- The behavior applies on every screen that renders markdown, with no per-site wiring
