---
id: SPEC-wf-019
domain: workflow
abbrev: workflow
status: active
aliases: []
version: "ecb16f3d"
---

# SPEC-wf-019 — Design phase is an optional pre-target planning artifact

## Invariant

An optional design phase may precede target creation for larger or more complex changes. A design lives at `.sdd/design/<name>/design.md`, where `<name>` is a short kebab-case identifier for the design. Optional sibling files (diagrams, research notes, alternatives) may exist in the same directory. The design is free-form markdown with no fixed schema beyond a problem/solution structure. When planning converges, targets are created from the design; the design directory is never deleted or archived. Designs do not have a status lifecycle — they are living documents, not negotiated artifacts.

## Acceptance criteria

- Design files live at `.sdd/design/<name>/design.md`
- Optional sibling files are allowed within `.sdd/design/<name>/`
- No fixed schema is required beyond free-form markdown
- Design directories are never deleted after targets are spawned from them
- `sdd:session-start` surfaces designs that have no corresponding targets yet under a **Designs in progress** section
- Targets may carry an optional `design:` frontmatter field referencing the design name that spawned them
- When a design changes materially (new scope added or existing intent contradicted), new targets are created and engaged through the normal negotiation process — the design informs the target but does not bypass negotiation
- Design changes that only refine or clarify without changing scope require no target action
- A design change that contradicts an existing accepted target causes that target to be re-engaged (flipped to `awaiting-agent`) with a note referencing the design change
