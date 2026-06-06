import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import { spawn } from "node-pty";
import { execSync } from "node:child_process";
import { URL } from "node:url";
import os from "node:os";

export const PTY_WS_PATH = "/terminal";

/** Resolve the executable to run in the PTY: `claude` if found on PATH, else the platform default shell. */
function resolveShell(): string {
  try {
    const which = os.platform() === "win32" ? "where" : "which";
    execSync(`${which} claude`, { stdio: "ignore" });
    return "claude";
  } catch {
    // claude not on PATH — fall back to platform default shell
    return os.platform() === "win32"
      ? (process.env.COMSPEC ?? "cmd.exe")
      : (process.env.SHELL ?? "/bin/sh");
  }
}

interface ResizeMessage {
  type: "resize";
  cols: number;
  rows: number;
}

function parseResizeMessage(raw: string): ResizeMessage | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as Record<string, unknown>)["type"] === "resize" &&
      typeof (parsed as Record<string, unknown>)["cols"] === "number" &&
      typeof (parsed as Record<string, unknown>)["rows"] === "number"
    ) {
      return parsed as ResizeMessage;
    }
    return null;
  } catch {
    return null;
  }
}

export function attachPtyWebSocketServer(httpServer: Server): void {
  const wss = new WebSocketServer({ server: httpServer, path: PTY_WS_PATH });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    // Derive cwd from the `cwd` query parameter; fall back to process.cwd()
    let cwd = process.cwd();
    try {
      const reqUrl = new URL(req.url ?? "", `http://127.0.0.1`);
      const cwdParam = reqUrl.searchParams.get("cwd");
      if (cwdParam) { cwd = cwdParam; }
    } catch {
      // ignore malformed URL — keep default cwd
    }

    const shell = resolveShell();

    const pty = spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 24,
      cwd,
      env: process.env as Record<string, string>,
    });

    // Stream PTY output → WebSocket client
    pty.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle incoming messages from the client
    ws.on("message", (data) => {
      const text = data.toString();

      // Check for a resize control message first
      const resize = parseResizeMessage(text);
      if (resize) {
        try {
          pty.resize(resize.cols, resize.rows);
        } catch {
          // ignore resize errors (e.g. PTY already closed)
        }
        return;
      }

      // Otherwise treat as raw keyboard input
      pty.write(text);
    });

    // Kill the PTY when the socket closes
    ws.on("close", () => {
      try {
        pty.kill();
      } catch {
        // PTY may already have exited
      }
    });

    // Close the socket if the PTY process exits
    pty.onExit(() => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    });
  });
}
