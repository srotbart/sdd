---
id: GAP-uic-018
spec-item: SPEC-uic-014
domain: ui-components
status: closed
discovered: "2026-06-05T14:00:00Z"
audit-spec-version: "61669cd9"
closed-by: WI-uic-021
deferred-reason: null
---

# Gap: Markdown component does not linkify artifact IDs or render them via ArtifactIdLink

**Location:** `hub/client/src/components/Markdown.tsx:1`

**Reasoning:** The shared `Markdown` component has no remark plugin to rewrite artifact-ID text nodes into `artifact:` links, and no `components.a` override to render them as `ArtifactIdLink`; all artifact IDs render as plain text.
