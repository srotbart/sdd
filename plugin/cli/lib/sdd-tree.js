/**
 * sdd-tree.js — shared helpers for the artifact CLI (sdd.js) and the legacy
 * scripts that will fold into it (plugin/scripts/spec-index.js, stamp.js).
 * One source for the spec-tree walk, project-root resolution, and
 * frontmatter access, per the one-source-per-mechanism standard.
 */

const fs = require('fs');
const path = require('path');

/** Nearest ancestor of startDir containing `.sdd/`, or null. */
function findSddRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.sdd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Recursively collect `SPEC-*.md` files under dir, skipping `archive/` at any
 * depth. Sorted for determinism. Unreadable directories yield no entries —
 * the walk tolerates absent optional trees; callers that need a hard error
 * check existence up front.
 */
function collectSpecFiles(dir) {
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
      if (entry.name === 'archive') continue;
      found.push(...collectSpecFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && /^SPEC-.*\.md$/.test(entry.name)) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found.sort();
}

/**
 * The frontmatter block's inner text (between the opening `---` line and the
 * closing `---` line, both at line start), or null when the file has no
 * frontmatter. Field lookups MUST be scoped to this block — spec item bodies
 * legitimately quote frontmatter examples (fenced schema snippets) that must
 * never be read or rewritten.
 */
function frontmatterBlock(content) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  return m ? m[1] : null;
}

/** A single-line frontmatter field value, inline `# comment` stripped. */
function field(fm, name) {
  if (fm === null) return null;
  // `[ \t]*`, not `\s*`: with the `m` flag `\s` crosses the newline, so an
  // empty `name:` line would capture the NEXT frontmatter line as its value.
  const m = fm.match(new RegExp(`^${name}:[ \\t]*(.+)$`, 'm'));
  if (!m) return null;
  return m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
}

/**
 * A frontmatter list value: inline `key: [a, b]` or a block of `- entry`
 * lines under a bare `key:` line. Inline `# comment`s and surrounding quotes
 * are stripped per entry; a scalar value reads as a one-entry list (some
 * fields, e.g. `gap-id`, accept either form). Returns null when the key is
 * absent. A flow list without its closing `]` on the same line (wrapped or
 * unterminated) reads as empty — fail closed, this helper is line-oriented.
 */
function fieldList(fm, name) {
  if (fm === null) return null;
  const clean = (s) => s.replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
  const lines = fm.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = new RegExp(`^${name}:[ \\t]*(.*)$`).exec(lines[i]);
    if (!m) continue;
    const val = clean(m[1]);
    if (val.startsWith('[') && val.endsWith(']')) {
      return val.slice(1, -1).split(',').map(clean).filter(Boolean);
    }
    if (val.startsWith('[')) return [];
    if (val !== '') return [val];
    const entries = [];
    for (let j = i + 1; j < lines.length; j++) {
      const item = /^\s*-\s*(.+)$/.exec(lines[j]);
      if (!item) break;
      const entry = clean(item[1]);
      if (entry) entries.push(entry);
    }
    return entries;
  }
  return null;
}

module.exports = { findSddRoot, collectSpecFiles, frontmatterBlock, field, fieldList };
