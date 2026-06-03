---
id: SPEC-wf-015
domain: workflow
abbrev: wf
status: active
aliases: []
version: "213cc54d"
---

# SPEC-wf-015 — Gap audit-spec-version and stale-audit detection are per spec item

## Invariant

When a gap is filed, its `audit-spec-version` field stores the `version` hash of the specific spec item file the gap was found against — not a domain-level hash. `sdd:session-start` detects a stale audit by comparing each open gap's `audit-spec-version` against the current `version` field in the referenced spec item file. A gap is stale when these differ. The stale-audit warning names the specific gap and spec item, not the whole domain.

## Acceptance criteria

- Every gap file has an `audit-spec-version` field set to the `version` hash of the specific spec item it was found against
- `sdd:session-start` compares each gap's `audit-spec-version` to the current `version` in the referenced spec item file
- A gap is flagged as stale when `audit-spec-version` ≠ spec item `version`
- Stale-audit warning names the specific gap ID and the specific spec item ID (not just the domain)
