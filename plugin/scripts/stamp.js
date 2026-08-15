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
 *     `grep -v "^version:" f | shasum -a 256 | cut -c1-8`, including grep's
 *     newline-termination of the final line). Writes only when the stored
 *     value differs; inserts the field before the closing frontmatter
 *     delimiter when absent. Prints one line per change: `id old → new`.
 *
 *   node stamp.js contract <file>...
 *     Re-stamp a contract item's `contract-synced` entries. For each
 *     endpoint: the endpoint's own `version:` is recomputed first (and
 *     rewritten if stale or missing — reported), then stamped — so stamps
 *     are always current-content hashes, independent of stale stored values.
 *     Self-stamps (the contract referencing itself) are removed: they can
 *     never converge. Multi-line `contract-synced` flow lists are read whole
 *     and rewritten single-line. Unresolvable entry IDs are a hard error —
 *     nothing is written. Does not accept --all: re-stamping records a
 *     verification, which is per-contract and deliberate.
 *     ONLY run this after re-verifying the contract against both sides.
 *
 *   node stamp.js check <file>... | --all
 *     Verify without writing: every `version:` against the canonical
 *     strip-line hash, and every binding stamp against its endpoint's
 *     current stored version (plus self-stamp and malformed-entry
 *     detection). Exit 0 clean, 1 on any mismatch. Note: hashes written
 *     under the retired whole-file convention cannot be verified post-hoc
 *     (the stored hash is part of what would be hashed) — on such projects
 *     expect widespread mismatches; restamping them is a deliberate,
 *     one-time `version --all` decision, never an automatic fix, because it
 *     flips open gaps to stale.
 *
 * The project root is the nearest ancestor of each file (or of the cwd for
 * --all) containing `.sdd/`. Exit codes: 0 success, 1 check-mismatch,
 * 2 usage/resolution error.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function fail(msg) {
  process.stderr.write(`stamp: ${msg}\n`);
  process.exit(2);
}

function readFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    fail(`${file}: ${e.code === 'ENOENT' ? 'no such file' : e.message}`);
  }
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

/**
 * SHA-256[:8] of content with every `version:` line removed — byte-identical
 * to `grep -v "^version:" f | shasum -a 256 | cut -c1-8`. grep newline-
 * terminates its final output line even when the input lacks a trailing
 * newline, so the stripped content is normalized the same way.
 */
function strippedHash(content) {
  let stripped = content
    .split('\n')
    .filter((line) => !line.startsWith('version:'))
    .join('\n');
  if (!stripped.endsWith('\n')) stripped += '\n';
  return crypto.createHash('sha256').update(stripped).digest('hex').slice(0, 8);
}

// ─── Frontmatter helpers (line-oriented; writes preserve everything else) ─────

function getField(content, name) {
  const m = content.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  if (!m) return null;
  return m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
}

function setVersion(file, content, hash) {
  if (/^version:.*$/m.test(content)) {
    return content.replace(/^version:.*$/m, `version: "${hash}"`);
  }
  // No version line yet: insert before the closing frontmatter delimiter
  // (the second `---` line). CRLF-tolerant; a file without frontmatter is an
  // error, never a silent no-op.
  const lines = content.split('\n');
  const isDelim = (l) => /^---\r?$/.test(l);
  if (!isDelim(lines[0])) fail(`${file}: no frontmatter block to stamp`);
  const close = lines.findIndex((l, i) => i > 0 && isDelim(l));
  if (close === -1) fail(`${file}: unterminated frontmatter block`);
  lines.splice(close, 0, `version: "${hash}"`);
  return lines.join('\n');
}

/**
 * The raw `contract-synced` flow list, matched across wrapped lines so a
 * multi-line list is read whole and can be rewritten in place. Returns
 * { match, inner } or null when the field is absent. An opening `[` with no
 * closing `]` is a hard error — partial parses corrupt files.
 */
function matchSynced(file, content) {
  const open = content.match(/^contract-synced:\s*/m);
  if (!open) return null;
  const m = content.match(/^contract-synced:[ \t]*\[([^\]]*)\]/m);
  if (!m) fail(`${file}: contract-synced must be a [...] flow list (closing ']' not found)`);
  return { match: m[0], inner: m[1] };
}

function parseSynced(file, content) {
  const raw = matchSynced(file, content);
  if (raw === null) return null;
  const entries = [];
  for (const part of raw.inner.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = /^([A-Za-z0-9-]+)@([0-9a-fA-F]+)$/.exec(trimmed);
    entries.push(m ? { item: m[1], stamp: m[2], raw: trimmed } : { item: null, stamp: null, raw: trimmed });
  }
  return entries;
}

function setSynced(file, content, entries) {
  const raw = matchSynced(file, content);
  const rendered = `contract-synced: [${entries.map((e) => `${e.item}@${e.stamp}`).join(', ')}]`;
  return content.replace(raw.match, rendered);
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
    } else if (entry.isFile() && /^SPEC-.*\.md$/.test(entry.name)) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found.sort();
}

/** id (uppercased) → { file } for every active-tree spec item, per project root. */
const indexCache = new Map();
function indexItems(root) {
  if (indexCache.has(root)) return indexCache.get(root);
  const index = new Map();
  for (const file of collectSpecFiles(path.join(root, '.sdd', 'specs'))) {
    const content = fs.readFileSync(file, 'utf8');
    const id = getField(content, 'id');
    if (!id) continue;
    index.set(id.toUpperCase(), { file });
  }
  indexCache.set(root, index);
  return index;
}

function rootFor(file) {
  const root = findSddRoot(path.dirname(file));
  if (!root) fail(`${file}: no .sdd/ found above the file`);
  return root;
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

/** Recompute and (when needed) rewrite one file's version. Returns the hash. */
function restampVersion(file, report) {
  const content = readFile(file);
  const id = getField(content, 'id') ?? path.basename(file);
  const current = getField(content, 'version');
  // The hash strips every version line, so the stored value never feeds into
  // its own recomputation.
  const hash = strippedHash(content);
  if (current !== hash) {
    fs.writeFileSync(file, setVersion(file, content, hash));
    if (report) process.stdout.write(`${id} ${current ?? '(none)'} → ${hash}\n`);
  }
  return hash;
}

function cmdVersion(files) {
  for (const file of files) restampVersion(file, true);
}

function cmdContract(files) {
  for (const file of files) {
    let content = readFile(file);
    const id = getField(content, 'id');
    if (!id) fail(`${file}: no id field`);
    const entries = parseSynced(file, content);
    if (entries === null || getField(content, 'contract-consumer') === null) {
      fail(`${file}: not a contract item (needs contract-consumer and contract-synced)`);
    }

    const index = indexItems(rootFor(file));

    const malformed = entries.filter((e) => e.item === null).map((e) => e.raw);
    if (malformed.length > 0) fail(`${file}: malformed contract-synced entries: ${malformed.join(', ')}`);

    const kept = entries.filter((e) => e.item.toUpperCase() !== id.toUpperCase());
    const dropped = entries.length - kept.length;
    const unresolved = kept.filter((e) => !index.has(e.item.toUpperCase())).map((e) => e.item);
    if (unresolved.length > 0) fail(`${file}: cannot resolve endpoint item(s): ${unresolved.join(', ')} — nothing written`);
    if (kept.length === 0) fail(`${file}: no usable endpoint entries after removing self-stamps — a binding needs at least one other endpoint`);

    // Endpoints are restamped from current content first, so the stamp never
    // bakes in a stale or missing stored version.
    const restamped = kept.map((e) => ({
      item: e.item,
      stamp: restampVersion(index.get(e.item.toUpperCase()).file, true),
    }));

    content = setSynced(file, content, restamped);
    content = setVersion(file, content, strippedHash(content));
    fs.writeFileSync(file, content);
    if (dropped > 0) process.stdout.write(`${id}: removed ${dropped} self-stamp(s) (can never converge)\n`);
    process.stdout.write(`${id}: stamped ${restamped.map((e) => `${e.item}@${e.stamp}`).join(', ')}\n`);
  }
}

function cmdCheck(files) {
  let ok = true;
  for (const file of files) {
    const content = readFile(file);
    const id = getField(content, 'id') ?? path.basename(file);
    const stored = getField(content, 'version');
    if (stored !== null && stored !== strippedHash(content)) {
      process.stdout.write(`${id}: version ${stored} does not match content (expected ${strippedHash(content)})\n`);
      ok = false;
    }
    const entries = parseSynced(file, content);
    if (entries !== null) {
      // Stamps resolve against the file's own project tree — files from
      // different projects in one invocation each get their own index.
      const index = indexItems(rootFor(file));
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
          continue;
        }
        const targetVersion = getField(fs.readFileSync(target.file, 'utf8'), 'version') ?? '';
        if (targetVersion.toLowerCase() !== e.stamp.toLowerCase()) {
          process.stdout.write(`${id}: ${e.item} drifted (stamped ${e.stamp}, current ${targetVersion})\n`);
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
    if (rest.includes('--all')) {
      fail('contract does not support --all — re-stamping records a per-contract verification; name the contract file(s)');
    }
    cmdContract(resolveTargets(rest, cwd));
    break;
  case 'check':
    cmdCheck(resolveTargets(rest, cwd));
    break;
  default:
    fail('usage: stamp.js version|contract|check <file>... [--all]');
}
