---
id: SPEC-wf-011
domain: workflow
abbrev: wf
status: active
aliases: []
version: "15868e14"
---

# SPEC-wf-011 — SDD statusline line shows targets, specs, gaps, work items, and a color-coded hub link

## Invariant

When a `.sdd/` directory is found (by walking up parent directories from `workspace.current_dir`), a second statusline line is rendered: `SDD ▸ {targets} targets · {specs} specs · {gaps} gaps · {work-items} work items · {hub-link}`. Counts are derived by direct file operations (see SPEC-wf-012). The hub link label is `open hub ↗` and is a clickable OSC 8 hyperlink pointing to `http://localhost:22400`. The link color reflects hub health: green when both frontend (22400) and backend (22351) are reachable, red when both are unreachable, orange (256-color `\033[38;5;208m`) when only one is reachable. Hub health is cached in `/tmp/.sdd-hub-status-color` for 30 seconds to avoid per-render overhead.

## Acceptance criteria

- Second line appears only when a `.sdd/` directory exists in `workspace.current_dir` or any parent directory
- Format: `SDD ▸ {n} targets · {n} specs · {n} gaps · {n} work items · open hub ↗`
- Order is fixed: targets, specs, gaps, work items, then hub link
- `open hub ↗` is an OSC 8 hyperlink (`\e]8;;http://localhost:22400\e\\`)
- Link is green when ports 22400 and 22351 are both open; red when both closed; orange when one is closed
- Health check uses `nc -z -w 1`; result cached in `/tmp/.sdd-hub-status-color` for 30s
- No second line is rendered when no `.sdd/` directory is found in the directory tree

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-011: SDD statusline shows targets, specs, gaps, work items, color-coded hub link > SPEC-wf-011: renders the line in fixed order targets · specs · gaps · work items` — the four counts render in the fixed order
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-011: SDD statusline shows targets, specs, gaps, work items, color-coded hub link > SPEC-wf-011: emits an OSC 8 hyperlink to http://localhost:22400 labelled 'open hub'` — the hub link is an OSC 8 hyperlink to the hub
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-011: SDD statusline shows targets, specs, gaps, work items, color-coded hub link > SPEC-wf-011: color-codes hub health green/red/orange and caches in /tmp/.sdd-hub-status-color` — the hub link color reflects cached health
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-011: SDD statusline shows targets, specs, gaps, work items, color-coded hub link > SPEC-wf-011: hub health check uses nc -z -w 1 on ports 22400 and 22351` — health is probed on both hub ports
