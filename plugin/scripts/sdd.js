#!/usr/bin/env node
/**
 * sdd.js — the SDD artifact CLI for agents.
 *
 * One deterministic, testable surface for the mechanical artifact
 * conventions, so skills (and agents running them) query and mint through
 * this instead of globbing and grepping `.sdd/` by hand. Read-side commands
 * never write; `mint` prints an ID without creating a file; `stamp`
 * delegates to stamp.js (the one surface that rewrites hashes).
 *
 * Commands:
 *
 *   node sdd.js state [--json]
 *     Project snapshot: artifact counts by status per type, plus the count
 *     of active spec items without a **Tests:** block (uncovered).
 *
 *   node sdd.js list <specs|gaps|work-items|issues|improvements|targets>
 *                    [--status=<s>] [--component=<path>] [--archived] [--json]
 *     One line per artifact: `id<TAB>status<TAB>component<TAB>title`.
 *     --component matches the component subtree (path or descendant).
 *     --archived includes `archive/` subtrees (local-only for ephemeral
 *     types; tracked for specs). Legacy `domain:` frontmatter reads as a
 *     one-level component path everywhere.
 *
 *   node sdd.js show <ID>
 *     Print the artifact's project-relative path, a blank line, then the
 *     file content. Spec aliases resolve to the surviving item.
 *
 *   node sdd.js resolve <ID>...
 *     Print `id<TAB>path` per ID (aliases note the canonical id in a third
 *     column). Unresolved IDs go to stderr; exit 1 if any.
 *
 *   node sdd.js mint <gap|work-item|issue|improvement> <abbrev>
 *   node sdd.js mint target
 *     Ephemeral types mint `{PREFIX}-{abbrev}-{7hex}` (7 random lowercase
 *     hex chars — collision-free by construction, double-checked against
 *     the active tree and archives). Targets are sequential: the next
 *     `TGT-{seq}` derives from active target files plus a
 *     `git log --diff-filter=A` history scan (target archives are
 *     local-only). Prints the ID; creating the file is the caller's job.
 *
 *   node sdd.js stamp <version|contract|check> <file>... | --all
 *     Delegates to stamp.js verbatim (same exit codes).
 *
 * The project root is the nearest ancestor of the cwd containing `.sdd/`.
 * Exit codes: 0 success, 1 unresolved/lookup failure, 2 usage error.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const { findSddRoot, collectSpecFiles, frontmatterBlock, field, fieldList } = require('./lib/sdd-tree.js');

const USAGE = `usage: sdd.js <command>

  state  [--json]                                   project snapshot
  list   <type> [--status=s] [--component=p] [--archived] [--json]
  show   <ID>                                       path + content
  resolve <ID>...                                   id -> path
  mint   <gap|work-item|issue|improvement> <abbrev> | mint target
  stamp  <version|contract|check> ...               delegates to stamp.js

types: specs gaps work-items issues improvements targets`;

function fail(msg, code = 2) {
  process.stderr.write(`sdd: ${msg}\n`);
  process.exit(code);
}

// type key → directory, ID prefix, and the generic heading prefix its titles carry.
const TYPES = {
  specs: { dir: 'specs', prefix: 'SPEC' },
  gaps: { dir: 'gaps', prefix: 'GAP' },
  'work-items': { dir: 'work-items', prefix: 'WI' },
  issues: { dir: 'issues', prefix: 'ISS' },
  improvements: { dir: 'improvements', prefix: 'IMP' },
  targets: { dir: 'targets', prefix: 'TGT' },
};

// ─── Collection ───────────────────────────────────────────────────────────────

/** All .md files under dir at any depth; `archive/` skipped unless included. */
function collectMdFiles(dir, includeArchive) {
  const found = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    // Absent or unreadable directory: an empty tree, by contract.
    return found;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === 'archive' && !includeArchive) continue;
      found.push(...collectMdFiles(path.join(dir, entry.name), includeArchive));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found.sort();
}

function collectTypeFiles(root, type, includeArchive) {
  const dir = path.join(root, '.sdd', TYPES[type].dir);
  if (type === 'specs') {
    // Item files only — manifests (component.md, area.md) are not artifacts.
    return includeArchive
      ? collectMdFiles(dir, true).filter((f) => /^SPEC-.*\.md$/.test(path.basename(f)))
      : collectSpecFiles(dir);
  }
  return collectMdFiles(dir, includeArchive);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** First `#` heading, minus generic `Gap:`-style and `{ID} —` prefixes. */
function parseTitle(content, id) {
  const m = content.match(/^#\s+(.+?)\s*$/m);
  if (!m) return '';
  return m[1]
    .replace(/^(?:Gap|Work Item|Target|Issue|Improvement):\s*/i, '')
    .replace(new RegExp(`^${escapeRe(id)}\\s*[—:-]\\s*`, 'i'), '')
    .trim();
}

/** Parse one artifact file, or null when it has no frontmatter id (manifests, conflict files). */
function readArtifact(file, type) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
  const fm = frontmatterBlock(content);
  if (fm === null) return null;
  const id = field(fm, 'id');
  if (!id) return null;
  return {
    id,
    type,
    status: field(fm, 'status') ?? '',
    // Legacy `domain:` reads as a one-level component path everywhere.
    component: field(fm, 'component') ?? field(fm, 'domain') ?? '',
    title: parseTitle(content, id),
    aliases: fieldList(fm, 'aliases') ?? [],
    archived: file.split(path.sep).includes('archive'),
    file,
    content,
  };
}

function collectArtifacts(root, types, includeArchive) {
  const artifacts = [];
  for (const type of types) {
    for (const file of collectTypeFiles(root, type, includeArchive)) {
      const a = readArtifact(file, type);
      if (a) artifacts.push(a);
    }
  }
  return artifacts;
}

/** id (uppercased) → artifact, aliases included (marked with aliasOf). */
function buildIndex(root) {
  const index = new Map();
  for (const a of collectArtifacts(root, Object.keys(TYPES), true)) {
    if (!index.has(a.id.toUpperCase())) index.set(a.id.toUpperCase(), a);
    for (const alias of a.aliases) {
      if (!index.has(alias.toUpperCase())) index.set(alias.toUpperCase(), { ...a, aliasOf: a.id });
    }
  }
  return index;
}

const rel = (root, file) => path.relative(root, file);

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdState(root, flags) {
  const out = {};
  for (const type of Object.keys(TYPES)) {
    const byStatus = {};
    let uncovered = 0;
    for (const a of collectArtifacts(root, [type], false)) {
      const status = a.status || '(none)';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
      if (type === 'specs' && a.status === 'active' && !a.content.includes('**Tests:**')) uncovered++;
    }
    out[type] = type === 'specs' ? { byStatus, uncovered } : { byStatus };
  }
  if (flags.json) {
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  for (const [type, info] of Object.entries(out)) {
    const parts = Object.entries(info.byStatus)
      .sort()
      .map(([s, n]) => `${n} ${s}`);
    let line = parts.length ? parts.join(', ') : 'none';
    if (type === 'specs' && info.uncovered > 0) line += ` (${info.uncovered} uncovered)`;
    process.stdout.write(`${type}: ${line}\n`);
  }
}

function cmdList(root, args, flags) {
  const type = args[0];
  if (!type || !TYPES[type]) fail(`list: unknown type '${type ?? ''}' — one of: ${Object.keys(TYPES).join(' ')}`);
  const inSubtree = (p) => p === flags.component || p.startsWith(flags.component + '/');
  const rows = collectArtifacts(root, [type], flags.archived)
    .filter((a) => (flags.status ? a.status === flags.status : true))
    .filter((a) => (flags.component ? inSubtree(a.component) : true));
  if (flags.json) {
    process.stdout.write(
      JSON.stringify(
        rows.map((a) => ({
          id: a.id,
          status: a.status,
          component: a.component,
          title: a.title,
          archived: a.archived,
          file: rel(root, a.file),
        })),
        null,
        2
      ) + '\n'
    );
    return;
  }
  for (const a of rows) {
    process.stdout.write(`${a.id}\t${a.status}\t${a.component}\t${a.title}\n`);
  }
}

function cmdShow(root, args) {
  const id = args[0];
  if (!id) fail('show: no ID given');
  const found = buildIndex(root).get(id.toUpperCase());
  if (!found) fail(`show: ${id} not found`, 1);
  process.stdout.write(`${rel(root, found.file)}\n\n${found.content}`);
}

function cmdResolve(root, ids) {
  if (ids.length === 0) fail('resolve: no IDs given');
  const index = buildIndex(root);
  let ok = true;
  for (const id of ids) {
    const found = index.get(id.toUpperCase());
    if (!found) {
      process.stderr.write(`unresolved: ${id}\n`);
      ok = false;
      continue;
    }
    const aliasNote = found.aliasOf ? `\t(alias of ${found.aliasOf})` : '';
    process.stdout.write(`${id}\t${rel(root, found.file)}${aliasNote}\n`);
  }
  if (!ok) process.exit(1);
}

const MINTABLE = { gap: 'GAP', 'work-item': 'WI', issue: 'ISS', improvement: 'IMP' };

function cmdMint(root, args) {
  const kind = args[0];
  if (kind === 'target') {
    // Sequential: max over active target files and git history of added
    // target files — archives are local-only, so history is the record.
    let max = 0;
    const noteSeq = (name) => {
      const m = /^TGT-(\d+)\.md$/.exec(name);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    };
    for (const f of collectMdFiles(path.join(root, '.sdd', 'targets'), true)) noteSeq(path.basename(f));
    try {
      const log = execFileSync(
        'git',
        ['log', '--diff-filter=A', '--name-only', '--pretty=format:', '--', '.sdd/targets'],
        { cwd: root, encoding: 'utf8' }
      );
      for (const line of log.split('\n')) noteSeq(path.basename(line.trim()));
    } catch {
      process.stderr.write('sdd: warning: git history unavailable — next target seq derived from files only\n');
    }
    process.stdout.write(`TGT-${String(max + 1).padStart(3, '0')}\n`);
    return;
  }
  const prefix = MINTABLE[kind];
  if (!prefix) fail(`mint: unknown kind '${kind ?? ''}' — one of: ${Object.keys(MINTABLE).join(' ')} target`);
  const abbrev = args[1];
  if (!abbrev || !/^[a-z][a-z0-9-]*$/.test(abbrev)) fail('mint: abbrev required (lowercase, e.g. `auth`)');
  const index = buildIndex(root);
  // Random 7-hex is collision-free by construction; the index check is
  // defense in depth and costs one tree scan.
  for (;;) {
    const id = `${prefix}-${abbrev}-${crypto.randomBytes(4).toString('hex').slice(0, 7)}`;
    if (!index.has(id.toUpperCase())) {
      process.stdout.write(`${id}\n`);
      return;
    }
  }
}

function cmdStamp(rest) {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'stamp.js'), ...rest], { stdio: 'inherit' });
  process.exit(result.status ?? 2);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const command = argv[0];
const flags = { json: false, archived: false, status: null, component: null };
const positional = [];
for (const arg of argv.slice(1)) {
  if (arg === '--json') flags.json = true;
  else if (arg === '--archived') flags.archived = true;
  else if (arg.startsWith('--status=')) flags.status = arg.slice('--status='.length);
  else if (arg.startsWith('--component=')) flags.component = arg.slice('--component='.length);
  else if (command !== 'stamp' && arg.startsWith('--')) fail(`unknown flag ${arg}\n${USAGE}`);
  else positional.push(arg);
}

if (!command || command === '--help' || command === 'help') {
  process.stdout.write(USAGE + '\n');
  process.exit(command ? 0 : 2);
}

if (command === 'stamp') cmdStamp(argv.slice(1));

const root = findSddRoot(process.cwd());
if (!root) fail(`no .sdd/ found above ${process.cwd()}`);

switch (command) {
  case 'state':
    cmdState(root, flags);
    break;
  case 'list':
    cmdList(root, positional, flags);
    break;
  case 'show':
    cmdShow(root, positional);
    break;
  case 'resolve':
    cmdResolve(root, positional);
    break;
  case 'mint':
    cmdMint(root, positional);
    break;
  default:
    fail(`unknown command '${command}'\n${USAGE}`);
}
