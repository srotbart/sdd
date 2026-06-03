---
id: WI-uic-011
gap-id: GAP-uic-008
domain: ui-components
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Add background: var(--paper) to base rules of .gaps-row, .specs-domain-row, .kcard, and .act-line

**Scope:** `hub/client/src/screens/Gaps.css:52`, `hub/client/src/screens/Specs.css:64`, `hub/client/src/screens/WorkItems.css:87`, `hub/client/src/screens/Activity.css:126` — add `background: var(--paper)` to the base (non-pseudo, non-modifier) rule of each class.

**Acceptance criteria:**
- `.gaps-row` base rule in `Gaps.css` declares `background: var(--paper)`
- `.specs-domain-row` base rule in `Specs.css` declares `background: var(--paper)`
- `.kcard` base rule in `WorkItems.css` declares `background: var(--paper)`
- `.act-line` base rule in `Activity.css` declares `background: var(--paper)`
- No existing hover, active, or modifier rules are removed or broken
- Client test: at least one of the affected screens renders its rows with an explicit background value (snapshot or computed-style check)
