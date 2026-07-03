---
id: SPEC-wf-035
domain: workflow
abbrev: wf
status: active
aliases: []
version: "e3ca1fbe"
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

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: .gitignore covers all five ephemeral archive paths` — the five ephemeral archive paths are gitignored
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: .gitignore does NOT ignore the spec archive (permanent truth)` — the spec archive is exempt from the ignore rules
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: no tracked files exist under any ephemeral archive path` — no ephemeral archive file is version-controlled
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: the spec archive remains tracked` — the spec archive stays under version control
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: lint-check.sh emits no archive violation on a clean tree` — the lint gate passes when no ephemeral archive file is tracked
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: lint-check.sh fails when a file under an ignored archive path is force-added` — the lint gate fails when an ephemeral archive file is force-added
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled > SPEC-wf-035: session-start degrades orphan checks to 'unverifiable' for local-only archives` — session-start does not hard-fail when an archive is absent
