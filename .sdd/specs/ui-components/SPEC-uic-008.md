---
id: SPEC-uic-008
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "750249b0"
---

# SPEC-uic-008 — Row-level CSS classes declare explicit background on their base rule

The following CSS classes must declare `background: var(--paper)` on their base (non-pseudo, non-modifier) rule: `.gaps-row` in `Gaps.css`, `.specs-domain-row` in `Specs.css`, `.kcard` in `WorkItems.css`, and `.act-line` in `Activity.css`. This ensures each row component's resting background is self-declared per SPEC-uic-006 and does not depend on the parent container.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-008 row classes declare explicit base background > SPEC-uic-008: .gaps-row base rule declares background: var(--paper) in Gaps.css` — the .gaps-row base rule self-declares its resting background.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-008 row classes declare explicit base background > SPEC-uic-008: .specs-domain-row base rule declares background: var(--paper) in Specs.css` — the .specs-domain-row base rule self-declares its resting background.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-008 row classes declare explicit base background > SPEC-uic-008: .kcard base rule declares background: var(--paper) in WorkItems.css` — the .kcard base rule self-declares its resting background.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-008 row classes declare explicit base background > SPEC-uic-008: .act-line base rule declares background: var(--paper) in Activity.css` — the .act-line base rule self-declares its resting background.
