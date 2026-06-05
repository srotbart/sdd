---
id: WI-uic-001
gap-id: GAP-uic-001
domain: ui-components
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Wire rehype-highlight into the shared Markdown component with themed CSS token mapping

**Scope:** `hub/client/package.json`, `hub/client/src/components/Markdown.tsx`, `hub/client/src/styles/tokens.css`, `hub/client/src/components/Markdown.test.tsx` — install `rehype-highlight` + `highlight.js`, compose the plugin into the Markdown component's `rehypePlugins` with `detect: false` and `ignoreMissing: true`, and add a CSS stylesheet that maps `hljs-*` token classes to the existing `--hl-kw` / `--hl-fn` / `--hl-str` / `--hl-num` CSS tokens.

**Acceptance criteria:**
- `rehype-highlight` (with `highlight.js`) is listed as a dependency in `hub/client/package.json`; `highlight.js` common language set is used, no lazy loading
- `Markdown.tsx` passes `rehypeHighlight` as a `rehypePlugins` entry with `{ detect: false, ignoreMissing: true }`; `rehype-raw` is not added
- A CSS stylesheet (e.g. `Markdown.css`) maps `.hljs-keyword` → `var(--hl-kw)`, `.hljs-title` / `.hljs-built_in` → `var(--hl-fn)`, `.hljs-string` / `.hljs-attr` → `var(--hl-str)`, `.hljs-number` / `.hljs-literal` → `var(--hl-num)`; unmapped classes inherit `color: inherit` (default code ink)
- Test: a fenced code block with a language tag (e.g. ` ```ts `) renders `hljs` class on the `<code>` element and at least one `hljs-*` token class on a child span
- Test: a fenced code block with no language tag renders without error and produces no `hljs-*` token spans
- Test: a fenced code block with an unknown language tag degrades gracefully — no thrown error, no `hljs-*` spans
- Test: `rehype-raw` is NOT in the rehypePlugins list (preserves SPEC-uic-013 safety invariant)
- Test: artifact IDs inside fenced code blocks are still NOT linkified (SPEC-uic-014 regression)
- All existing SPEC-uic-013 and SPEC-uic-014 tests continue to pass
