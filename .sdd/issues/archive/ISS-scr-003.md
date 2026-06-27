---
id: ISS-scr-003
domain: ui-screens
status: accepted
location: "hub/client/src/screens/WorkItems.tsx:169"
severity: medium
discovered: "2026-06-27T22:18:12Z"
reviewed-by: GAP-uic-020
engaged-by: GAP-uic-020
---

# Issue: WorkItems renders scope with a hand-rolled HTML injector, not the Markdown component

**Location:** `hub/client/src/screens/WorkItems.tsx:169` (used at `:202`)
**Problem:** `renderScope` builds HTML with two ad-hoc regex replacements and injects it via `dangerouslySetInnerHTML`, instead of using the shared `Markdown` component that every other artifact detail uses.
**Rationale:** It reimplements a tiny, incomplete subset of Markdown (only inline code and a single path match — no lists, bold, links, or multi-match path handling), so work-item scope renders inconsistently with other screens, and `dangerouslySetInnerHTML` is an unnecessary HTML-injection surface. The work-item detail also does not reuse `ArtifactList`/`Markdown` the way Targets/Gaps/Issues do.
**Severity:** medium

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-uic-013 (markdown via the shared `Markdown`
component; raw HTML stays disabled). `renderScope` builds HTML and injects it via
`dangerouslySetInnerHTML` instead of using the shared component — a divergence from that
invariant. User pre-authorised fixing this in PR 4. Outcome: GAP-uic-020 written; issue
archived as accepted.
