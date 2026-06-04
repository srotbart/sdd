---
id: GAP-ui-021
spec-item: SPEC-ui-018
domain: ui-layout
status: closed
discovered: "2026-06-04T00:00:00Z"
audit-spec-version: "a2ee1790"
closed-by: WI-ui-021
deferred-reason: null
---

# Gap: No dark-theme token set declared in tokens.css

**Location:** `hub/client/src/styles/tokens.css:1`

**Reasoning:** `tokens.css` only declares a single `:root` block with light-mode colour values; no `[data-theme="dark"]` selector (or equivalent) defining alternative values for `--paper*`, `--ink*`, `--hair*`, `--accent*`, and `--st-*` tokens exists anywhere in the codebase.
