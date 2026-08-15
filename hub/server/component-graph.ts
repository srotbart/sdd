import fs from "node:fs";
import path from "node:path";
import { parseSpecs, parseGaps, collectSpecsTree } from "./sdd-parser.js";

// The component graph powering the hub's Map screen: one node per component
// (derived from item `component:` paths — legacy flat domains are one-level
// trees — plus any component.md manifest dirs), and one edge per manifest
// `depends-on` entry.

export interface ComponentNode {
  path: string; // full component path, e.g. "hub/client/screens"
  area: string; // first path segment
  depth: number; // 1 for an area, 2 for its direct children, ...
  abbrev: string | null; // from the manifest, when present
  description: string; // first body paragraph of the manifest, when present
  hasManifest: boolean;
  itemCount: number; // spec items attached directly to this node
  subtreeItemCount: number; // items in this node and all descendants
  openGaps: number; // open gaps in this node's subtree
  uncovered: number; // direct items with no **Tests:** block (session-start's definition)
  failing: number; // direct items with failing tests
  dependsOn: string[]; // manifest depends-on entries (component paths)
  contracts: ContractSummary[]; // contracts this component owns (as producer)
}

export type BindingStatus = "in-sync" | "producer-drifted" | "consumer-drifted" | "unknown";

export interface ComponentEdge {
  from: string;
  to: string;
  kind: "depends-on" | "contract";
  // Contract edges only: the owning contract item and its derived binding status.
  contractItem?: string;
  status?: BindingStatus;
}

export interface ContractSummary {
  item: string; // contract spec item id
  consumer: string;
  status: BindingStatus;
}

export interface ComponentGraph {
  nodes: ComponentNode[];
  edges: ComponentEdge[];
}

interface Manifest {
  dirPath: string; // component path derived from the directory location
  component: string | null; // declared path (should match dirPath)
  abbrev: string | null;
  dependsOn: string[];
  description: string;
}

// Minimal manifest frontmatter reader with list support (`key: [a, b]` and
// block `- x` forms) — manifests carry lists, which the generic single-line
// frontmatter parser doesn't handle.
function parseManifest(filePath: string, dirPath: string): Manifest | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  } catch {
    // Unreadable manifest is treated as absent: the component still renders
    // from its items, just without manifest metadata.
    return null;
  }
  const fmMatch = /^---\n([\s\S]*?)\n---/.exec(content);
  const fm = fmMatch ? fmMatch[1] : "";
  const body = fmMatch ? content.slice(fmMatch[0].length) : content;

  const line = (name: string): string | null => {
    const m = new RegExp(`^${name}:\\s*(.+)$`, "m").exec(fm);
    if (!m) return null;
    // Strip inline comments — the documented templates carry them.
    const v = m[1].replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, "");
    return v.startsWith("[") ? null : v || null;
  };

  const list = (name: string): string[] => {
    const inline = new RegExp(`^${name}:\\s*\\[([^\\]]*)\\]\\s*$`, "m").exec(fm);
    if (inline) {
      return inline[1]
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    const block = new RegExp(`^${name}:\\s*\\n((?:\\s+-\\s*.+\\n?)+)`, "m").exec(fm);
    if (block) {
      return block[1]
        .split("\n")
        .map((l) => l.replace(/^\s*-\s*/, "").replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    return [];
  };

  // First non-heading, non-empty paragraph of the body.
  const description =
    body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("#")) ?? "";

  return {
    dirPath,
    component: line("component"),
    abbrev: line("abbrev"),
    dependsOn: list("depends-on"),
    description,
  };
}

function collectManifests(tree: ReturnType<typeof collectSpecsTree>): Manifest[] {
  // collectSpecsTree is the single source for the specs-tree walk; this only
  // parses what it classified as manifests.
  const manifests: Manifest[] = [];
  for (const { componentPath, filePath } of tree.manifestFiles) {
    const parsed = parseManifest(filePath, componentPath);
    if (parsed) manifests.push(parsed);
  }
  return manifests;
}

export function buildComponentGraph(sddPath: string): ComponentGraph {
  // One tree walk serves both the spec parse and the manifest scan — this
  // endpoint refires on every watcher event, so the directory I/O matters.
  const tree = collectSpecsTree(path.join(sddPath, "specs"));
  const specs = parseSpecs(sddPath, tree);
  const gaps = parseGaps(sddPath);
  const manifests = collectManifests(tree);

  // Node set: every component path an item attaches to, every ancestor of it,
  // and every manifest directory.
  const nodePaths = new Set<string>();
  const addWithAncestors = (p: string): void => {
    const segs = p.split("/").filter(Boolean);
    for (let i = 1; i <= segs.length; i++) {
      nodePaths.add(segs.slice(0, i).join("/"));
    }
  };

  interface ItemContract {
    consumer: string;
    synced: Array<{ item: string; stamp: string }>;
  }
  interface ItemInfo {
    id: string;
    component: string;
    version: string;
    uncovered: boolean;
    failing: boolean;
    contract?: ItemContract;
  }
  const items: ItemInfo[] = [];
  for (const spec of specs) {
    for (const item of spec.items) {
      const component = (item as { component?: string }).component ?? spec.domain;
      addWithAncestors(component);
      const contract = (item as { contract?: ItemContract }).contract;
      // A contract's consumer is a component by declaration, even before it
      // holds items of its own — the edge needs both endpoints to exist.
      if (contract) addWithAncestors(contract.consumer);
      items.push({
        id: item.id,
        component,
        version: item.version,
        // Uncovered = no **Tests:** block at all — matching session-start.
        // A covered item whose report simply hasn't run is not "uncovered".
        uncovered: !item.body.includes("**Tests:**"),
        failing: item.testStatus.status === "failing",
        contract,
      });
    }
  }
  for (const m of manifests) addWithAncestors(m.dirPath);

  // Binding status: compare each synced stamp against the referenced item's
  // current version. Derived here, never stored in the artifact.
  const itemByUpperId = new globalThis.Map<string, ItemInfo>(items.map((i) => [i.id.toUpperCase(), i]));
  const inSubtree = (root: string, componentPath: string): boolean =>
    componentPath === root || componentPath.startsWith(root + "/");

  const bindingStatus = (contractId: string, producer: string, contract: ItemContract): BindingStatus => {
    // Scan every entry and report the most actionable state: a definite
    // producer/consumer drift beats an unknown — an early return on the first
    // oddity would let a third-party or missing entry mask a real drift.
    let producerDrift = false;
    let consumerDrift = false;
    let sawUnknown = false;
    let sawEntry = false;
    for (const entry of contract.synced) {
      // A self-stamp can never converge (writing the stamp changes the hash
      // the stamp would need to record) — ignored here; sdd-doctor flags it.
      if (entry.item.toUpperCase() === contractId.toUpperCase()) continue;
      sawEntry = true;
      const current = itemByUpperId.get(entry.item.toUpperCase());
      if (!current) {
        sawUnknown = true;
        continue;
      }
      if (current.version.toLowerCase() !== entry.stamp.toLowerCase()) {
        if (inSubtree(producer, current.component)) producerDrift = true;
        else if (inSubtree(contract.consumer, current.component)) consumerDrift = true;
        else sawUnknown = true;
      }
    }
    // Zero usable entries means the binding was never verified — fail closed.
    if (!sawEntry) return "unknown";
    if (producerDrift) return "producer-drifted";
    if (consumerDrift) return "consumer-drifted";
    return sawUnknown ? "unknown" : "in-sync";
  };

  // One derivation per contract item — the node summary and the edge must
  // never disagree about the same binding.
  const statusByContractItem = new globalThis.Map<string, BindingStatus>();
  for (const i of items) {
    if (i.contract) statusByContractItem.set(i.id, bindingStatus(i.id, i.component, i.contract));
  }

  const manifestByPath = new Map(manifests.map((m) => [m.dirPath, m]));

  const openGaps = gaps.filter((g) => g.status === "open");

  const nodes: ComponentNode[] = Array.from(nodePaths)
    .sort()
    .map((p) => {
      const manifest = manifestByPath.get(p);
      const direct = items.filter((i) => i.component === p);
      const subtree = items.filter((i) => inSubtree(p, i.component));
      return {
        path: p,
        area: p.split("/")[0],
        depth: p.split("/").length,
        abbrev: manifest?.abbrev ?? null,
        description: manifest?.description ?? "",
        hasManifest: manifest !== undefined,
        itemCount: direct.length,
        subtreeItemCount: subtree.length,
        openGaps: openGaps.filter((g) => inSubtree(p, g.domain)).length,
        uncovered: direct.filter((i) => i.uncovered).length,
        failing: direct.filter((i) => i.failing).length,
        dependsOn: manifest?.dependsOn ?? [],
        contracts: direct
          .filter((i) => i.contract)
          .map((i) => ({
            item: i.id,
            consumer: i.contract!.consumer,
            status: statusByContractItem.get(i.id) ?? "unknown",
          })),
      };
    });

  // Edges only between paths that exist as nodes — a dangling depends-on
  // stays visible on the node's own dependsOn list but draws nothing.
  const edges: ComponentEdge[] = [];
  for (const m of manifests) {
    // Deduped: a repeated depends-on entry must not produce duplicate edges
    // (and duplicate React keys downstream).
    for (const target of new Set(m.dependsOn)) {
      if (nodePaths.has(target)) {
        edges.push({ from: m.dirPath, to: target, kind: "depends-on" });
      }
    }
  }

  // Contract edges: consumer → producer (the consumer relies on the
  // producer's promise; the item lives with the producer). The consumer node
  // always exists — addWithAncestors registered it when the item was read.
  for (const i of items) {
    if (!i.contract) continue;
    edges.push({
      from: i.contract.consumer,
      to: i.component,
      kind: "contract",
      contractItem: i.id,
      status: statusByContractItem.get(i.id) ?? "unknown",
    });
  }

  return { nodes, edges };
}
