---
id: SPEC-wf-028
domain: workflow
abbrev: wf
status: active
aliases: []
version: "59f918fb"
---

# SPEC-wf-028 — session-start primes the agent with the SDD model and essential context

## Invariant

Beyond rendering the user-facing status snapshot, the `sdd:session-start` skill also primes the agent. It provides a concise, high-level orientation to the SDD artifact types (targets, specs, gaps, work-items — and issues / improvements / coding-standards as they exist): what each represents and how the agent should act on it. It conveys the spec → code → review → gaps → refactor pipeline mental model, and it loads project-specific essential context (ID conventions, artifact locations, active domains). This agent-facing orientation is distinct from, and complements, both the user-facing snapshot and the user-invoked `sdd-help`; the pipeline/artifact model has a single source of truth shared with `sdd-help` rather than a divergent copy.

## Acceptance criteria

- `session-start` emits an agent-facing orientation in addition to the user-facing status snapshot
- The orientation summarizes each artifact type's meaning and how the agent acts on it, at a high level (not a full schema dump)
- The orientation includes the spec → code → review → gaps → refactor pipeline mental model
- `session-start` surfaces project-specific essential context: ID conventions, artifact locations, and active domains
- The pipeline/artifact model shares one source of truth with `sdd-help` (no divergent copy)
