import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseSpecs } from "./sdd-parser.js";

function makeWorkspace(): { workspaceRoot: string; sddPath: string } {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-specs-test-"));
  const sddPath = path.join(workspaceRoot, ".sdd");
  fs.mkdirSync(path.join(sddPath, "specs", "architecture"), { recursive: true });
  return { workspaceRoot, sddPath };
}

function writeSpecItem(
  sddPath: string,
  domain: string,
  abbrev: string,
  id: string,
  title: string,
  body: string,
  version = "651d284b"
): void {
  fs.mkdirSync(path.join(sddPath, "specs", domain), { recursive: true });
  fs.writeFileSync(
    path.join(sddPath, "specs", domain, `${id}.md`),
    `---\nid: ${id}\ndomain: ${domain}\nabbrev: ${abbrev}\nstatus: active\naliases: []\nversion: "${version}"\n---\n\n# ${id} — ${title}\n\n${body}\n`
  );
}

const VITEST_REPORT_ALL_PASSING = JSON.stringify({
  startTime: 1716000000000,
  testResults: [
    {
      assertionResults: [
        { fullName: "Node.js server starts correctly", status: "passed" },
        { fullName: "React frontend renders", status: "passed" },
      ],
    },
  ],
});

const VITEST_REPORT_WITH_FAILURE = JSON.stringify({
  startTime: 1716000000000,
  testResults: [
    {
      assertionResults: [
        { fullName: "Node.js server starts correctly", status: "passed" },
        { fullName: "React frontend renders", status: "failed" },
      ],
    },
  ],
});

describe("parseSpecs — testStatus integration", () => {
  it("defaults all items to not-run when no .tests.json mapping file exists", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Frontend is React", "The UI is a React application.");

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(1);
    for (const item of specs[0]!.items) {
      expect(item.testStatus.status).toBe("not-run");
    }
  });

  it("returns passing status when all matched tests pass", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Frontend is React", "The UI is a React application.");

    const reportPath = path.join(workspaceRoot, "reports", "vitest.json");
    fs.mkdirSync(path.join(workspaceRoot, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, VITEST_REPORT_ALL_PASSING);

    const mapping = {
      runner: "vitest",
      report: "reports/vitest.json",
      items: {
        "SPEC-ARCH-001": ["Node.js server"],
        "SPEC-ARCH-002": ["React frontend"],
      },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    const items = specs[0]!.items;
    const item001 = items.find((i) => i.id === "SPEC-ARCH-001");
    const item002 = items.find((i) => i.id === "SPEC-ARCH-002");
    expect(item001!.testStatus.status).toBe("passing");
    expect(item002!.testStatus.status).toBe("passing");
    expect(item001!.testStatus.lastRun).toBeDefined();
  });

  it("returns failing status when a matched test fails", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Frontend is React", "The UI is a React application.");

    const reportPath = path.join(workspaceRoot, "reports", "vitest.json");
    fs.mkdirSync(path.join(workspaceRoot, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, VITEST_REPORT_WITH_FAILURE);

    const mapping = {
      runner: "vitest",
      report: "reports/vitest.json",
      items: {
        "SPEC-ARCH-001": ["Node.js server"],
        "SPEC-ARCH-002": ["React frontend"],
      },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    const items = specs[0]!.items;
    const item001 = items.find((i) => i.id === "SPEC-ARCH-001");
    const item002 = items.find((i) => i.id === "SPEC-ARCH-002");
    expect(item001!.testStatus.status).toBe("passing");
    expect(item002!.testStatus.status).toBe("failing");
  });

  it("returns missing when spec item has no mapping entry", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Frontend is React", "The UI is a React application.");

    const reportPath = path.join(workspaceRoot, "reports", "vitest.json");
    fs.mkdirSync(path.join(workspaceRoot, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, VITEST_REPORT_ALL_PASSING);

    const mapping = {
      runner: "vitest",
      report: "reports/vitest.json",
      items: {
        "SPEC-ARCH-001": ["Node.js server"],
      },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    const item002 = specs[0]!.items.find((i) => i.id === "SPEC-ARCH-002");
    expect(item002!.testStatus.status).toBe("missing");
  });

  it("returns not-run when report file does not exist", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");

    const mapping = {
      runner: "vitest",
      report: "reports/nonexistent.json",
      items: { "SPEC-ARCH-001": ["Node.js server"] },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    for (const item of specs[0]!.items) {
      expect(item.testStatus.status).toBe("not-run");
    }
  });

  it("every item in the response has a testStatus field", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Frontend is React", "The UI is a React application.");

    const reportPath = path.join(workspaceRoot, "reports", "vitest.json");
    fs.mkdirSync(path.join(workspaceRoot, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, VITEST_REPORT_ALL_PASSING);

    const mapping = {
      runner: "vitest",
      report: "reports/vitest.json",
      items: { "SPEC-ARCH-001": ["Node.js server"], "SPEC-ARCH-002": ["React"] },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    for (const item of specs[0]!.items) {
      expect(item).toHaveProperty("testStatus");
      expect(["passing", "failing", "missing", "not-run"]).toContain(item.testStatus.status);
    }
  });

  it("collects items from multiple domain subdirectories into separate specs", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-001", "Two phases exist", "Intent and execution phases.");

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(2);
    const domains = specs.map((s) => s.domain).sort();
    expect(domains).toEqual(["architecture", "workflow"]);
  });

  it("skips non-directory entries in the specs directory", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");
    fs.writeFileSync(path.join(sddPath, "specs", "COLLAPSE-all.md"), "not a domain");

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(1);
    expect(specs[0]!.domain).toBe("architecture");
  });

  it("items within a spec are sorted by ID", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-003", "Third", "body");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "First", "body");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-002", "Second", "body");

    const specs = parseSpecs(sddPath);
    const ids = specs[0]!.items.map((i) => i.id);
    expect(ids).toEqual(["SPEC-ARCH-001", "SPEC-ARCH-002", "SPEC-ARCH-003"]);
  });

  it("each item includes a version field from its file frontmatter", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.", "abc12345");

    const specs = parseSpecs(sddPath);
    expect(specs[0]!.items[0]!.version).toBe("abc12345");
  });

  it("extracts invariant and criteria from spec item with both sections", () => {
    const { sddPath } = makeWorkspace();
    const body = [
      "## Invariant",
      "",
      "The hub server runs on Node.js LTS.",
      "",
      "## Acceptance criteria",
      "",
      "- Server starts without errors on Node.js LTS",
      "- Server rejects startup on unsupported Node.js versions",
    ].join("\n");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", body);

    const specs = parseSpecs(sddPath);
    const item = specs[0]!.items[0]!;
    expect(item.invariant).toBe("The hub server runs on Node.js LTS.");
    expect(item.criteria).toEqual([
      "Server starts without errors on Node.js LTS",
      "Server rejects startup on unsupported Node.js versions",
    ]);
  });

  it("returns empty invariant and criteria when sections are absent", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Server runtime is Node.js", "The hub server runs on Node.js.");

    const specs = parseSpecs(sddPath);
    const item = specs[0]!.items[0]!;
    expect(item.invariant).toBe("");
    expect(item.criteria).toEqual([]);
  });
});

describe("parseSpecs — SPEC-scr-047: skipped test state", () => {
  it("parses **Tests:** skipped — <reason> and returns status=skipped with skipReason", () => {
    const { sddPath } = makeWorkspace();
    const body = [
      "## Invariant",
      "",
      "This item has no meaningful code boundary.",
      "",
      "## Acceptance criteria",
      "",
      "- N/A",
      "",
      "**Tests:** skipped — no code boundary",
    ].join("\n");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Skipped item", body);

    const specs = parseSpecs(sddPath);
    const item = specs[0]!.items[0]!;
    expect(item.testStatus.status).toBe("skipped");
    expect(item.testStatus.skipReason).toBe("no code boundary");
  });

  it("skipped status is preserved even when a .tests.json mapping exists — skip wins over computed status", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    const body = [
      "## Invariant",
      "",
      "This item has no meaningful code boundary.",
      "",
      "## Acceptance criteria",
      "",
      "- N/A",
      "",
      "**Tests:** skipped — no code boundary",
    ].join("\n");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Skipped item", body);

    const reportPath = path.join(workspaceRoot, "reports", "vitest.json");
    fs.mkdirSync(path.join(workspaceRoot, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, VITEST_REPORT_ALL_PASSING);
    const mapping = {
      runner: "vitest",
      report: "reports/vitest.json",
      items: { "SPEC-ARCH-001": ["Node.js server"] },
    };
    fs.writeFileSync(
      path.join(sddPath, "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specs = parseSpecs(sddPath);
    const item = specs[0]!.items[0]!;
    expect(item.testStatus.status).toBe("skipped");
    expect(item.testStatus.skipReason).toBe("no code boundary");
  });

  it("item with no **Tests:** block still gets status=not-run", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Regular item", "No tests block here.");

    const specs = parseSpecs(sddPath);
    const item = specs[0]!.items[0]!;
    expect(item.testStatus.status).toBe("not-run");
    expect(item.testStatus.skipReason).toBeUndefined();
  });
});

describe("parseSpecs — SPEC-wf-018: subject subdirectory glob", () => {
  it("includes spec items found in a subject subdirectory", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Root item", "At domain root.");
    const subjectDir = path.join(sddPath, "specs", "architecture", "components");
    fs.mkdirSync(subjectDir, { recursive: true });
    fs.writeFileSync(
      path.join(subjectDir, "SPEC-arch-002.md"),
      `---\nid: SPEC-arch-002\ndomain: architecture\nabbrev: arch\nstatus: active\naliases: []\nversion: "deadbeef"\n---\n\n# SPEC-arch-002 — Subject item\n\nLives in subject subdirectory.\n`
    );

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(1);
    const ids = specs[0]!.items.map((i) => i.id).sort();
    expect(ids).toContain("SPEC-ARCH-001");
    expect(ids).toContain("SPEC-ARCH-002");
  });

  it("excludes spec items inside an archive subdirectory at domain root level", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Active item", "Still active.");
    const archiveDir = path.join(sddPath, "specs", "architecture", "archive");
    fs.mkdirSync(archiveDir, { recursive: true });
    fs.writeFileSync(
      path.join(archiveDir, "SPEC-arch-000.md"),
      `---\nid: SPEC-arch-000\ndomain: architecture\nabbrev: arch\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# SPEC-arch-000 — Archived item\n\nShould be excluded.\n`
    );

    const specs = parseSpecs(sddPath);
    const ids = specs[0]!.items.map((i) => i.id);
    expect(ids).not.toContain("SPEC-ARCH-000");
    expect(ids).toContain("SPEC-ARCH-001");
  });

  it("excludes spec items inside an archive subdirectory nested under a subject", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Active item", "Still active.");
    const subjectArchiveDir = path.join(sddPath, "specs", "architecture", "components", "archive");
    fs.mkdirSync(subjectArchiveDir, { recursive: true });
    fs.writeFileSync(
      path.join(subjectArchiveDir, "SPEC-arch-099.md"),
      `---\nid: SPEC-arch-099\ndomain: architecture\nabbrev: arch\nstatus: active\naliases: []\nversion: "99999999"\n---\n\n# SPEC-arch-099 — Nested archived item\n\nShould be excluded.\n`
    );

    const specs = parseSpecs(sddPath);
    const ids = specs[0]!.items.map((i) => i.id);
    expect(ids).not.toContain("SPEC-ARCH-099");
    expect(ids).toContain("SPEC-ARCH-001");
  });
});

describe("parseSpecs — recursive component tree", () => {
  function writeComponentItem(
    sddPath: string,
    componentPath: string,
    abbrev: string,
    id: string,
    title: string
  ): void {
    const dir = path.join(sddPath, "specs", componentPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${id}.md`),
      `---\nid: ${id}\ncomponent: ${componentPath}\nabbrev: ${abbrev}\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# ${id} — ${title}\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
  }

  it("finds items at any depth and groups them by area (first path segment)", () => {
    const { sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001", "Server item");
    writeComponentItem(sddPath, "hub/client/screens", "scr", "SPEC-scr-001", "Deep screen item");
    writeComponentItem(sddPath, "pipeline/artifacts", "wfa", "SPEC-wfa-001", "Artifact rule");

    const specs = parseSpecs(sddPath);
    const byDomain = new Map(specs.map((s) => [s.domain, s]));
    expect(byDomain.get("hub")?.items.map((i) => i.id).sort()).toEqual(["SPEC-HSRV-001", "SPEC-SCR-001"]);
    expect(byDomain.get("pipeline")?.items.map((i) => i.id)).toEqual(["SPEC-WFA-001"]);
  });

  it("exposes the full component path on each item; legacy domain items get a one-segment path", () => {
    const { sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/client/screens", "scr", "SPEC-scr-001", "Deep item");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Legacy item", "## Invariant\nx\n\n## Acceptance criteria\n- x");

    const specs = parseSpecs(sddPath);
    const deep = specs.find((s) => s.domain === "hub")?.items[0] as { component?: string };
    const legacy = specs.find((s) => s.domain === "architecture")?.items[0] as { component?: string };
    expect(deep?.component).toBe("hub/client/screens");
    expect(legacy?.component).toBe("architecture");
  });

  it("skips archive directories at every depth", () => {
    const { sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001", "Live item");
    writeComponentItem(sddPath, "hub/server/archive", "hsrv", "SPEC-hsrv-002", "Archived item");

    const specs = parseSpecs(sddPath);
    const hub = specs.find((s) => s.domain === "hub");
    expect(hub?.items.map((i) => i.id)).toEqual(["SPEC-HSRV-001"]);
  });

  it("does not parse component.md manifests as spec items", () => {
    const { sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001", "Item");
    fs.writeFileSync(
      path.join(sddPath, "specs", "hub", "server", "component.md"),
      "---\ncomponent: hub/server\nabbrev: hsrv\nscope: [hub/server/**]\ndepends-on: []\n---\n\n# hub/server\n"
    );

    const specs = parseSpecs(sddPath);
    const hub = specs.find((s) => s.domain === "hub");
    expect(hub?.items).toHaveLength(1);
  });

  it("discovers a .tests.json mapping sitting next to nested component items", () => {
    const { workspaceRoot, sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/client/screens", "scr", "SPEC-scr-001", "Screen item");
    const reportPath = path.join(workspaceRoot, "report.json");
    fs.writeFileSync(reportPath, VITEST_REPORT_ALL_PASSING);
    fs.writeFileSync(
      path.join(sddPath, "specs", "hub", "client", "screens", "SPEC-scr.tests.json"),
      JSON.stringify({ runner: "vitest", report: "report.json", items: { "SPEC-scr-001": ["Node.js server starts correctly"] } })
    );

    const specs = parseSpecs(sddPath);
    const item = specs.find((s) => s.domain === "hub")?.items[0];
    expect(item?.testStatus.status).toBe("passing");
  });

  it("treats a mapping file with missing report/items fields as absent instead of crashing", () => {
    const { sddPath } = makeWorkspace();
    writeComponentItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001", "Item");
    fs.writeFileSync(
      path.join(sddPath, "specs", "hub", "server", "SPEC-hsrv.tests.json"),
      "{}"
    );

    const specs = parseSpecs(sddPath);
    const item = specs.find((s) => s.domain === "hub")?.items[0];
    expect(item?.testStatus.status).toBe("not-run");
  });
});
