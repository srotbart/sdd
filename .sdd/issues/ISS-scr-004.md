---
id: ISS-scr-004
domain: ui-screens
status: open
location: "hub/client/src/screens/Standards.tsx:86"
severity: medium
discovered: "2026-06-27T22:18:12Z"
reviewed-by: null
---

# Issue: Standards screen renders user-authored markdown as plain text

**Location:** `hub/client/src/screens/Standards.tsx:86` (and the fallback at `:90`)
**Problem:** The standards screen renders `sec.body` and `file.content` directly inside `<div>`s as raw strings; it never imports or uses the shared `Markdown` component.
**Rationale:** Standards files are user-authored Markdown documents (headings, lists, tables, code spans), so they display as unformatted raw text — markdown syntax (`#`, `**`, `-`, backticks) is shown literally instead of rendered, unlike every other document view (Projections, Designs, Spec items) which use `Markdown`.
**Severity:** medium
