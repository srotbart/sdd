import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { Targets } from './screens/Targets';

const WS = { id: 'ws-1', name: 'My Repo', path: '/tmp/repo', description: null, created_at: '2026-01-01' };

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
});

describe('App targets data wiring', () => {
  it('fetches /workspaces/:id/targets after selecting a workspace', async () => {
    render(<App />);

    // wait for workspaces to load then click a workspace tile in the dashboard
    const tile = await waitFor(() => {
      const el = document.querySelector('.workspace-tile');
      if (!el) throw new Error('no tile');
      return el;
    });
    await userEvent.click(tile);

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
