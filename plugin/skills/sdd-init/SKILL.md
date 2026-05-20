---
name: sdd-init
description: This skill should be used when the user invokes `/sdd:sdd-init`, says "initialize SDD", "set up SDD", "create the SDD folder", "bootstrap SDD for this project", or wants to start using spec-driven development in a project that has no `.sdd/` directory yet. Creates the full directory structure and optionally scaffolds a first target.
version: 0.1.0
---

# SDD Init

Bootstrap a new SDD workspace in the current project. Creates the `.sdd/`
directory structure and optionally scaffolds a first target from an argument.

## Procedure

### 1. Check if .sdd/ already exists

If `.sdd/` exists, report its current state and stop:

```
.sdd/ already exists. Run `/sdd:session-start` to see current state.
```

### 2. Create the directory structure

```bash
mkdir -p .sdd/targets/archive
mkdir -p .sdd/specs
mkdir -p .sdd/gaps/archive
mkdir -p .sdd/work-items/archive
```

### 3. Scaffold a first target (if argument provided)

If the user supplied a topic or intent (e.g., `/sdd:sdd-init add authentication`),
create `.sdd/targets/TGT-001.md` with that intent as the starting point:

```markdown
---
id: TGT-001
status: awaiting-agent
created: {today}
domain: {inferred from intent}
---

# Target: {intent}

## Current statement
{intent as written by the user}

## Dialog
### {today} — User
{intent as written by the user}
```

Set `status: awaiting-agent` so the next step is clear: run
`/sdd:target-engage TGT-001` to begin negotiating the target.

If no argument was provided, skip this step.

### 4. Report

```
## SDD Initialized

Created:
  .sdd/targets/       — user-written intent
  .sdd/targets/archive/
  .sdd/specs/         — canonical specifications (durable)
  .sdd/gaps/          — audit reports
  .sdd/gaps/archive/
  .sdd/work-items/    — tasks that close gaps
  .sdd/work-items/archive/

[If target was scaffolded:]
  .sdd/targets/TGT-001.md — "{intent}" [awaiting-agent]
  → Run `/sdd:target-engage TGT-001` to start negotiating.

[If no target scaffolded:]
  → Write your first target at .sdd/targets/TGT-001.md, then run
    `/sdd:target-engage TGT-001` to start.
  → Or run `/sdd:sdd-init {your intent}` to scaffold one now.

## Two-phase workflow

SDD separates **intent** from **execution**:

**Intent phase** (you + Claude):
- Write targets describing what must be true
- Run `/sdd:target-engage` to negotiate and fold targets into the spec
- This phase requires judgment — it stays with you

**Execution phase** (sdd-worker agent):
- Once the spec is updated, run `/sdd:spawn-sdd-worker {domain}`
- The worker autonomously handles: spec audit → gap creation → work item closure
- You are notified when it completes or hits a blocker

Run `/sdd:sdd-help` for a full explanation of the workflow.
```
