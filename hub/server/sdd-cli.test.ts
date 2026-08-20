import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SCRIPT = path.join(REPO_ROOT, "plugin", "cli", "sdd.js");

function run(args: string[], cwd: string): { stdout: string; code: number } {
  try {
    return { stdout: execFileSync("node", [SCRIPT, ...args], { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }), code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { stdout: `${err.stdout ?? ""}${err.stderr ?? ""}`, code: err.status ?? -1 };
  }
}

/** A fixture project: component-tree + legacy specs, gap, work items, target. */
function makeProject(): string {
  const root = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sdd-cli-test-")), "proj");
  const sdd = path.join(root, ".sdd");
  for (const d of [
    "specs/hub/server",
    "specs/hub/client/archive",
    "specs/authentication",
    "gaps/archive",
    "work-items/archive",
    "issues",
    "improvements",
    "targets/archive",
  ]) {
    fs.mkdirSync(path.join(sdd, d), { recursive: true });
  }

  const item = (id: string, componentLine: string, extra = "", body = "") =>
    `---\nid: ${id}\n${componentLine}\nabbrev: x\nstatus: active\naliases: []\n${extra}version: "00000000"\n---\n\n# ${id} — item ${id}\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n${body}`;

  fs.writeFileSync(
    path.join(sdd, "specs/hub/server/SPEC-hsrv-001.md"),
    item("SPEC-hsrv-001", "component: hub/server", "", "\n**Tests:**\n- `t.ts::x` — \"covered\"\n")
  );
  // Aliased survivor: carries a former ID in `aliases:`.
  fs.writeFileSync(
    path.join(sdd, "specs/hub/client/SPEC-hcli-001.md"),
    item("SPEC-hcli-001", "component: hub/client").replace("aliases: []", "aliases: [SPEC-old-001]")
  );
  // Legacy flat domain item — reads as a one-level component path.
  fs.writeFileSync(path.join(sdd, "specs/authentication/SPEC-auth-001.md"), item("SPEC-auth-001", "domain: authentication"));
  // Archived spec item: hidden unless --archived.
  fs.writeFileSync(path.join(sdd, "specs/hub/client/archive/SPEC-hcli-090.md"), item("SPEC-hcli-090", "component: hub/client"));
  // Manifests are not artifacts and must not list.
  fs.writeFileSync(
    path.join(sdd, "specs/hub/server/component.md"),
    `---\ncomponent: hub/server\nabbrev: hsrv\ndepends-on: []\n---\n\n# hub/server\n\nDesc.\n`
  );

  fs.writeFileSync(
    path.join(sdd, "gaps/GAP-hsrv-a1b2c3d.md"),
    `---\nid: GAP-hsrv-a1b2c3d\nspec-item: SPEC-hsrv-001\ncomponent: hub/server\nstatus: open\ndiscovered: "2026-08-15T00:00:00Z"\naudit-spec-version: "00000000"\nclosed-by: null\ndeferred-reason: null\n---\n\n# Gap: Missing null check\n\n**Location:** \`x:1\`\n**Reasoning:** r\n`
  );
  fs.writeFileSync(
    path.join(sdd, "work-items/WI-hsrv-a1b2c3d.md"),
    `---\nid: WI-hsrv-a1b2c3d\ngap-id: GAP-hsrv-a1b2c3d\ncomponent: hub/server\nstatus: pending\ncreated: "2026-08-15T00:00:00Z"\nabandoned-reason: null\n---\n\n# Work Item: Add the null check\n\n**Scope:** x\n\n**Acceptance criteria:**\n- x\n`
  );
  fs.writeFileSync(
    path.join(sdd, "work-items/archive/WI-hsrv-0ld0ne1.md"),
    `---\nid: WI-hsrv-0ld0ne1\ngap-id: GAP-hsrv-a1b2c3d\ncomponent: hub/server\nstatus: done\ncreated: "2026-08-01T00:00:00Z"\nabandoned-reason: null\n---\n\n# Work Item: Earlier fix\n\n**Scope:** x\n\n**Acceptance criteria:**\n- x\n`
  );
  fs.writeFileSync(
    path.join(sdd, "targets/TGT-007.md"),
    `---\nid: TGT-007\nstatus: awaiting-agent\ncreated: 2026-08-15\ncomponent: hub/server\n---\n\n# Target: Better errors\n\n## Current statement\nx\n\n## Dialog\n### 2026-08-15 — User\nx\n`
  );
  return root;
}

describe("sdd.js artifact CLI", () => {
  it("lists specs with component/status/title columns, hiding archives and manifests", () => {
    const root = makeProject();
    const result = run(["list", "specs"], root);
    expect(result.code).toBe(0);
    const lines = result.stdout.trim().split("\n");
    expect(lines).toContain("SPEC-hsrv-001\tactive\thub/server\titem SPEC-hsrv-001");
    // Legacy domain: frontmatter reads as a one-level component path.
    expect(lines).toContain("SPEC-auth-001\tactive\tauthentication\titem SPEC-auth-001");
    expect(result.stdout).not.toContain("SPEC-hcli-090"); // archived
    expect(result.stdout).not.toContain("component.md"); // manifest
    expect(run(["list", "specs", "--archived"], root).stdout).toContain("SPEC-hcli-090");
  });

  it("filters by status and by component subtree", () => {
    const root = makeProject();
    expect(run(["list", "gaps", "--status=open"], root).stdout).toContain("GAP-hsrv-a1b2c3d");
    expect(run(["list", "gaps", "--status=closed"], root).stdout.trim()).toBe("");
    // Subtree semantics: `hub` matches hub/server and hub/client items.
    const hub = run(["list", "specs", "--component=hub"], root).stdout;
    expect(hub).toContain("SPEC-hsrv-001");
    expect(hub).toContain("SPEC-hcli-001");
    expect(hub).not.toContain("SPEC-auth-001");
  });

  it("emits JSON rows with project-relative file paths", () => {
    const root = makeProject();
    const rows = JSON.parse(run(["list", "work-items", "--json"], root).stdout);
    expect(rows).toEqual([
      {
        id: "WI-hsrv-a1b2c3d",
        status: "pending",
        component: "hub/server",
        title: "Add the null check",
        archived: false,
        file: path.join(".sdd", "work-items", "WI-hsrv-a1b2c3d.md"),
        gapIds: ["GAP-hsrv-a1b2c3d"],
      },
    ]);
  });

  it("JSON rows carry the per-type cross-reference and staleness fields", () => {
    const root = makeProject();
    const specs = JSON.parse(run(["list", "specs", "--json"], root).stdout);
    const hsrv = specs.find((s: { id: string }) => s.id === "SPEC-hsrv-001");
    expect(hsrv.version).toBe("00000000");
    expect(hsrv.covered).toBe(true);
    const auth = specs.find((s: { id: string }) => s.id === "SPEC-auth-001");
    expect(auth.covered).toBe(false);

    const gaps = JSON.parse(run(["list", "gaps", "--json"], root).stdout);
    expect(gaps[0].specItem).toBe("SPEC-hsrv-001");
    expect(gaps[0].auditSpecVersion).toBe("00000000");
  });

  it("state summarises counts by status and uncovered active specs", () => {
    const root = makeProject();
    const state = JSON.parse(run(["state", "--json"], root).stdout);
    expect(state.specs.byStatus.active).toBe(3);
    expect(state.specs.uncovered).toBe(2); // only SPEC-hsrv-001 carries **Tests:**
    expect(state.gaps.byStatus.open).toBe(1);
    expect(state["work-items"].byStatus.pending).toBe(1); // archive excluded
    expect(state.targets.byStatus["awaiting-agent"]).toBe(1);

    const text = run(["state"], root).stdout;
    expect(text).toContain("specs: 3 active (2 uncovered)");
    expect(text).toContain("gaps: 1 open");
    expect(text).toContain("issues: none");
  });

  it("resolves IDs to paths, follows spec aliases, and fails on unknown IDs", () => {
    const root = makeProject();
    const ok = run(["resolve", "GAP-hsrv-a1b2c3d", "SPEC-old-001", "WI-hsrv-0ld0ne1"], root);
    expect(ok.code).toBe(0);
    expect(ok.stdout).toContain(`GAP-hsrv-a1b2c3d\t${path.join(".sdd", "gaps", "GAP-hsrv-a1b2c3d.md")}`);
    expect(ok.stdout).toContain("(alias of SPEC-hcli-001)");
    expect(ok.stdout).toContain("WI-hsrv-0ld0ne1"); // archived items still resolve

    const bad = run(["resolve", "SPEC-hsrv-001", "SPEC-nope-999"], root);
    expect(bad.code).toBe(1);
    expect(bad.stdout).toContain("unresolved: SPEC-nope-999");
  });

  it("show prints the artifact's path and full content", () => {
    const root = makeProject();
    const result = run(["show", "gap-hsrv-a1b2c3d"], root); // case-insensitive
    expect(result.code).toBe(0);
    expect(result.stdout.startsWith(path.join(".sdd", "gaps", "GAP-hsrv-a1b2c3d.md") + "\n\n---\n")).toBe(true);
    expect(result.stdout).toContain("# Gap: Missing null check");
  });

  it("mints 7-hex hash IDs for ephemeral types and sequential IDs for targets", () => {
    const root = makeProject();
    expect(run(["mint", "gap", "auth"], root).stdout.trim()).toMatch(/^GAP-auth-[0-9a-f]{7}$/);
    expect(run(["mint", "work-item", "ui-screens"], root).stdout.trim()).toMatch(/^WI-ui-screens-[0-9a-f]{7}$/);
    // No git history in the fixture: the sequence derives from active files.
    expect(run(["mint", "target"], root).stdout.trim()).toBe("TGT-008");
    expect(run(["mint", "gap"], root).code).toBe(2); // abbrev required
  });

  it("delegates stamp to stamp.js with its exit codes", () => {
    const root = makeProject();
    expect(run(["stamp", "version", "--all"], root).code).toBe(0);
    expect(run(["stamp", "check", "--all"], root).code).toBe(0);
  });

  it("rejects unknown commands and types with usage", () => {
    const root = makeProject();
    expect(run(["frobnicate"], root).code).toBe(2);
    expect(run(["list", "nope"], root).code).toBe(2);
  });
});
