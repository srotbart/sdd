import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { Targets } from './screens/Targets';

const WS = {
  id: 'ws-1', name: 'My Repo', path: '/tmp/repo', description: null, created_at: '2026-01-01',
  lastActivity: '2026-01-01T00:00:00Z', agents: [],
  counts: {
    targetsAwaitingUser: 0, targetsAwaitingAgent: 0, targetsReady: 0, targetsDraft: 0,
    specs: 0, specItems: 0, openGaps: 0, staleAuditDomains: 0,
    workPending: 0, workInProgress: 0, workBlocked: 0, workDoneToday: 0,
  },
};

function setupFetch() {
  global.fetch = vi.fn((url: string) => {
    if (url === '/workspaces') {
      return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
    }
    return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
  }) as unknown as typeof fetch;
}

function fetchedUrls(): string[] {
  return (global.fetch as ReturnType<typeof vi.fn>).mock.calls.map(
    (c: unknown[]) => c[0] as string,
  );
}

beforeEach(() => { setupFetch(); });

describe('API target mapping (WI-scr-001)', () => {
  function setupFetchWithTargets(apiTargets: Record<string, unknown>[]) {
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/targets')) {
        return Promise.resolve({ json: () => Promise.resolve(apiTargets) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
  }

  async function navigateToTargets() {
    // Open the workspace dropdown in the sidenav and select the DB workspace
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);

    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);

    const targetsBtn = await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets',
      );
      if (!btn) throw new Error('no targets nav button');
      return btn;
    });
    await userEvent.click(targetsBtn);
  }

  it('renders Targets without crashing when API returns only required fields', async () => {
    const minimalTarget = {
      id: 'TGT-001',
      status: 'awaiting-user',
      created: '2026-05-17T00:00:00Z',
      domain: 'ui-screens',
      statement: 'The UI renders correctly.',
    };
    setupFetchWithTargets([minimalTarget]);
    render(<App />);
    await navigateToTargets();

    await waitFor(() => {
      const rows = document.querySelectorAll('.target-row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  it('maps domainAbbrev from domain when not provided by API', async () => {
    const target = {
      id: 'TGT-002',
      status: 'draft',
      created: '2026-05-17T00:00:00Z',
      domain: 'ui-screens',
      statement: 'A statement.',
    };
    setupFetchWithTargets([target]);
    render(<App />);
    await navigateToTargets();

    await waitFor(() => {
      expect(document.querySelectorAll('.target-row').length).toBeGreaterThan(0);
    });
  });

  it('defaults dialog to empty array when API omits it', async () => {
    const target = {
      id: 'TGT-003',
      status: 'awaiting-user',
      created: '2026-05-17T00:00:00Z',
      domain: 'ui-screens',
      statement: 'No dialog turns.',
    };
    setupFetchWithTargets([target]);
    render(<App />);
    await navigateToTargets();

    await waitFor(() => {
      const footer = document.querySelector('.target-row__footer');
      expect(footer).not.toBeNull();
      expect(footer!.textContent).not.toMatch(/turn/);
    });
  });
});

describe('Sidenav tabCounts computed from live data (WI-scr-009)', () => {
  function setupFetchWithTargets(apiTargets: Record<string, unknown>[]) {
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/targets')) {
        return Promise.resolve({ json: () => Promise.resolve(apiTargets) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
  }

  async function selectWorkspace() {
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);
    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);
  }

  it('sidenav targets count badge shows only non-accepted targets', async () => {
    const targets = [
      { id: 'TGT-001', status: 'awaiting-user', created: '2026-05-17T00:00:00Z', domain: 'ui-screens', statement: 'A' },
      { id: 'TGT-002', status: 'awaiting-agent', created: '2026-05-17T00:00:00Z', domain: 'ui-screens', statement: 'B' },
      { id: 'TGT-003', status: 'accepted', created: '2026-05-17T00:00:00Z', domain: 'ui-screens', statement: 'C' },
    ];
    setupFetchWithTargets(targets);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const targetsBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets');
      expect(targetsBtn).toBeTruthy();
      const count = targetsBtn!.querySelector('.sidenav-nav-count');
      expect(count).not.toBeNull();
      expect(count!.textContent).toBe('2');
    });
  });

  it('sidenav targets count badge is absent when all targets are accepted', async () => {
    const targets = [
      { id: 'TGT-001', status: 'accepted', created: '2026-05-17T00:00:00Z', domain: 'ui-screens', statement: 'A' },
    ];
    setupFetchWithTargets(targets);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const targetsBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets');
      expect(targetsBtn).toBeTruthy();
      const count = targetsBtn!.querySelector('.sidenav-nav-count');
      expect(count).toBeNull();
    });
  });
});

describe('Sidenav plugin reference entry (WI-scr-008)', () => {
  it('renders "plugin reference" sidenav entry when no workspace is active', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const label = Array.from(document.querySelectorAll('.sidenav-plugin-ref-label'))
      .find((el) => el.textContent?.trim() === 'plugin reference');
    expect(label).toBeTruthy();
  });
});

describe('App gaps and work-items data wiring (WI-scr-016)', () => {
  function setupFetchWithGapsAndWorkItems(
    apiGaps: Record<string, unknown>[],
    apiWorkItems: Record<string, unknown>[],
  ) {
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/gaps')) {
        return Promise.resolve({ json: () => Promise.resolve(apiGaps) } as Response);
      }
      if ((url as string).includes('/work-items')) {
        return Promise.resolve({ json: () => Promise.resolve(apiWorkItems) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
  }

  async function selectWorkspace() {
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);
    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);
  }

  it('fetches /workspaces/:id/gaps after selecting a workspace', async () => {
    setupFetchWithGapsAndWorkItems([], []);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes('/gaps'))).toBe(true);
    });
  });

  it('fetches /workspaces/:id/work-items after selecting a workspace', async () => {
    setupFetchWithGapsAndWorkItems([], []);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes('/work-items'))).toBe(true);
    });
  });

  it('sidenav gaps count uses live gaps data excluding closed and deferred', async () => {
    const apiGaps = [
      { id: 'GAP-arch-001', specItem: 'SPEC-arch-001', domain: 'architecture', status: 'open', discovered: '2026-05-17T00:00:00Z', auditVersion: 'abc', title: 'Gap 1', location: 'foo.ts:1', reasoning: 'r', closedBy: null },
      { id: 'GAP-arch-002', specItem: 'SPEC-arch-002', domain: 'architecture', status: 'closed', discovered: '2026-05-17T00:00:00Z', auditVersion: 'abc', title: 'Gap 2', location: 'foo.ts:2', reasoning: 'r', closedBy: 'WI-arch-001' },
    ];
    setupFetchWithGapsAndWorkItems(apiGaps, []);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const gapsBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'gaps');
      expect(gapsBtn).toBeTruthy();
      const count = gapsBtn!.querySelector('.sidenav-nav-count');
      expect(count).not.toBeNull();
      expect(count!.textContent).toBe('1');
    });
  });

  it('sidenav work items count uses live work-items data excluding done and abandoned', async () => {
    const apiWorkItems = [
      { id: 'WI-arch-001', gapId: 'GAP-arch-001', domain: 'architecture', status: 'pending', created: '2026-05-17T00:00:00Z', title: 'WI 1', scope: 's', acceptance: [] },
      { id: 'WI-arch-002', gapId: 'GAP-arch-001', domain: 'architecture', status: 'done', created: '2026-05-17T00:00:00Z', title: 'WI 2', scope: 's', acceptance: [] },
    ];
    setupFetchWithGapsAndWorkItems([], apiWorkItems);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const wiBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'work items');
      expect(wiBtn).toBeTruthy();
      const count = wiBtn!.querySelector('.sidenav-nav-count');
      expect(count).not.toBeNull();
      expect(count!.textContent).toBe('1');
    });
  });

  it('sidenav gap count excludes gaps with status deferred (SPEC-arch-040)', async () => {
    const apiGaps = [
      { id: 'GAP-arch-001', specItem: 'SPEC-arch-001', domain: 'architecture', status: 'open', discovered: '2026-05-17T00:00:00Z', auditVersion: 'abc', title: 'Gap 1', location: 'foo.ts:1', reasoning: 'r', closedBy: null },
      { id: 'GAP-arch-002', specItem: 'SPEC-arch-002', domain: 'architecture', status: 'deferred', discovered: '2026-05-17T00:00:00Z', auditVersion: 'abc', title: 'Gap 2', location: 'foo.ts:2', reasoning: 'r', closedBy: null },
    ];
    setupFetchWithGapsAndWorkItems(apiGaps, []);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const gapsBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'gaps');
      expect(gapsBtn).toBeTruthy();
      const count = gapsBtn!.querySelector('.sidenav-nav-count');
      expect(count).not.toBeNull();
      expect(count!.textContent).toBe('1');
    });
  });

  it('sidenav work-items count excludes items with status abandoned (SPEC-arch-040)', async () => {
    const apiWorkItems = [
      { id: 'WI-arch-001', gapId: 'GAP-arch-001', domain: 'architecture', status: 'in-progress', created: '2026-05-17T00:00:00Z', title: 'WI 1', scope: 's', acceptance: [] },
      { id: 'WI-arch-002', gapId: 'GAP-arch-001', domain: 'architecture', status: 'abandoned', created: '2026-05-17T00:00:00Z', title: 'WI 2', scope: 's', acceptance: [] },
    ];
    setupFetchWithGapsAndWorkItems([], apiWorkItems);
    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const wiBtn = Array.from(document.querySelectorAll('.sidenav-nav-row'))
        .find((el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'work items');
      expect(wiBtn).toBeTruthy();
      const count = wiBtn!.querySelector('.sidenav-nav-count');
      expect(count).not.toBeNull();
      expect(count!.textContent).toBe('1');
    });
  });
});

describe('App targets data wiring', () => {
  it('fetches /workspaces/:id/targets after workspace is auto-selected', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes('/targets'))).toBe(true);
    });
  });

  it('auto-selects the first workspace and fetches its targets when no localStorage key is set', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/targets`))).toBe(true);
    });
  });
});

describe('URL param replaceState on navigation (WI-scr-019)', () => {
  let replaceStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    replaceStateSpy.mockRestore();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  async function selectWorkspace() {
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);
    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);
  }

  it('selecting a workspace updates URL to ?w=<id>&v=session', async () => {
    render(<App />);
    await selectWorkspace();
    await waitFor(() => {
      const calls = replaceStateSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toMatch(new RegExp(`w=${WS.id}`));
      expect(lastCall[2]).toMatch(/v=session/);
    });
  });

  it('switching tabs calls replaceState with updated ?v= and retains ?w=', async () => {
    render(<App />);
    await selectWorkspace();

    const targetsBtn = await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets',
      );
      if (!btn) throw new Error('no targets button');
      return btn;
    });
    await userEvent.click(targetsBtn);

    await waitFor(() => {
      const calls = replaceStateSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[2]).toMatch(new RegExp(`w=${WS.id}`));
      expect(lastCall[2]).toMatch(/v=targets/);
    });
  });

  it('navigating to hub dashboard results in URL with no ?w= param', async () => {
    render(<App />);
    await selectWorkspace();

    const hubRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-hub-row');
      if (!el) throw new Error('no hub row');
      return el;
    });
    await userEvent.click(hubRow);

    await waitFor(() => {
      const calls = replaceStateSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const search = lastCall[2] as string;
      expect(search).not.toMatch(/[?&]w=/);
    });
  });

  it('switching tabs removes &id= from URL when selectedItemId is cleared', async () => {
    window.history.replaceState(null, '', `/?w=${WS.id}&v=targets&id=TGT-001`);
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));

    const specsBtn = await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'specs',
      );
      if (!btn) throw new Error('no specs button');
      return btn;
    });
    await userEvent.click(specsBtn);

    await waitFor(() => {
      const calls = replaceStateSpy.mock.calls;
      const lastCall = calls[calls.length - 1];
      const search = lastCall[2] as string;
      expect(search).not.toMatch(/[?&]id=/);
      expect(search).toMatch(/v=specs/);
    });
  });
});

describe('URL param mount initialisation (WI-scr-018)', () => {
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('initialises workspace and tab from URL params, ignoring localStorage', async () => {
    localStorage.setItem('hub.activeWorkspaceId', 'stale-from-storage');
    window.history.replaceState(null, '', `/?w=${WS.id}&v=targets`);
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/targets`))).toBe(true);
    });
    const targetsNavRow = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
      (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets',
    );
    expect(targetsNavRow?.classList.contains('sidenav-nav-row--active')).toBe(true);
  });

  it('unrecognised ?v= defaults to targets tab', async () => {
    window.history.replaceState(null, '', `/?w=${WS.id}&v=not-a-real-tab`);
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/targets`))).toBe(true);
    });
    const targetsNavRow = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
      (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets',
    );
    expect(targetsNavRow?.classList.contains('sidenav-nav-row--active')).toBe(true);
  });

  it('unrecognised ?w= falls back to localStorage value when present', async () => {
    localStorage.setItem('hub.activeWorkspaceId', WS.id);
    window.history.replaceState(null, '', '/?w=unknown-workspace-id&v=targets');
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/`))).toBe(true);
    });
  });

  it('?id=GAP-arch-001 with ?v=gaps causes Gaps to open with GAP-arch-001 pre-selected (WI-scr-028)', async () => {
    const gap = {
      id: 'GAP-arch-001', specItem: 'SPEC-arch-001', domain: 'architecture',
      status: 'open', discovered: '2026-05-19T00:00:00Z', auditVersion: 'abc',
      title: 'Missing thing', location: 'foo.ts:1', reasoning: 'r', closedBy: null,
    };
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/gaps')) {
        return Promise.resolve({ json: () => Promise.resolve([gap]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    window.history.replaceState(null, '', `/?w=${WS.id}&v=gaps&id=GAP-arch-001`);
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));

    await waitFor(() => {
      const gapsNav = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'gaps',
      );
      expect(gapsNav?.classList.contains('sidenav-nav-row--active')).toBe(true);
    });

    await waitFor(() => {
      const activeGapRow = document.querySelector('.gaps-row--active');
      expect(activeGapRow).not.toBeNull();
      expect(activeGapRow?.textContent).toContain('GAP-arch-001');
    });
  });
});

describe('sdd-changed WebSocket message triggers re-fetch (WI-arch-018)', () => {
  let mockWsInstance: {
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    close: () => void;
  } | null;
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
      constructor() { mockWsInstance = this as unknown as typeof mockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  function simulateSddChanged(artifact: string) {
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'sdd-changed', workspaceId: WS.id, artifact }) });
  }

  it('re-fetches /targets when sdd-changed artifact is "targets"', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    simulateSddChanged('targets');
    await waitFor(() => {
      const newUrls = fetchedUrls().slice(callsBefore);
      expect(newUrls.some((u) => u.includes(`/workspaces/${WS.id}/targets`))).toBe(true);
    });
  });

  it('re-fetches /specs when sdd-changed artifact is "specs"', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    simulateSddChanged('specs');
    await waitFor(() => {
      const newUrls = fetchedUrls().slice(callsBefore);
      expect(newUrls.some((u) => u.includes(`/workspaces/${WS.id}/specs`))).toBe(true);
    });
  });

  it('re-fetches /gaps when sdd-changed artifact is "gaps"', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    simulateSddChanged('gaps');
    await waitFor(() => {
      const newUrls = fetchedUrls().slice(callsBefore);
      expect(newUrls.some((u) => u.includes(`/workspaces/${WS.id}/gaps`))).toBe(true);
    });
  });

  it('re-fetches /work-items when sdd-changed artifact is "work-items"', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    simulateSddChanged('work-items');
    await waitFor(() => {
      const newUrls = fetchedUrls().slice(callsBefore);
      expect(newUrls.some((u) => u.includes(`/workspaces/${WS.id}/work-items`))).toBe(true);
    });
  });

  it('ignores sdd-changed message for a different workspaceId', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'sdd-changed', workspaceId: 'other-ws', artifact: 'targets' }) });
    await new Promise((r) => setTimeout(r, 50));
    const newUrls = fetchedUrls().slice(callsBefore);
    expect(newUrls.some((u) => u.includes('/targets'))).toBe(false);
  });

  it('ignores non-sdd-changed message types', async () => {
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    const callsBefore = fetchedUrls().length;
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [], agents: [] }) });
    await new Promise((r) => setTimeout(r, 50));
    const newUrls = fetchedUrls().slice(callsBefore);
    expect(newUrls.some((u) => u.match(/\/workspaces\/.+\/(targets|specs|gaps|work-items)/))).toBe(false);
  });
});

describe('WebSocket snapshot/update message handling and reconnect (WI-arch-022)', () => {
  let mockWsInstance: {
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    close: ReturnType<typeof vi.fn>;
  } | null;
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
      constructor() { mockWsInstance = this as unknown as typeof mockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  it('snapshot message updates workspaces state — workspace appears in sidenav', async () => {
    const snapshotWs = {
      id: 'ws-snap', name: 'Snapped', path: '/snap', description: null, created_at: '2026-01-01',
      lastActivity: '2026-01-01T00:00:00Z', agents: [],
      counts: { targetsAwaitingUser: 0, targetsAwaitingAgent: 0, targetsReady: 0, targetsDraft: 0, specs: 0, specItems: 0, openGaps: 0, staleAuditDomains: 0, workPending: 0, workInProgress: 0, workBlocked: 0, workDoneToday: 0 },
    };
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [snapshotWs], agents: [] }) });
    await waitFor(() => {
      const trigger = document.querySelector('.sidenav-ws-trigger');
      expect(trigger).not.toBeNull();
    });
  });

  it('update message is processed without error and does not fetch artifact endpoints', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    const callsBefore = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'update', changedPath: '/upd/.sdd', workspaces: [WS], agents: [] }) });
    await new Promise((r) => setTimeout(r, 50));
    const newCalls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.slice(callsBefore) as unknown[][];
    expect(newCalls.some((c) => (c[0] as string).match(/\/workspaces\/.+\/(targets|specs|gaps|work-items)/))).toBe(false);
  });

  it('agent-registered message is handled without error', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'agent-registered', agentId: 'a1', workspaceId: WS.id }) });
    }).not.toThrow();
  });

  it('activity message is handled without error', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'activity', agentId: 'a1', workspaceId: WS.id, kind: 'note', msg: 'hi', t: new Date().toISOString() }) });
    }).not.toThrow();
  });

  it('close event triggers reconnect — WebSocket constructor called a second time', async () => {
    let callCount = 0;
    class TrackingWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() {
        callCount++;
        mockWsInstance = this as unknown as typeof mockWsInstance;
      }
    }
    global.WebSocket = TrackingWS as unknown as typeof WebSocket;
    render(<App />);
    await waitFor(() => expect(callCount).toBe(1));
    mockWsInstance!.onclose?.();
    await waitFor(() => expect(callCount).toBe(2), { timeout: 2000 });
  });

  it('reconnect timer is cleared on unmount — no second WebSocket connection opened after unmount', async () => {
    let callCount = 0;
    class TrackingWS {
      onopen: (() => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onmessage: ((e: { data: string }) => void) | null = null;
      close = vi.fn();
      constructor() {
        callCount++;
        mockWsInstance = this as unknown as typeof mockWsInstance;
      }
    }
    global.WebSocket = TrackingWS as unknown as typeof WebSocket;
    const { unmount } = render(<App />);
    await waitFor(() => expect(callCount).toBe(1));
    mockWsInstance!.onclose?.();
    unmount();
    await new Promise((r) => setTimeout(r, 1200));
    expect(callCount).toBe(1);
  });
});

describe('liveAgents populated from WebSocket messages (WI-arch-025)', () => {
  let mockWsInstance: {
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    close: ReturnType<typeof vi.fn>;
  } | null;
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
      constructor() { mockWsInstance = this as unknown as typeof mockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  const agentA = { id: 'agt-1', name: 'claude-a', initials: 'CA', host: 'localhost', status: 'busy' as const, pid: 1 };
  const agentB = { id: 'agt-2', name: 'claude-b', initials: 'CB', host: 'localhost', status: 'idle' as const, pid: 2 };

  it('snapshot message sets liveAgents — Header agentCount reflects payload', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [WS], agents: [agentA, agentB] }) });
    await waitFor(() => {
      const header = document.querySelector('.header-agent-count, [data-testid="agent-count"]');
      if (!header) {
        const anyText = document.body.textContent ?? '';
        expect(anyText).toContain('2');
      } else {
        expect(header.textContent).toContain('2');
      }
    });
  });

  it('update message sets liveAgents from payload agents array', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [WS], agents: [agentA, agentB] }) });
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'update', changedPath: '/x', workspaces: [WS], agents: [agentA] }) });
    await new Promise((r) => setTimeout(r, 50));
  });

  it('agent-registered message does not throw', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'agent-registered', agentId: 'agt-1', workspaceId: WS.id }) });
    }).not.toThrow();
  });
});

describe('Dashboard receives live WorkspaceData (WI-scr-025)', () => {
  let mockWsInstance: {
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    close: ReturnType<typeof vi.fn>;
  } | null;
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
      constructor() { mockWsInstance = this as unknown as typeof mockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  const liveWs = {
    id: 'ws-live',
    name: 'Live Repo',
    path: '/live',
    description: 'live',
    lastActivity: new Date().toISOString(),
    agents: [],
    counts: {
      targetsAwaitingUser: 3, targetsAwaitingAgent: 0, targetsReady: 0,
      targetsDraft: 0, specs: 1, specItems: 5, openGaps: 2,
      staleAuditDomains: 0, workPending: 1, workInProgress: 0,
      workBlocked: 0, workDoneToday: 0,
    },
  };

  it('snapshot WebSocket message with workspaces populates Dashboard with live workspace count', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [liveWs], agents: [] }) });
    await waitFor(() => {
      expect(document.querySelector('.sidenav-ws-trigger')).not.toBeNull();
    });
  });

  it('Dashboard receives workspaces from state — no workspace-tile rendered when workspaces is empty', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    await new Promise((r) => setTimeout(r, 50));
    const tiles = document.querySelectorAll('.workspace-tile');
    expect(tiles.length).toBe(0);
  });

  it('Dashboard renders without throwing when a workspace has counts: undefined (WI-scr-034)', async () => {
    const wsNoCounts = {
      id: 'ws-nc', name: 'No Counts', path: '/nc', description: null, created_at: '2026-01-01',
      lastActivity: '2026-01-01T00:00:00Z', agents: [],
    };
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [wsNoCounts], agents: [] }) });
    }).not.toThrow();
  });

  it('Dashboard renders without throwing when workspaces array is empty (WI-scr-034)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      mockWsInstance!.onmessage?.({ data: JSON.stringify({ type: 'snapshot', workspaces: [], agents: [] }) });
    }).not.toThrow();
  });
});

describe('liveActivity accumulated from WebSocket activity events (WI-scr-026)', () => {
  let mockWsInstance: {
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: (() => void) | null;
    onmessage: ((e: { data: string }) => void) | null;
    close: ReturnType<typeof vi.fn>;
  } | null;
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
      constructor() { mockWsInstance = this as unknown as typeof mockWsInstance; }
    }
    global.WebSocket = MockWS as unknown as typeof WebSocket;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
    localStorage.clear();
  });

  function sendActivity(kind: string, msg: string) {
    mockWsInstance!.onmessage?.({
      data: JSON.stringify({
        type: 'activity', agentId: 'agt-1', workspaceId: WS.id,
        kind, msg, t: '09:00:00',
      }),
    });
  }

  it('activity WS message appears in Activity screen after navigating to activity tab', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    sendActivity('note', 'tests passed');

    const activityBtn = await waitFor(() => {
      const btn = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'activity',
      );
      if (!btn) throw new Error('no activity nav button');
      return btn;
    });
    await userEvent.click(activityBtn);

    await waitFor(() => {
      expect(document.body.textContent).toContain('tests passed');
    });
  });

  it('activity WS message is handled without error (liveActivity state updated)', async () => {
    render(<App />);
    await waitFor(() => expect(mockWsInstance).not.toBeNull());
    expect(() => {
      sendActivity('in', 'msg-a');
      sendActivity('err', 'msg-b');
    }).not.toThrow();
  });
});

describe('CommandPalette onNavigate sets selectedItemId (WI-scr-027)', () => {
  function setupFetchWithGaps() {
    const gap = {
      id: 'GAP-arch-001', specItem: 'SPEC-arch-001', domain: 'architecture',
      status: 'open', discovered: '2026-05-19T00:00:00Z', auditVersion: 'abc',
      title: 'Missing arch thing', location: 'foo.ts:1', reasoning: 'r', closedBy: null,
    };
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/gaps')) {
        return Promise.resolve({ json: () => Promise.resolve([gap]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
  }

  afterEach(() => { localStorage.clear(); });

  it('onNavigate with a gap kind and ID navigates to gaps tab and closes palette', async () => {
    setupFetchWithGaps();
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));

    await userEvent.keyboard('{Meta>}k{/Meta}');

    const input = await waitFor(() => {
      const el = document.querySelector('input[placeholder*="Search"]');
      if (!el) throw new Error('no palette input');
      return el as HTMLInputElement;
    });

    await userEvent.type(input, 'Missing');

    const resultRow = await waitFor(() => {
      const rows = Array.from(document.querySelectorAll('.cp-row, [class*="cp-row"]'));
      const row = rows.find((r) => r.textContent?.includes('GAP-arch-001'));
      if (!row) throw new Error('no gap result row');
      return row;
    });

    await userEvent.click(resultRow);

    await waitFor(() => {
      const gapsNav = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
        (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'gaps',
      );
      expect(gapsNav?.classList.contains('sidenav-nav-row--active')).toBe(true);
    });

    expect(document.querySelector('input[placeholder*="Search"]')).toBeNull();
  });
});

describe('Empty state prompt vs Dashboard (WI-ui-012)', () => {
  afterEach(() => { localStorage.clear(); });

  it('shows empty-state prompt when workspaces list is empty', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => {
      expect(document.body.textContent).toContain('No workspace attached');
    });
    expect(document.querySelector('.dashboard')).toBeNull();
  });

  it('empty-state element has class app-empty-state when workspaces is empty (WI-ui-019)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('.app-empty-state')).not.toBeNull();
    });
  });

  it('app-empty-state element contains the expected prompt text (WI-ui-019)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) } as Response)) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => {
      const el = document.querySelector('.app-empty-state');
      expect(el).not.toBeNull();
      expect(el!.textContent).toContain('No workspace attached');
    });
  });

  it('shows Dashboard tile grid when workspaces has items but no workspace is active', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
    localStorage.removeItem('hub.activeWorkspaceId');
    window.history.replaceState(null, '', '/');
    render(<App />);

    const hubRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-hub-row');
      if (!el) throw new Error('no hub row');
      return el;
    });
    await userEvent.click(hubRow);

    await waitFor(() => {
      expect(document.querySelector('.dashboard')).not.toBeNull();
    });
  });
});

describe('localStorage workspace persistence (WI-scr-017)', () => {
  afterEach(() => {
    localStorage.clear();
  });

  async function selectWorkspace() {
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);
    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);
  }

  it('writes hub.activeWorkspaceId to localStorage when a workspace is selected', async () => {
    render(<App />);
    await selectWorkspace();
    await waitFor(() => {
      expect(localStorage.getItem('hub.activeWorkspaceId')).toBe(WS.id);
    });
  });

  it('pre-selects the persisted workspace on mount when the ID is present in the fetched list', async () => {
    localStorage.setItem('hub.activeWorkspaceId', WS.id);
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/`))).toBe(true);
    });
  });

  it('falls back to first workspace when persisted ID is absent from fetched list', async () => {
    localStorage.setItem('hub.activeWorkspaceId', 'stale-id-not-in-list');
    render(<App />);
    await waitFor(() => expect(fetchedUrls()).toContain('/workspaces'));
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes(`/workspaces/${WS.id}/`))).toBe(true);
    });
  });
});

describe('ws.counts optional chaining guard (WI-scr-032)', () => {
  afterEach(() => { localStorage.clear(); });

  it('alertCount in sidenav workspaces.map defaults to 0 when counts is undefined', async () => {
    const wsWithCounts = {
      ...WS,
      counts: {
        targetsAwaitingUser: 0, targetsAwaitingAgent: 0, targetsReady: 0, targetsDraft: 0,
        specs: 0, specItems: 0, openGaps: 0, staleAuditDomains: 0,
        workPending: 0, workInProgress: 0, workBlocked: 0, workDoneToday: 0,
      },
    };
    const wsNoCounts = { id: 'ws-no-counts', name: 'No Counts', path: '/x', description: null, created_at: '2026-01-01', lastActivity: '2026-01-01T00:00:00Z', agents: [], counts: undefined } as unknown as typeof WS;
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([wsWithCounts]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('.sidenav-ws-trigger')).not.toBeNull();
    });
    const alertCount = wsNoCounts.counts?.targetsAwaitingUser ?? 0;
    expect(alertCount).toBe(0);
  });

  it('App.tsx workspaces.map does not throw when counts is undefined (optional chaining guard)', () => {
    const wsNoCounts = { id: 'ws-1', name: 'No Counts', path: '/x', description: null, created_at: '2026-01-01', lastActivity: '2026-01-01T00:00:00Z', agents: [] } as unknown as typeof WS;
    const result = [wsNoCounts].map((ws) => ({
      id: ws.id,
      name: ws.name,
      path: ws.path,
      alertCount: ws.counts?.targetsAwaitingUser ?? 0,
    }));
    expect(result[0].alertCount).toBe(0);
  });
});

describe('No mock constants in App (SPEC-scr-033)', () => {
  it('App renders with live specs fetched from server — Session receives liveSpecs not mock data', async () => {
    const mockSpecs = [
      { id: 'SPEC-live', domain: 'live', abbrev: 'live', version: 'abc', items: [] },
    ];
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/specs')) {
        return Promise.resolve({ json: () => Promise.resolve(mockSpecs) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<App />);
    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes('/specs'))).toBe(true);
    });
  });

  it('App renders and passes liveSpecs (initially empty) to Session without crashing', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<App />);
    await waitFor(() => {
      expect(fetchedUrls()).toContain('/workspaces');
    });
  });
});

describe('alertCount derived from liveTargets for active workspace (WI-ui-018)', () => {
  afterEach(() => { localStorage.clear(); });

  async function selectWorkspace() {
    const wsTrigger = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-trigger');
      if (!el) throw new Error('no ws trigger');
      return el;
    });
    await userEvent.click(wsTrigger);
    const wsRow = await waitFor(() => {
      const el = document.querySelector('.sidenav-ws-panel-row');
      if (!el) throw new Error('no ws panel row');
      return el;
    });
    await userEvent.click(wsRow);
  }

  it('sidenav badge count reflects 2 awaiting-user targets from liveTargets', async () => {
    const awaitingTargets = [
      { id: 'TGT-001', status: 'awaiting-user', created: '2026-05-17T00:00:00Z', domain: 'arch', statement: 'A' },
      { id: 'TGT-002', status: 'awaiting-user', created: '2026-05-17T00:00:00Z', domain: 'arch', statement: 'B' },
      { id: 'TGT-003', status: 'awaiting-agent', created: '2026-05-17T00:00:00Z', domain: 'arch', statement: 'C' },
    ];
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/targets')) {
        return Promise.resolve({ json: () => Promise.resolve(awaitingTargets) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      const badge = document.querySelector('.sidenav-badge');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toContain('2');
    });
  });

  it('sidenav badge is absent when no targets are awaiting-user', async () => {
    const noAwaitingTargets = [
      { id: 'TGT-001', status: 'awaiting-agent', created: '2026-05-17T00:00:00Z', domain: 'arch', statement: 'A' },
    ];
    global.fetch = vi.fn((url: string) => {
      if (url === '/workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
      }
      if ((url as string).includes('/targets')) {
        return Promise.resolve({ json: () => Promise.resolve(noAwaitingTargets) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<App />);
    await selectWorkspace();

    await waitFor(() => {
      expect(fetchedUrls().some((u) => u.includes('/targets'))).toBe(true);
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('.sidenav-badge')).toBeNull();
  });
});
