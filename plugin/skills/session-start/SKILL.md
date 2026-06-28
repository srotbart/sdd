---
name: session-start
description: This skill should be used when the user invokes `/sdd:session-start`, says "start my SDD session", "show SDD state", "what's pending in SDD", "what targets are waiting", "check my SDD", or begins work on a spec-driven project and wants a status snapshot. Produces a complete, urgency-ordered report of all active SDD artifacts and flags stale gap audits.
version: 0.1.0
---

# SDD Session Start

Scan the project's `.sdd/` directory and produce a concise status snapshot grouped by urgency. The most important output is how many targets are awaiting the user's input. Also surface stale audits so the agent can flag which gap reports need regenerating before proceeding.

## Procedure

### 1. Check for .sdd/ directory

If `.sdd/` does not exist at the project root, print the zero-state welcome and stop:

```
No .sdd/ directory found. This project has no SDD state yet.

To begin:
  mkdir -p .sdd/{targets,specs,gaps,work-items}
  mkdir -p .sdd/{targets,gaps,work-items}/archive

Then write your first target at .sdd/targets/TGT-001.md and run
/sdd:target-engage to negotiate it.
```

### 2. Collect active artifacts

Read the following, skipping any `archive/` subdirectory:

- `.sdd/targets/*.md` — parse `id`, `status`, `domain`, first `# Target:` heading, and optional `design:` frontmatter field
- `.sdd/specs/{domain}/SPEC-*.md` and `.sdd/specs/{domain}/*/SPEC-*.md` — for each domain subdirectory, glob both patterns (skip `archive/` at either level); parse `id`, `domain`, `abbrev`, `version`; count items with a `**Tests:**` block
- `.sdd/gaps/*.md` — parse `id`, `spec-item`, `domain`, `status`, `audit-spec-version`
- `.sdd/work-items/*.md` — parse `id`, `gap-id`, `domain`, `status`
- `.sdd/design/*/design.md` — for each design directory, extract the design name (the directory component between `design/` and `/design.md`); collect the set of design names referenced by any target's `design:` frontmatter field; a design is "in progress without a target" when its name does not appear in any target's `design:` field

### 3. Detect stale gap audits

For each open gap, look up the referenced spec item file and read its `version` field from frontmatter:

```bash
# spec items may live at domain root or one level deeper in a subject subdirectory
grep "^version:" .sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md 2>/dev/null | head -1 || \
  grep "^version:" .sdd/specs/{domain}/*/SPEC-{abbrev}-{seq}.md 2>/dev/null | head -1
```

Mark a gap as stale when its `audit-spec-version` does not match the `version` field of the spec item file it references. For each stale gap, emit one warning naming the specific gap ID and the specific spec item ID it was generated against (e.g. `⚠ GAP-auth-001 is stale: audit-spec-version a3f9c812 ≠ SPEC-auth-001 version c4e1f205`). Collect the list of stale domains for the next-action footer.

If the Bash tool is unavailable, compare each gap's `discovered` timestamp against the spec item file's modification time as a fallback indicator.

### 4. Render the status report

Print sections in this order, omitting any section with no entries:

1. Header — date
2. **Targets awaiting your input** (`awaiting-user`) — primary call to action
3. Targets awaiting agent (`awaiting-agent`)
4. Ready targets (`ready`) — settled, pending reconciliation with spec
5. Draft targets (`draft`) — in progress, not yet submitted
6. **Designs in progress** — designs in `.sdd/design/` with no corresponding target referencing them via `design:` frontmatter; each entry shows design name and path (`.sdd/design/{name}/design.md`)
7. Specs summary — one line per domain: name, item count, coverage fraction
8. Stale audit warnings — `⚠` prefix, gap ID, spec item ID, old vs current hash
9. Uncovered spec items — items with no `**Tests:**` block
10. Open gaps — grouped by domain, one line each
11. Active work items — ordered: `in-progress`, `blocked`, `pending`
12. Footer — one concrete next-action suggestion

Keep each entry to a single line: `ID: title excerpt  [metadata]`

Sort within each section by ID ascending (e.g., TGT-001 before TGT-009).

If any section exceeds 10 entries, show the first 5 then `… and N more`.

### 5. Emit high-level orientation

Before the artifact operating contract, emit a concise **high-level orientation**
for the agent. This is the brief "map" layer — the contract in step 5b is the
detail layer. The orientation shares its source of truth with `sdd-help` and
the SPEC-wf-023 artifact guides (it references them; it is not a divergent copy).

**Orientation content:**

1. **Artifact map** — what each SDD artifact type represents and how to act on it
   at a glance (one line per type):
   - Target: user intent, negotiated in-document → folds into spec
   - Spec: canonical invariants, source of truth → audited against codebase
   - Gap: audit finding, codebase diverges from spec → decomposed into work items
   - Work item: scoped task to close a gap → implemented with tests
   - Issue: reviewer-flagged problem → engaged via review-engage
   - Improvement: reviewer-proposed enhancement → engaged via review-engage

2. **Pipeline model** — the spec→code→review→gaps→refactor flow:
   ```
   spec (red) → code (green) → review (issues/improvements) → gaps → refactor
   ```
   Concrete skills: target-engage → spec-audit → gap-to-work-items → work-item-close

3. **Project-specific context** — essential orientation for this repo's `.sdd/`:
   - ID conventions: `TGT-{seq}`, `SPEC-{abbrev}-{seq}`, `GAP-{abbrev}-{seq}`, `WI-{abbrev}-{seq}`
   - Artifact locations: derive from the active artifacts found in steps 2–3
   - Active domains: list the domain subdirectories found under `.sdd/specs/`

Keep the orientation to ≤15 lines. Reference `references/sdd-pipeline.md` and
`plugin/skills/sdd-help/SKILL.md` as the authoritative source for the pipeline model.

Omit this block when running in zero-state (no `.sdd/` directory found, step 1).

### 5b. Emit artifact operating contract

After the status snapshot (step 4), emit a terse consolidated **operating
contract** for the agent, derived from `references/artifacts/*.md`. The purpose
is to give the agent the working rules for every artifact it may touch during
the session without requiring it to re-read the full guides.

Emit one block per active artifact type, in this order: target, spec, gap,
work-item. For each artifact, extract and summarise:

- **ID + path convention** (one line)
- **Active states** (one line)
- **Terminal states → archive** (one line)
- **Key invariants** (2–4 bullet points — the discipline rules most likely to be
  violated: version recomputation, append-only dialog, atomic writes, etc.)

Keep the total contract under 30 lines. Use a collapsible or clearly-delineated
block so the user can skip it. Reference each full guide for exhaustive detail:
`references/artifacts/{type}.md`.

Example format:

```
---
## Artifact Operating Contract

**Target** (`TGT-{seq}` · `.sdd/targets/`)
States: draft → awaiting-agent → awaiting-user → ready → accepted/archived
Terminal → archive: accepted, archived
Rules: dialog append-only; current statement editable by either party; soft cap ~3 rounds; atomic write (dialog + status in one edit); conflicts surface as .conflict.md, never auto-merge.
Full guide: references/artifacts/target.md

**Spec** (`SPEC-{abbrev}-{seq}` · `.sdd/specs/{domain}/`)
States: active → deprecated/aliased
Terminal → archive: deprecated, aliased
Rules: version field recomputed on every write; one invariant per item; ## Invariant + ## Acceptance criteria sections mandatory; IDs never recycled; never deleted, only archived.
Full guide: references/artifacts/spec.md

**Gap** (`GAP-{abbrev}-{seq}` · `.sdd/gaps/`)
States: open
Terminal → archive: closed, accepted, deferred
Rules: one-line reasoning mandatory; never fabricate file:line locations; audit-spec-version stamped on every write; never renumber IDs; do not close if closed-by is already set.
Full guide: references/artifacts/gap.md

**Work Item** (`WI-{abbrev}-{seq}` · `.sdd/work-items/`)
States: pending → in-progress → done/abandoned; blocked
Terminal → archive: done, abandoned
Rules: flip to in-progress before writing code; tests are not optional; minimal scope (make reasoning false, nothing more); verify before archiving; do not close gaps with non-null closed-by.
Full guide: references/artifacts/work-item.md
---
```

Omit this block when running in zero-state (no `.sdd/` directory found, step 1).

### 5c. Surface the coding standards

This is the **proactive enforcement layer** for coding standards (SPEC-wf-029, layer 1):
session-start is where the agent receives the standards rubric for the session, so it
follows them while writing code — the rules are NOT duplicated into `CLAUDE.md`.

If `.sdd/standards/` contains a rubric (e.g. `standards-template.md`), read it and emit a
terse agent-facing summary of its rules (formatting, anti-patterns, conventions,
architectural rules), capped at ~12 lines, prefixed with the source path so the agent knows
the full rubric lives at `.sdd/standards/`. If the rubric is still the unfilled template
(only `_[Fill in…]_` placeholders), note that no standards are authored yet and skip the
summary.

Keep this to the working rules an author needs at a glance; the `.sdd/standards/` file is the
authoritative source for exhaustive detail. Omit in zero-state (step 1).

### 6. Next-action footer

End with exactly one suggestion based on highest-priority state:

Before rendering the footer, check whether an sdd-worker is already running in the
current session: look for a named agent or teammate called `sdd-worker` that is still
active. If one is found, treat "worker already running" as the highest-priority
execution condition and suggest SendMessage instead of spawning.

| Condition | Suggestion |
|---|---|
| Targets `awaiting-user` exist | "N targets need your input. Run `/sdd:target-engage TGT-XXX` to continue." |
| Ready targets exist | "Run `/sdd:target-engage TGT-XXX` to reconcile it with spec." |
| Worker already running (sdd-worker active in session) | "Worker is running. Send it the domain: `SendMessage to \"sdd-worker\"` with the domain name." |
| Stale audits exist | "Run `/sdd:spawn-sdd-worker {domain}` to hand off execution to the sdd-worker." |
| Open gaps, no work items | "Run `/sdd:spawn-sdd-worker {domain}` to hand off execution to the sdd-worker." |
| Work items pending/blocked | "Run `/sdd:spawn-sdd-worker {domain}` to hand off execution to the sdd-worker." |
| Uncovered spec items, no open gaps | "Run `/sdd:spec-test {domain}` to add test coverage to spec items." |
| Nothing active | "All clear. No open targets, gaps, or work items." |

## Output Format

```
## SDD State — 2026-05-12

### Targets awaiting your input (2)
- TGT-007: Two-factor auth for admin actions  [authentication]
- TGT-009: Rate limiting on public endpoints  [api]

### Targets awaiting agent (1)
- TGT-008: Refresh token rotation  [authentication]

### Ready targets (1)
- TGT-010: Admin audit logging  [authentication]

### Designs in progress (1)
- sdd-explain: .sdd/design/sdd-explain/design.md  [no target yet]

### Specs (2 domains)
- SPEC-auth: Authentication — 3 items, 2/3 covered
- SPEC-api: API — 5 items, 0/5 covered

⚠ GAP-auth-001 is stale: audit-spec-version a3f9c812 ≠ SPEC-auth-001 version c4e1f205

### Uncovered spec items (6)
- SPEC-auth-003: Password complexity requirements  [authentication]
- SPEC-api-001: Rate limiting on public endpoints  [api]
- ... and 4 more

### Open gaps (4)
- GAP-auth-001: Admin handler missing MFA check  [SPEC-auth-001]
- GAP-auth-002: Token cache not cleared on logout  [SPEC-auth-002]
- GAP-api-001: Rate limit not applied to /search  [SPEC-api-003]
- GAP-api-002: Rate limit bypass via OPTIONS  [SPEC-api-003]

### Active work items
- WI-auth-002: Clear token cache on logout  [in-progress]
- WI-auth-003: Fix rate limit bypass  [blocked]
- WI-auth-001: Add MFA check to admin handler  [pending]
- WI-api-001: Apply rate limiting to /search  [pending]

---
2 targets need your input.
Next: Engage the highest-priority target. Run `/sdd:target-engage TGT-007` to proceed.
```

## Edge Cases

**Orphaned gap** — gap references a `spec-item` ID not found in any spec file (including aliases). Flag with: `⚠ GAP-auth-005 references SPEC-auth-009 which no longer exists — verify spec-collapse ran alias correctly.`

**Orphaned work item** — work item references a `gap-id` not found in the active or archive gaps directory. Flag with: `⚠ WI-auth-007 references GAP-auth-004 which cannot be found.`

**Multiple domain directories** — each domain should have exactly one subdirectory under `.sdd/specs/`. Multiple directories for the same domain cannot occur under the naming scheme.

**Empty archive dirs are fine** — `archive/` subdirectories may not exist yet; skip gracefully without error.

## Schema Reference

For full artifact schemas, ID conventions, and state machines:
`references/schemas.md`

For pipeline overview and skill responsibilities:
`references/sdd-pipeline.md`

## Examples

For concrete session output snapshots (all-clear state, stale-audit-only state, zero state):
`skills/session-start/examples/`
