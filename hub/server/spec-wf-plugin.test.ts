import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// These tests assert that committed plugin artifacts (SKILL.md files and the
// statusline shell script) actually contain the content the workflow spec items
// claim. They read the real files under plugin/ — they do not exercise runtime
// agent behavior. Each `it` is named with the spec id it covers.

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, "..", "..");
const PLUGIN = path.join(REPO_ROOT, "plugin");
const SKILLS = path.join(PLUGIN, "skills");

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

const PIPELINE_SKILLS = [
  "session-start",
  "target-engage",
  "spec-audit",
  "gap-to-work-items",
  "work-item-close",
  "spec-test",
];

describe("SPEC-wf-002: spawn-sdd-worker creates a persistent sdd-worker agent", () => {
  const skill = read("plugin/skills/spawn-sdd-worker/SKILL.md");

  it("SPEC-wf-002: the spawn-sdd-worker SKILL.md exists in the plugin", () => {
    expect(fs.existsSync(path.join(SKILLS, "spawn-sdd-worker", "SKILL.md"))).toBe(true);
  });

  it("SPEC-wf-002: spawns an agent named sdd-worker", () => {
    expect(skill).toMatch(/name['"`:\s]+["`']?sdd-worker/);
  });

  it("SPEC-wf-002: the worker prompt sequences spec-audit then gap-to-work-items then work-item-close", () => {
    const auditAt = skill.indexOf("sdd:spec-audit");
    const decomposeAt = skill.indexOf("sdd:gap-to-work-items");
    const closeAt = skill.indexOf("sdd:work-item-close");
    expect(auditAt).toBeGreaterThanOrEqual(0);
    expect(decomposeAt).toBeGreaterThan(auditAt);
    expect(closeAt).toBeGreaterThan(decomposeAt);
  });

  it("SPEC-wf-002: documents reuse via SendMessage for additional domains without re-spawning", () => {
    expect(skill).toMatch(/SendMessage/);
    expect(skill.toLowerCase()).toMatch(/additional domain/);
  });
});

describe("SPEC-wf-003: session-start footer references sdd-worker for execution work", () => {
  const skill = read("plugin/skills/session-start/SKILL.md");

  it("SPEC-wf-003: open-gaps footer suggests /sdd:spawn-sdd-worker, not /sdd:spec-audit", () => {
    const openGapsRow = skill
      .split("\n")
      .find((l) => /open gaps/i.test(l) && l.includes("|"));
    expect(openGapsRow).toBeDefined();
    expect(openGapsRow!).toMatch(/spawn-sdd-worker/);
    expect(openGapsRow!).not.toMatch(/\/sdd:spec-audit/);
  });

  it("SPEC-wf-003: pending/blocked work-items footer suggests /sdd:spawn-sdd-worker, not /sdd:work-item-close", () => {
    const wiRow = skill
      .split("\n")
      .find((l) => /work items pending\/blocked/i.test(l) && l.includes("|"));
    expect(wiRow).toBeDefined();
    expect(wiRow!).toMatch(/spawn-sdd-worker/);
    expect(wiRow!).not.toMatch(/\/sdd:work-item-close/);
  });

  it("SPEC-wf-003: when a worker is already running, footer instructs SendMessage to the existing worker", () => {
    const activeRow = skill
      .split("\n")
      .find((l) => /worker already running|worker is running/i.test(l) && l.includes("|"));
    expect(activeRow).toBeDefined();
    expect(activeRow!).toMatch(/SendMessage/);
    expect(activeRow!).toMatch(/sdd-worker/);
  });
});

describe("SPEC-wf-004: sdd-init describes the two-phase workflow", () => {
  const skill = read("plugin/skills/sdd-init/SKILL.md");

  it("SPEC-wf-004: contains a Two-phase workflow section", () => {
    expect(skill).toMatch(/##\s*Two-phase workflow/i);
  });

  it("SPEC-wf-004: names /sdd:target-engage as the intent-phase skill", () => {
    const intentIdx = skill.toLowerCase().indexOf("intent phase");
    const execIdx = skill.toLowerCase().indexOf("execution phase");
    expect(intentIdx).toBeGreaterThanOrEqual(0);
    const intentSection = skill.slice(intentIdx, execIdx > intentIdx ? execIdx : undefined);
    expect(intentSection).toMatch(/target-engage/);
  });

  it("SPEC-wf-004: names /sdd:spawn-sdd-worker as the execution-phase skill", () => {
    const execIdx = skill.toLowerCase().indexOf("execution phase");
    expect(execIdx).toBeGreaterThanOrEqual(0);
    const execSection = skill.slice(execIdx);
    expect(execSection).toMatch(/spawn-sdd-worker/);
  });
});

describe("SPEC-wf-005: sdd-worker is spawned via the Agent tool with no team setup step", () => {
  const skill = read("plugin/skills/spawn-sdd-worker/SKILL.md");

  it("SPEC-wf-005: does not invoke TeamCreate", () => {
    // The removed TeamCreate tool must not be called (prose may reference its removal).
    expect(skill).not.toMatch(/TeamCreate\s*\(/);
  });

  it("SPEC-wf-005: does not invoke TeamDelete", () => {
    expect(skill).not.toMatch(/TeamDelete\s*\(/);
  });

  it("SPEC-wf-005: the Agent spawn parameters do not include team_name", () => {
    // No `team_name` bullet in the spawn parameter list.
    expect(skill).not.toMatch(/^\s*-\s*`team_name`/m);
  });

  it("SPEC-wf-005: documents that team setup and cleanup are automatic", () => {
    expect(skill).toMatch(/No team setup step is required/);
    expect(skill.toLowerCase()).toMatch(/automatically when the session exits/);
  });
});

describe("SPEC-wf-006: sdd-worker prompt defines role, responsibilities, and gap reporting", () => {
  const skill = read("plugin/skills/spawn-sdd-worker/SKILL.md");

  it("SPEC-wf-006: prompt opens with an explicit execution-agent role declaration", () => {
    expect(skill).toMatch(/You are sdd-worker, an autonomous SDD execution agent/);
  });

  it("SPEC-wf-006: prompt prohibits the intent-phase skills session-start and target-engage", () => {
    expect(skill).toMatch(/sdd:session-start/);
    expect(skill).toMatch(/sdd:target-engage/);
    expect(skill.toLowerCase()).toMatch(/never (engage targets|invoke intent-phase)/);
  });

  it("SPEC-wf-006: prompt instructs a 'nothing to do' message when no gaps are found", () => {
    expect(skill.toLowerCase()).toMatch(/nothing to do/);
  });

  it("SPEC-wf-006: prompt instructs sending the gap report to the team lead after the audit", () => {
    expect(skill.toLowerCase()).toMatch(/listing every gap\s+found/);
  });
});

// SPEC-wf-007 (spawn-sdd-worker derives a unique team name from the project root) was
// deprecated by TGT-117 and archived: as of Claude Code v2.1.178 TeamCreate was removed
// and team_name is ignored, so no team name is derived. Spawn behavior is covered by
// SPEC-wf-005 above.

describe("SPEC-wf-008: every pipeline skill output ends with a concrete next-step footer", () => {
  for (const name of PIPELINE_SKILLS) {
    it(`SPEC-wf-008: ${name} contains a '---' divider and a 'Next:' footer line`, () => {
      const skill = read(`plugin/skills/${name}/SKILL.md`);
      expect(skill).toMatch(/Next:/);
      // A horizontal-rule divider precedes the footer guidance.
      expect(skill).toMatch(/\n---\n/);
    });
  }

  it("SPEC-wf-008: spec-audit footer routes to gap-to-work-items when gaps are found", () => {
    const skill = read("plugin/skills/spec-audit/SKILL.md");
    const nextLine = skill.split("\n").find((l) => l.startsWith("Next:"));
    expect(nextLine).toBeDefined();
    expect(nextLine!).toMatch(/gap-to-work-items/);
  });

  it("SPEC-wf-008: spawn-sdd-worker footer reads 'Worker running. You will be notified on completion.'", () => {
    const skill = read("plugin/skills/spawn-sdd-worker/SKILL.md");
    expect(skill).toMatch(/Worker running\. You will be notified on completion\./);
  });
});

describe("SPEC-wf-009: install-statusline appends SDD delegation to the global statusline script", () => {
  const skill = read("plugin/skills/install-statusline/SKILL.md");

  it("SPEC-wf-009: the install-statusline SKILL.md exists", () => {
    expect(fs.existsSync(path.join(SKILLS, "install-statusline", "SKILL.md"))).toBe(true);
  });

  it("SPEC-wf-009: reads ~/.claude/settings.json and extracts statusLine.command", () => {
    expect(skill).toMatch(/~\/\.claude\/settings\.json/);
    expect(skill).toMatch(/statusLine\.command/);
  });

  it("SPEC-wf-009: is idempotent on the presence of plugins/cache/sdd", () => {
    expect(skill).toMatch(/plugins\/cache\/sdd/);
    expect(skill.toLowerCase()).toMatch(/already installed|nothing to do/);
  });

  it("SPEC-wf-009: never writes to a settings.json file (only appends to the script)", () => {
    // The skill documents appending to the script file, never editing settings.json.
    expect(skill).toMatch(/Append the following block verbatim to the end of the script/);
    expect(skill).not.toMatch(/(write|append|edit).{0,20}settings\.json/i);
  });

  it("SPEC-wf-009: plugin/statusline.sh exists alongside the skills", () => {
    expect(fs.existsSync(path.join(PLUGIN, "statusline.sh"))).toBe(true);
  });
});

describe("SPEC-wf-011: SDD statusline shows targets, specs, gaps, work items, color-coded hub link", () => {
  const sh = read("plugin/statusline.sh");

  it("SPEC-wf-011: renders the line in fixed order targets · specs · gaps · work items", () => {
    const printf = sh.split("\n").find((l) => l.includes("printf") && l.includes("targets"))!;
    const tIdx = printf.indexOf("targets");
    const sIdx = printf.indexOf("specs");
    const gIdx = printf.indexOf("gaps");
    const wIdx = printf.indexOf("work items");
    expect(tIdx).toBeGreaterThanOrEqual(0);
    expect(sIdx).toBeGreaterThan(tIdx);
    expect(gIdx).toBeGreaterThan(sIdx);
    expect(wIdx).toBeGreaterThan(gIdx);
  });

  it("SPEC-wf-011: emits an OSC 8 hyperlink to http://localhost:22400 labelled 'open hub'", () => {
    expect(sh).toMatch(/\]8;;http:\/\/localhost:22400/);
    expect(sh).toMatch(/open hub/);
  });

  it("SPEC-wf-011: color-codes hub health green/red/orange and caches in /tmp/.sdd-hub-status-color", () => {
    expect(sh).toMatch(/\\033\[0;32m/); // green
    expect(sh).toMatch(/\\033\[0;31m/); // red
    expect(sh).toMatch(/\\033\[38;5;208m/); // orange (256-color)
    expect(sh).toMatch(/\/tmp\/\.sdd-hub-status-color/);
  });

  it("SPEC-wf-011: hub health check uses nc -z -w 1 on ports 22400 and 22351", () => {
    expect(sh).toMatch(/nc -z -w 1 localhost 22400/);
    expect(sh).toMatch(/nc -z -w 1 localhost 22351/);
  });
});

describe("SPEC-wf-012: SDD statusline counts use direct file operations with parent-directory walk-up", () => {
  const sh = read("plugin/statusline.sh");

  it("SPEC-wf-012: walks up parent directories to find the .sdd root, stopping at /", () => {
    expect(sh).toMatch(/while \[ "\$dir" != "\/" \]/);
    expect(sh).toMatch(/dir=\$\(dirname "\$dir"\)/);
    expect(sh).toMatch(/\[ -d "\$dir\/\.sdd" \]/);
  });

  it("SPEC-wf-012: target count greps for awaiting-user markdown files", () => {
    expect(sh).toMatch(/grep -rl 'status: awaiting-user'[\s\S]*?\/\.sdd\/targets\//);
  });

  it("SPEC-wf-012: spec count uses find for SPEC-*.md excluding archive across all domains", () => {
    expect(sh).toMatch(/find "\$sdd_root\/\.sdd\/specs" -name "SPEC-\*\.md" ! -path "\*\/archive\/\*"/);
  });

  it("SPEC-wf-012: gap and work-item counts use find -maxdepth 1 in their directories", () => {
    expect(sh).toMatch(/find "\$sdd_root\/\.sdd\/gaps" -maxdepth 1 -name "\*\.md"/);
    expect(sh).toMatch(/find "\$sdd_root\/\.sdd\/work-items" -maxdepth 1 -name "\*\.md"/);
  });

  it("SPEC-wf-012: makes no Hub API call for count data (no curl/wget/localhost fetch for counts)", () => {
    expect(sh).not.toMatch(/curl/);
    expect(sh).not.toMatch(/wget/);
  });
});

describe("SPEC-wf-020: sdd:explain skill spawns a dedicated sdd-explainer agent", () => {
  const skill = read("plugin/skills/explain/SKILL.md");

  it("SPEC-wf-020: spawns sdd-explainer via the Agent tool with no team setup", () => {
    expect(skill).toMatch(/name['"`:\s]+["`']?sdd-explainer/);
    // No TeamCreate call and no team_name spawn-parameter bullet.
    expect(skill).not.toMatch(/TeamCreate\s*\(/);
    expect(skill).not.toMatch(/^\s*-\s*`team_name`/m);
  });

  it("SPEC-wf-020: pins the sonnet model for the explainer agent", () => {
    expect(skill).toMatch(/model['"`:\s]+["`']?sonnet/);
  });

  it("SPEC-wf-020: writes the projection to .sdd/projections/<subject>.md", () => {
    expect(skill).toMatch(/\.sdd\/projections\//);
  });

  it("SPEC-wf-020: agent's first action asks interactive vs non-interactive", () => {
    expect(skill.toLowerCase()).toMatch(/interactive|non-interactive/);
    expect(skill).toMatch(/Ask the user one question/);
  });

  it("SPEC-wf-020: consults .sdd/specs first as authoritative ground truth before code", () => {
    expect(skill.toLowerCase()).toMatch(/specs before code|consult `?\.sdd\/specs/);
  });
});

describe("SPEC-wf-021: sdd-worker is spawned with the sonnet model", () => {
  const skill = read("plugin/skills/spawn-sdd-worker/SKILL.md");

  it("SPEC-wf-021: lists model: \"sonnet\" in the Agent spawn parameters", () => {
    expect(skill).toMatch(/`model`:\s*`?"sonnet"`?/);
  });

  it("SPEC-wf-021: does not pin opus and explains sonnet is sufficient for the deterministic pipeline", () => {
    expect(skill).not.toMatch(/`model`:\s*`?"opus"`?/);
    expect(skill.toLowerCase()).toMatch(/sonnet is sufficient/);
  });
});

describe("SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries", () => {
  const skill = read("plugin/skills/projection-comments/SKILL.md");

  it("SPEC-wf-034: skill file exists at plugin/skills/projection-comments/SKILL.md", () => {
    expect(fs.existsSync(path.join(SKILLS, "projection-comments", "SKILL.md"))).toBe(true);
  });

  it("SPEC-wf-034: description mentions addressing projection comments and pruning", () => {
    expect(skill.toLowerCase()).toMatch(/address.*projection.*comment|projection.*comment.*prun/);
  });

  it("SPEC-wf-034: skill reads .comments.json for the named projection", () => {
    expect(skill).toMatch(/\.comments\.json/);
  });

  it("SPEC-wf-034: skill lists all four action types: clarify, re-evaluate, expand, condense", () => {
    expect(skill).toMatch(/clarify/);
    expect(skill).toMatch(/re-evaluate/);
    expect(skill).toMatch(/expand/);
    expect(skill).toMatch(/condense/);
  });

  it("SPEC-wf-034: skill states that unaddressable entries are left in place (not silently dropped)", () => {
    expect(skill.toLowerCase()).toMatch(/not silently drop|left in place|unaddressable|cannot.*address/);
  });

  it("SPEC-wf-034: skill instructs writing the pruned JSON back to .comments.json", () => {
    // Must mention both removing addressed entries and writing the result back
    expect(skill).toMatch(/\.comments\.json/);
    expect(skill.toLowerCase()).toMatch(/prun|remov.*address|address.*remov/);
  });

  it("SPEC-wf-034: skill ends with a next-step footer referencing session-start", () => {
    expect(skill).toMatch(/session-start/);
  });

  it("SPEC-wf-034: skill states it operates per projection and does not touch unrelated artifacts", () => {
    expect(skill.toLowerCase()).toMatch(/per projection|does not.*other projection|operate.*per/);
  });
});
