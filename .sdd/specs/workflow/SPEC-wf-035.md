---
id: SPEC-wf-035
domain: workflow
abbrev: wf
status: active
aliases: []
version: "c5ea5aff"
---

# SPEC-wf-035 — Ephemeral artifact archives are local-only, never version-controlled

## Invariant

The `archive/` subdirectories of the ephemeral artifact types — `.sdd/targets/archive/`, `.sdd/gaps/archive/`, `.sdd/work-items/archive/`, `.sdd/issues/archive/`, `.sdd/improvements/archive/` — are gitignored. Archiving keeps its existing mechanics (terminal-state flip, `mv` into `archive/`), but the archived copy is an untracked local file: never committed, never pushed, present only on the machine where the artifact was closed. Fresh clones and worktrees start with empty archives, and no skill or tool may depend on archive contents being present. Spec archives (`.sdd/specs/**/archive/`) are exempt — they are permanent truth (deprecated/aliased items needed for alias resolution) and remain tracked. `plugin/scripts/lint-check.sh` enforces the boundary: it fails when any tracked file exists under an ignored ephemeral archive path.

## Acceptance criteria

- `.gitignore` covers the five ephemeral archive paths (targets, gaps, work-items, issues, improvements)
- No tracked files exist under any ephemeral `archive/` path
- `.sdd/specs/**/archive/` remains tracked and is not covered by the ignore rules
- `lint-check.sh` fails when a file under an ignored ephemeral archive path is tracked (e.g. force-added), and passes otherwise
- Skills that read archives (e.g. session-start) degrade gracefully when archive dirs are empty or absent
