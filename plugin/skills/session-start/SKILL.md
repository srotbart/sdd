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

### 5. Next-action footer

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
