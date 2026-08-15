#!/usr/bin/env node
/**
 * spec-index.js
 *
 * Builds the SDD spec index mechanically: globs the active spec
 * corpus and prints one tab-separated line per active item to stdout:
 *
 *   {id}\t{component}\t{title}\t{scope globs, comma-separated or empty}
 *
 * The index is ephemeral — it is built on the fly and never committed. Agents
 * never assemble it by hand; determinism is the point. `sdd:close-domain` runs
 * this at Phase 0 (orient) and re-runs it at Phase 4 (guardian audit) so mid-run
 * spec changes are covered by regeneration rather than cache invalidation.
 *
 * Rules:
 *   - Walks the component tree under `.sdd/specs/` to any depth.
 *   - Skips `archive/` at every level.
 *   - Excludes items whose `status:` is not `active`.
 *   - The second column is the item's `component:` path (legacy `domain:`
 *     frontmatter is read as a one-level component path).
 *   - The item's title (first heading, minus the `SPEC-... —` prefix) is its
 *     one-line description; there is no separate summary field.
 *   - Scope globs (optional `scope:` frontmatter) are emitted in the
 *     4th column, comma-separated, or an empty field when absent.
 *
 * Usage: node spec-index.js [project-root]
 *   The project root defaults to the nearest ancestor of the current working
 *   directory containing `.sdd/` (so the script works when run from the
 *   installed plugin cache), falling back to the script's own repo layout.
 */

const fs = require('fs');
const path = require('path');

function resolveProjectRoot() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  // Walk up from cwd looking for .sdd/ — the script may live in the plugin
  // cache, far away from the project it indexes.
  let dir = process.cwd();
  for (;;) {
    if (fs.existsSync(path.join(dir, '.sdd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const scriptDir = path.dirname(path.resolve(__filename));
  return path.resolve(scriptDir, '..', '..');
}

const repoRoot = resolveProjectRoot();
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
  if (!m) return null;
  // Strip inline comments — the artifact templates show them on these fields
  // ("status: active        # active | deprecated | aliased").
  return m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
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
  const component = field(fm, 'component') || field(fm, 'domain') || '';
  const title = parseTitle(content, id);
  const scope = parseScope(fm).join(',');

  lines.push(`${id}\t${component}\t${title}\t${scope}`);
}

process.stdout.write(lines.join('\n') + (lines.length ? '\n' : ''));
