import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { getDb, getAllWorkspaces, getRecentWorkspaces, getWorkspaceById, updateWorkspace, insertWorkspace } from "./db/index.js";
import { parseSpecs, parseTargets, parseGaps, parseWorkItems } from "./sdd-parser.js";
import { attachUiWebSocketServer, broadcastUpdate, broadcastSddChanged } from "./ws-ui.js";
import { getWorkspacesEnriched } from "./workspace-data.js";
export type { WorkspaceCounts, WorkspaceData } from "./workspace-data.js";
import { resolveArtifact } from "./sdd-artifact.js";
import { attachAgentWebSocketServer } from "./ws-agent.js";
import { startWatcher } from "./watcher.js";

const HOST = "127.0.0.1";
const PORT = 22351;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, "../client/dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".mjs":  "application/javascript",
  ".css":  "text/css",
  ".json": "application/json",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export const watcherRegistry = new Map<string, () => void>();

export function swapWatcher(
  workspaceId: string,
  newPath: string,
  onChange: (changedPath: string) => void,
  onSpecsChanged: () => void
): void {
  const oldCleanup = watcherRegistry.get(workspaceId);
  if (oldCleanup) { oldCleanup(); }
  const cleanup = startWatcher(newPath, onChange, onSpecsChanged);
  watcherRegistry.set(workspaceId, cleanup);
}

function serveStatic(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  const urlPath = req.url === "/" ? "/index.html" : (req.url ?? "/index.html");
  const safePath = path.join(CLIENT_DIST, path.normalize(urlPath));

  if (!safePath.startsWith(CLIENT_DIST)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      const indexPath = path.join(CLIENT_DIST, "index.html");
      fs.readFile(indexPath, (_err2, indexData) => {
        if (_err2) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(safePath);
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function browseFolder(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const script = "POSIX path of (choose folder with prompt \"Select project folder\")";
    const proc = spawn("osascript", ["-e", script]);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim().replace(/\/$/, ""));
      } else if (stderr.includes("User canceled")) {
        resolve(null);
      } else if (code === 1 && stdout.trim() === "") {
        resolve(null);
      } else {
        reject(new Error(`osascript exited ${code}: ${stderr.trim()}`));
      }
    });
    proc.on("error", (err) => reject(new Error(`osascript unavailable: ${err.message}`)));
  });
}

function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) { return diff; }
  }
  return 0;
}

function parseFrontmatterField(content: string, field: string): string {
  const match = new RegExp(`^${field}:\\s*(.+)$`, "m").exec(content);
  if (!match) { return ""; }
  return match[1].trim().replace(/^["']|["']$/g, "");
}

export function getPluginSkills(): { name: string; description: string }[] {
  const cacheBase = path.join(os.homedir(), ".claude", "plugins", "cache", "sdd", "sdd");
  let versions: string[];
  try {
    versions = fs.readdirSync(cacheBase).filter((v) => /^\d+\.\d+/.test(v));
  } catch {
    return [];
  }
  if (versions.length === 0) { return []; }
  versions.sort(semverCompare);
  const latest = versions[versions.length - 1];
  const skillsDir = path.join(cacheBase, latest, "skills");
  let skillDirs: string[];
  try {
    skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
  const skills: { name: string; description: string }[] = [];
  for (const dir of skillDirs) {
    const skillFile = path.join(skillsDir, dir, "SKILL.md");
    let content: string;
    try {
      content = fs.readFileSync(skillFile, "utf-8");
    } catch {
      continue;
    }
    const name = parseFrontmatterField(content, "name");
    const description = parseFrontmatterField(content, "description");
    if (name) {
      skills.push({ name, description });
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res: http.ServerResponse, status: number, data: unknown): void {
  const payload = JSON.stringify(data);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(payload);
}

async function handleApi(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<boolean> {
  const url = req.url ?? "";
  const method = req.method ?? "GET";

  if (method === "GET" && url === "/browse-folder") {
    try {
      const pickedPath = await browseFolder();
      json(res, 200, { path: pickedPath });
    } catch (err) {
      json(res, 500, { error: String(err) });
    }
    return true;
  }

  const specsMatch = /^\/workspaces\/([^/?]+)\/specs$/.exec(url);
  if (method === "GET" && specsMatch) {
    const ws = getWorkspaceById(specsMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    json(res, 200, parseSpecs(path.join(ws.path, ".sdd")));
    return true;
  }

  const workItemsMatch = /^\/workspaces\/([^/?]+)\/work-items$/.exec(url);
  if (method === "GET" && workItemsMatch) {
    const ws = getWorkspaceById(workItemsMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    json(res, 200, parseWorkItems(path.join(ws.path, ".sdd")));
    return true;
  }

  const gapsMatch = /^\/workspaces\/([^/?]+)\/gaps$/.exec(url);
  if (method === "GET" && gapsMatch) {
    const ws = getWorkspaceById(gapsMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    json(res, 200, parseGaps(path.join(ws.path, ".sdd")));
    return true;
  }

  const targetsMatch = /^\/workspaces\/([^/?]+)\/targets$/.exec(url);
  if (method === "GET" && targetsMatch) {
    const ws = getWorkspaceById(targetsMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    json(res, 200, parseTargets(path.join(ws.path, ".sdd")));
    return true;
  }

  const projectionsListMatch = /^\/workspaces\/([^/?]+)\/projections$/.exec(url);
  if (method === "GET" && projectionsListMatch) {
    const ws = getWorkspaceById(projectionsListMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    const projectionsDir = path.join(ws.path, ".sdd", "projections");
    const result: { name: string; lastModified: string }[] = [];
    if (fs.existsSync(projectionsDir)) {
      const files = fs.readdirSync(projectionsDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const stat = fs.statSync(path.join(projectionsDir, file));
        result.push({ name: file.replace(/\.md$/, ""), lastModified: stat.mtime.toISOString() });
      }
    }
    json(res, 200, result);
    return true;
  }

  const projectionsItemMatch = /^\/workspaces\/([^/?]+)\/projections\/([^/?]+)$/.exec(url);
  if (method === "GET" && projectionsItemMatch) {
    const ws = getWorkspaceById(projectionsItemMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    const filePath = path.join(ws.path, ".sdd", "projections", `${projectionsItemMatch[2]}.md`);
    if (!fs.existsSync(filePath)) {
      json(res, 404, { error: "projection not found" });
      return true;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(content);
    return true;
  }

  const designsListMatch = /^\/workspaces\/([^/?]+)\/designs$/.exec(url);
  if (method === "GET" && designsListMatch) {
    const ws = getWorkspaceById(designsListMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    const designsDir = path.join(ws.path, ".sdd", "design");
    const result: { name: string; lastModified: string }[] = [];
    if (fs.existsSync(designsDir)) {
      const entries = fs.readdirSync(designsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) { continue; }
        const designFile = path.join(designsDir, entry.name, "design.md");
        if (!fs.existsSync(designFile)) { continue; }
        const stat = fs.statSync(designFile);
        result.push({ name: entry.name, lastModified: stat.mtime.toISOString() });
      }
    }
    json(res, 200, result);
    return true;
  }

  const designsItemMatch = /^\/workspaces\/([^/?]+)\/designs\/([^/?]+)$/.exec(url);
  if (method === "GET" && designsItemMatch) {
    const ws = getWorkspaceById(designsItemMatch[1]);
    if (!ws) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    const filePath = path.join(ws.path, ".sdd", "design", designsItemMatch[2], "design.md");
    if (!fs.existsSync(filePath)) {
      json(res, 404, { error: "design not found" });
      return true;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(content);
    return true;
  }

  if (method === "GET" && url === "/plugin-skills") {
    json(res, 200, getPluginSkills());
    return true;
  }

  if (method === "GET" && url === "/recent-workspaces") {
    const recent = getRecentWorkspaces(5).map((ws) => ({
      id: ws.id,
      name: ws.name,
      path: ws.path,
      hasSdd: fs.existsSync(path.join(ws.path, ".sdd")),
    }));
    json(res, 200, recent);
    return true;
  }

  if (method === "GET" && url.startsWith("/check-sdd?")) {
    const qs = new URLSearchParams(url.slice("/check-sdd?".length));
    const checkPath = qs.get("path") ?? "";
    json(res, 200, { hasSdd: checkPath.length > 0 && fs.existsSync(path.join(checkPath, ".sdd")) });
    return true;
  }

  if (method === "GET" && url === "/workspaces") {
    json(res, 200, getWorkspacesEnriched());
    return true;
  }

  if (method === "POST" && url === "/workspaces") {
    let body: unknown;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      json(res, 400, { error: "invalid JSON body" });
      return true;
    }
    if (typeof body !== "object" || body === null) {
      json(res, 400, { error: "body must be an object" });
      return true;
    }
    const { name, path: wsPath } = body as Record<string, unknown>;
    if (typeof name !== "string" || typeof wsPath !== "string") {
      json(res, 400, { error: "name and path are required strings" });
      return true;
    }
    const id = randomUUID();
    try {
      insertWorkspace({ id, name, path: wsPath, description: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("UNIQUE constraint failed")) {
        json(res, 409, { error: "workspace with this path already exists" });
        return true;
      }
      throw err;
    }
    const cleanup = startWatcher(
      wsPath,
      (changedPath) => {
        broadcastUpdate(changedPath);
        const artifact = resolveArtifact(changedPath);
        if (artifact !== null) {
          broadcastSddChanged(id, artifact);
        }
      },
      () => broadcastSddChanged(id, "specs")
    );
    watcherRegistry.set(id, cleanup);
    json(res, 201, getWorkspaceById(id));
    return true;
  }

  const patchMatch = /^\/workspaces\/([^/?]+)$/.exec(url);
  if (method === "PATCH" && patchMatch) {
    const id = patchMatch[1];
    const existing = getWorkspaceById(id);
    if (!existing) {
      json(res, 404, { error: "workspace not found" });
      return true;
    }
    let body: unknown;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      json(res, 400, { error: "invalid JSON body" });
      return true;
    }
    if (typeof body !== "object" || body === null) {
      json(res, 400, { error: "body must be an object" });
      return true;
    }
    const allowed = ["name", "path", "description"] as const;
    const updates: Partial<Record<typeof allowed[number], string>> = {};
    for (const key of allowed) {
      const val = (body as Record<string, unknown>)[key];
      if (typeof val === "string") {
        updates[key] = val;
      }
    }
    if (Object.keys(updates).length === 0) {
      json(res, 400, { error: "body must include at least one of: name, path, description" });
      return true;
    }
    updateWorkspace(id, updates);

    if (updates.path !== undefined && updates.path !== existing.path) {
      swapWatcher(
        id,
        updates.path,
        (changedPath) => {
          broadcastUpdate(changedPath);
          const artifact = resolveArtifact(changedPath);
          if (artifact !== null) {
            broadcastSddChanged(id, artifact);
          }
        },
        () => broadcastSddChanged(id, "specs")
      );
    }

    json(res, 200, getWorkspaceById(id));
    return true;
  }

  return false;
}

export const server = http.createServer(async (req, res) => {
  const handled = await handleApi(req, res);
  if (!handled) {
    serveStatic(req, res);
  }
});

attachUiWebSocketServer(server);
attachAgentWebSocketServer(server);

getDb();

function startWatchers(): void {
  const workspaces = getAllWorkspaces();
  for (const workspace of workspaces) {
    const cleanup = startWatcher(
      workspace.path,
      (changedPath) => {
        broadcastUpdate(changedPath);
        const artifact = resolveArtifact(changedPath);
        if (artifact !== null) {
          broadcastSddChanged(workspace.id, artifact);
        }
      },
      () => broadcastSddChanged(workspace.id, "specs")
    );
    watcherRegistry.set(workspace.id, cleanup);
  }
}

startWatchers();

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    process.stderr.write(
      `SDD Hub is already running on port ${PORT}. Only one instance may run at a time.\n`
    );
    process.exit(1);
  }
  throw err;
});

// Skip auto-listen under Vitest: tests import { server } and manage the
// listen/close lifecycle themselves (see designs.test.ts). VITEST is set
// automatically by the test runner.
if (!process.env.VITEST) {
  server.listen(PORT, HOST, () => {
    process.stderr.write(`SDD Hub server listening on http://${HOST}:${PORT}\n`);
  });
}
