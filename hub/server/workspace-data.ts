import fs from "node:fs";
import path from "node:path";
import { getAllWorkspaces, getAgentIdsByWorkspace, type Workspace } from "./db/index.js";
import { parseSpecs, parseTargets, parseGaps, parseWorkItems } from "./sdd-parser.js";

export interface WorkspaceCounts {
  targetsAwaitingUser: number;
  targetsAwaitingAgent: number;
  targetsReady: number;
  targetsDraft: number;
  specs: number;
  specItems: number;
  openGaps: number;
  staleAuditDomains: number;
  workPending: number;
  workInProgress: number;
  workBlocked: number;
  workDoneToday: number;
}

export interface WorkspaceData extends Workspace {
  counts: WorkspaceCounts;
  agents: string[];
  lastActivity: string;
}

function latestMtime(dir: string): number {
  let latest = 0;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return latest;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = latestMtime(full);
      if (sub > latest) { latest = sub; }
    } else {
      try {
        const mtime = fs.statSync(full).mtimeMs;
        if (mtime > latest) { latest = mtime; }
      } catch { /* skip */ }
    }
  }
  return latest;
}

function computeStaleAuditDomains(
  specs: ReturnType<typeof parseSpecs>,
  gaps: ReturnType<typeof parseGaps>
): number {
  const itemVersionMap = new Map<string, string>();
  for (const spec of specs) {
    for (const item of spec.items) {
      itemVersionMap.set(item.id.toUpperCase(), item.version);
    }
  }

  const staleDomains = new Set<string>();
  for (const gap of gaps) {
    if (gap.status !== "open") continue;
    const specItemVersion = itemVersionMap.get(gap.specItem.toUpperCase());
    if (specItemVersion !== undefined && gap.auditVersion !== specItemVersion) {
      staleDomains.add(gap.domain);
    }
  }
  return staleDomains.size;
}

export function getWorkspacesEnriched(): WorkspaceData[] {
  const workspaces = getAllWorkspaces();
  const agentsByWs = getAgentIdsByWorkspace();

  return workspaces.map((ws) => {
    const sddPath = path.join(ws.path, ".sdd");
    const targets = parseTargets(sddPath);
    const gaps = parseGaps(sddPath);
    const workItems = parseWorkItems(sddPath);
    const specs = parseSpecs(sddPath);

    const today = new Date().toISOString().slice(0, 10);
    const counts: WorkspaceCounts = {
      targetsAwaitingUser: targets.filter((t) => t.status === "awaiting-user").length,
      targetsAwaitingAgent: targets.filter((t) => t.status === "awaiting-agent").length,
      targetsReady: targets.filter((t) => t.status === "ready").length,
      targetsDraft: targets.filter((t) => t.status === "draft").length,
      specs: specs.length,
      specItems: specs.reduce((sum, s) => sum + s.items.filter((i) => i.status === "active").length, 0),
      openGaps: gaps.filter((g) => g.status === "open").length,
      staleAuditDomains: computeStaleAuditDomains(specs, gaps),
      workPending: workItems.filter((w) => w.status === "pending").length,
      workInProgress: workItems.filter((w) => w.status === "in-progress").length,
      workBlocked: workItems.filter((w) => w.status === "blocked").length,
      workDoneToday: workItems.filter((w) => w.status === "done" && w.closed?.startsWith(today)).length,
    };

    const mtime = latestMtime(sddPath);
    const lastActivity = mtime > 0
      ? new Date(mtime).toISOString()
      : ws.created_at;

    return {
      ...ws,
      counts,
      agents: agentsByWs.get(ws.id) ?? [],
      lastActivity,
    };
  });
}
