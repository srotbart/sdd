---
id: GAP-wf-019
spec-item: SPEC-wf-012
domain: workflow
status: closed
discovered: "2026-06-02T00:00:00Z"
audit-spec-version: "ad2911f7"
closed-by: WI-wf-018
deferred-reason: null
---

**Location:** `plugin/statusline.sh` — no `grep` for `awaiting-user` targets and no `find` across spec domain subdirectories; these count variables are never computed

**Reasoning:** SPEC-wf-012 requires target count via `grep -rl 'status: awaiting-user'` in `.sdd/targets/` and spec item count via `find` across all spec domain subdirectories excluding archive/, but `statusline.sh` computes neither — both count variables are absent from the script.
