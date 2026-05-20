# Handoff: SDD Hub

A centralized hub for supervising multiple Claude Code agents working in
parallel across spec-driven-development workspaces.

---

## Overview

**SDD Hub** is a single-user supervisor UI for a tech lead running multiple
Claude Code (CC) instances against one or more codebases that use the
Spec-Driven Development workflow (`.sdd/` directory: targets / specs / gaps /
work-items).

The hub:

- **Indexes `.sdd/` directories** across attached workspaces (file watchers).
- **Renders the live state** as targets / specs / gaps / work-items.
- **Surfaces what needs the user's attention first** — targets awaiting user
  input, blocked work items, stale audits.
- **Shows what agents are doing** in near-real-time via an activity stream.
- **Provides editing surfaces** for negotiating targets (the back-and-forth
  dialog that converges intent into a spec item).

Agents themselves are external — local Claude Code instances launched from a
terminal via `claude --hub localhost:<port> --workspace <name>`. They report
heartbeats and emit activity events to the hub, but **the hub does not host
agents**.

---

## About the design files

The files in this handoff are **design references created in HTML/React/CSS**.
They are not production code to copy directly — the visual and interaction
language is finalized, but the implementation should be **recreated in the
target codebase's environment** (React + Vite, Next.js, SvelteKit, Tauri,
Electron — whatever the team chooses) using its established conventions.

The HTML prototype loads everything via Babel in-browser, uses a mocked
`window.SDD` data object, and has no backend. Treat it as a faithful spec
of look + behavior; build the real app against actual filesystem watchers,
WebSockets, etc.

---

## Fidelity

**High-fidelity.** Colors, typography, spacing, layout, and component states
are final. Status-pill treatment, hairline-rule density, type hierarchy, and
the editorial-minimal aesthetic should be matched closely.

Two visual directions are provided:

- **`SDD Hub.html`** — Editorial minimalism (default / approved direction).
  Pure white background, neutral charcoal greys, oxblood accent reserved for
  IDs and active-state wayfinding.
- **`SDD Hub - Terminal.html`** — Phosphor-on-graphite terminal style (earlier
  exploration). Provided for reference only; **build the editorial version**.

---

## Architecture (for the implementer)

The prototype is presentation only. The real product has three layers:

```
┌──────────────────────────────────────────────────────────────────┐
│  Hub UI (browser app, what these mocks describe)                 │
│  - Tab-bar + sidebar; renders state from the hub server          │
└────────────────────┬─────────────────────────────────────────────┘
                     │ HTTP + WebSocket
                     ▼
┌──────────────────────────────────────────────────────────────────┐
│  Hub server (local daemon, e.g. localhost:7320)                  │
│  - Maintains a list of attached workspaces (paths on disk)       │
│  - Watches each workspace's .sdd/ tree (fs.watch / chokidar)     │
│  - Parses markdown artifacts (frontmatter + body)                │
│  - Computes spec content hashes for stale-audit detection        │
│  - Receives connections from Claude Code agents (heartbeats,     │
│    activity events: file edits, test runs, work-item state)      │
│  - Broadcasts state changes to UI clients                        │
└────────────────────▲─────────────────────────────────────────────┘
                     │ stdio / unix socket / WS
                     │
┌──────────────────────────────────────────────────────────────────┐
│  Claude Code agent processes (one or more per workspace)         │
│  - Launched by user: `claude --hub localhost:7320 --workspace X` │
│  - Inherits SDD skills (session-start, target-engage, ...)       │
│  - Emits structured activity events while working                │
└──────────────────────────────────────────────────────────────────┘
```

**The hub does not write to `.sdd/` files itself.** It surfaces edits the
user makes through the UI as proposals the connected agent (or the user
directly via their editor) commits to disk. Treat the filesystem as the
source of truth and the UI as a window over it.

### Data schemas

The hub's data model is the SDD artifact schema. Definitive reference is
`references/schemas.md` in the SDD plugin repo (provided by the user when
the project started). Brief recap:

| Artifact   | Frontmatter fields                                              | Body                                |
|------------|----------------------------------------------------------------|-------------------------------------|
| Target     | `id, status, domain, created`                                  | `## Current statement` + `## Dialog`|
| Spec       | `id, domain, abbrev, version, aliases`                         | One `## SPEC-{abbrev}-{seq}` per item|
| Gap        | `id, spec-item, domain, status, discovered, audit-spec-version, closed-by, deferred-reason` | Location + reasoning |
| Work item  | `id, gap-id, domain, status, created, abandoned-reason`        | Scope + acceptance criteria         |

Statuses, archive rules, version hashing (`grep -v "^version:" SPEC.md \|
shasum -a 256 \| cut -c1-8`), and aliasing logic all live in the SDD plugin
spec. The hub must mirror those exactly.

---

## Visual system

### Color tokens

```css
/* Surfaces */
--paper:        #ffffff;   /* page background */
--paper-2:      #f7f7f5;   /* hover bands, code blocks, soft fills */
--paper-3:      #ecece9;   /* deepest fill, used sparingly */

/* Ink */
--ink:          #18181a;   /* primary text */
--ink-2:        #5b5b5d;   /* secondary text */
--ink-3:        #8e8e8f;   /* tertiary, captions */
--ink-4:        #c2c2c1;   /* most dimmed */

/* Hairlines */
--hair:         #ececea;   /* default divider */
--hair-2:       #d4d4d1;   /* slightly stronger */

/* Accent — reserved: IDs, active-nav indicator, pipeline active stage */
--accent:       #7e3a2c;   /* deep oxblood */
--accent-deep:  #5a281d;
--accent-soft:  #a86247;

/* Status (used in pills only) */
--st-open:      #9c7218;   /* awaiting-user — ochre */
--st-progress:  #3f5e7d;   /* in-progress — slate */
--st-blocked:   #9a3a2b;   /* blocked — clay red */
--st-done:      #4f6b48;   /* done — moss */
--st-draft:     #8e8e8f;   /* draft — neutral */
--st-stale:     #b15d28;   /* stale audit — burnt orange */
```

Color use is intentional: most chrome is monochrome ink/grey. Color appears
only on (a) IDs and active state markers (accent), (b) status pills (status
palette), and (c) the highlighted line in a code preview (clay tint).

### Typography

| Role         | Family               | Weights        | Notes                                  |
|--------------|----------------------|----------------|-----------------------------------------|
| Headings     | **Newsreader**       | 400, 500       | Often italic; used for screen titles, spec titles, gap/target titles, pipeline numerals |
| UI / body    | **Geist** (sans)     | 400, 500, 600  | Default font for everything non-mono   |
| IDs / code   | **JetBrains Mono**   | 400, 500       | All artifact IDs, file paths, version hashes, timestamps |

Google Fonts URL used in the prototype:

```
https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap
```

Tabular numerals are enabled globally (`font-variant-numeric: tabular-nums`)
for counts and version hashes.

### Spacing & layout

- Page base font-size: **13.5px**, line-height **1.55**
- Toolbar: 60px min-height, 22–32px horizontal padding
- Sidebar: 252px wide, hairline divider on the right
- Card padding: 22–24px
- Row padding: 14px × 22px
- Section vertical rhythm: 22–32px between groupings
- Hairline borders (1px var(--hair)), no shadows anywhere

### Status pill

Distinctive component — used on every artifact list/detail row.

```
●  awaiting user      ← small filled colored dot + italic small-caps text
```

- Font: Newsreader, italic, `font-variant: small-caps`, weight 500
- Size: 11px, letter-spacing 0.04em
- **No background fill, no border** — just dot + text
- Dot: 6px, color matches status color
- Variants: `open`, `progress`, `blocked`, `done`, `draft`, `stale`, `phosphor`

### Buttons

| Variant | Style                                                                 |
|---------|-----------------------------------------------------------------------|
| Default | Hairline border, transparent bg, ink text                             |
| Primary | Solid `var(--ink)` background, paper text — turns to accent on hover  |
| Ghost   | No border, no bg; underlines on hover                                 |
| Danger  | Clay red text + soft border (used in original danger zone, now removed) |

All buttons `white-space: nowrap`, 6×12px padding, 12px text.

---

## Sidebar

The left rail is 252px wide with a hairline right border. Three regions:

1. **Hub overview** row at the top (`◉ hub overview`). Clicking it returns to the hub dashboard.
2. **Workspace dropdown** (label `workspace`, `+` affordance for attach).
   - Closed: a hairline-bordered button showing a live/idle dot, the active workspace name, an attention badge if any (`2!` for awaiting-user count, blocked-work count in clay, or open-gap count), and a chevron.
   - Open: floating panel (1px hairline border, soft drop shadow, 120ms pop-in) with one row per workspace. Each row shows the dot, name (sans 13px), path (mono 10.5px, dimmed), and the same attention badge on the right. The active row has a paper-2 background and a 3px accent left bar. A `+ attach workspace` foot row sits at the bottom of the open menu.
   - Click outside dismisses.
3. **Navigate** section — the seven workspace tabs (session, targets, specs, gaps, work items, activity, settings). Active tab is bold + accent.

Nothing else lives in the sidebar. (Earlier explorations included a "recent skills" footer; it was removed.)

---

## Screens

The app has two scopes: **hub** (cross-workspace overview) and **workspace**
(single project drill-in). The workspace scope has seven tabs.

### 1. Hub Dashboard

**Purpose.** Snapshot across all attached workspaces. Lead with what needs
the supervisor's attention.

**Layout.**
- Toolbar (h1: `hub`, sub-count of workspaces + active agents, primary action `+ attach workspace`)
- 5-column summary strip (`awaiting your input`, `open targets`, `open gaps`, `active work`, `stale audits`) — large serif numerals, eyebrow labels above
- Section header **WORKSPACES** with count
- Auto-fill grid of workspace tiles (min 340px)
- Section header **AGENT ACTIVITY (LAST 30M)** — last 10 lines of a unified activity stream

**Workspace tile.** Hairline borders forming a sheet (no individual card
shadows). Contains: live/idle dot + workspace name (serif), path (mono),
attached agent chips, "active now" or "last activity Xm ago", and a 4-stat
strip at the bottom (`await user`, `gaps`, `in progress`, `blocked`). Each
stat shows a large numeral over an uppercase eyebrow label.

### 2. Workspace > Session

**Purpose.** Mirrors the `/sdd:session-start` skill output graphically. The
first thing the user sees when they open a workspace.

**Layout.**
- Toolbar with workspace name (serif italic) + path
- A "terminal block" rendering of the `$ /sdd:session-start` invocation with the run timestamp
- **Pipeline strip** — 5 equal columns: targets / spec items / open gaps / work items / done today. Each column is a serif numeral over an uppercase label. The active stage gets a 2px accent border on top.
- **Session categories** rendered in priority order:
  1. `▸ targets awaiting your input` (alert color)
  2. targets awaiting agent
  3. ready targets — pending spec reconciliation
  4. draft targets — not submitted
  5. specs (one row per domain — clickable)
  6. **Stale audit warning** banner (only if stale) with re-run button
  7. open gaps
  8. active work items
- Footer "next action" terminal block: prose recommendation + the exact `/sdd:` command to run

Each section header is a small-caps uppercase eyebrow followed by a count
and a hairline rule that fills remaining width.

### 3. Workspace > Targets

**Two-pane layout.** Left list, right detail.

**Left list (~380px).**
- Filter bar: `all / awaiting you / awaiting agent / ready / draft`, each with a count
- One row per target showing: ID (mono, accent), status pill, time-ago, title (serif), domain in brackets + dialog turn count
- Active row gets `var(--paper-2)` background and a 2px accent left border

**Right detail (target negotiation).**
- Header: ID, status pill, domain pill, created date, target title (serif italic, 18px)
- **Conflict / ready banner** (when status is `ready`): inline notice with primary action "fold into spec →"
- **Current statement** panel — accent-bordered-left block with eyebrow label, editable text, "edit" toggle
- **Dialog** — a turn-by-turn conversation log:
  - 80px left gutter with `YOU` / `AGENT` label (small-caps eyebrow; agent label in accent), round number
  - Bubble area is bordered-left only (hairline for user, accent for agent), no background
  - Each bubble has a timestamp line at the top, body below
  - Markdown-lite: blockquote (proposed Current statement), inline code, numbered lists rendered as indented divs, line breaks
- **Composer** — sticky at bottom: textarea + ⌘+↵ hint + status-aware action label (e.g. `send reply`, `mark ready`, `submit for response`)

### 4. Workspace > Specs

**Two-pane layout.** Left domain list, right items.

**Left list (~220px).** Domain rows: name (sans), then ID and version hash
(`<a3f9c812>`) in mono on a second line. Active row has accent left bar.

**Right pane.**
- Spec file header: serif `SPEC-{domain}` title, ID + abbrev + version chips, item count
- One spec item block per active item (max-width ~780px for readability):
  - ID line: mono accent ID + `active` pill + an open-gap pill if any open gaps reference this item + right-aligned "aliases: none"
  - Title (Newsreader, 20px, 500, line-height 1.3)
  - Body paragraph (sans, 14px, line-height 1.65, max 68ch)
  - Ref pills at the bottom: clickable mono pills linking out to GAP-* and WI-* IDs (rounded, hairline border)

### 5. Workspace > Gaps

**Two-pane layout.** Left list (~420px), right detail.

**Left list.**
- Domain filter bar across the top (horizontally scrollable if many)
- One row per gap: ID + status pill + (optional) "WI-xxx" closer pill on first line; title (serif); `path:lineno` in mono; metadata footer (`↑ SPEC-xxx · audited <hash> · Xh ago`)
- Active row: accent left bar + soft bg

**Right detail.**
- Header: ID + status pill + (right-aligned) either "addressed by WI-xxx" link or primary `+ create work item` button + serif gap title
- Two-column content (1fr + 280px):
  - **Left (main):**
    - "LOCATION" eyebrow → mono path:line bar with `jump to source ↗` affordance
    - "REASONING" eyebrow → bordered block with prose reasoning, inline `code` highlights
    - "CODE CONTEXT" eyebrow → light-grey code preview block:
      - Mono, 12px, 1.7 line-height
      - Line numbers in a 48px right-bordered gutter
      - Offending line highlighted with `var(--danger-tint-1)` background, clay-red line number
      - Refined light-theme syntax tokens: `.kw #6e3aa8`, `.fn #1f4e7a`, `.str #8a6a1c`, `.com ink-3 italic`, `.num #a85620`
  - **Right (rail):**
    - "SPEC ITEM" linked card (ID, active pill, title, 140-char body excerpt + ellipsis)
    - "AUDIT METADATA" plain key/value: discovered date + time-ago, spec version, status
    - "WORK ITEM" linked card if closer exists

### 6. Workspace > Work items

**Kanban + side drawer.**

**Kanban.** Four columns of equal width sharing one outer hairline border;
columns separated by hairlines (no card-style gaps). Columns: `pending`,
`in progress`, `blocked`, `done · today`. Each header is small-caps + count.

**Work-item card.**
- Hairline border + 2px colored left border by status (`pending` grey,
  `in-progress` slate, `blocked` clay, `done` moss)
- ID (mono accent), title (serif 14px 500, line-height 1.35)
- Footer: agent chip (or "unassigned" grey), right-aligned `↑ GAP-xxx`
- **In-progress only:** dashed top border separating an italic "▸ {progressNote}" snippet from agent
- **Blocked only:** dashed top border, clay text, lead `⏸` + blockedReason
- **Done only:** opacity 0.7 + "closed Xm ago"

**Side drawer (when a card is clicked).** ~460px right rail with: ID +
status, ✕ close, serif title, optional clay-red "blocked: ..." notice,
working agent chip, scope (sans, 12px, with inline path + code highlighting),
acceptance criteria (○ / ✓ checklist, hairline between rows), latest agent
progress note in an italic card with slate left-border, "closing gap" linked
card, "tracing to spec" linked block with accent left-border, action buttons
at bottom (e.g. `▸ assign agent + start`, `/sdd:work-item-close WI-xxx`,
`unblock`, `abandon`).

### 7. Workspace > Activity

**Live log stream.** Toolbar contains a `live / paused` toggle and the
active agent count.

- Agent filter row (`all` + one button per agent name)
- 3-column grid per line: timestamp (78px, mono) | agent name (100px, mono,
  colored — accent for the watching agent, slate for "in" events) | message (sans/mono mix)
- Messages support inline `<b>` for highlights, `<span class="ref">` for file
  references (accent-soft color)
- Line kinds: `in` (default action), `note` (italic, muted), `err` (red bold)
- When live: an appended "listening..." line at the tail acts as a placeholder
- On a live tick, a new line is prepended every ~6.5s (in prototype this is
  cosmetic; in production this is driven by a WebSocket pushing agent events)

### 8. Workspace > Settings

Two sections only (per the current scope):

**Workspace** — key/value inputs:
- `name` (text input)
- `path` (text input)
- `description` (text input)
- `.sdd location` (muted, computed)

**SDD behavior** — four setting rows, each is `title + description + control`:
- `auto-archive terminal artifacts` (toggle)
- `warn on stale audits` (toggle)
- `auto-run spec-audit on spec write` (toggle, default off)
- `target / spec conflict handling` (segmented: `surface` | `auto-merge`)

(Earlier explorations also included an "agent runtime" section and a "danger
zone"; both were removed and should not be reintroduced.)

---

## Interactions

- **Sidebar workspace dropdown.** A single hairline-bordered control shows the active workspace; clicking it opens a floating menu with all workspaces (name, path, attention badge), plus an `+ attach workspace` row at the bottom. Selecting one switches the main panel to that workspace's current tab (or `session` on first visit) and closes the menu. Click-outside dismisses it.
- **Workspace tabs.** Seven tabs in fixed order: session, targets, specs,
  gaps, work items, activity, settings. (Agents tab was removed.) Active
  tab is bold + accent.
- **Click-through navigation between artifacts.** Every artifact-ID badge
  or related-item card is clickable and routes to the corresponding tab
  scoped to that ID. Examples:
  - Gap → spec item card → Specs tab on the right spec/item
  - Gap → addressed-by WI pill → Work-items tab with drawer open
  - Work item drawer → "closing gap" card → Gaps tab on that gap
  - Session row → its detail tab
- **Composer behavior.** The action button label is computed from target
  status (e.g. `awaiting-user` → "send reply", with hint "sets status →
  awaiting-agent"). The composer is sticky at the bottom of the dialog
  scroller.
- **Activity live toggle.** When on, a `listening` placeholder line is
  shown at the tail and a fake new line appears every ~6.5s in the prototype.
  In production this becomes a WebSocket subscription.
- **Hover states.** Rows tint to `--paper-2`. Buttons darken their border
  to `--hair-2`. Ghost buttons gain an underline at 4px offset.
- **No drag-drop on the kanban in the prototype.** In production, drag a
  card to a column to update the work-item's status field. Validate the
  transition against the SDD state machine before committing.

---

## State management

State concerns the implementer will face:

1. **Filesystem watchers** for `.sdd/targets/`, `.sdd/specs/`,
   `.sdd/gaps/`, `.sdd/work-items/` (and their `archive/` subdirs). Re-parse
   the relevant artifact on change; broadcast a typed update to UI clients.
2. **Spec hash recomputation** on every spec file change (excluding the
   `version:` frontmatter line — see SDD schemas reference).
3. **Stale audit detection** — for each open gap, compare its
   `audit-spec-version` to the current spec hash; emit a `stale` flag per domain.
4. **Cross-reference resolution at read time** (per SDD design): when
   `spec-collapse` aliases an item, gap files do not migrate. The reader
   resolves alias → current item by scanning spec frontmatter `aliases`.
5. **Agent connection registry.** Track connected agents per workspace,
   with status (idle / busy), last-heartbeat, pid, host. Persist enough
   to render the activity stream after a UI reconnect.
6. **Optimistic UI for dialog turns.** When the user submits a target reply,
   render it immediately and flip the target status optimistically; reconcile
   on the next filesystem-driven update.
7. **Archive moves are atomic file renames** (per SDD design). The UI should
   treat artifacts as disappearing from active and appearing in archive on
   the same broadcast.

The prototype uses a single `useState({ scope, wsId, tab, focusId })` in
`app.jsx` for routing. A real app should use whatever the codebase prefers
(router, store, etc.).

---

## Assets

- **Fonts.** Newsreader, Geist, JetBrains Mono — Google Fonts, free, no
  attribution required.
- **No images, icons, or illustrations.** Glyphs in the UI are single
  Unicode characters (`●`, `▸`, `∎`, `≠`, `□`, `≡`, `◎`, `⚙`, `◌`, `↗`, etc.)
  rendered in the active font. If the engineering team prefers a real icon
  set (Lucide, Phosphor, Tabler), substitute outline icons at 14–16px,
  ink-2 color, ink on hover. Do not introduce filled / colorful icons.

---

## Mock data

`data.js` contains a realistic sample dataset organized as the implementer's
data access layer should structure things:

- 4 workspaces: `plover` (the primary), `plover-mobile`, `ledger-cli`, `vault-rs`
- 5 agents with status/host/pid
- 4 spec domains × multiple items in `plover`
- 5 targets in mixed statuses (awaiting-user, awaiting-agent, ready, draft)
- 8 gaps across domains
- 10 work items in mixed statuses (pending, in-progress, blocked, done)
- A 22-entry activity stream

Use this as a fidelity reference for tone/level-of-detail in copy, not as a
seed dataset.

---

## Files

```
SDD Hub.html               ← entry point, editorial direction
SDD Hub - Terminal.html    ← earlier exploration, terminal aesthetic (for reference only)
styles.css                 ← editorial design tokens + component styles
styles-terminal.css        ← terminal stylesheet (reference)
data.js                    ← mock data layer
ui.jsx                     ← shared primitives (StatusPill, AgentChip, Card, Toolbar, Pipeline, CodeView, ...)
app.jsx                    ← root component, routing, sidebar
screens/
  dashboard.jsx            ← Hub dashboard
  session-start.jsx        ← Workspace > Session
  specs.jsx                ← Workspace > Specs
  targets.jsx              ← Workspace > Targets (list + detail)
  gaps.jsx                 ← Workspace > Gaps (list + detail)
  work-items.jsx           ← Workspace > Work items (kanban + drawer)
  activity-and-agents.jsx  ← Workspace > Activity + (unused) Agents + Settings
```

Note: `activity-and-agents.jsx` still defines an `AgentsView` component; it
is no longer mounted in `app.jsx` and should be omitted from the new build
unless explicitly requested.

---

## Implementation suggestions

1. **Stack.** A Tauri or Electron app makes sense if the hub needs to talk
   to local agents over IPC. A pure web app with a local Node/Bun server
   also works.
2. **Frontend.** Plain React works fine — the prototype uses Babel-in-browser
   only because we couldn't ship a build step. Move to Vite + React (or
   Next.js if SSR matters).
3. **Filesystem watching.** `chokidar` (Node) or `notify` (Rust) are robust.
   Debounce events 150–300ms so a quick git-checkout doesn't flood.
4. **Markdown parsing.** Use a frontmatter parser (`gray-matter`) and a
   markdown lib (`unified` / `remark`) for the spec body. Don't roll your
   own.
5. **Agent transport.** Either: (a) Claude Code emits structured events
   over its stdio bus and the hub listens via a launcher, or (b) the agent
   opens a websocket to the hub on start. (a) is simpler for v1.
6. **Auth.** Local-only hub binds to `127.0.0.1` and trusts the loopback;
   no auth needed for v1.
