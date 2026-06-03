# SDD Artifact Schemas

All SDD state lives under `.sdd/` at the project root. Specs are durable.
Targets, gaps, and work-items are scaffolding that archives on terminal-state
transitions. Each has an `archive/` subdirectory; terminal items move there
immediately, preserving provenance via frontmatter references in the spec.

---

## Directory layout

```
.sdd/
├── targets/
│   ├── TGT-007.md
│   └── archive/
├── specs/
│   └── authentication/          ← one subdirectory per domain
│       ├── SPEC-auth-001.md
│       ├── SPEC-auth-002.md
│       └── archive/             ← removed/obsolete items move here
├── gaps/
│   ├── GAP-auth-001.md
│   └── archive/
└── work-items/
    ├── WI-auth-001.md
    └── archive/
```

---

## Targets — `.sdd/targets/TGT-{seq}.md`

One file per target. Created by the user; negotiated in-document with the agent.

```markdown
---
id: TGT-007
status: awaiting-user   # draft | awaiting-agent | awaiting-user | ready | accepted | archived
created: 2026-05-12
domain: authentication
---

# Target: Two-factor auth for admin actions

## Current statement
[Authoritative target text. Both user and agent may propose edits here.]

## Dialog
### 2026-05-12 — User
[original intent]

### 2026-05-12 — Agent
[clarifying questions or proposed Current statement edit]
```

**Status semantics:**
- `draft` — user hasn't submitted for agent response yet
- `awaiting-agent` — user wants a response; agent acts, then flips to `awaiting-user`
- `awaiting-user` — agent responded; waiting for user input
- `ready` — target is settled; either party may flip here
- `accepted` — folded into spec → **archive**
- `archived` — abandoned without folding → **archive**

**Dialog rules:** append-only; never rewrite prior entries. Soft cap ~3 rounds;
agent commits to a best-effort Current statement rather than infinite clarification.

---

## Specs — `.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md`

One file per spec item, inside a domain subdirectory. Durable — active items are never
archived, but removed or obsolete items move to `.sdd/specs/{domain}/archive/`. New
targets fold into an existing domain subdirectory; a new subdirectory is created only
when a target opens a genuinely new domain. There is no domain-level manifest file.

```markdown
---
id: SPEC-auth-001
domain: authentication
abbrev: auth
status: active        # active | deprecated | aliased
aliases: []           # former spec IDs, populated by spec-collapse
version: "a3f9c812"  # SHA-256[:8] of this file's content; recompute on every write
---

# SPEC-auth-001 — Admin actions require two-factor verification

## Invariant

All admin-privileged operations MUST verify a second factor before proceeding.
The factor must be validated within the current session; cross-session caching
is not permitted.

## Acceptance criteria

- Every admin action handler verifies MFA before executing
- MFA check rejects calls where the second factor is absent or expired
- MFA check permits calls where the second factor is verified in the current session

**Tests:**
- `tests/integration/test_admin.py::test_SPEC_auth_001_admin_rejected_without_mfa` — "admin action rejected when second factor is absent or expired"
- `tests/integration/test_admin.py::test_SPEC_auth_001_admin_proceeds_with_valid_mfa` — "admin action proceeds when second factor is verified in current session"
```

**Item ID convention:** `SPEC-{abbrev}-{seq}` — sequential within domain, globally stable.
All domain metadata (`domain`, `abbrev`) is in each item's own frontmatter; the domain
name is also derivable from the subdirectory name.

**Tests block:** Optional per-item section linking the spec item to its verification
tests in the project's regular test suite. Added by the `spec-test` skill; updated
whenever tests are renamed or moved.

```markdown
**Tests:**
- `tests/integration/test_admin.py::test_SPEC_auth_001_rejected_without_mfa` — "one-line description of what behavior this test exercises"
```

Format per entry: `` `file::test_identifier` — "behavior description" ``
The description states the behavior being tested, not the assertion mechanism.
Test names must embed the spec item ID (e.g., `test_SPEC_auth_001_...`) so
spec→test coverage is grep-able without parsing the spec file.

Items without a `**Tests:**` block are considered uncovered and surfaced by
`session-start`.

**Version field:** SHA-256 first 8 hex chars of the item file's own content. Recompute
and update on every write. Used for per-item stale-audit detection.

To compute:
```bash
shasum -a 256 .sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md | cut -c1-8
```

**Status values per item:** `active | deprecated | aliased`

**Aliasing on spec-collapse:** when SPEC-auth-001 merges into SPEC-auth-core-001,
the new item gains `Aliases: SPEC-auth-001` in its status line. Existing gap files
pointing at `SPEC-auth-001` remain valid — resolution finds the alias at read time.
No existing artifacts are migrated.

---

## Gaps — `.sdd/gaps/GAP-{abbrev}-{seq}.md`

One file per gap. Generated by spec-audit; never human-written.

```markdown
---
id: GAP-auth-001
spec-item: SPEC-auth-001
domain: authentication
status: open          # open | closed | accepted | deferred
discovered: "2026-05-12T14:30:00Z"
audit-spec-version: "a3f9c812"
closed-by: null       # WI-{abbrev}-{seq} when closed
deferred-reason: null
---

# Gap: Admin handler missing MFA check

**Location:** `src/auth/admin.py:142`
**Reasoning:** `execute()` proceeds without verifying MFA status in the current session.
```

**Terminal states → archive:** `closed`, `accepted`, `deferred`
**Active states:** `open`

**Stale detection:** compare `audit-spec-version` against the `version` field in the
referenced spec item file (`.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md`). If they
differ, the gap is stale and the audit should be re-run.

---

## Work Items — `.sdd/work-items/WI-{abbrev}-{seq}.md`

One file per work item. Generated by gap-to-work-items; never human-written.

```markdown
---
id: WI-auth-001
gap-id: GAP-auth-001
domain: authentication
status: pending       # pending | in-progress | done | blocked | abandoned
created: "2026-05-12T15:00:00Z"
abandoned-reason: null
---

# Work Item: Add MFA check to admin action handler

**Scope:** `src/auth/admin.py` — verify MFA before `execute()`

**Acceptance criteria:**
- MFA check at handler entry; rejects calls where second factor is absent or stale
- Unit test: MFA absent → rejection
- Unit test: MFA present → success
```

**Terminal states → archive:** `done`, `abandoned`
**Active states:** `pending`, `in-progress`, `blocked`

---

## Cross-reference chain

```
SPEC-auth-001  ←—  GAP-auth-001 (spec-item field)
                       ↑
               WI-auth-001 (gap-id field)
```

Reverse lookups (e.g., "all work items for this gap") are resolved at read time
by scanning the relevant directory — no stored back-references.

---

## Conflict Files — `.sdd/targets/TGT-{id}.conflict.md`

Created by target-engage when a ready target contradicts or ambiguously overlaps an
active spec item. Lives as a sibling of the target file. Deleted by the user after
resolution; re-run `/sdd:target-engage` to retry reconciliation.

```markdown
---
target-id: TGT-007
spec-item: SPEC-auth-003
conflict-type: contradiction   # contradiction | overlap
created: 2026-05-12T14:30:00Z
---

# Conflict: TGT-007 vs SPEC-auth-003

## Target statement (TGT-007 excerpt)
[Relevant excerpt from Current statement]

## Conflicting spec item (SPEC-auth-003)
[Full spec item text]

## Nature of conflict
[One paragraph explaining the contradiction or overlap]

## Resolution options
1. Update SPEC-auth-003 to reflect the target's intent — edit the spec item, delete
   this file, re-run target-engage.
2. Revise TGT-007's Current statement to align with the spec — edit the target, delete
   this file, re-run target-engage.
3. Archive the target without folding it in — change TGT-007 status to `archived`,
   move to archive/.
```

One conflict file per blocking spec item. If a target conflicts with multiple items,
create one file per pair.

---

## ID conventions summary

| Artifact | Pattern | Example |
|---|---|---|
| Target | `TGT-{seq}` | `TGT-007` |
| Spec domain dir | `specs/{domain}/` | `specs/authentication/` |
| Spec item | `SPEC-{abbrev}-{seq}` | `SPEC-auth-001` |
| Gap | `GAP-{abbrev}-{seq}` | `GAP-auth-001` |
| Work item | `WI-{abbrev}-{seq}` | `WI-auth-001` |

Sequences are globally stable within their type+domain. IDs are never recycled.
Retired IDs become aliases in the spec; gaps and work-items are never re-IDed.
