import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SCRIPT = path.join(REPO_ROOT, "plugin", "scripts", "stamp.js");

function run(args: string[], cwd: string): { stdout: string; code: number } {
  try {
    return { stdout: execFileSync("node", [SCRIPT, ...args], { cwd, encoding: "utf8" }), code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { stdout: `${err.stdout ?? ""}${err.stderr ?? ""}`, code: err.status ?? -1 };
  }
}

function shellStripHash(file: string): string {
  return execFileSync("bash", ["-c", `grep -v "^version:" "${file}" | shasum -a 256 | cut -c1-8`], {
    encoding: "utf8",
  }).trim();
}

function makeProject(): string {
  const root = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "stamp-test-")), "proj");
  fs.mkdirSync(path.join(root, ".sdd", "specs", "hub", "server"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "specs", "hub", "client"), { recursive: true });
  return root;
}

function writeItem(root: string, rel: string, id: string, component: string, extraFm = ""): string {
  const file = path.join(root, ".sdd", "specs", rel);
  fs.writeFileSync(
    file,
    `---\nid: ${id}\ncomponent: ${component}\nabbrev: x\nstatus: active\naliases: []\n${extraFm}version: "00000000"\n---\n\n# ${id} — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
  );
  return file;
}

describe("stamp.js", () => {
  it("version: matches the canonical shell pipeline exactly and is idempotent", () => {
    const root = makeProject();
    const file = writeItem(root, "hub/server/SPEC-hsrv-001.md", "SPEC-hsrv-001", "hub/server");

    const first = run(["version", "--all"], root);
    expect(first.code).toBe(0);
    expect(first.stdout).toContain("SPEC-hsrv-001 00000000 →");

    const stored = /version: "([0-9a-f]{8})"/.exec(fs.readFileSync(file, "utf8"))![1];
    expect(stored).toBe(shellStripHash(file));

    const second = run(["version", "--all"], root);
    expect(second.code).toBe(0);
    expect(second.stdout).toBe("");
  });

  it("contract: removes self-stamps, re-stamps endpoints, and converges under check", () => {
    const root = makeProject();
    writeItem(root, "hub/client/SPEC-hcli-004.md", "SPEC-hcli-004", "hub/client");
    const contract = writeItem(
      root,
      "hub/server/SPEC-hsrv-012.md",
      "SPEC-hsrv-012",
      "hub/server",
      "contract-consumer: hub/client\ncontract-synced: [SPEC-hsrv-012@deadbeef, SPEC-hcli-004@deadbeef]\n"
    );
    run(["version", "--all"], root);

    const stamp = run(["contract", contract], root);
    expect(stamp.code).toBe(0);
    expect(stamp.stdout).toContain("removed 1 self-stamp(s)");

    const check = run(["check", "--all"], root);
    expect(check.code).toBe(0);

    // The contract's own version covers the freshly written stamps.
    expect(run(["version", "--all"], root).stdout).toBe("");
  });

  it("contract: hard-errors on unresolvable endpoints without writing anything", () => {
    const root = makeProject();
    const contract = writeItem(
      root,
      "hub/server/SPEC-hsrv-020.md",
      "SPEC-hsrv-020",
      "hub/server",
      "contract-consumer: hub/client\ncontract-synced: [SPEC-none-999@deadbeef]\n"
    );
    const before = fs.readFileSync(contract, "utf8");

    const result = run(["contract", contract], root);
    expect(result.code).toBe(2);
    expect(result.stdout).toContain("SPEC-none-999");
    expect(fs.readFileSync(contract, "utf8")).toBe(before);
  });

  it("check: flags a wrong version hash and a drifted stamp", () => {
    const root = makeProject();
    const item = writeItem(root, "hub/client/SPEC-hcli-001.md", "SPEC-hcli-001", "hub/client");
    // Stored 00000000 matches neither convention.
    const bad = run(["check", item], root);
    expect(bad.code).toBe(1);
    expect(bad.stdout).toContain("does not match content");

    run(["version", item], root);
    expect(run(["check", item], root).code).toBe(0);

    const contract = writeItem(
      root,
      "hub/server/SPEC-hsrv-030.md",
      "SPEC-hsrv-030",
      "hub/server",
      "contract-consumer: hub/client\ncontract-synced: [SPEC-hcli-001@deadbeef]\n"
    );
    run(["version", contract], root);
    const drift = run(["check", contract], root);
    expect(drift.code).toBe(1);
    expect(drift.stdout).toContain("drifted");
  });

  it("version: matches the shell pipeline for files without a trailing newline", () => {
    const root = makeProject();
    const file = path.join(root, ".sdd", "specs", "hub", "server", "SPEC-hsrv-002.md");
    fs.writeFileSync(
      file,
      `---\nid: SPEC-hsrv-002\ncomponent: hub/server\nabbrev: x\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# SPEC-hsrv-002 — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x`
    );
    run(["version", file], root);
    const stored = /version: "([0-9a-f]{8})"/.exec(fs.readFileSync(file, "utf8"))![1];
    expect(stored).toBe(shellStripHash(file));
  });

  it("version: inserts a missing version field before the closing frontmatter delimiter", () => {
    const root = makeProject();
    const file = path.join(root, ".sdd", "specs", "hub", "server", "SPEC-hsrv-003.md");
    fs.writeFileSync(
      file,
      `---\nid: SPEC-hsrv-003\ncomponent: hub/server\nabbrev: x\nstatus: active\naliases: []\n---\n\n# SPEC-hsrv-003 — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    const first = run(["version", file], root);
    expect(first.code).toBe(0);
    expect(first.stdout).toContain("(none) →");
    const content = fs.readFileSync(file, "utf8");
    expect(content.match(/^version: "[0-9a-f]{8}"$/m)).not.toBeNull();
    // Idempotent after insertion.
    expect(run(["version", file], root).stdout).toBe("");
    expect(run(["check", file], root).code).toBe(0);
  });

  it("contract: reads a wrapped multi-line synced list whole and rewrites it single-line", () => {
    const root = makeProject();
    writeItem(root, "hub/client/SPEC-hcli-004.md", "SPEC-hcli-004", "hub/client");
    writeItem(root, "hub/client/SPEC-hcli-005.md", "SPEC-hcli-005", "hub/client");
    const contract = path.join(root, ".sdd", "specs", "hub", "server", "SPEC-hsrv-013.md");
    fs.writeFileSync(
      contract,
      `---\nid: SPEC-hsrv-013\ncomponent: hub/server\nabbrev: x\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-hcli-004@deadbeef,\n  SPEC-hcli-005@deadbeef]\nversion: "00000000"\n---\n\n# SPEC-hsrv-013 — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    run(["version", "--all"], root);

    const result = run(["contract", contract], root);
    expect(result.code).toBe(0);
    const content = fs.readFileSync(contract, "utf8");
    // Single-line list, both endpoints stamped, no orphan continuation line.
    expect(content).toMatch(/^contract-synced: \[SPEC-hcli-004@[0-9a-f]{8}, SPEC-hcli-005@[0-9a-f]{8}\]$/m);
    expect(content).not.toMatch(/^\s+SPEC-hcli-005/m);
    expect(run(["check", contract], root).code).toBe(0);
  });

  it("contract: restamps a stale or version-less endpoint before stamping it", () => {
    const root = makeProject();
    // Endpoint with no version field at all.
    const endpoint = path.join(root, ".sdd", "specs", "hub", "client", "SPEC-hcli-006.md");
    fs.writeFileSync(
      endpoint,
      `---\nid: SPEC-hcli-006\ncomponent: hub/client\nabbrev: x\nstatus: active\naliases: []\n---\n\n# SPEC-hcli-006 — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    const contract = writeItem(
      root,
      "hub/server/SPEC-hsrv-014.md",
      "SPEC-hsrv-014",
      "hub/server",
      "contract-consumer: hub/client\ncontract-synced: [SPEC-hcli-006@deadbeef]\n"
    );
    run(["version", contract], root);

    const result = run(["contract", contract], root);
    expect(result.code).toBe(0);
    // No malformed 'ID@' stamp; endpoint gained a version and the stamp matches it.
    const stamped = /contract-synced: \[SPEC-hcli-006@([0-9a-f]{8})\]/.exec(fs.readFileSync(contract, "utf8"));
    expect(stamped).not.toBeNull();
    const endpointVersion = /version: "([0-9a-f]{8})"/.exec(fs.readFileSync(endpoint, "utf8"))![1];
    expect(stamped![1]).toBe(endpointVersion);
    expect(run(["check", "--all"], root).code).toBe(0);
  });

  it("errors with exit 2 on missing files and on contract --all", () => {
    const root = makeProject();
    expect(run(["check", "no/such/SPEC-x-001.md"], root).code).toBe(2);
    expect(run(["version", "no/such/SPEC-x-001.md"], root).code).toBe(2);
    const all = run(["contract", "--all"], root);
    expect(all.code).toBe(2);
    expect(all.stdout).toContain("does not support --all");
  });

  it("check: flags self-stamps as non-convergent", () => {
    const root = makeProject();
    const contract = writeItem(
      root,
      "hub/server/SPEC-hsrv-040.md",
      "SPEC-hsrv-040",
      "hub/server",
      "contract-consumer: hub/client\ncontract-synced: [SPEC-hsrv-040@00000000]\n"
    );
    run(["version", contract], root);
    const result = run(["check", contract], root);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain("self-stamp");
  });
});
