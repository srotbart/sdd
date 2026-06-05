#!/usr/bin/env node
/**
 * gen-sdd-help-skills.js
 *
 * Reads SKILL.md frontmatter (name, description) from every skill under
 * plugin/skills/ and outputs a "## All Skills" section suitable for
 * plugin/skills/sdd-help/SKILL.md.
 *
 * Usage:
 *   node plugin/scripts/gen-sdd-help-skills.js           # print section to stdout
 *   node plugin/scripts/gen-sdd-help-skills.js --update  # update sdd-help/SKILL.md in place
 *
 * Single source of truth: each skill's SKILL.md frontmatter `description` field.
 * Line-ending-agnostic: reads files with .replace(/\r\n/g, '\n').
 */

const fs = require('fs');
const path = require('path');

const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const skillsDir = path.join(repoRoot, 'plugin', 'skills');
const sddHelpPath = path.join(skillsDir, 'sdd-help', 'SKILL.md');

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
 * Extract a concise help blurb from a skill description.
 * Strips lengthy trigger-phrase prefixes and trims to a useful one-liner.
 */
function extractBlurb(desc) {
  if (!desc) return '';
  // Remove trigger-phrase prefix like "This skill should be used when the user invokes `/sdd:X`,"
  let blurb = desc
    .replace(/^This skill should be used when the user invokes `[^`]+`,\s*/i, '')
    .replace(/^This skill should be used when the user\s*/i, '')
    .replace(/^Use when the user invokes `[^`]+`,\s*/i, '')
    .replace(/^Use when the user\s*/i, '');
  // Trim to first sentence
  const sentenceEnd = blurb.search(/(?<=[^`])\. /);
  if (sentenceEnd > 0) {
    blurb = blurb.slice(0, sentenceEnd + 1);
  }
  blurb = blurb.replace(/\.$/, '').trim();
  return blurb;
}

// Collect all skills, sorted alphabetically
const skillDirs = fs.readdirSync(skillsDir)
  .filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
  .sort();

const skills = [];

for (const dir of skillDirs) {
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
    blurb: extractBlurb(fm.description),
  });
}

/**
 * Build the "## All Skills" section content (without the heading itself,
 * so the update regex can replace just the block).
 */
function buildSkillsBlock(skills) {
  const lines = [];
  for (const s of skills) {
    // Skip sdd-help itself (self-referential; it is already the help skill)
    // Keep it — users need to know it exists
    const displayName = s.name
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    lines.push(`### \`${s.invoke}\` — ${displayName}`);
    lines.push(s.blurb || '(no description)');
    lines.push('');
  }
  // Remove trailing blank line
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}

const block = buildSkillsBlock(skills);
const section = `## All Skills\n\n${block}\n`;

if (!UPDATE_FLAG) {
  console.log(section);
  process.exit(0);
}

// Update sdd-help/SKILL.md in place
if (!fs.existsSync(sddHelpPath)) {
  console.error(`ERROR: sdd-help/SKILL.md not found at ${sddHelpPath}`);
  process.exit(1);
}

let content = fs.readFileSync(sddHelpPath, 'utf8').replace(/\r\n/g, '\n');

// Replace existing "## All Skills" section, or append if absent
const allSkillsPattern = /## All Skills\n[\s\S]*?(?=\n## |\n---\s*$|$)/;

if (allSkillsPattern.test(content)) {
  content = content.replace(allSkillsPattern, section.trimEnd());
} else {
  // Append before the Schema Reference section, or at end
  const schemaRefIdx = content.indexOf('\n## Schema Reference');
  if (schemaRefIdx !== -1) {
    content = content.slice(0, schemaRefIdx) + '\n\n' + section.trimEnd() + content.slice(schemaRefIdx);
  } else {
    content = content.trimEnd() + '\n\n' + section.trimEnd() + '\n';
  }
}

fs.writeFileSync(sddHelpPath, content);
console.log(`sdd-help/SKILL.md updated with ${skills.length} skill(s).`);
