---
id: SPEC-ui-screens
domain: ui-screens
abbrev: scr
version: "f1c1eaf6"
aliases: []
---

# Spec: UI Screens

## SPEC-scr-001 — Hub Dashboard screen
*Status: active | Aliases: none*

`client/src/screens/Dashboard.tsx` renders a cross-workspace overview with: a 5-column summary strip (awaiting your input, open targets, open gaps, active work, stale audits — large serif numerals over uppercase eyebrow labels); an auto-fill workspace tile grid where each tile shows a live/idle dot, workspace name and path, attached agent chips, last-activity timestamp, and a 4-stat strip; and a unified agent-activity stream showing the last 10 lines across all workspaces.

## SPEC-scr-002 — Workspace Session screen
*Status: active | Aliases: none*

`client/src/screens/Session.tsx` mirrors the `/sdd:session-start` output: a terminal-style invocation block with timestamp; a 5-column pipeline strip (targets / spec items / open gaps / work items / done today) with the active stage marked by a 2 px accent top border; priority-ordered category sections (targets awaiting user, targets awaiting agent, ready targets, draft targets, specs, stale audit warning, open gaps, active work items); and a footer next-action terminal block.

## SPEC-scr-003 — Workspace Targets screen
*Status: active | Aliases: none*

`client/src/screens/Targets.tsx` has a full-width title bar above the two-pane split: `▪ targets — declared intent, negotiated to spec` (small square bullet, "targets" in Newsreader italic, muted subtitle text) with a `+ new target` button (filled black, top-right). The left list (~380 px) has a filter bar with tabs: all / awaiting you / awaiting agent / ready / draft / archived, each with a live count. Active items appear first; below them a `· ARCHIVED N` eyebrow divider separates archived items — each archived row shows the standard fields (ID in mono accent, status pill, time-ago, title in serif, domain in brackets, dialog-turn count) plus a `folded → SPEC-{abbrev}-{seq}` footer in muted mono when accepted into a spec item. The selected row has a 2 px accent left border. The right pane shows target detail: header with ID + status + domain + created + title, a current-statement block with a left accent border bar and an edit toggle, a turn-by-turn dialog log (YOU / AGENT labels, dated, bordered-left), and a sticky composer at the bottom.

## SPEC-scr-025 — Targets screen list pane uses ArtifactList for active and archived rows
*Status: active | Aliases: none*

The Targets screen left list pane renders active and archived target rows via the shared `ArtifactList` component (`hub/client/src/components/ArtifactList.tsx`, SPEC-uic-001). Inline reimplementation of the archived divider or the archived-row opacity treatment in `Targets.tsx` is not permitted; those responsibilities belong exclusively to `ArtifactList`.

## SPEC-scr-026 — Gaps screen list pane uses ArtifactList for active and archived rows
*Status: active | Aliases: none*

The Gaps screen left list pane renders active and archived gap rows via the shared `ArtifactList` component (`hub/client/src/components/ArtifactList.tsx`, SPEC-uic-001). Inline reimplementation of the archived divider or the archived-row opacity treatment in `Gaps.tsx` is not permitted; those responsibilities belong exclusively to `ArtifactList`.

## SPEC-scr-004 — Workspace Specs screen
*Status: active | Aliases: none*

`client/src/screens/Specs.tsx` is a two-pane layout: a left domain list (~220 px) with name and version hash per domain, and a right pane showing all active spec items for the selected domain — each item has an ID line (mono accent ID, active pill, open-gap pill if applicable, aliases), a Newsreader title, body paragraph, and ref pills linking to related GAP and WI IDs.

## SPEC-scr-005 — Workspace Gaps screen
*Status: active | Aliases: none*

`client/src/screens/Gaps.tsx` is a two-pane layout: a left list (~420 px) with a horizontally-scrollable domain filter bar and one row per gap showing ID + status pill + optional WI closer pill, serif title, mono path:line, and a metadata footer. The right pane shows gap detail: header with ID + status + action button or WI link + serif title; a two-column layout with main area (location, reasoning, code context with syntax highlighting and highlighted offending line) and a right rail (linked spec item card, audit metadata, linked work-item card if present).

## SPEC-scr-006 — Workspace Work Items screen
*Status: active | Aliases: none*

`client/src/screens/WorkItems.tsx` is a Kanban with four equal-width columns (pending, in progress, blocked, done·today) sharing one outer hairline border. Each card shows ID in mono accent, serif title, agent chip or "unassigned", and a gap-ID footer link. In-progress cards show a dashed-top italic progress note; blocked cards show a clay-red blockedReason. Clicking a card opens a ~460 px right side drawer with full detail, acceptance-criteria checklist, progress note, closing-gap card, and action buttons.

## SPEC-scr-008 — Workspace Settings screen
*Status: active | Aliases: none*

`client/src/screens/Settings.tsx` renders a workspace settings form. Page title is `○ workspace settings` in Newsreader italic with a circle bullet and a hairline separator below. A WORKSPACE section eyebrow precedes a hairline-bordered card with four rows (inner hairlines between rows): `name` (text input), `path` (text input), `description` (text input), `.sdd location` (read-only computed value in muted mono, no input box). Labels are left-aligned in `var(--ink-2)`; inputs use `var(--hair-2)` borders; `.sdd location` value uses `var(--ink-3)` and JetBrains Mono. No explicit save button — changes persist on blur.

## SPEC-scr-009 — Targets screen fetches live data from the backend
*Status: active | Aliases: none*

When a workspace is active, `client/src/App.tsx` fetches `GET /workspaces/:id/targets` and passes the result to the `Targets` component, replacing any static mock. The fetch is triggered whenever the active workspace ID changes. The API response fields (`id`, `status`, `created`, `domain`, `statement`) are mapped to the frontend `Target` type before being passed to the component.

## SPEC-scr-010 — Targets screen archived section divider
*Status: active | Aliases: none*

In the Targets screen left list, the divider between active and archived rows renders as `· ARCHIVED N ·` — a centred label with a dot on each side — flanked by full-width horizontal rule lines on both sides. The divider is not a plain text string; it uses the eyebrow-divider visual treatment (muted colour, small caps or uppercase tracking, ruled lines). The `N` is the live count of archived targets for the active workspace.

## SPEC-scr-011 — Targets screen sticky composer
*Status: active | Aliases: none*

The sticky composer at the bottom of the Targets detail pane contains: a textarea with the contextual placeholder "answer the agent's questions, or revise the current statement…"; a toolbar row below the textarea with `⌘ + ↵ to send` hint aligned left, and a "mark ready" ghost button plus a "send reply" filled primary button aligned right; and a muted one-line hint beneath the toolbar reading "sets status → awaiting-agent". The composer replaces the current "add a note…" / single "send" implementation.

## SPEC-scr-012 — Targets screen list item background
*Status: active | Aliases: none*

Active (non-archived) target rows in the Targets screen left list have a white (`#ffffff`) background. Archived rows below the divider may use a muted or slightly dimmed treatment. The current off-white/grey tint applied to the active items area does not match this requirement.

## SPEC-scr-013 — Targets screen statement body uses 16px serif
*Status: active | Aliases: none*

The current statement body in the Targets detail pane renders in `font-family: var(--serif)` (Newsreader italic) at `font-size: 16px` with `line-height: 1.55`. This is the editorial prose treatment — the statement is reader content, not UI chrome. The `.statement-block__text` rule must declare both properties.

## SPEC-scr-014 — Targets screen list pane background and archived row opacity
*Status: active | Aliases: none*

The `.targets-list` container has `background: var(--paper)` (not `var(--paper-2)`). Archived target rows carry `opacity: 0.55` to visually mute them relative to active rows; on hover opacity rises to `0.85`; when selected, opacity is `1` with `var(--paper-2)` background and accent left border.

## SPEC-scr-015 — Targets screen archived divider is collapsible with correct eyebrow styling
*Status: active | Aliases: none*

The archived section divider in the Targets list is interactive: clicking it toggles the archived rows open or closed. The label prepends `▾` (open) or `▸` (closed) as a caret. Label styling: `letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`, `font-size: 10px`, `color: var(--ink-3)`. The archived count renders in a separate `<span>` with `font-family: var(--mono)`, `letter-spacing: 0`, `color: var(--ink-4)`.

## SPEC-scr-016 — Targets screen dialog layout matches design
*Status: active | Aliases: none*

The dialog region in the Targets detail pane uses `padding: 24px 36px 120px` and `gap: 22px` between turns. Dialog turn WHO labels use `font-size: 10px` and `letter-spacing: 0.18em`. Turn bubbles use `padding: 0 0 0 20px` (left-only) with `font-size: 14px` and `line-height: 1.65`; vertical rhythm is provided entirely by the gap between turns, not by bubble padding.

## SPEC-scr-017 — Plugin Reference screen accessible from the sidenav
*Status: active | Aliases: none*

A `PluginReference` screen exists and is reachable via a permanent entry at the bottom of the sidenav, visually separated from workspace-scoped navigation and always visible. Toolbar: `❡ plugin reference — SDD workflow, artifacts, and skills` with a `view source on github ↗` ghost button. Layout: 220px left TOC sidebar + scrollable right content pane. The TOC has 7 sections (Overview, Pipeline, Artifacts, Status lifecycles, Skills, Schemas, Design decisions) with a scroll-spy that highlights the active section. Content matches the design's `plugin-reference.jsx` exactly: pipeline ASCII diagram, artifact cards, skill-card rows, schema pre blocks, lifecycle table, design decisions list.

## SPEC-scr-018 — Sidenav item counts reflect non-archived items only
*Status: active | Aliases: none*

The count badge next to each sidenav navigation item (Targets, Specs, Gaps, Work Items) shows only items whose status is not terminal/archived: targets exclude `accepted` and `archived`; gaps exclude `closed` and `deferred`; work items exclude `done` and `abandoned`. Counts update reactively as workspace data changes. Specs show the number of spec domains (all active — specs are never archived).

## SPEC-scr-019 — Command palette for fuzzy search across workspace artifacts
*Status: active | Aliases: none*

A `CommandPalette` component is triggered by `⌘K` / `Ctrl+K` and renders as a full-screen overlay that closes on outside click. The dialog has three regions: (1) input row with `⌕` glyph, text field with placeholder "Search targets, specs, gaps, work items…", and a scope chip showing the active workspace name; (2) scrollable results grouped by kind (targets, gaps, work items, spec items, spec files) with group headers; (3) footer with keyboard hints (↑↓ / ↵ / Esc) and result count. Default state (no query) shows "Recent" targets (4), gaps (3), work items (3). Search scores ID (1.6×), title (1.2×), full text (0.7×); top 30 results; matched characters highlighted with `<mark class="cp-mark">`. Keyboard: ArrowUp/Down moves selection; Enter navigates and closes; Escape closes. Each result row shows a kind glyph (▸ target, ≠ gap, □ work, ∎ spec), ID in mono accent, title, status pill, and domain/location/linked-ID metadata.

## SPEC-scr-020 — Gaps screen fetches live data and shows archived section
*Status: active | Aliases: none*

`App.tsx` fetches `GET /workspaces/:id/gaps` when the active workspace ID changes and passes the result to the `Gaps` component, replacing mock data. The Gaps list splits into active (`open`) and archived (`closed`, `deferred`, `accepted`) sections. Active gaps appear first; a collapsible eyebrow divider (same style as SPEC-scr-015 — `· ARCHIVED N ·` with flanking `<hr>`, `letter-spacing: 0.18em`, `font-weight: 500`, ▾/▸ toggle) separates them from archived gaps. Archived rows use `opacity: 0.55` (0.85 on hover). The domain filter applies to both sections.

## SPEC-scr-021 — WorkItems screen fetches live data, splits done-today, and adds ArchiveFooter
*Status: active | Aliases: none*

`App.tsx` fetches `GET /workspaces/:id/work-items` when the active workspace ID changes and passes the result to the `WorkItems` component, replacing mock data. The "done · today" kanban column shows only items closed within the last 24 hours. Items with `status: done` closed more than 24 hours ago, plus all `status: abandoned` items, are excluded from the kanban and shown only in the `ArchiveFooter`. The `ArchiveFooter` is a collapsible horizontal strip pinned below the kanban columns. Collapsed: shows `▸ archive`, total archived count, and "last closed N ago". Expanded: scrollable area grouped by day (Today / Yesterday / weekday date), with a search input, status filter (all / done / abandoned), and domain filter. Each archived card shows ID, status pill, title, agent chip or "unassigned", gap ID. Clicking opens the item in the right-side drawer. All filters reset on collapse.

## SPEC-scr-022 — Selected workspace is persisted in localStorage
*Status: active | Aliases: none*

The active workspace ID is written to `localStorage` under the key `hub.activeWorkspaceId` whenever the user switches workspaces. On mount, `App.tsx` reads this key and pre-selects the matching workspace if it is present in the fetched list. If the persisted ID is absent or no longer matches any workspace, the app falls back to the first workspace in the list.

## SPEC-scr-023 — URL reflects navigation state; refresh restores the same view
*Status: active | Aliases: none*

The URL encodes active navigation state via query-string params: `?w=<workspaceId>` (absent when Hub dashboard is active), `&v=<tab>` (one of `session`, `targets`, `specs`, `gaps`, `work-items`, `settings`, `plugin-reference`), and `&id=<itemId>` (the selected item within the tab; omitted when none). On mount, URL params are read first and take precedence over `localStorage`. On navigation, `history.replaceState` updates the URL in place; sidenav tab switches and item selections do not push new history entries. If the URL-encoded workspace is missing from the list, the app falls back to `localStorage` then the first workspace. An unrecognised `v` param defaults to `targets`; an unrecognised `id` opens the tab with no item selected.

## SPEC-scr-007 — Workspace Activity screen
*Status: active | Aliases: none*

`client/src/screens/Activity.tsx` renders a live log stream with a live/paused toggle and active-agent count in the toolbar. An agent filter row (all + one button per agent) sits above a 3-column line grid (timestamp 78 px mono, agent name 100 px mono, message). Messages support inline highlights and file-reference spans. When live, a "listening…" placeholder line appears at the tail. The `AgentsView` component from the prototype is not ported.
