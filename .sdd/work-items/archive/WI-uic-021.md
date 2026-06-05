---
id: WI-uic-021
gap-id: GAP-uic-018
domain: ui-components
status: done
created: "2026-06-05T14:00:00Z"
abandoned-reason: null
---

# Work Item: Add artifact-ID remark plugin and ArtifactIdLink renderer to Markdown component

**Scope:** `hub/client/src/components/Markdown.tsx` — add `remarkArtifactLinks` plugin that rewrites artifact-ID text nodes into `artifact:<ID>` link nodes, and add `components.a` override that maps `artifact:` links to `<ArtifactIdLink>`; add `urlTransform` to allow the sentinel URL through sanitization.

**Acceptance criteria:**
- Artifact IDs (TGT, SPEC, GAP, WI, ISS, IMP prefixes) in markdown body text render as `<button class="artifact-id-link">` via `ArtifactIdLink`
- Unit test (a): ID in paragraph → `artifact-id-link` button rendered
- Unit test (b): ID inside fenced code block → NOT linkified (plain text in `<code>`)
- Unit test (b): ID inside inline code → NOT linkified (plain text in `<code>`)
- Unit test (c): normal markdown link → plain `<a>` element, no artifact button
- Unit test (d): GFM table still renders (regression: remark-gfm unchanged)
- No new npm dependencies required
