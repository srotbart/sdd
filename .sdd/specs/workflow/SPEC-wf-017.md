---
id: SPEC-wf-017
domain: workflow
abbrev: wf
status: active
aliases: []
version: "5a022567"
---

# SPEC-wf-017 — Spec item files require Invariant and Acceptance Criteria sections

## Invariant

Each spec item file body must contain `## Invariant` and `## Acceptance criteria` sections in order after the title heading; the optional `**Tests:**` block, when present, follows `## Acceptance criteria`.

## Acceptance criteria

- The file body opens with `# {id} — {title}` as the first heading
- `## Invariant` section is present with a concise statement of the rule or behaviour the item asserts
- `## Acceptance criteria` section is present with a plain bullet list of verifiable conditions that must hold for the invariant to be satisfied
- When a `**Tests:**` block is present, it appears after `## Acceptance criteria`
- Skills that create or update spec items (`sdd:target-engage`, `sdd:gap-to-work-items`, `sdd:work-item-close`, `sdd:spec-audit`) produce this structure for every spec item they write
- The Hub API spec parser extracts and exposes both `## Invariant` and `## Acceptance criteria` sections
- `references/schemas.md` documents the required section structure

**Tests:**
- `hub/server/spec-wf.test.ts` — `SPEC-wf-017` — extracts invariant and criteria from spec item with both sections
