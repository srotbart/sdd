---
id: SPEC-wf-030
domain: workflow
abbrev: wf
status: active
aliases: []
version: "0747bc89"
---

# SPEC-wf-030 — session-start gives the agent a high-level orientation to artifacts and the pipeline

## Invariant

In addition to the user-facing status snapshot and the operating contract (SPEC-wf-024), the `sdd:session-start` skill emits a concise **high-level orientation** for the agent: what each SDD artifact type represents and how to act on it at a glance, plus the spec → code → review → gaps → refactor pipeline mental model, and the project-specific essential context needed to work this repo's `.sdd/` (ID conventions, artifact locations, active domains). This orientation is the brief "map" layer; the per-artifact operating contract (SPEC-wf-024) is the detailed layer. The pipeline/artifact model shares a single source of truth with `sdd-help` and the SPEC-wf-023 guides rather than a divergent copy.

## Acceptance criteria

- `session-start` emits a concise agent-facing orientation distinct from the user-facing status snapshot
- The orientation summarizes each artifact type's meaning and how to act on it, at a high level
- The orientation includes the spec → code → review → gaps → refactor pipeline mental model
- The orientation surfaces project-specific essential context: ID conventions, artifact locations, active domains
- The model shares one source of truth with `sdd-help` and the SPEC-wf-023 guides (no divergent copy)
