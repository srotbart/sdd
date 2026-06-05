---
id: SPEC-uic-015
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "1d510278"
---

# SPEC-uic-015 — Fenced code blocks in the shared Markdown component render with themed syntax highlighting

## Invariant

The shared `Markdown` component (SPEC-uic-013) renders fenced code blocks with language-aware
syntax highlighting via the `rehype-highlight` (highlight.js) rehype plugin, composed into the
existing `react-markdown` pipeline alongside `remark-gfm` and the artifact-link remark plugin
(SPEC-uic-014). Highlighted token colors are driven exclusively by the app's existing
`--hl-kw` / `--hl-fn` / `--hl-str` / `--hl-num` CSS tokens (defined for light and dark in
`src/styles/tokens.css`), so highlighting honors the active theme rather than shipping a
clashing third-party color scheme. Highlighting requires no raw HTML — `rehype-raw` stays
disabled, preserving SPEC-uic-013's safety invariant — and artifact IDs inside code blocks
remain non-linkified (SPEC-uic-014 preserved).

## Acceptance criteria

- The shared `Markdown` component passes `rehype-highlight` as a `rehypePlugins` entry; no
  markdown call site enables highlighting independently
- A fenced code block with a language tag (e.g. ` ```ts `) renders with `hljs`/`hljs-*` token
  classes (highlighted tokens), not flat monospaced text
- A fenced code block with no language tag renders as plain unhighlighted code with no thrown
  error (`detect: false`)
- A fenced code block with an unknown / unsupported language tag degrades gracefully —
  unhighlighted, no thrown error (`ignoreMissing: true`)
- Highlight token colors resolve from the existing `--hl-kw` / `--hl-fn` / `--hl-str` /
  `--hl-num` CSS tokens via a stylesheet mapping `hljs-*` classes; unmapped token classes
  inherit the default code `--ink` color, and the highlighting follows light/dark theme switches
- Raw HTML remains disabled (no `rehype-raw`); artifact IDs inside fenced code blocks are still
  NOT linkified (SPEC-uic-014 regression holds)
- `rehype-highlight` (with highlight.js) is added as a dependency in `hub/client`; the
  highlight.js `common` language set is used with no lazy grammar loading
