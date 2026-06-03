---
id: GAP-uic-008
spec-item: SPEC-uic-008
domain: ui-components
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "e48bbe04"
closed-by: WI-uic-011
deferred-reason: null
---

# Gap: Four row-level CSS classes are missing background: var(--paper) on their base rule

**Locations:**
- `hub/client/src/screens/Gaps.css:52` — `.gaps-row` base rule has no `background` declaration
- `hub/client/src/screens/Specs.css:64` — `.specs-domain-row` base rule has no `background` declaration
- `hub/client/src/screens/WorkItems.css:87` — `.kcard` base rule has no `background` declaration
- `hub/client/src/screens/Activity.css:126` — `.act-line` base rule has no `background` declaration

**Reasoning:** All four base rules rely on ambient container background instead of declaring `background: var(--paper)` explicitly, violating the self-sufficient baseline requirement of SPEC-uic-006 and the explicit mandate of SPEC-uic-008.
