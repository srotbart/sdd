---
id: SPEC-scr-050
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "4e610a0e"
---

# SPEC-scr-050 — Dedicated Hub screens for issues and improvements, each with its own artifact list

## Invariant

The Hub provides dedicated screens for the **issues** and **improvements** artifacts (SPEC-wf-025 / SPEC-wf-026), each with its own artifact list mirroring the existing artifact screens (Targets / Gaps / Work Items / Specs). The **Issues** screen lists `ISS-*` artifacts (showing severity, status, domain); the **Improvements** screen lists `IMP-*` artifacts (showing effort/impact, status, domain). Each row opens a detail view. Both screens are reachable via navigation entries. The Hub data layer loads `.sdd/issues/` and `.sdd/improvements/` to populate them. The screens are read-only — engaging an artifact remains the `/sdd:review-engage` flow, not an in-UI action.

## Acceptance criteria

- An "Issues" screen lists all `ISS-*` artifacts with severity, status, and domain; selecting one shows its detail
- An "Improvements" screen lists all `IMP-*` artifacts with effort/impact, status, and domain; selecting one shows its detail
- Both screens have navigation entries alongside the other artifact screens
- The Hub loads `.sdd/issues/` and `.sdd/improvements/` into the client
- The screens are read-only (no engage/editing performed in the UI)

**Tests:**
- `SPEC-scr-050 Issues screen — empty state > renders the empty state message when issues array is empty`
- `SPEC-scr-050 Issues screen — empty state > does not render any issue rows when issues array is empty`
- `SPEC-scr-050 Issues screen — with data > renders ISS-* ids in the list rows`
- `SPEC-scr-050 Issues screen — with data > renders severity badge on each row`
- `SPEC-scr-050 Issues screen — with data > renders domain in the meta line`
- `SPEC-scr-050 Issues screen — with data > shows detail panel title when an issue is selected (first issue auto-selected)`
- `SPEC-scr-050 Issues screen — with data > screen has no create/edit/engage buttons — read-only`
- `SPEC-scr-050 Improvements screen — empty state > renders the empty state message when improvements array is empty`
- `SPEC-scr-050 Improvements screen — empty state > does not render any improvement rows when improvements array is empty`
- `SPEC-scr-050 Improvements screen — with data > renders IMP-* ids in the list rows`
- `SPEC-scr-050 Improvements screen — with data > renders effort/impact badge on each row`
- `SPEC-scr-050 Improvements screen — with data > renders domain in the meta line`
- `SPEC-scr-050 Improvements screen — with data > shows detail panel title when an improvement is selected (first auto-selected)`
- `SPEC-scr-050 Improvements screen — with data > screen has no create/edit/engage buttons — read-only`
