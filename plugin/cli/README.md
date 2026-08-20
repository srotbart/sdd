# SDD Artifact CLI

The deterministic, imperative surface for SDD artifact mechanics. Agents (via
skills) and tooling call this instead of globbing, grepping, and hand-editing
`.sdd/` — the mechanical file conventions (frontmatter schemas, ID minting,
hash recomputation, depth-agnostic scans, alias resolution) live here, once,
under test. Skills keep the intent and judgement.

Lives inside the plugin so it ships with it: in a consumer project the CLI is
at `$HOME/.claude/plugins/cache/sdd/sdd/<version>/cli/sdd.js`; in this repo,
`plugin/cli/sdd.js`. Skills resolve it with:

```bash
sdd_cli=$(ls plugin/cli/sdd.js 2>/dev/null || ls "$HOME/.claude/plugins/cache/sdd/sdd/"*/cli/sdd.js 2>/dev/null | head -1)
```

Zero dependencies; plain Node (>= 18).

## Commands

```
node plugin/cli/sdd.js state  [--json]                    project snapshot: counts by status per type
node plugin/cli/sdd.js list   <type> [--status=s] [--component=p] [--archived] [--json]
node plugin/cli/sdd.js show   <ID>                        project-relative path + full content
node plugin/cli/sdd.js resolve <ID>...                    id → path (spec aliases resolve; exit 1 on misses)
node plugin/cli/sdd.js mint   <gap|work-item|issue|improvement> <abbrev>
node plugin/cli/sdd.js mint   target                      next sequential TGT id (files + git history)
node plugin/cli/sdd.js stamp  <version|contract|check> <file>... | --all
```

Types: `specs gaps work-items issues improvements targets`. Legacy `domain:`
frontmatter reads as a one-level component path everywhere; `--component`
matches the whole subtree. Read commands never write; `mint` prints an ID
without creating a file; `stamp` delegates to `../scripts/stamp.js`, the one
surface that rewrites hashes.

`list --json` rows always carry `id`, `status`, `component`, `title`,
`archived`, `file`, plus per-type cross-reference fields:

| type | extra fields |
|---|---|
| specs | `version`, `covered` (has a `**Tests:**` block) |
| gaps | `specItem`, `auditSpecVersion` (staleness = ≠ the spec's `version`) |
| work-items | `gapIds` |
| targets | `design` |

## Layout

This directory is where the CLI grows. `lib/sdd-tree.js` is the shared
artifact-mechanics library (tree walk, frontmatter access, list parsing); the
legacy standalone scripts (`plugin/scripts/stamp.js`, `spec-index.js`) consume
it from here and fold into the CLI as subcommands over time (`sdd stamp`
already delegates; `spec-index` becomes `sdd index`).

## Planned (not yet implemented)

The goal is that **all** artifact manipulation and searching goes through the
CLI; skills keep intent and judgement. Next, roughly in order:

- **Write side** — `create <type>` (mint + write from schema, fields as flags),
  `transition <ID> <status>` (validated state-machine moves, terminal states
  archived with commit-before-archive semantics), `close-gap`, `archive`.
- **Staleness / health** — `stale` (gaps whose `auditSpecVersion` drifted;
  bindings via stamp), folding sdd-doctor's ten deterministic checks in as
  `doctor`.
- **`index`** — `spec-index.js` as a subcommand; `refs <ID>` for reverse
  lookups (who references this artifact).
- **Search** — `search <term>` scoped by type/component, replacing raw grep
  over `.sdd/`.

## Tests

End-to-end tests live in `hub/server/sdd-cli.test.ts` and
`hub/server/stamp-script.test.ts`.
