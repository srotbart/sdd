---
id: SPEC-wf-043
domain: workflow
abbrev: wf
status: active
aliases: []
version: "ef419ccc"
---

# SPEC-wf-043 — The shipped plugin never references this repository's own spec

## Invariant

Everything under `plugin/` is the shipped product, installed into consuming projects where this repository's spec item IDs refer to nothing or collide with the consumer's own domains. No file under `plugin/` — skill text, reference docs, script code or comments — may reference this repository's own spec items (`SPEC-wf-*`). All shipped text and code states its behavior self-containedly: the rule itself is written inline where it applies, never cited by ID. Provenance for why a rule exists belongs to this repository's commits and the spec items' `**Tests:**` links, which do not ship. Generic illustrative placeholders in examples (e.g. `SPEC-auth-001`, `GAP-scr-001`, or schema patterns like `SPEC-{abbrev}-{seq}`) are not references and remain permitted. A mechanical check enforces the boundary so the leak cannot recur.

## Acceptance criteria

- No `SPEC-wf-` item reference exists anywhere under `plugin/` (skills, references, scripts)
- Every former citation site states its rule inline, self-containedly, with no loss of normative content
- `plugin/scripts/lint-check.sh` (or a dedicated check script) fails when a `SPEC-wf-` ID appears under `plugin/`
- Spec tests that grep shipped plugin files assert behavior phrases, never this repository's item IDs
- Generic example IDs and `{abbrev}`/`{seq}`/`{7hex}` schema patterns remain permitted
