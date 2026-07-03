import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
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

  it("SPEC-wf-002: the worker prompt's first action is to invoke sdd:close-domain, with no embedded pipeline", () => {
    // The loop lives in close-domain (SPEC-wf-038), not in the prompt.
    expect(skill).toMatch(/first action[^]*sdd:close-domain \{domain\}/i);
    // The old three-step audit→decompose→close procedure is gone from the prompt.
    expect(skill).not.toMatch(/1\.\s*Run \/sdd:spec-audit/);
    expect(skill).not.toMatch(/Run \/sdd:gap-to-work-items \{domain\}/);
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

  it("SPEC-wf-006: prompt's only imperative is invoking sdd:close-domain (no embedded procedure)", () => {
    expect(skill).toMatch(/sdd:close-domain \{domain\}/);
    expect(skill).not.toMatch(/1\.\s*Run \/sdd:spec-audit/);
  });

  it("SPEC-wf-006: prompt restricts lead reports to completion, 'nothing to do', or blocker", () => {
    expect(skill.toLowerCase()).toMatch(
      /report to your team lead only at genuine completion, "nothing to do", or a real\s+blocker/,
    );
  });

  it("SPEC-wf-006: prompt instructs surfacing lead-instruction-vs-spec conflicts instead of complying", () => {
    const lower = skill.toLowerCase();
    expect(lower).toMatch(/conflicts with an active spec item/);
    expect(lower).toMatch(/do not comply/);
    expect(lower).toMatch(/quote the\s+spec item/);
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

describe("SPEC-wf-025: Issues are a reviewer-team-produced artifact type", () => {
  const skill = read("plugin/skills/review-issues/SKILL.md");

  it("SPEC-wf-025: review-issues spawns exactly 3 reviewer agents via the Agent tool", () => {
    expect(skill).toMatch(/exactly \*\*3 reviewer agents/);
    expect(skill).toMatch(/Agent tool/);
  });

  it("SPEC-wf-025: review-issues does not spawn via the removed TeamCreate tool", () => {
    expect(skill).not.toMatch(/TeamCreate\s*\(/);
  });

  it("SPEC-wf-025: findings are ISS-{domain}-{seq|7hex} under .sdd/issues/ recording location, problem, rationale, severity", () => {
    // Per SPEC-wf-037 the suffix may be sequential ({seq}) or a 7-hex hash ({7hex});
    // consumers accept both forms.
    expect(skill).toMatch(/ISS-\{domain\}-\{(?:seq|7hex)\}/);
    expect(skill).toMatch(/\.sdd\/issues\//);
    expect(skill.toLowerCase()).toMatch(/location/);
    expect(skill.toLowerCase()).toMatch(/rationale/);
    expect(skill.toLowerCase()).toMatch(/severity/);
  });

  it("SPEC-wf-025: reviewers never auto-fix findings", () => {
    expect(skill.toLowerCase()).toMatch(/never auto-fix/);
  });

  it("SPEC-wf-025: issue storage path and archive-subdirectory convention are documented", () => {
    // Per SPEC-wf-035, ephemeral archive dirs are gitignored and may be absent on a
    // fresh clone/worktree; no tool (tests included) may depend on their presence.
    // Assert the documented storage shape, not on-disk directory existence.
    expect(skill).toMatch(/\.sdd\/issues\/ISS-\{domain\}-\{(?:seq|7hex)\}\.md/);
    expect(skill).toMatch(/\.sdd\/issues\/archive\//);
  });
});

describe("SPEC-wf-026: Improvements are a team-produced enhancement artifact type", () => {
  const skill = read("plugin/skills/review-improvements/SKILL.md");

  it("SPEC-wf-026: review-improvements spawns exactly 3 agents via the Agent tool", () => {
    expect(skill).toMatch(/exactly \*\*3 improvement-focused agents/);
    expect(skill).toMatch(/Agent tool/);
  });

  it("SPEC-wf-026: review-improvements does not spawn via the removed TeamCreate tool", () => {
    expect(skill).not.toMatch(/TeamCreate\s*\(/);
  });

  it("SPEC-wf-026: proposals are IMP-{domain}-{seq|7hex} under .sdd/improvements/ recording effort and impact", () => {
    // Per SPEC-wf-037 the suffix may be sequential ({seq}) or a 7-hex hash ({7hex}).
    expect(skill).toMatch(/IMP-\{domain\}-\{(?:seq|7hex)\}/);
    expect(skill).toMatch(/\.sdd\/improvements\//);
    expect(skill.toLowerCase()).toMatch(/effort/);
    expect(skill.toLowerCase()).toMatch(/impact/);
  });

  it("SPEC-wf-026: the team never auto-applies improvements", () => {
    expect(skill.toLowerCase()).toMatch(/never auto-appl/);
  });

  it("SPEC-wf-026: improvement storage path and archive-subdirectory convention are documented", () => {
    // Per SPEC-wf-035, ephemeral archive dirs are gitignored and may be absent on a
    // fresh clone/worktree; no tool (tests included) may depend on their presence.
    // Assert the documented storage shape, not on-disk directory existence.
    expect(skill).toMatch(/\.sdd\/improvements\/IMP-\{domain\}-\{(?:seq|7hex)\}\.md/);
    expect(skill).toMatch(/\.sdd\/improvements\/archive\//);
  });
});

describe("SPEC-wf-035: Ephemeral artifact archives are local-only, never version-controlled", () => {
  const gitignore = read(".gitignore");
  const EPHEMERAL_ARCHIVES = [
    ".sdd/targets/archive/",
    ".sdd/gaps/archive/",
    ".sdd/work-items/archive/",
    ".sdd/issues/archive/",
    ".sdd/improvements/archive/",
  ];

  it("SPEC-wf-035: .gitignore covers all five ephemeral archive paths", () => {
    for (const p of EPHEMERAL_ARCHIVES) {
      expect(gitignore).toMatch(new RegExp("^" + p.replace(/[.]/g, "\\$&"), "m"));
    }
  });

  it("SPEC-wf-035: .gitignore does NOT ignore the spec archive (permanent truth)", () => {
    expect(gitignore).not.toMatch(/^\.sdd\/specs\/.*archive/m);
  });

  it("SPEC-wf-035: no tracked files exist under any ephemeral archive path", () => {
    const tracked = execFileSync(
      "git",
      ["ls-files", "--", ...EPHEMERAL_ARCHIVES],
      { cwd: REPO_ROOT, encoding: "utf8" },
    ).trim();
    expect(tracked).toBe("");
  });

  it("SPEC-wf-035: the spec archive remains tracked", () => {
    const tracked = execFileSync(
      "git",
      ["ls-files", "--", ".sdd/specs/"],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );
    expect(tracked).toMatch(/\/archive\//);
  });

  // Behavioral backstop: lint-check.sh must fail when the archive boundary is
  // bypassed via `git add -f`, and pass otherwise.
  const LINT = "plugin/scripts/lint-check.sh";
  const PROBE = ".sdd/gaps/archive/_lint_probe_test.md";
  const ARCHIVE_FAIL = /ephemeral archive path/i;

  function runLint(): string {
    try {
      return execFileSync("bash", [LINT], { cwd: REPO_ROOT, encoding: "utf8" });
    } catch (e: any) {
      // A non-zero exit still carries the script's output on the error object.
      return `${e.stdout ?? ""}${e.stderr ?? ""}`;
    }
  }

  it("SPEC-wf-035: lint-check.sh emits no archive violation on a clean tree", () => {
    expect(runLint()).not.toMatch(ARCHIVE_FAIL);
  });

  it("SPEC-wf-035: lint-check.sh fails when a file under an ignored archive path is force-added", () => {
    const abs = path.join(REPO_ROOT, PROBE);
    try {
      fs.writeFileSync(abs, "probe\n");
      execFileSync("git", ["add", "-f", "--", PROBE], { cwd: REPO_ROOT });
      expect(runLint()).toMatch(ARCHIVE_FAIL);
    } finally {
      try {
        execFileSync("git", ["rm", "-f", "--cached", "--quiet", "--", PROBE], { cwd: REPO_ROOT });
      } catch { /* index already clean */ }
      fs.rmSync(abs, { force: true });
    }
  });

  it("SPEC-wf-035: session-start degrades orphan checks to 'unverifiable' for local-only archives", () => {
    const skill = read("plugin/skills/session-start/SKILL.md");
    // A missing reference with an empty/absent archive cache is reported as
    // unverifiable, not a hard error.
    expect(skill).toMatch(/unverifiable \(archive is local-only\)/);
    // Resolution is scoped to active files plus the local cache *when present*.
    expect(skill.toLowerCase()).toMatch(/cache[^.]*when it is present/);
  });
});

describe("SPEC-wf-036: Terminal artifact state is committed before archiving", () => {
  const ARCHIVING_SKILLS = [
    "plugin/skills/work-item-close/SKILL.md",
    "plugin/skills/target-engage/SKILL.md",
    "plugin/skills/review-engage/SKILL.md",
  ];

  for (const rel of ARCHIVING_SKILLS) {
    const name = rel.split("/")[2];

    it(`SPEC-wf-036: ${name} states the commit-before-mv ordering (terminal state → commit → mv)`, () => {
      const skill = read(rel);
      expect(skill).toMatch(/→\s*commit\s*→\s*`mv`/);
    });

    it(`SPEC-wf-036: ${name} forbids staging files under an archive path`, () => {
      const skill = read(rel).toLowerCase();
      expect(skill).toMatch(/never stage[^\n]*archive/);
    });
  }

  it("SPEC-wf-036: the merge-strategy caveat is documented in the artifact operating guides", () => {
    const wi = read("plugin/references/artifacts/work-item.md").toLowerCase();
    const tgt = read("plugin/references/artifacts/target.md").toLowerCase();
    for (const guide of [wi, tgt]) {
      expect(guide).toMatch(/squash/);
      expect(guide).toMatch(/merge-commit/);
    }
  });
});

describe("SPEC-wf-037: consumers and docs accept both {seq} and {7hex} ID suffix forms", () => {
  it("SPEC-wf-037: session-start documents the {7hex} form, TGT history-scan, and duplicate-ID warning", () => {
    const skill = read("plugin/skills/session-start/SKILL.md");
    expect(skill).toMatch(/\{7hex\}/);
    expect(skill).toMatch(/git log --diff-filter=A -- \.sdd\/targets\//);
    expect(skill.toLowerCase()).toMatch(/duplicate active id/);
  });

  it("SPEC-wf-037: schemas.md documents both suffix forms and local-only archive semantics", () => {
    const schemas = read("plugin/references/schemas.md");
    expect(schemas).toMatch(/\{7hex\}/);
    expect(schemas).toMatch(/\{seq\}/);
    expect(schemas.toLowerCase()).toMatch(/local-only cache/);
  });

  it("SPEC-wf-037: hub ARTIFACT_ID_RE matches both sequential and 7-hex suffix forms", () => {
    const src = read("hub/client/src/components/Markdown.tsx");
    const m = src.match(/ARTIFACT_ID_RE\s*=\s*\/(.+?)\/[a-z]*;/);
    expect(m).not.toBeNull();
    const re = new RegExp(m![1]);
    // Legacy sequential and new hash forms both linkify.
    expect(re.test("ISS-auth-001")).toBe(true);
    expect(re.test("GAP-wf-3f9c2a1")).toBe(true);
    expect(re.test("WI-auth-9cfd75f")).toBe(true);
  });
});

describe("SPEC-wf-037: ephemeral minting skills mint {7hex} hash IDs, not archive-scanned {seq}", () => {
  const CASES = [
    { skill: "plugin/skills/spec-audit/SKILL.md", mint: /GAP-\{abbrev\}-\{7hex\}/, oldScan: /gaps\/archive\/GAP-\{abbrev\}-\*\.md/ },
    { skill: "plugin/skills/gap-to-work-items/SKILL.md", mint: /WI-\{abbrev\}-\{7hex\}/, oldScan: /work-items\/archive\/WI-\{abbrev\}-\*\.md/ },
    { skill: "plugin/skills/review-issues/SKILL.md", mint: /ISS-\{domain\}-\{7hex\}/, oldScan: /next available sequence number/i },
    { skill: "plugin/skills/review-improvements/SKILL.md", mint: /IMP-\{domain\}-\{7hex\}/, oldScan: /next available sequence number/i },
  ];

  for (const { skill, mint, oldScan } of CASES) {
    const name = skill.split("/")[2];

    it(`SPEC-wf-037: ${name} mints the {7hex} hash form`, () => {
      expect(read(skill)).toMatch(mint);
    });

    it(`SPEC-wf-037: ${name} no longer instructs an archive/sequence scan for minting`, () => {
      expect(read(skill)).not.toMatch(oldScan);
    });
  }
});

describe("SPEC-wf-039: spec-index.js builds a deterministic, ephemeral full-corpus index", () => {
  const SCRIPT = path.join(REPO_ROOT, "plugin", "scripts", "spec-index.js");

  function runIndex(): string {
    return execFileSync("node", [SCRIPT], { cwd: REPO_ROOT, encoding: "utf8" });
  }

  it("SPEC-wf-039: the spec-index.js script exists", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it("SPEC-wf-039: prints one tab-separated line per active item with id, domain, title, scope", () => {
    const lines = runIndex().split("\n").filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      const cols = line.split("\t");
      expect(cols.length).toBe(4); // id, domain, title, scope (4th may be empty)
      expect(cols[0]).toMatch(/^SPEC-/);
      expect(cols[1].length).toBeGreaterThan(0);
      expect(cols[2].length).toBeGreaterThan(0);
    }
  });

  it("SPEC-wf-039: includes an active item and excludes archived items", () => {
    const out = runIndex();
    expect(out).toMatch(/^SPEC-wf-038\t/m); // active
    expect(out).not.toMatch(/^SPEC-wf-007\t/m); // archived at .sdd/specs/workflow/archive/
  });

  it("SPEC-wf-039: emits scope globs comma-separated when present, empty when absent (SPEC-wf-042)", () => {
    const fixtureDir = path.join(REPO_ROOT, ".sdd", "specs", "__indextest__");
    const withScope = path.join(fixtureDir, "SPEC-idx-001.md");
    const noScope = path.join(fixtureDir, "SPEC-idx-002.md");
    try {
      fs.mkdirSync(fixtureDir, { recursive: true });
      fs.writeFileSync(
        withScope,
        '---\nid: SPEC-idx-001\ndomain: indextest\nabbrev: idx\nstatus: active\naliases: []\nscope: [hub/client/src/**, plugin/**]\nversion: "00000000"\n---\n\n# SPEC-idx-001 — fixture item with scope\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n',
      );
      fs.writeFileSync(
        noScope,
        '---\nid: SPEC-idx-002\ndomain: indextest\nabbrev: idx\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# SPEC-idx-002 — fixture item without scope\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n',
      );
      const out = runIndex();
      const withLine = out.split("\n").find((l) => l.startsWith("SPEC-idx-001\t"));
      const noLine = out.split("\n").find((l) => l.startsWith("SPEC-idx-002\t"));
      expect(withLine).toBeDefined();
      expect(noLine).toBeDefined();
      expect(withLine!.split("\t")[3]).toBe("hub/client/src/**,plugin/**");
      expect(noLine!.split("\t")[3]).toBe("");
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it("SPEC-wf-039: excludes non-active items", () => {
    const fixtureDir = path.join(REPO_ROOT, ".sdd", "specs", "__indextest__");
    const deprecated = path.join(fixtureDir, "SPEC-idx-003.md");
    try {
      fs.mkdirSync(fixtureDir, { recursive: true });
      fs.writeFileSync(
        deprecated,
        '---\nid: SPEC-idx-003\ndomain: indextest\nabbrev: idx\nstatus: deprecated\naliases: []\nversion: "00000000"\n---\n\n# SPEC-idx-003 — deprecated fixture\n\n## Invariant\nx\n',
      );
      const out = runIndex();
      expect(out).not.toMatch(/^SPEC-idx-003\t/m);
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it("SPEC-wf-039: writes only to stdout — no index file is committed to the repo", () => {
    runIndex();
    const tracked = execFileSync(
      "git",
      ["ls-files", "--", ".sdd/spec-index*", "plugin/scripts/spec-index.txt", "spec-index.*"],
      { cwd: REPO_ROOT, encoding: "utf8" },
    ).trim();
    expect(tracked).toBe("");
  });
});

describe("SPEC-wf-042: spec items may declare an optional scope of governed code paths", () => {
  it("SPEC-wf-042: schemas.md documents the optional scope: field with path-glob semantics", () => {
    const schemas = read("plugin/references/schemas.md");
    expect(schemas).toMatch(/scope:/);
    expect(schemas.toLowerCase()).toMatch(/path glob/);
    expect(schemas).toMatch(/SPEC-wf-042/);
  });

  it("SPEC-wf-042: the spec artifact guide documents the optional scope: field with path-glob semantics", () => {
    const guide = read("plugin/references/artifacts/spec.md");
    expect(guide).toMatch(/scope:/);
    expect(guide.toLowerCase()).toMatch(/path glob/);
    expect(guide).toMatch(/SPEC-wf-042/);
  });

  it("SPEC-wf-042: docs state scope is opt-in, recall-oriented, no-backfill, and authoritative inclusion", () => {
    for (const rel of ["plugin/references/schemas.md", "plugin/references/artifacts/spec.md"]) {
      const doc = read(rel).toLowerCase();
      expect(doc).toMatch(/opt-in/);
      expect(doc).toMatch(/recall-oriented/);
      expect(doc).toMatch(/no backfill/);
      expect(doc).toMatch(/authoritative/);
      // Absence of scope never means the item is out of play.
      expect(doc).toMatch(/absence of `scope:`/);
    }
  });

  it("SPEC-wf-042: spec-index emits scope globs for an item carrying scope:", () => {
    const SCRIPT = path.join(REPO_ROOT, "plugin", "scripts", "spec-index.js");
    const fixtureDir = path.join(REPO_ROOT, ".sdd", "specs", "__scopetest__");
    const scoped = path.join(fixtureDir, "SPEC-scp-001.md");
    try {
      fs.mkdirSync(fixtureDir, { recursive: true });
      fs.writeFileSync(
        scoped,
        '---\nid: SPEC-scp-001\ndomain: scopetest\nabbrev: scp\nstatus: active\naliases: []\nscope: [hub/**, plugin/scripts/**]\nversion: "00000000"\n---\n\n# SPEC-scp-001 — scoped fixture\n\n## Invariant\nx\n',
      );
      const out = execFileSync("node", [SCRIPT], { cwd: REPO_ROOT, encoding: "utf8" });
      const line = out.split("\n").find((l) => l.startsWith("SPEC-scp-001\t"));
      expect(line).toBeDefined();
      expect(line!.split("\t")[3]).toBe("hub/**,plugin/scripts/**");
    } finally {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });
});

describe("SPEC-wf-038: close-domain skill drives the full execution loop for a domain", () => {
  const rel = "plugin/skills/close-domain/SKILL.md";

  it("SPEC-wf-038: close-domain/SKILL.md exists in the plugin", () => {
    expect(fs.existsSync(path.join(SKILLS, "close-domain", "SKILL.md"))).toBe(true);
  });

  it("SPEC-wf-038: the skill contains all five phases in order (orient, audit, decompose, close, guardian)", () => {
    const skill = read(rel);
    const p0 = skill.indexOf("### Phase 0");
    const p1 = skill.indexOf("### Phase 1");
    const p2 = skill.indexOf("### Phase 2");
    const p3 = skill.indexOf("### Phase 3");
    const p4 = skill.indexOf("### Phase 4");
    expect(p0).toBeGreaterThan(-1);
    expect(p1).toBeGreaterThan(p0);
    expect(p2).toBeGreaterThan(p1);
    expect(p3).toBeGreaterThan(p2);
    expect(p4).toBeGreaterThan(p3);
    const lower = skill.toLowerCase();
    for (const word of ["orient", "audit", "decompose", "close", "guardian"]) {
      expect(lower).toMatch(new RegExp(word));
    }
  });

  it("SPEC-wf-038: Phase 0 runs the spec-index script and sends a first-report handshake", () => {
    const skill = read(rel);
    expect(skill).toMatch(/spec-index\.js/);
    expect(skill.toLowerCase()).toMatch(/first-report handshake/);
  });

  it("SPEC-wf-038: the skill states inner Next: footers are advisory", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/footers? (are )?advisory/);
  });

  it("SPEC-wf-038: stop conditions are exactly nothing-to-do, complete-and-clean, escalation", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/nothing to do/);
    expect(skill).toMatch(/complete and clean/);
    expect(skill).toMatch(/escalation/);
  });
});

describe("SPEC-wf-041: guardian cross-domain audit gates worker completion", () => {
  const rel = "plugin/skills/close-domain/SKILL.md";

  it("SPEC-wf-041: records the run's git start point at Phase 0 and diffs changed files at Phase 4", () => {
    const skill = read(rel);
    expect(skill).toMatch(/git rev-parse HEAD/);
    expect(skill).toMatch(/git diff --name-only/);
  });

  it("SPEC-wf-041: maps changed files to spec items across all domains", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/across all domains/);
  });

  it("SPEC-wf-041: own-run violations are fixed inline with no gap artifacts", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/fix inline/);
    expect(skill).toMatch(/do \*\*not\*\* write gap artifacts|not write gap artifacts/);
  });

  it("SPEC-wf-041: escalation triggers are stated (tension, out-of-scope, or 2 non-converging cycles)", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/in tension/);
    expect(skill).toMatch(/outside this run's scope|out of scope/);
    expect(skill).toMatch(/without\s+convergence/);
  });

  it("SPEC-wf-041: pre-existing violations are reported as candidate gaps, not fixed, not blocking", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/pre-existing violations/);
    expect(skill).toMatch(/candidate gaps/);
  });

  it("SPEC-wf-041: complete is reported only on a clean guardian audit", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/report complete only on a clean guardian audit/);
  });
});

describe("SPEC-wf-008: close-domain footer + advisory-footer rule", () => {
  const rel = "plugin/skills/close-domain/SKILL.md";

  it("SPEC-wf-008: close-domain ends with a '---' divider and a 'Next:' footer line", () => {
    const skill = read(rel);
    expect(skill).toMatch(/\n---\n/);
    expect(skill).toMatch(/\nNext: /);
  });

  it("SPEC-wf-008: close-domain completion footer routes to session-start; escalation footer is the blocker", () => {
    const skill = read(rel);
    expect(skill).toMatch(/\/sdd:session-start/);
    expect(skill.toLowerCase()).toMatch(/on escalation[^]*blocker description/);
  });

  it("SPEC-wf-008: close-domain states inner-skill footers are advisory", () => {
    const skill = read(rel).toLowerCase();
    expect(skill).toMatch(/footers? (are )?advisory/);
  });
});

describe("SPEC-wf-040: work items are closed with cross-domain spec context and self-check", () => {
  const wic = "plugin/skills/work-item-close/SKILL.md";
  const cd = "plugin/skills/close-domain/SKILL.md";

  it("SPEC-wf-040: work-item-close verifies each acceptance criterion against the code before done", () => {
    const skill = read(wic).toLowerCase();
    expect(skill).toMatch(/re-read the gap's spec item[^]*acceptance criteria[^]*against the code/);
    expect(skill).toMatch(/"tests pass" alone is not completion/);
  });

  it("SPEC-wf-040: work-item-close instructs a cross-domain diff self-check from close-domain", () => {
    const skill = read(wic).toLowerCase();
    expect(skill).toMatch(/cross-domain self-check/);
    expect(skill).toMatch(/every cross-domain spec item provided/);
  });

  it("SPEC-wf-040: close-domain selects relevant spec items across all domains before implementing", () => {
    const skill = read(cd).toLowerCase();
    expect(skill).toMatch(/select the governing spec items/);
    expect(skill).toMatch(/across all domains/);
    // Discovery: index/scope first, read-only subagent only when inconclusive, fallback reported.
    expect(skill).toMatch(/spec-discovery subagent/);
    expect(skill).toMatch(/never silently skipped/);
  });
});

describe("SPEC-wf-031/033: close-domain is documented (docs-sync drift-free)", () => {
  it("does not drift: check-skills-drift.js exits 0 with close-domain present", () => {
    // Throws on non-zero exit; a clean run proves README + sdd-help list close-domain.
    const out = execFileSync("node", [path.join(REPO_ROOT, "plugin", "scripts", "check-skills-drift.js")], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    expect(out).toMatch(/close-domain/);
  });
});
