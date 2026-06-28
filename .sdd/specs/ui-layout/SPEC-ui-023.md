---
id: SPEC-ui-023
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "8aa323f3"
---

# SPEC-ui-023 — App shell back/forward buttons navigate an in-app view history

## Invariant

The app shell renders browser-style **back** and **forward** buttons (in the header) that
navigate through an in-app history of viewed content. The history is a stack of view states —
`{ workspaceId, tab (activeTab), selectedItemId, pluginRefActive }`, the same tuple already
URL-synced in `App.tsx` — with a current index maintained in `App`. A user navigation
(switching tab, selecting an artifact, opening the plugin reference, switching workspace)
truncates any forward entries, appends the new view state, and advances the index; consecutive
duplicate states are not pushed. The **back** button decrements the index and re-applies the
stored view state; **forward** increments it; neither re-applied navigation pushes a new entry.
Back is disabled at the oldest entry and forward at the newest. `Alt+←` / `Alt+→` trigger
back / forward. The URL stays in sync (via the existing `pushUrlState`/`replaceState`) so reload
and shareable links keep working. Hijacking the browser's native back button and mouse aux
buttons is out of scope for this item.

## Acceptance criteria

- The app-shell header renders a back button and a forward button
- `App` maintains an in-app navigation stack of view states
  (`{ workspaceId, tab, selectedItemId, pluginRefActive }`) with a current index
- A user navigation that produces a new view state truncates forward entries, appends the new
  state, and advances the index; navigating to the same state as current does not add an entry
- Clicking back re-applies the previous view state (tab, selected item, plugin-ref, workspace)
  and does not create a new history entry; clicking forward re-applies the next state
- Back is disabled when at the oldest entry; forward is disabled when at the newest entry
- `Alt+ArrowLeft` triggers back and `Alt+ArrowRight` triggers forward (no-ops when disabled)
- The URL reflects the restored view state after a back/forward navigation (existing URL sync)

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: header renders back and forward buttons` — back and forward buttons render in the header
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: back button is disabled at the initial entry (oldest entry)` — back is disabled at the first history entry
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: forward button is disabled when there are no forward entries` — forward is disabled at the newest entry
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: navigating to a new tab enables back and disables forward` — a new navigation enables back and keeps forward disabled
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: clicking back returns to the previous tab; forward re-applies the newer one` — back/forward navigate through history correctly
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: new navigation after going back truncates the forward stack` — navigating after going back clears the forward entries
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: Alt+ArrowLeft triggers back; Alt+ArrowRight triggers forward` — keyboard shortcuts Alt+← and Alt+→ trigger back and forward
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: Header back/forward props alone wire correctly (disabled state, aria-label)` — Header back/forward buttons render with correct disabled state and aria-label
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-023 — in-app back/forward navigation > SPEC-ui-023: Header back button enabled when canGoBack=true, calls onBack on click` — enabled back button fires the onBack callback
