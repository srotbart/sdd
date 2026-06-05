---
id: SPEC-uic-014
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "2d68725c"
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

## Tests

- `hub/client/src/components/Markdown.test.tsx` — `Markdown component — artifact ID linkification (SPEC-uic-014)`
  - `(a) an artifact ID in a paragraph renders as an artifact-id-link button`
  - `(a) multi-segment IDs (SPEC-uic-014, GAP-uic-001, WI-uic-001) also linkify`
  - `(a) all supported prefixes linkify: TGT SPEC GAP WI ISS IMP`
  - `(b) an artifact ID inside a fenced code block is NOT linkified`
  - `(b) an artifact ID inside inline code is NOT linkified`
  - `(c) a normal markdown link still renders as a plain <a> element`
  - `(d) GFM table still renders correctly alongside artifact linkification (regression)`
