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
const { findSddRoot, collectSpecFiles, frontmatterBlock, field, fieldList } = require('../cli/lib/sdd-tree.js');

function resolveProjectRoot() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  // Walk up from cwd looking for .sdd/ — the script may live in the plugin
  // cache, far away from the project it indexes.
  const fromCwd = findSddRoot(process.cwd());
  if (fromCwd) return fromCwd;
  const scriptDir = path.dirname(path.resolve(__filename));
  return path.resolve(scriptDir, '..', '..');
}

const repoRoot = resolveProjectRoot();
const specsDir = path.join(repoRoot, '.sdd', 'specs');

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
  const fm = frontmatterBlock(content);
  if (!fm) continue;
  if (field(fm, 'status') !== 'active') continue;

  const id = field(fm, 'id') || '';
  const component = field(fm, 'component') || field(fm, 'domain') || '';
  const title = parseTitle(content, id);
  // Shared list parser (one source per repeated mechanism): inline and block
  // forms, inline comments stripped — the documented templates carry them.
  const scope = (fieldList(fm, 'scope') ?? []).join(',');

  lines.push(`${id}\t${component}\t${title}\t${scope}`);
}

process.stdout.write(lines.join('\n') + (lines.length ? '\n' : ''));
