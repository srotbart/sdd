---
id: SPEC-uic-013
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "93e58648"
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
