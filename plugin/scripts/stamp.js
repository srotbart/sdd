#!/usr/bin/env node
/**
 * stamp.js — deterministic hash stamping for SDD spec items.
 *
 * Agents never compute or edit hashes by hand; this script is the one
 * imperative, deterministic way to do it. Same input tree → same output,
 * byte for byte.
 *
 * Commands:
 *
 *   node stamp.js version <file>... | --all
 *     Recompute each spec item's `version:` field (SHA-256 of the file with
 *     every `version:` line stripped, first 8 hex chars — identical to
 *     `grep -v "^version:" f | shasum -a 256 | cut -c1-8`). Writes only when
 *     the stored value differs. Prints one line per change: `id old → new`.
 *
 *   node stamp.js contract <file>...
 *     Re-stamp a contract item's `contract-synced` entries with each
 *     referenced item's CURRENT version, then recompute the contract's own
 *     `version:` (in that order — stamps change the content the version
 *     covers). Self-stamps (the contract referencing itself) are removed:
 *     they can never converge. Unresolvable entry IDs are a hard error —
 *     nothing is guessed, nothing is partially written.
 *     ONLY run this after re-verifying the contract against both sides;
 *     stamping IS the record of that verification.
 *
 *   node stamp.js check <file>... | --all
 *     Verify without writing. Exit 0 when every checked file's `version:`
 *     (and, for contract items, every stamp) matches; exit 1 otherwise,
 *     printing one line per mismatch. Accepts BOTH hash conventions for
 *     `version:` (strip-line and legacy whole-file) so unmigrated projects
 *     pass; stamps are always compared against current versions.
 *
 * The project root is the nearest ancestor of the first file (or of the
 * cwd for --all) containing `.sdd/`. Files may be given relative or
 * absolute. Exit codes: 0 success, 1 check-mismatch, 2 usage/resolution
 * error.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Hashing ──────────────────────────────────────────────────────────────────

/** SHA-256[:8] of content with every `version:` line removed (the canonical rule). */
function strippedHash(content) {
  const stripped = content
    .split('\n')
    .filter((line) => !line.startsWith('version:'))
    .join('\n');
  return crypto.createHash('sha256').update(stripped).digest('hex').slice(0, 8);
}

/** SHA-256[:8] of the whole file (legacy convention, accepted by `check`). */
function wholeFileHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

// ─── Frontmatter helpers (line-oriented; writes preserve everything else) ─────

function getField(content, name) {
  const m = content.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!m) return null;
  return m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
}

function setVersion(content, hash) {
  if (/^version:.*$/m.test(content)) {
    return content.replace(/^version:.*$/m, `version: "${hash}"`);
  }
  // No version line yet: insert before the closing frontmatter delimiter.
  return content.replace(/^---$/m, '---').replace(/\n---\n/, `\nversion: "${hash}"\n---\n`);
}

function parseSynced(content) {
  const raw = getField(content, 'contract-synced');
  if (raw === null) return null;
  const inner = raw.replace(/^\[|\]$/g, '');
  const entries = [];
  for (const part of inner.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = /^([A-Za-z0-9-]+)@([0-9a-fA-F]+)$/.exec(trimmed);
    entries.push(m ? { item: m[1], stamp: m[2], raw: trimmed } : { item: null, stamp: null, raw: trimmed });
  }
  return entries;
}

function setSynced(content, entries) {
  const rendered = `[${entries.map((e) => `${e.item}@${e.stamp}`).join(', ')}]`;
  return content.replace(/^contract-synced:.*$/m, `contract-synced: ${rendered}`);
}

// ─── Tree resolution ──────────────────────────────────────────────────────────

function findSddRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.sdd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function collectSpecFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === 'archive') continue;
      found.push(...collectSpecFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && /^SPEC-.*\.md$/.test(entry.name) && !entry.name.endsWith('.tests.json')) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found.sort();
}

/** id (uppercased) → { file, version } for every active-tree spec item. */
function indexVersions(specsDir) {
  const index = new Map();
  for (const file of collectSpecFiles(specsDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const id = getField(content, 'id');
    if (!id) continue;
    index.set(id.toUpperCase(), { file, version: getField(content, 'version') ?? '' });
  }
  return index;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function resolveTargets(args, cwd) {
  if (args.includes('--all')) {
    const root = findSddRoot(cwd);
    if (!root) fail(`--all: no .sdd/ found above ${cwd}`);
    return collectSpecFiles(path.join(root, '.sdd', 'specs'));
  }
  if (args.length === 0) fail('no files given (or use --all)');
  return args.map((f) => path.resolve(cwd, f)).sort();
}

function fail(msg) {
  process.stderr.write(`stamp: ${msg}\n`);
  process.exit(2);
}

function cmdVersion(files) {
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const id = getField(content, 'id') ?? path.basename(file);
    const current = getField(content, 'version') ?? '(none)';
    // The hash strips every version line, so the stored value never feeds
    // into its own recomputation — compute straight from the content.
    const hash = strippedHash(content);
    if (current === hash) continue;
    fs.writeFileSync(file, setVersion(content, hash));
    process.stdout.write(`${id} ${current} → ${hash}\n`);
  }
}

function cmdContract(files) {
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const id = getField(content, 'id');
    if (!id) fail(`${file}: no id field`);
    const entries = parseSynced(content);
    if (entries === null || getField(content, 'contract-consumer') === null) {
      fail(`${file}: not a contract item (needs contract-consumer and contract-synced)`);
    }

    const root = findSddRoot(path.dirname(file));
    if (!root) fail(`${file}: no .sdd/ found above the file`);
    const index = indexVersions(path.join(root, '.sdd', 'specs'));

    const malformed = entries.filter((e) => e.item === null).map((e) => e.raw);
    if (malformed.length > 0) fail(`${file}: malformed contract-synced entries: ${malformed.join(', ')}`);

    const kept = entries.filter((e) => e.item.toUpperCase() !== id.toUpperCase());
    const dropped = entries.length - kept.length;
    const unresolved = kept.filter((e) => !index.has(e.item.toUpperCase())).map((e) => e.item);
    if (unresolved.length > 0) fail(`${file}: cannot resolve endpoint item(s): ${unresolved.join(', ')} — nothing written`);
    if (kept.length === 0) fail(`${file}: no usable endpoint entries after removing self-stamps — a binding needs at least one other endpoint`);

    const restamped = kept.map((e) => ({ item: e.item, stamp: index.get(e.item.toUpperCase()).version }));
    content = setSynced(content, restamped);
    content = setVersion(content, strippedHash(content));
    fs.writeFileSync(file, content);
    if (dropped > 0) process.stdout.write(`${id}: removed ${dropped} self-stamp(s) (can never converge)\n`);
    process.stdout.write(`${id}: stamped ${restamped.map((e) => `${e.item}@${e.stamp}`).join(', ')}\n`);
  }
}

function cmdCheck(files) {
  let ok = true;
  let index = null;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const id = getField(content, 'id') ?? path.basename(file);
    const stored = getField(content, 'version');
    if (stored !== null) {
      const stripHash = strippedHash(content);
      const legacyHash = wholeFileHash(content);
      if (stored !== stripHash && stored !== legacyHash) {
        process.stdout.write(`${id}: version ${stored} matches neither convention (expected ${stripHash})\n`);
        ok = false;
      }
    }
    const entries = parseSynced(content);
    if (entries !== null) {
      if (index === null) {
        const root = findSddRoot(path.dirname(file));
        if (!root) fail(`${file}: no .sdd/ found above the file`);
        index = indexVersions(path.join(root, '.sdd', 'specs'));
      }
      for (const e of entries) {
        if (e.item === null) {
          process.stdout.write(`${id}: malformed stamp '${e.raw}'\n`);
          ok = false;
          continue;
        }
        if (e.item.toUpperCase() === id.toUpperCase()) {
          process.stdout.write(`${id}: self-stamp ${e.raw} (can never converge — remove it)\n`);
          ok = false;
          continue;
        }
        const target = index.get(e.item.toUpperCase());
        if (!target) {
          process.stdout.write(`${id}: stamp references unknown item ${e.item}\n`);
          ok = false;
        } else if (target.version.toLowerCase() !== e.stamp.toLowerCase()) {
          process.stdout.write(`${id}: ${e.item} drifted (stamped ${e.stamp}, current ${target.version})\n`);
          ok = false;
        }
      }
    }
  }
  process.exit(ok ? 0 : 1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const [, , command, ...rest] = process.argv;
const cwd = process.cwd();

switch (command) {
  case 'version':
    cmdVersion(resolveTargets(rest, cwd));
    break;
  case 'contract':
    cmdContract(resolveTargets(rest.filter((a) => a !== '--all'), cwd));
    break;
  case 'check':
    cmdCheck(resolveTargets(rest, cwd));
    break;
  default:
    fail('usage: stamp.js version|contract|check <file>... [--all]');
}
