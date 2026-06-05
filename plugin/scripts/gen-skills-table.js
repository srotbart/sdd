#!/usr/bin/env node
/**
 * gen-skills-table.js
 *
 * Reads SKILL.md frontmatter (name, description) from every skill under
 * plugin/skills/ and outputs a Markdown table suitable for the README's
 * "## Skills" section.
 *
 * Usage:
 *   node plugin/scripts/gen-skills-table.js           # print table to stdout
 *   node plugin/scripts/gen-skills-table.js --update  # update README.md in place
 */

const fs = require('fs');
const path = require('path');

// Find the repo root
const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const skillsDir = path.join(repoRoot, 'plugin', 'skills');
const readmePath = path.join(repoRoot, 'README.md');

const UPDATE_FLAG = process.argv.includes('--update');

/**
 * Parse YAML-like frontmatter from a SKILL.md file.
 * Only extracts 'name' and 'description' fields.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = match[1];

  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
  };
}

/**
 * Shorten a description to a useful one-liner for the table.
 * Strips the trigger phrase prefix (e.g. "This skill should be used when ...").
 */
function shortenDescription(desc) {
  if (!desc) return '';
  // Remove the "This skill should be used when the user invokes `/sdd:X`," prefix
  let short = desc
    .replace(/^This skill should be used when the user invokes `[^`]+`,\s*/i, '')
    .replace(/^This skill should be used when the user\s*/i, '');
  // Trim to first sentence (up to first period that isn't inside backticks)
  const sentenceEnd = short.search(/(?<=[^`])\. /);
  if (sentenceEnd > 0) {
    short = short.slice(0, sentenceEnd + 1);
  }
  // Remove trailing period
  short = short.replace(/\.$/, '').trim();
  return short;
}

// Collect all skills
const skillDirs = fs.readdirSync(skillsDir).filter(d => {
  const p = path.join(skillsDir, d);
  return fs.statSync(p).isDirectory();
});

const skills = [];

for (const dir of skillDirs.sort()) {
  const skillFile = path.join(skillsDir, dir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    console.warn(`WARN: No SKILL.md found in ${dir}/`);
    continue;
  }
  const content = fs.readFileSync(skillFile, 'utf8').replace(/\r\n/g, '\n');
  const fm = parseFrontmatter(content);
  if (!fm || !fm.name) {
    console.warn(`WARN: Could not parse frontmatter from ${dir}/SKILL.md`);
    continue;
  }
  skills.push({
    dir,
    name: fm.name,
    invoke: `/sdd:${fm.name}`,
    description: shortenDescription(fm.description),
  });
}

// Build the table
function buildTable(skills) {
  const lines = [
    '| Skill | Invoke | Purpose |',
    '|---|---|---|',
  ];
  for (const s of skills) {
    // Convert skill name to display name (title-case words)
    const displayName = s.name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    lines.push(`| ${displayName} | \`${s.invoke}\` | ${s.description} |`);
  }
  return lines.join('\n');
}

const table = buildTable(skills);

if (!UPDATE_FLAG) {
  console.log(table);
  process.exit(0);
}

// Update README.md in place
if (!fs.existsSync(readmePath)) {
  console.error(`ERROR: README.md not found at ${readmePath}`);
  process.exit(1);
}

let readme = fs.readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n');

// Find the "## Skills" section and replace the table within it
// The table runs from the first | after "## Skills" to the first blank line after the table
const skillsSectionPattern = /(## Skills\n\n)\|[\s\S]*?\|\n(?=\n)/;
if (!skillsSectionPattern.test(readme)) {
  console.error('ERROR: Could not find the "## Skills" table in README.md');
  console.error('Expected a markdown table immediately after "## Skills\\n\\n"');
  process.exit(1);
}

readme = readme.replace(skillsSectionPattern, `$1${table}\n`);
fs.writeFileSync(readmePath, readme);
console.log(`README.md updated with ${skills.length} skill(s).`);
console.log(table);
