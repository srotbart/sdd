---
id: SPEC-wf-012
domain: workflow
abbrev: wf
status: active
aliases: []
version: "2b05f077"
---

# SPEC-wf-012 — SDD statusline counts use direct file operations with parent-directory walk-up

## Invariant

All four SDD counts shown in the statusline are derived by direct file operations; no Hub API calls are made for count data. The `.sdd/` root is found by walking up from `workspace.current_dir`. Target count uses `grep` to find files with `status: awaiting-user` in `.sdd/targets/` (maxdepth 1). Spec item count uses `find` across all spec domain subdirectories excluding `archive/`. Gap and work-item counts use `find` at maxdepth 1 in their respective directories excluding `archive/`.

## Acceptance criteria

- Target count: `grep -rl 'status: awaiting-user' {sdd_root}/.sdd/targets/ --include="*.md" --maxdepth 1` — awaiting-user only
- Spec item count: `find {sdd_root}/.sdd/specs -name "SPEC-*.md" ! -path "*/archive/*"` — all domains, all items
- Gap count: `find {sdd_root}/.sdd/gaps -maxdepth 1 -name "*.md"` — open gaps only
- Work-item count: `find {sdd_root}/.sdd/work-items -maxdepth 1 -name "*.md"` — open items only
- All counts exclude `archive/` directories
- `sdd_root` found by walking up from `workspace.current_dir`; stops at `/` without error
- No Hub API is called for count data at any point

**Tests:**

- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up > SPEC-wf-012: walks up parent directories to find the .sdd root, stopping at /` — the script walks up to find the .sdd root
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up > SPEC-wf-012: target count greps for awaiting-user markdown files` — targets are counted by direct grep
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up > SPEC-wf-012: spec count uses find for SPEC-*.md excluding archive across all domains` — spec items are counted by find excluding archive
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up > SPEC-wf-012: gap and work-item counts use find -maxdepth 1 in their directories` — gaps and work items are counted by shallow find
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up > SPEC-wf-012: makes no Hub API call for count data (no curl/wget/localhost fetch for counts)` — counts never call the Hub API
