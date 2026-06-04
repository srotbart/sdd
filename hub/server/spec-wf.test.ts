import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseSpecs, parseGaps } from "./sdd-parser.js";

// These tests exercise the parser at its module boundary for the workflow-domain
// spec items that make claims about how spec items are stored on disk and how
// per-item metadata (domain, version) and per-item stale-audit detection work.

function makeWorkspace(): { workspaceRoot: string; sddPath: string } {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-wf-test-"));
  const sddPath = path.join(workspaceRoot, ".sdd");
  fs.mkdirSync(path.join(sddPath, "specs"), { recursive: true });
  return { workspaceRoot, sddPath };
}

function writeSpecItem(
  sddPath: string,
  domain: string,
  abbrev: string,
  id: string,
  title: string,
  body: string,
  version = "651d284b",
  includeDomain = true
): string {
  fs.mkdirSync(path.join(sddPath, "specs", domain), { recursive: true });
  const domainLine = includeDomain ? `domain: ${domain}\n` : "";
  const filePath = path.join(sddPath, "specs", domain, `${id}.md`);
  fs.writeFileSync(
    filePath,
    `---\nid: ${id}\n${domainLine}abbrev: ${abbrev}\nstatus: active\naliases: []\nversion: "${version}"\n---\n\n# ${id} — ${title}\n\n${body}\n`
  );
  return filePath;
}

function writeGap(
  sddPath: string,
  id: string,
  specItem: string,
  auditVersion: string
): void {
  fs.mkdirSync(path.join(sddPath, "gaps"), { recursive: true });
  fs.writeFileSync(
    path.join(sddPath, "gaps", `${id}.md`),
    `---\nid: ${id}\nspec-item: ${specItem}\ndomain: workflow\nstatus: open\ndiscovered: "2026-05-17T00:00:00Z"\naudit-spec-version: "${auditVersion}"\nclosed-by: null\ndeferred-reason: null\n---\n\n# Gap: example divergence\n\n**Location:** somewhere.ts:1\n\n**Reasoning:** test gap.\n`
  );
}

describe("SPEC-wf-013: spec items stored as individual files in domain subdirectories", () => {
  it("SPEC-wf-013: parses each per-item file under a domain subdirectory into one spec item", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-013", "Per-item files", "Each item is its own file.");
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-014", "Per-item metadata", "Each item carries metadata.");

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(1);
    const ids = specs[0]!.items.map((i) => i.id).sort();
    expect(ids).toEqual(["SPEC-WF-013", "SPEC-WF-014"]);
    expect(specs[0]!.domain).toBe("workflow");
  });

  it("SPEC-wf-013: skips items under an archive subdirectory rather than treating them as active", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-001", "Active item", "Still active.");
    const archiveDir = path.join(sddPath, "specs", "workflow", "archive");
    fs.mkdirSync(archiveDir, { recursive: true });
    fs.writeFileSync(
      path.join(archiveDir, "SPEC-wf-000.md"),
      `---\nid: SPEC-wf-000\ndomain: workflow\nabbrev: wf\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# SPEC-wf-000 — Archived item\n\nObsolete.\n`
    );

    const specs = parseSpecs(sddPath);
    const ids = specs[0]!.items.map((i) => i.id);
    expect(ids).toContain("SPEC-WF-001");
    expect(ids).not.toContain("SPEC-WF-000");
  });

  it("SPEC-wf-013: a flat domain-level file (no per-item frontmatter) yields no spec item", () => {
    // No flat SPEC-{domain}.md files exist — a file lacking id/domain/abbrev frontmatter
    // is not parsed as a spec item, so the subdirectory is the only source of items.
    const { sddPath } = makeWorkspace();
    fs.mkdirSync(path.join(sddPath, "specs", "workflow"), { recursive: true });
    fs.writeFileSync(
      path.join(sddPath, "specs", "workflow", "SPEC-workflow.md"),
      "# SPEC-workflow\n\nA legacy flat file with no per-item frontmatter.\n"
    );

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(0);
  });
});

describe("SPEC-wf-014: each spec item file carries its own domain metadata and per-item version hash", () => {
  it("SPEC-wf-014: an item file carries its own version hash from frontmatter", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-014", "Versioned item", "Body.", "abcd1234");

    const specs = parseSpecs(sddPath);
    expect(specs[0]!.items[0]!.version).toBe("abcd1234");
  });

  it("SPEC-wf-014: domain identity comes from per-item frontmatter; two domains stay separate", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-014", "WF item", "Body.");
    writeSpecItem(sddPath, "architecture", "arch", "SPEC-arch-001", "Arch item", "Body.");

    const specs = parseSpecs(sddPath);
    const byDomain = Object.fromEntries(specs.map((s) => [s.domain, s.items.map((i) => i.id)]));
    expect(byDomain["workflow"]).toEqual(["SPEC-WF-014"]);
    expect(byDomain["architecture"]).toEqual(["SPEC-ARCH-001"]);
  });

  it("SPEC-wf-014: an item file MISSING the domain frontmatter field is rejected (not silently grouped)", () => {
    // The domain field is required per-item metadata; without it the item is not parsed,
    // proving domain identity is carried by the item rather than inferred from the path.
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-099", "No domain field", "Body.", "deadbeef", false);

    const specs = parseSpecs(sddPath);
    expect(specs).toHaveLength(0);
  });
});

describe("SPEC-wf-015: gap audit-spec-version and stale-audit detection are per spec item", () => {
  it("SPEC-wf-015: a gap stores the audit-spec-version of the specific spec item it was found against", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-015", "Stale detection", "Body.", "11112222");
    writeGap(sddPath, "GAP-wf-001", "SPEC-wf-015", "11112222");

    const gaps = parseGaps(sddPath);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]!.specItem).toBe("SPEC-wf-015");
    expect(gaps[0]!.auditVersion).toBe("11112222");
  });

  it("SPEC-wf-015: a gap is stale when its audit-spec-version differs from the referenced item's current version", () => {
    // Per-item stale detection: compare the gap's audit-spec-version against the
    // current version of the exact spec item it references.
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-015", "Stale detection", "Body changed.", "99998888");
    writeGap(sddPath, "GAP-wf-001", "SPEC-wf-015", "11112222");

    const specs = parseSpecs(sddPath);
    const gaps = parseGaps(sddPath);
    const item = specs[0]!.items.find((i) => i.id === "SPEC-WF-015")!;
    const gap = gaps.find((g) => g.id === "GAP-wf-001")!;

    const isStale = gap.auditVersion !== item.version;
    expect(isStale).toBe(true);
  });

  it("SPEC-wf-015: a gap is fresh when its audit-spec-version equals the referenced item's current version", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-015", "Stale detection", "Body.", "55556666");
    writeGap(sddPath, "GAP-wf-001", "SPEC-wf-015", "55556666");

    const specs = parseSpecs(sddPath);
    const gaps = parseGaps(sddPath);
    const item = specs[0]!.items.find((i) => i.id === "SPEC-WF-015")!;
    const gap = gaps.find((g) => g.id === "GAP-wf-001")!;

    const isStale = gap.auditVersion !== item.version;
    expect(isStale).toBe(false);
  });

  it("SPEC-wf-015: stale detection is per-item — a sibling item's version change does not stale this gap", () => {
    const { sddPath } = makeWorkspace();
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-014", "Sibling item", "Changed body.", "aaaabbbb");
    writeSpecItem(sddPath, "workflow", "wf", "SPEC-wf-015", "Audited item", "Body.", "77778888");
    writeGap(sddPath, "GAP-wf-001", "SPEC-wf-015", "77778888");

    const specs = parseSpecs(sddPath);
    const gaps = parseGaps(sddPath);
    const item = specs[0]!.items.find((i) => i.id === "SPEC-WF-015")!;
    const gap = gaps.find((g) => g.id === "GAP-wf-001")!;

    // The gap references SPEC-wf-015 only; SPEC-wf-014 having a different version is irrelevant.
    expect(gap.auditVersion).toBe(item.version);
  });
});
