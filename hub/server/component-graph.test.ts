import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildComponentGraph } from "./component-graph.js";

function makeSdd(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-graph-test-"));
  const sddPath = path.join(root, ".sdd");
  fs.mkdirSync(path.join(sddPath, "specs"), { recursive: true });
  fs.mkdirSync(path.join(sddPath, "gaps"), { recursive: true });
  return sddPath;
}

function writeItem(sddPath: string, component: string, abbrev: string, id: string, extra = ""): void {
  const dir = path.join(sddPath, "specs", component);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${id}.md`),
    `---\nid: ${id}\ncomponent: ${component}\nabbrev: ${abbrev}\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# ${id} — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n${extra}`
  );
}

function writeManifest(sddPath: string, component: string, abbrev: string, dependsOn: string[]): void {
  const dir = path.join(sddPath, "specs", component);
  fs.mkdirSync(dir, { recursive: true });
  const deps = dependsOn.length ? `depends-on:\n${dependsOn.map((d) => `  - ${d}`).join("\n")}\n` : "depends-on: []\n";
  fs.writeFileSync(
    path.join(dir, "component.md"),
    `---\ncomponent: ${component}\nabbrev: ${abbrev}\nscope: [src/**]\n${deps}---\n\n# ${component}\n\nWhat this component is.\n`
  );
}

describe("buildComponentGraph", () => {
  it("derives nodes from item component paths including ancestors", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/client/screens", "scr", "SPEC-scr-001");
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");

    const graph = buildComponentGraph(sddPath);
    const paths = graph.nodes.map((n) => n.path);
    expect(paths).toEqual(["hub", "hub/client", "hub/client/screens", "hub/server"]);
    const hub = graph.nodes.find((n) => n.path === "hub");
    expect(hub?.itemCount).toBe(0);
    expect(hub?.subtreeItemCount).toBe(2);
    expect(hub?.depth).toBe(1);
  });

  it("treats a legacy flat domain as a one-level node", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "authentication");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "SPEC-auth-001.md"),
      `---\nid: SPEC-auth-001\ndomain: authentication\nabbrev: auth\nstatus: active\naliases: []\nversion: "00000000"\n---\n\n# SPEC-auth-001 — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );

    const graph = buildComponentGraph(sddPath);
    expect(graph.nodes.map((n) => n.path)).toEqual(["authentication"]);
    expect(graph.nodes[0].itemCount).toBe(1);
    expect(graph.edges).toEqual([]);
  });

  it("reads manifest metadata and builds depends-on edges between existing nodes", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-001");
    writeManifest(sddPath, "hub/server", "hsrv", []);
    writeManifest(sddPath, "hub/client", "hcli", ["hub/server", "nonexistent/target"]);

    const graph = buildComponentGraph(sddPath);
    const client = graph.nodes.find((n) => n.path === "hub/client");
    expect(client?.hasManifest).toBe(true);
    expect(client?.abbrev).toBe("hcli");
    expect(client?.description).toBe("What this component is.");
    expect(client?.dependsOn).toEqual(["hub/server", "nonexistent/target"]);
    // Only the resolvable edge is emitted.
    expect(graph.edges).toEqual([{ from: "hub/client", to: "hub/server", kind: "depends-on" }]);
  });

  it("counts open gaps per subtree and uncovered items per node", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");
    fs.writeFileSync(
      path.join(sddPath, "gaps", "GAP-hsrv-a1b2c3d.md"),
      `---\nid: GAP-hsrv-a1b2c3d\nspec-item: SPEC-hsrv-001\ncomponent: hub/server\nstatus: open\ndiscovered: "2026-08-15T00:00:00Z"\naudit-spec-version: "00000000"\nclosed-by: null\ndeferred-reason: null\n---\n\n# Gap: g\n\n**Location:** \`x:1\`\n**Reasoning:** r\n`
    );

    const graph = buildComponentGraph(sddPath);
    const hub = graph.nodes.find((n) => n.path === "hub");
    const server = graph.nodes.find((n) => n.path === "hub/server");
    expect(server?.openGaps).toBe(1);
    expect(hub?.openGaps).toBe(1); // rolls up the subtree
    expect(server?.uncovered).toBe(1); // no **Tests:** block in the body
  });

  it("derives binding status on contract edges from synced version stamps", () => {
    const sddPath = makeSdd();
    // Producer-side contract item, stamped against itself and the consumer item.
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-012.md"),
      `---\nid: SPEC-hsrv-012\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-hsrv-012@aaaaaaaa, SPEC-hcli-004@bbbbbbbb]\nversion: "aaaaaaaa"\n---\n\n# SPEC-hsrv-012 — WS message schemas match client types\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-004");
    // hcli-004 was written with version 00000000 — the bbbbbbbb stamp is stale.

    const graph = buildComponentGraph(sddPath);
    const edge = graph.edges.find((e) => e.kind === "contract");
    expect(edge).toMatchObject({
      from: "hub/client",
      to: "hub/server",
      contractItem: "SPEC-HSRV-012",
      status: "consumer-drifted",
    });
    const server = graph.nodes.find((n) => n.path === "hub/server");
    expect(server?.contracts).toEqual([
      { item: "SPEC-HSRV-012", consumer: "hub/client", status: "consumer-drifted" },
    ]);
  });

  it("reports in-sync when all stamps match and unknown when an endpoint is missing", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    const writeContract = (id: string, synced: string) =>
      fs.writeFileSync(
        path.join(dir, `${id}.md`),
        `---\nid: ${id}\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [${synced}]\nversion: "aaaaaaaa"\n---\n\n# ${id} — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
      );
    writeContract("SPEC-hsrv-020", "SPEC-hsrv-020@aaaaaaaa, SPEC-hcli-004@00000000");
    writeContract("SPEC-hsrv-021", "SPEC-none-999@12345678");
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-004");

    const graph = buildComponentGraph(sddPath);
    const byItem = new globalThis.Map(graph.edges.filter((e) => e.kind === "contract").map((e) => [e.contractItem, e.status]));
    expect(byItem.get("SPEC-HSRV-020")).toBe("in-sync");
    expect(byItem.get("SPEC-HSRV-021")).toBe("unknown");
  });

  it("treats an empty or all-self-stamped contract-synced as unknown, never in-sync", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    // Only a self-stamp: ignored (can never converge), so zero usable entries.
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-030.md"),
      `---\nid: SPEC-hsrv-030\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-hsrv-030@aaaaaaaa]\nversion: "aaaaaaaa"\n---\n\n# SPEC-hsrv-030 — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-001");

    const graph = buildComponentGraph(sddPath);
    const edge = graph.edges.find((e) => e.contractItem === "SPEC-HSRV-030");
    expect(edge?.status).toBe("unknown");
  });

  it("a definite drift outranks an unknown entry regardless of order", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    // First entry unresolvable, second a real producer-side drift.
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-031.md"),
      `---\nid: SPEC-hsrv-031\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-none-999@12345678, SPEC-hsrv-001@ffffffff]\nversion: "aaaaaaaa"\n---\n\n# SPEC-hsrv-031 — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001"); // version 00000000 ≠ ffffffff
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-001");

    const graph = buildComponentGraph(sddPath);
    const edge = graph.edges.find((e) => e.contractItem === "SPEC-HSRV-031");
    expect(edge?.status).toBe("producer-drifted");
  });

  it("dedupes repeated depends-on entries into a single edge", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-001");
    writeManifest(sddPath, "hub/client", "hcli", ["hub/server", "hub/server"]);

    const graph = buildComponentGraph(sddPath);
    expect(graph.edges.filter((e) => e.kind === "depends-on")).toHaveLength(1);
  });

  it("strips inline comments from manifest and item structural fields", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-001.md"),
      `---\nid: SPEC-hsrv-001\ncomponent: hub/server   # the producer\nabbrev: hsrv\nstatus: active   # active | deprecated | aliased\naliases: []\nversion: "00000000"\n---\n\n# SPEC-hsrv-001 — item\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    fs.writeFileSync(
      path.join(dir, "component.md"),
      `---\ncomponent: hub/server   # full path\nabbrev: hsrv   # shorthand\nscope: [src/**]\ndepends-on: []\n---\n\n# hub/server\n\nDesc.\n`
    );

    const graph = buildComponentGraph(sddPath);
    const server = graph.nodes.find((n) => n.path === "hub/server");
    expect(server?.itemCount).toBe(1);
    expect(server?.abbrev).toBe("hsrv");
  });

  it("reads wrapped multi-line contract-synced lists whole (a drifted second entry is not lost)", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    // Second entry on a continuation line carries the drift.
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-050.md"),
      `---\nid: SPEC-hsrv-050\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-hsrv-001@00000000,\n  SPEC-hcli-004@deadbeef]\nversion: "aaaaaaaa"\n---\n\n# SPEC-hsrv-050 — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001"); // version 00000000 — matches
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-004"); // version 00000000 ≠ deadbeef

    const graph = buildComponentGraph(sddPath);
    const edge = graph.edges.find((e) => e.contractItem === "SPEC-HSRV-050");
    expect(edge?.status).toBe("consumer-drifted");
  });

  it("treats an unterminated contract-synced list as unknown, never in-sync", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub", "server");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "SPEC-hsrv-051.md"),
      `---\nid: SPEC-hsrv-051\ncomponent: hub/server\nabbrev: hsrv\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [SPEC-hcli-004@00000000\nversion: "aaaaaaaa"\n---\n\n# SPEC-hsrv-051 — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
    );
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-004");

    const graph = buildComponentGraph(sddPath);
    const edge = graph.edges.find((e) => e.contractItem === "SPEC-HSRV-051");
    expect(edge?.status).toBe("unknown");
  });

  it("parses the documented component.md template — inline comments do not empty block lists", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");
    writeItem(sddPath, "hub/client/screens", "scr", "SPEC-scr-001");
    // Verbatim shape of the manifest template in plugin/references/artifacts/spec.md.
    fs.writeFileSync(
      path.join(sddPath, "specs", "hub", "client", "screens", "component.md"),
      [
        "---",
        "component: hub/client/screens    # full path — must match the directory",
        "abbrev: scr                      # shorthand for NEW spec items minted here",
        "scope:                           # path globs of the code this component owns",
        "  - hub/client/src/screens/**",
        "depends-on:                      # other components, full paths; may be empty",
        "  - hub/server",
        "---",
        "",
        "# hub/client/screens",
        "",
        "One paragraph: what this component is and where it lives in the codebase.",
        "",
      ].join("\n")
    );

    const graph = buildComponentGraph(sddPath);
    const screens = graph.nodes.find((n) => n.path === "hub/client/screens");
    expect(screens?.abbrev).toBe("scr");
    expect(screens?.dependsOn).toEqual(["hub/server"]);
    expect(graph.edges).toContainEqual({ from: "hub/client/screens", to: "hub/server", kind: "depends-on" });
  });

  it("an empty manifest field never captures the following frontmatter line as its value", () => {
    const sddPath = makeSdd();
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001");
    fs.writeFileSync(
      path.join(sddPath, "specs", "hub", "server", "component.md"),
      `---\ncomponent: hub/server\nabbrev:\ndepends-on: []\n---\n\n# hub/server\n\nDesc.\n`
    );

    const graph = buildComponentGraph(sddPath);
    const server = graph.nodes.find((n) => n.path === "hub/server");
    expect(server?.abbrev).toBeNull();
    expect(server?.dependsOn).toEqual([]);
  });

  it("attributes drift to the more specific root when the contract lives at a common ancestor", () => {
    const sddPath = makeSdd();
    const dir = path.join(sddPath, "specs", "hub");
    fs.mkdirSync(dir, { recursive: true });
    const writeLcaContract = (id: string, synced: string) =>
      fs.writeFileSync(
        path.join(dir, `${id}.md`),
        `---\nid: ${id}\ncomponent: hub\nabbrev: hub\nstatus: active\naliases: []\ncontract-consumer: hub/client\ncontract-synced: [${synced}]\nversion: "aaaaaaaa"\n---\n\n# ${id} — contract\n\n## Invariant\nx\n\n## Acceptance criteria\n- x\n`
      );
    // Consumer subtree (hub/client ⊂ hub) drifts: the consumer claims it.
    writeLcaContract("SPEC-hub-001", "SPEC-hcli-004@bbbbbbbb");
    // Producer subtree outside the consumer (hub/server) drifts: producer's.
    writeLcaContract("SPEC-hub-002", "SPEC-hsrv-001@ffffffff");
    writeItem(sddPath, "hub/client", "hcli", "SPEC-hcli-004"); // version 00000000 ≠ bbbbbbbb
    writeItem(sddPath, "hub/server", "hsrv", "SPEC-hsrv-001"); // version 00000000 ≠ ffffffff

    const graph = buildComponentGraph(sddPath);
    const byItem = new globalThis.Map(
      graph.edges.filter((e) => e.kind === "contract").map((e) => [e.contractItem, e.status])
    );
    expect(byItem.get("SPEC-HUB-001")).toBe("consumer-drifted");
    expect(byItem.get("SPEC-HUB-002")).toBe("producer-drifted");
  });

  it("returns an empty graph for a missing specs directory", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-graph-empty-"));
    const graph = buildComponentGraph(path.join(root, ".sdd"));
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });
});
