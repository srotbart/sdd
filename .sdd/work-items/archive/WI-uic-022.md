---
id: WI-uic-022
gap-id: GAP-uic-019
domain: ui-components
status: done
created: "2026-06-27T23:44:34Z"
abandoned-reason: null
---

# Work Item: Render Standards content via the shared Markdown component

**Scope:** `hub/client/src/screens/Standards.tsx` — render section bodies and the full-file fallback through the shared `Markdown` component instead of raw `<div>` text.

**Acceptance criteria:**
- `Standards.tsx` imports and uses the shared `Markdown` component for `sec.body` and the `file.content` fallback
- No raw markdown string is rendered directly into a `<div>`
- Section headings continue to render as before
- Test: a standards file containing markdown (e.g. a `**bold**` span or a list) renders formatted HTML (e.g. a `<strong>`/`<li>`), not literal markdown characters
