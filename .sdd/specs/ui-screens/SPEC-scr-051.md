---
id: SPEC-scr-051
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "037b8982"
---

# SPEC-scr-051 — Dedicated Hub screen for standards and conventions

## Invariant

The Hub provides a dedicated **Standards** screen that presents the user-authored coding standards and conventions (from `.sdd/standards/` and the `CLAUDE.md` standards section, per SPEC-wf-028). Because standards are documents rather than ID'd artifacts, the screen renders the standards content as readable, sectioned text rather than an ID'd artifact list. It is reachable via a navigation entry and is read-only — the files remain the source of truth. Standards and conventions are presented together in this one screen.

## Acceptance criteria

- A "Standards" screen renders the coding standards / conventions content
- The content source is `.sdd/standards/` (and/or the `CLAUDE.md` standards section)
- The screen is reachable via a navigation entry alongside the other screens
- The screen presents standards as readable sections, not an ID'd artifact list
- The screen is read-only; the underlying files remain the source of truth

**Tests:**
- `SPEC-scr-051 Standards screen — empty state > renders empty state when no standards files are returned`
- `SPEC-scr-051 Standards screen — empty state > renders the standards layout container`
- `SPEC-scr-051 Standards screen — empty state > shows title bar with the word standards`
- `SPEC-scr-051 Standards screen — empty state > renders empty state when workspaceId is null — no fetch made`
- `SPEC-scr-051 Standards screen — with content > renders section headings from the standards content`
- `SPEC-scr-051 Standards screen — with content > renders standards content as readable sections, not an artifact list`
- `SPEC-scr-051 Standards screen — with content > renders the file source label`
- `SPEC-scr-051 Standards screen — with content > fetches from the correct endpoint`
- `SPEC-scr-051 Standards screen — with content > screen has no create/edit buttons — read-only`
