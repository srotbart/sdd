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

  it("returns an empty graph for a missing specs directory", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-graph-empty-"));
    const graph = buildComponentGraph(path.join(root, ".sdd"));
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });
});
