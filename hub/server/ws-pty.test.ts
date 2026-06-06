import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import { WebSocket } from "ws";

// ---- Mock node-pty ----
// Keep a reference to the last spawned mock PTY so tests can inspect / drive it.
interface MockPty {
  dataCallback: ((data: string) => void) | null;
  exitCallback: (() => void) | null;
  writtenData: string[];
  resizes: { cols: number; rows: number }[];
  killed: boolean;
  onData: (cb: (data: string) => void) => void;
  onExit: (cb: () => void) => void;
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  /** Helper: simulate PTY producing output */
  emit: (data: string) => void;
  /** Helper: simulate PTY exiting */
  exit: () => void;
}

let lastPty: MockPty;

vi.mock("node-pty", () => ({
  spawn: vi.fn((_shell: string, _args: string[], _opts: unknown) => {
    const pty: MockPty = {
      dataCallback: null,
      exitCallback: null,
      writtenData: [],
      resizes: [],
      killed: false,
      onData(cb) { this.dataCallback = cb; },
      onExit(cb) { this.exitCallback = cb; },
      write(data) { this.writtenData.push(data); },
      resize(cols, rows) { this.resizes.push({ cols, rows }); },
      kill() { this.killed = true; },
      emit(data) { this.dataCallback?.(data); },
      exit() { this.exitCallback?.(); },
    };
    lastPty = pty;
    return pty;
  }),
}));

// ---- Import module under test ----
const { attachPtyWebSocketServer, PTY_WS_PATH } = await import("./ws-pty.js");

// ---- Helpers ----
function startTestServer(): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve) => {
    const s = http.createServer();
    attachPtyWebSocketServer(s);
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address() as { port: number };
      resolve({ server: s, port: addr.port });
    });
  });
}

function connect(port: number, query = ""): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${PTY_WS_PATH}${query}`);
    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
  });
}

function waitFor(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Tests ----
describe("ws-pty — PTY WebSocket endpoint (SPEC-arch-043)", () => {
  let server: http.Server;
  let port: number;

  beforeEach(async () => {
    vi.clearAllMocks();
    ({ server, port } = await startTestServer());
  });

  afterEach(() => {
    server.close();
  });

  it("spawns a PTY on connection", async () => {
    const ws = await connect(port);
    await waitFor();

    expect(lastPty).toBeDefined();
    ws.close();
  });

  it("forwards PTY output to the WebSocket client", async () => {
    const received: string[] = [];
    const ws = await connect(port);
    ws.on("message", (data) => received.push(data.toString()));
    await waitFor();

    lastPty.emit("hello from pty\r\n");
    await waitFor();

    expect(received).toContain("hello from pty\r\n");
    ws.close();
  });

  it("writes client text messages to the PTY", async () => {
    const ws = await connect(port);
    await waitFor();

    ws.send("ls\r");
    await waitFor();

    expect(lastPty.writtenData).toContain("ls\r");
    ws.close();
  });

  it("handles resize messages by resizing the PTY", async () => {
    const ws = await connect(port);
    await waitFor();

    ws.send(JSON.stringify({ type: "resize", cols: 120, rows: 40 }));
    await waitFor();

    expect(lastPty.resizes).toContainEqual({ cols: 120, rows: 40 });
    ws.close();
  });

  it("kills the PTY when the WebSocket closes", async () => {
    const ws = await connect(port);
    await waitFor();

    ws.close();
    await waitFor(60);

    expect(lastPty.killed).toBe(true);
  });

  it("closes the socket when the PTY exits", async () => {
    let closedCode: number | undefined;
    const ws = await connect(port);
    ws.on("close", (code) => { closedCode = code; });
    await waitFor();

    lastPty.exit();
    await waitFor(60);

    expect(closedCode).toBeDefined();
  });

  it("resize messages are not written to the PTY as raw input", async () => {
    const ws = await connect(port);
    await waitFor();

    ws.send(JSON.stringify({ type: "resize", cols: 80, rows: 24 }));
    await waitFor();

    // writtenData must NOT contain the raw resize JSON
    const hasResizeRaw = lastPty.writtenData.some((d) => d.includes('"resize"'));
    expect(hasResizeRaw).toBe(false);
    ws.close();
  });

  it("uses cwd from the query parameter when spawning the PTY", async () => {
    const { spawn: mockSpawn } = await import("node-pty");
    const ws = await connect(port, "?cwd=/tmp/my-workspace");
    await waitFor();

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ cwd: "/tmp/my-workspace" }),
    );
    ws.close();
  });
});
