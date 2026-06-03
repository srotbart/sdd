---
id: SPEC-uic-008
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "874eaac5"
---

# SPEC-uic-008 — Row-level CSS classes declare explicit background on their base rule

The following CSS classes must declare `background: var(--paper)` on their base (non-pseudo, non-modifier) rule: `.gaps-row` in `Gaps.css`, `.specs-domain-row` in `Specs.css`, `.kcard` in `WorkItems.css`, and `.act-line` in `Activity.css`. This ensures each row component's resting background is self-declared per SPEC-uic-006 and does not depend on the parent container.
