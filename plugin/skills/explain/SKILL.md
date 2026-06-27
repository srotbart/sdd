---
name: explain
description: Use when the user invokes `/sdd:explain <subject>`, asks to "explain how X works", "document X", "write an explanation of X", or wants a deep-dive document on a component, concept, or subsystem in the current project. Spawns a dedicated sdd-explainer agent that writes to `.sdd/projections/<subject>.md` and can work interactively (asking what to explore next) or autonomously (full document without prompts).
version: 0.1.0
---

# SDD Explain

Spawn a dedicated `sdd-explainer` agent to research and document a subject from
the current project. The agent writes to `.sdd/projections/<subject>.md` so the
Hub surfaces the document live as it is written. The agent can work interactively
(guided by the user turn-by-turn) or autonomously (full traversal without prompts).

## Input

Accept a required subject argument: `/sdd:explain authentication`

The subject becomes the filename stem: `.sdd/projections/authentication.md`.

## Procedure

### 1. Ensure .sdd/projections/ exists

```bash
mkdir -p .sdd/projections
```

### 2. Spawn the sdd-explainer agent

Use the Agent tool with the following parameters:

- `name`: `"sdd-explainer"`
- `subagent_type`: `"general-purpose"`
- `model`: `"sonnet"`
- `run_in_background`: `true`

No team setup step is required. As of Claude Code v2.1.178 the `TeamCreate`/`TeamDelete`
tools no longer exist: spawning the agent via the Agent tool sets up the team context
automatically, and it is torn down automatically when the session exits. There is no
project-root-derived team name to compute, and the `team_name` input is accepted but
ignored, so it is not passed. The agent inherits the Skill tool from its `general-purpose`
agent type.

Pass this prompt to the agent (substituting `{subject}` and `{project_root}`):

```
You are sdd-explainer, a documentation agent for the project at {project_root}.

Your job is to explain the subject: {subject}

## Your first actions (do these immediately, in order):

1. Ask the user one question: "Should I work interactively (I'll ask what to explore
   next after each section) or non-interactively (I'll write the full document
   autonomously)?"

2. While waiting for their answer (or immediately in non-interactive mode), write
   a skeleton header to `.sdd/projections/{subject}.md`:

   ```markdown
   # {subject}

   > Explanation in progress — {timestamp}

   ## Contents
   <!-- sections will appear here as they are written -->
   ```

   Create `.sdd/projections/` if it does not exist.

## Research protocol

Always consult `.sdd/specs/` first — spec items are the authoritative ground truth
for what the system is supposed to do. Search for relevant SPEC-*.md files before
reading any code:

```bash
grep -rn "{subject}" .sdd/specs/ --include="*.md" | head -20
```

After reading relevant specs, trace the implementation: find entry points, key
components, and data flows by reading source files.

## Interactive mode

1. Write the main concept section to `.sdd/projections/{subject}.md` (specs first,
   then code evidence).
2. Send the user a message: "I've written the main concept section. What should I
   explore next? (e.g. 'data flow', 'error handling', 'testing approach')"
3. For each user reply, write the directed section to the file, then ask again.
4. Continue until the user says they are done or sends an empty reply.

## Non-interactive mode

Traverse autonomously in this order:
1. Main concept (what it is, why it exists) — from specs
2. Entry points (how it is invoked) — from code
3. Key components (the main files/functions/classes) — from code
4. Data flow (inputs → processing → outputs) — from code
5. Error handling and edge cases — from code
6. Test coverage summary — from test files

Write each section to `.sdd/projections/{subject}.md` as you complete it. When all
sections are written, update the Contents list at the top, then shut down.

## Rules

- Specs before code — always.
- Write to the file incrementally so Hub shows progress.
- Do not ask clarifying questions beyond the initial interactive/non-interactive choice.
- If `.sdd/specs/` has no relevant items, say so explicitly in the document and
  proceed with code-only research.
```

### 3. Confirm and report

After spawning, print:

```
sdd-explainer spawned for subject: {subject}

The agent will:
  1. Ask: interactive or non-interactive?
  2. Write a skeleton to .sdd/projections/{subject}.md immediately
  3. Research specs first, then code
  4. Write sections incrementally (interactive) or the full document (non-interactive)

Output will appear at: .sdd/projections/{subject}.md
```
