---
id: WI-wf-018
gap-id: [GAP-wf-018, GAP-wf-019]
spec-item: SPEC-wf-011
status: done
created: "2026-06-02T00:00:00Z"
abandoned-reason: null
---

**Scope:** `plugin/statusline.sh` — add `open_targets` count (grep for `status: awaiting-user` in `.sdd/targets/`) and `open_specs` count (find SPEC-*.md across all domain subdirectories excluding archive/), then prepend both counts to the printf format string so the output matches `SDD ▸ {targets} targets · {specs} specs · {gaps} gaps · {work-items} work items · {hub-link}`

**Acceptance criteria:**
- `statusline.sh` computes `open_targets` via `grep -rl 'status: awaiting-user' "$sdd_root/.sdd/targets/" --include="*.md"` (or equivalent) counting only files in the targets directory (not archive)
- `statusline.sh` computes `open_specs` via `find "$sdd_root/.sdd/specs" -name "SPEC-*.md" ! -path "*/archive/*"` count
- printf output format is `SDD ▸ {targets} targets · {specs} specs · {gaps} gaps · {work-items} work items · {hub-link}` in that order
- Script still exits cleanly when no `.sdd/` directory exists
- Test: `plugin/skills/explain/explain.test.sh` or a new `plugin/statusline.test.sh` verifies the output format includes all four counts when `.sdd/` directories contain files
