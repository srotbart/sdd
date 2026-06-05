---
id: GAP-uic-001
spec-item: SPEC-uic-015
domain: ui-components
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "1d510278"
closed-by: WI-uic-001
deferred-reason: null
---

# Gap: rehype-highlight not installed or wired into the shared Markdown component

**Locations:**
- `hub/client/package.json` — `rehype-highlight` and `highlight.js` are absent from dependencies
- `hub/client/src/components/Markdown.tsx:119` — `ReactMarkdown` is called with no `rehypePlugins`; the `rehype-highlight` plugin is not composed into the pipeline
- `hub/client/src/styles/tokens.css` — no `hljs-*` class rules mapping highlight.js token classes to `--hl-kw` / `--hl-fn` / `--hl-str` / `--hl-num` CSS tokens
- `hub/client/src/components/Markdown.test.tsx` — no SPEC-uic-015 test cases covering syntax highlighting behavior

**Reasoning:** The shared Markdown component has no rehype-highlight plugin, no hljs CSS token mapping, and no tests; fenced code blocks render as flat monospaced text rather than themed highlighted output.
