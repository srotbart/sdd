---
id: WI-wf-9cfd75f
gap-id: GAP-wf-9171263
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: Gitignore ephemeral archives and untrack the 486 existing archived files

**Scope:** `.gitignore` and `.sdd/{targets,gaps,work-items,issues,improvements}/archive/` — add ignore entries for the five ephemeral archive paths and `git rm -r --cached` the tracked files under them (files stay on local disk).

**Acceptance criteria:**
- `.gitignore` contains entries for `.sdd/targets/archive/`, `.sdd/gaps/archive/`, `.sdd/work-items/archive/`, `.sdd/issues/archive/`, `.sdd/improvements/archive/`
- `git ls-files` returns zero files under any of the five ephemeral `archive/` paths
- `.sdd/specs/**/archive/` remains tracked (not added to `.gitignore`)
- The archived files still exist on local disk after untracking
- Test (hub `spec-wf-plugin.test.ts`): assert `.gitignore` covers the five ephemeral archive paths and does not cover `.sdd/specs/**/archive/`; assert no tracked files exist under the ephemeral archive paths
