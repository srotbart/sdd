#!/usr/bin/env node
/**
 * spec-index.js
 *
 * Builds the SDD spec index mechanically (SPEC-wf-039): globs the active spec
 * corpus and prints one tab-separated line per active item to stdout:
 *
 *   {id}\t{domain}\t{title}\t{scope globs, comma-separated or empty}
 *
 * The index is ephemeral — it is built on the fly and never committed. Agents
 * never assemble it by hand; determinism is the point. `sdd:close-domain` runs
 * this at Phase 0 (orient) and re-runs it at Phase 4 (guardian audit) so mid-run
 * spec changes are covered by regeneration rather than cache invalidation.
 *
 * Rules (SPEC-wf-039):
 *   - Globs SPEC-*.md one and two levels under `.sdd/specs/{domain}/`.
 *   - Skips `archive/` at either level.
 *   - Excludes items whose `status:` is not `active`.
 *   - The item's title (first heading, minus the `SPEC-... —` prefix) is its
 *     one-line description; there is no separate summary field.
 *   - Scope globs (optional `scope:` frontmatter, SPEC-wf-042) are emitted in the
 *     4th column, comma-separated, or an empty field when absent.
 *
 * Usage: node plugin/scripts/spec-index.js
 */

const fs = require('fs');
const path = require('path');

const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const specsDir = path.join(repoRoot, '.sdd', 'specs');

// ─── Collect active spec files ────────────────────────────────────────────────

/**
 * Recursively walk a directory collecting `SPEC-*.md` files, skipping any
 * `archive/` directory at any depth.
 */
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
  return found;
}

// ─── Parse a spec item ────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function field(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Parse the optional `scope:` list. Supports the inline form
 * `scope: [glob1, glob2]` and a multi-line block of `- glob` entries.
 * Returns an array of globs (possibly empty).
 */
function parseScope(fm) {
  const inline = fm.match(/^scope:\s*\[([^\]]*)\]\s*$/m);
  if (inline) {
    return inline[1]
      .split(',')
      .map((g) => g.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  const block = fm.match(/^scope:\s*\n((?:\s*-\s*.+\n?)+)/m);
  if (block) {
    return block[1]
      .split('\n')
      .map((line) => line.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

/**
 * Extract the one-line title: the first `#` heading with the leading `# ` and any
 * `SPEC-... —` / `SPEC-... -` id prefix stripped.
 */
function parseTitle(content, id) {
  const m = content.match(/^#\s+(.+?)\s*$/m);
  if (!m) return '';
  let title = m[1].trim();
  const prefix = new RegExp(`^${id}\\s*[—:-]\\s*`);
  title = title.replace(prefix, '');
  return title.trim();
}

// ─── Build the index ──────────────────────────────────────────────────────────

const files = collectSpecFiles(specsDir).sort();
const lines = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const fm = parseFrontmatter(content);
  if (!fm) continue;
  if (field(fm, 'status') !== 'active') continue;

  const id = field(fm, 'id') || '';
  const domain = field(fm, 'domain') || '';
  const title = parseTitle(content, id);
  const scope = parseScope(fm).join(',');

  lines.push(`${id}\t${domain}\t${title}\t${scope}`);
}

process.stdout.write(lines.join('\n') + (lines.length ? '\n' : ''));
