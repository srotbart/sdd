import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { getDb, getAllWorkspaces, getWorkspaceById, updateWorkspace, insertWorkspace } from "./db/index.js";
import { parseSpecs, parseTargets, parseGaps, parseWorkItems } from "./sdd-parser.js";
import { attachUiWebSocketServer, broadcastUpdate, broadcastSddChanged } from "./ws-ui.js";
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

  if (method === "GET" && url === "/workspaces") {
    json(res, 200, getAllWorkspaces());
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
    insertWorkspace({ id, name, path: wsPath, description: null });
    startWatcher(wsPath, (changedPath) => {
      broadcastUpdate(changedPath);
      const artifact = resolveArtifact(changedPath);
      if (artifact !== null) {
        broadcastSddChanged(id, artifact);
      }
    });
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
    startWatcher(workspace.path, (changedPath) => {
      broadcastUpdate(changedPath);
      const artifact = resolveArtifact(changedPath);
      if (artifact !== null) {
        broadcastSddChanged(workspace.id, artifact);
      }
    });
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

server.listen(PORT, HOST, () => {
  process.stderr.write(`SDD Hub server listening on http://${HOST}:${PORT}\n`);
});
