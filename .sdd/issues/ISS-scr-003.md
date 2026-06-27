---
id: ISS-scr-003
domain: ui-screens
status: open
location: "hub/client/src/screens/WorkItems.tsx:169"
severity: medium
discovered: "2026-06-27T22:18:12Z"
reviewed-by: null
---

# Issue: WorkItems renders scope with a hand-rolled HTML injector, not the Markdown component

**Location:** `hub/client/src/screens/WorkItems.tsx:169` (used at `:202`)
**Problem:** `renderScope` builds HTML with two ad-hoc regex replacements and injects it via `dangerouslySetInnerHTML`, instead of using the shared `Markdown` component that every other artifact detail uses.
**Rationale:** It reimplements a tiny, incomplete subset of Markdown (only inline code and a single path match — no lists, bold, links, or multi-match path handling), so work-item scope renders inconsistently with other screens, and `dangerouslySetInnerHTML` is an unnecessary HTML-injection surface. The work-item detail also does not reuse `ArtifactList`/`Markdown` the way Targets/Gaps/Issues do.
**Severity:** medium
