import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { App } from './App';

// Client-side SPEC-arch coverage: the WebSocket onmessage handler and the
// reconnect-with-backoff logic both live inside App.tsx's connect() effect.
// We drive them by swapping the global WebSocket with a controllable mock,
// matching the established App.test.tsx pattern.

const WS = {
  id: 'ws-1', name: 'My Repo', path: '/tmp/repo', description: null, created_at: '2026-01-01',
  lastActivity: '2026-01-01T00:00:00Z', agents: [],
  counts: {
    targetsAwaitingUser: 0, targetsAwaitingAgent: 0, targetsReady: 0, targetsDraft: 0,
    specs: 0, specItems: 0, openGaps: 0, staleAuditDomains: 0,
    workPending: 0, workInProgress: 0, workBlocked: 0, workDoneToday: 0,
  },
};

interface MockWsInstance {
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((e: { data: string }) => void) | null;
  close: ReturnType<typeof vi.fn>;
}

describe('SPEC-arch-026: client WebSocket handler processes snapshot and update messages', () => {
  let mockWsInstance: MockWsInstance | null;
  let OriginalWebSocket: typeof WebSocket;

  beforeEach(() => {
    OriginalWebSocket = global.WebSocket;
    mockWsInstance = null;
    class MockWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() { mockWsInstance = this as unknown as MockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  it('SPEC-arch-026: a snapshot message populates the live workspace list', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    const snapWs = { ...WS, id: 'ws-snap', name: 'Snapped' };
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [snapWs], agents: [] }) });
    await waitFor(() => {
      expect(document.querySelector('.sidenav-ws-trigger')).not.toBeNull();
    });
  });

  it('SPEC-arch-026: an update message does not itself fetch artifact endpoints', async () => {
    // Pre-seed workspaces so the active workspace is already settled; this
    // isolates the WS update handler from the workspace-selection effect.
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    await waitFor(() =>
      expect((global.fetch as ReturnType<typeof vi.fn>).mock.calls.some(
        (c: unknown[]) => /\/workspaces\/.+\/specs/.test(c[0] as string),
      )).toBe(true),
    );
    const before = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'update', changedPath: '/x/.sdd', workspaces: [WS], agents: [] }) });
    await new Promise((r) => setTimeout(r, 50));
    const after = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.slice(before) as unknown[][];
    expect(after.some((c) => /\/workspaces\/.+\/(targets|specs|gaps|work-items)/.test(c[0] as string))).toBe(false);
  });

  it('SPEC-arch-026: an unrecognized message type is ignored without throwing', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'totally-unknown', foo: 1 }) });
      mockWsInstance!.onmessage?.({ data: 'not even json' });
    }).not.toThrow();
  });
});

describe('SPEC-arch-031: client maintains liveAgents state from WebSocket', () => {
  let mockWsInstance: MockWsInstance | null;
  let OriginalWebSocket: typeof WebSocket;

  beforeEach(() => {
    OriginalWebSocket = global.WebSocket;
    mockWsInstance = null;
    class MockWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() { mockWsInstance = this as unknown as MockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  it('SPEC-arch-031: liveAgents from a snapshot drive the Header agent count', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    const agents = [
      { id: 'agt-1', name: 'claude-a', initials: 'CA', host: 'localhost', status: 'busy', pid: 1 },
      { id: 'agt-2', name: 'claude-b', initials: 'CB', host: 'localhost', status: 'idle', pid: 2 },
    ];
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [WS], agents }) });
    await waitFor(() => {
      expect(document.body.textContent ?? '').toContain('2 agents');
    });
  });

  it('SPEC-arch-031: MOCK_AGENTS / MOCK_WORKSPACES constants are not present in App.tsx source', () => {
    const appSrc = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');
    expect(appSrc.includes('MOCK_AGENTS')).toBe(false);
    expect(appSrc.includes('MOCK_WORKSPACES')).toBe(false);
  });
});

describe('SPEC-arch-027: WebSocket client reconnects with exponential backoff', () => {
  let OriginalWebSocket: typeof WebSocket;

  beforeEach(() => {
    OriginalWebSocket = global.WebSocket;
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  it('SPEC-arch-027: a close event triggers a reconnect (new WebSocket constructed)', async () => {
    let callCount = 0;
    let latest: MockWsInstance | null = null;
    class TrackingWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() { callCount++; latest = this as unknown as MockWsInstance; }
    }
    global.WebSocket = TrackingWS as unknown as typeof WebSocket;
    render(<App />);
    await waitFor(() => expect(callCount).toBe(1));
    latest!.onclose?.();
    await waitFor(() => expect(callCount).toBe(2), { timeout: 2000 });
  });

  it('SPEC-arch-027: backoff config is initial 1s, doubling, capped at 30s', () => {
    const appSrc = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');
    // initial delay 1000ms, doubling, capped at 30000ms
    expect(/reconnectDelay\s*=\s*1000/.test(appSrc)).toBe(true);
    expect(/Math\.min\(reconnectDelay\s*\*\s*2,\s*30000\)/.test(appSrc)).toBe(true);
  });

  it('SPEC-arch-027: reconnect timer is cleared on unmount (no further reconnect)', async () => {
    let callCount = 0;
    let latest: MockWsInstance | null = null;
    class TrackingWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() { callCount++; latest = this as unknown as MockWsInstance; }
    }
    global.WebSocket = TrackingWS as unknown as typeof WebSocket;
    const { unmount } = render(<App />);
    await waitFor(() => expect(callCount).toBe(1));
    latest!.onclose?.();
    unmount();
    await new Promise((r) => setTimeout(r, 1200));
    expect(callCount).toBe(1);
  });
});
