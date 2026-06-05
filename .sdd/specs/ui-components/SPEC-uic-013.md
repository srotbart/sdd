---
id: SPEC-uic-013
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "d31679a0"
---

# SPEC-uic-013 — Markdown is rendered with GFM support via a shared Markdown component

## Invariant

The Hub renders artifact markdown through a single shared `Markdown` component that wraps `react-markdown` with the `remark-gfm` plugin, so GitHub-Flavored-Markdown content renders: tables (no longer shown as raw pipes), strikethrough, task lists, and autolinks. Every markdown-rendering surface uses this shared component rather than calling `react-markdown` directly. Raw HTML stays disabled (no `rehype-raw`) for safety.

## Acceptance criteria

- A shared `Markdown` component wraps `react-markdown` + `remark-gfm`
- GFM tables render as HTML tables (not raw `|` text); strikethrough, task lists, and autolinks render
- All markdown call sites use the shared component (no direct `react-markdown` usage remains in screens)
- Raw HTML is not enabled (no `rehype-raw`)
- `remark-gfm` is added as a dependency in `hub/client`

**Tests:**
- `hub/client/src/components/Markdown.test.tsx::Markdown component — GFM support (SPEC-uic-013) > renders a GFM table as an HTML <table> element` — "GFM table renders as HTML table not raw pipes"
- `hub/client/src/components/Markdown.test.tsx::Markdown component — GFM support (SPEC-uic-013) > renders strikethrough ~~text~~ as a <del> element (SPEC-uic-013)` — "strikethrough renders as del element"
- `hub/client/src/components/Markdown.test.tsx::Markdown component — GFM support (SPEC-uic-013) > renders a GFM task list item as a checkbox input (SPEC-uic-013)` — "task list items render as checkbox inputs"
- `hub/client/src/components/Markdown.test.tsx::Markdown component — GFM support (SPEC-uic-013) > does not render raw HTML (no rehype-raw) — script tag is escaped (SPEC-uic-013)` — "raw HTML is disabled, no rehype-raw"
