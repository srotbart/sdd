---
id: SPEC-wf-024
domain: workflow
abbrev: wf
status: active
aliases: []
version: "397f6889"
---

# SPEC-wf-024 — session-start delivers the artifact operating contract for the session

## Invariant

The `sdd:session-start` skill emits, as part of its agent-facing output, a terse consolidated **operating contract** derived from the per-artifact guides (SPEC-wf-023), covering every active artifact type, so the agent has the operating knowledge for any artifact it may touch during the session. The contract states the working rules needed to operate each artifact correctly and points to the full guide for exhaustive detail. Because `session-start` runs at session open, a single emission covers the whole session — no per-edit injection is required.

## Acceptance criteria

- `session-start` output includes a consolidated, terse artifact operating contract
- The contract is derived from the `references/artifacts/*.md` guides, not a separately maintained copy
- The contract covers all active artifact types
- The contract is emitted once, as part of `session-start`, and references the full guides for detail
- The contract conveys each artifact's working rules (schema, transitions, procedure, invariants), not just a name list

**Tests:**
- `plugin/skills/session-start/SKILL.md` contains "operating contract" — "session-start SKILL.md includes an operating contract step derived from references/artifacts/"
