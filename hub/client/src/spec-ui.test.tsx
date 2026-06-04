import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { Sidenav } from './components/Sidenav';
import { Header } from './components/Header';
import { AttachWorkspaceDialog } from './components/AttachWorkspaceDialog';

const WS = {
  id: 'ws-1', name: 'My Repo', path: '/tmp/repo', description: null, created_at: '2026-01-01',
  lastActivity: '2026-01-01T00:00:00Z', agents: [],
  counts: {
    targetsAwaitingUser: 0, targetsAwaitingAgent: 0, targetsReady: 0, targetsDraft: 0,
    specs: 0, specItems: 0, openGaps: 0, staleAuditDomains: 0,
    workPending: 0, workInProgress: 0, workBlocked: 0, workDoneToday: 0,
  },
};

function fetchWithWorkspaces(extra?: (url: string) => unknown[] | undefined) {
  global.fetch = vi.fn((url: string) => {
    if (url === '/workspaces') {
      return Promise.resolve({ json: () => Promise.resolve([WS]) } as Response);
    }
    const e = extra?.(url);
    if (e) {
      return Promise.resolve({ json: () => Promise.resolve(e) } as Response);
    }
    return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
  }) as unknown as typeof fetch;
}

function fetchNoWorkspaces() {
  global.fetch = vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) } as Response),
  ) as unknown as typeof fetch;
}

async function openWorkspaceDropdown() {
  const trigger = await waitFor(() => {
    const el = document.querySelector('.sidenav-ws-trigger');
    if (!el) throw new Error('no ws trigger');
    return el;
  });
  await userEvent.click(trigger);
}

async function selectWorkspace() {
  await openWorkspaceDropdown();
  const row = await waitFor(() => {
    const el = document.querySelector('.sidenav-ws-panel-row');
    if (!el) throw new Error('no ws panel row');
    return el;
  });
  await userEvent.click(row);
}

afterEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

// ---------------------------------------------------------------------------
// SPEC-ui-001 — three-region shell
// ---------------------------------------------------------------------------
describe('SPEC-ui-001 — application shell three-region layout', () => {
  beforeEach(() => { fetchWithWorkspaces(); });

  it('SPEC-ui-001: shell renders header, sidenav, and main regions', async () => {
    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('.header')).not.toBeNull();
      expect(document.querySelector('.sidenav')).not.toBeNull();
      expect(document.querySelector('.app-main')).not.toBeNull();
    });
  });

  it('SPEC-ui-001: header and sidenav are persistent chrome and main is the screen container', async () => {
    render(<App />);
    await waitFor(() => {
      const shell = document.querySelector('.app-shell');
      expect(shell).not.toBeNull();
      // header, sidenav (nav) and main are all direct descendants of the shell
      expect(shell!.querySelector('header.header')).not.toBeNull();
      expect(shell!.querySelector('nav.sidenav')).not.toBeNull();
      expect(shell!.querySelector('main.app-main')).not.toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-002 — sidenav has three sections
// ---------------------------------------------------------------------------
describe('SPEC-ui-002 — sidenav structure and sections', () => {
  it('SPEC-ui-002: sidenav contains hub-overview row, WORKSPACE eyebrow, and NAVIGATE section when a workspace is active', () => {
    render(
      <Sidenav
        workspaces={[{ id: 'ws-1', name: 'Repo', path: '/repo' }]}
        activeWorkspaceId="ws-1"
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="targets"
        onSelectTab={vi.fn()}
        isHubActive={false}
        onSelectPluginRef={vi.fn()}
        pluginRefActive={false}
      />,
    );
    // (1) hub overview row with dot
    const hubRow = document.querySelector('.sidenav-hub-row');
    expect(hubRow).not.toBeNull();
    expect(hubRow!.querySelector('.sidenav-dot')).not.toBeNull();
    // (2) WORKSPACE eyebrow + workspace trigger row
    const eyebrows = Array.from(document.querySelectorAll('.sidenav-eyebrow')).map((e) =>
      e.textContent?.toLowerCase() ?? '',
    );
    expect(eyebrows.some((t) => t.includes('workspace'))).toBe(true);
    expect(document.querySelector('.sidenav-ws-trigger')).not.toBeNull();
    // (3) NAVIGATE eyebrow + one nav row per screen
    expect(eyebrows.some((t) => t.includes('navigate'))).toBe(true);
    const navLabels = Array.from(document.querySelectorAll('.sidenav-nav-label')).map((e) =>
      e.textContent?.trim(),
    );
    for (const screen of ['session', 'targets', 'specs', 'gaps', 'work items', 'activity', 'settings']) {
      expect(navLabels).toContain(screen);
    }
  });

  it('SPEC-ui-002: active nav row carries the --active modifier class (accent marker)', () => {
    render(
      <Sidenav
        workspaces={[{ id: 'ws-1', name: 'Repo', path: '/repo' }]}
        activeWorkspaceId="ws-1"
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="targets"
        onSelectTab={vi.fn()}
        isHubActive={false}
        onSelectPluginRef={vi.fn()}
        pluginRefActive={false}
      />,
    );
    const activeRow = Array.from(document.querySelectorAll('.sidenav-nav-row')).find(
      (el) => el.querySelector('.sidenav-nav-label')?.textContent?.trim() === 'targets',
    );
    expect(activeRow?.classList.contains('sidenav-nav-row--active')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-003 — header content
// ---------------------------------------------------------------------------
describe('SPEC-ui-003 — header spans full width with logo, breadcrumb, agent count, address, clock', () => {
  it('SPEC-ui-003: header renders logo, breadcrumb scope, agent count, hub address and a date/time, with no tab bar', () => {
    render(
      <Header
        breadcrumb={['hub', 'My Repo', 'targets']}
        agentCount={2}
        hubAddress="localhost:22351"
      />,
    );
    const header = document.querySelector('.header');
    expect(header).not.toBeNull();
    // logo
    const logo = document.querySelector('.header-logo');
    expect(logo?.textContent).toContain('sdd-hub');
    // breadcrumb showing hub / workspace / screen
    const crumbs = Array.from(document.querySelectorAll('.header-crumb')).map((c) => c.textContent);
    expect(crumbs).toEqual(['hub', 'My Repo', 'targets']);
    // agent count + hub address
    expect(header!.textContent).toContain('2 agents');
    expect(header!.textContent).toContain('localhost:22351');
    // date/time present (mono region)
    expect(document.querySelector('.header-mono')).not.toBeNull();
    // no tab bar lives in the header — nav rows are a sidenav concern only
    expect(header!.querySelector('.sidenav-nav-row')).toBeNull();
  });

  it('SPEC-ui-003: agent count is singular when there is exactly one agent', () => {
    render(<Header breadcrumb={['hub']} agentCount={1} hubAddress="localhost:22351" />);
    expect(document.querySelector('.header')!.textContent).toContain('1 agent');
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-007 — workspace dropdown selector
// ---------------------------------------------------------------------------
describe('SPEC-ui-007 — workspace selector dropdown', () => {
  beforeEach(() => { fetchWithWorkspaces(); });

  it('SPEC-ui-007: clicking the trigger opens a panel listing workspaces and an attach row', async () => {
    render(<App />);
    await openWorkspaceDropdown();
    await waitFor(() => {
      const panel = document.querySelector('.sidenav-ws-panel');
      expect(panel).not.toBeNull();
      // workspace row with name + mono path
      const row = panel!.querySelector('.sidenav-ws-panel-row');
      expect(row).not.toBeNull();
      expect(row!.querySelector('.sidenav-ws-panel-name')?.textContent).toContain('My Repo');
      expect(row!.querySelector('.sidenav-ws-panel-path')?.textContent).toContain('/tmp/repo');
      // attach row at the bottom
      expect(panel!.querySelector('.sidenav-ws-attach-row')).not.toBeNull();
    });
  });

  it('SPEC-ui-007: clicking a workspace row selects it and closes the panel', async () => {
    render(<App />);
    await selectWorkspace();
    await waitFor(() => {
      // panel closed
      expect(document.querySelector('.sidenav-ws-panel')).toBeNull();
      // selection reflected on the trigger
      const trigger = document.querySelector('.sidenav-ws-trigger');
      expect(trigger?.classList.contains('sidenav-ws-trigger--active')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-008 — attach workspace modal dialog
// ---------------------------------------------------------------------------
describe('SPEC-ui-008 — attach workspace modal dialog', () => {
  beforeEach(() => { fetchNoWorkspaces(); });

  it('SPEC-ui-008: clicking the + button opens a modal dialog titled "Attach workspace"', async () => {
    render(
      <Sidenav
        workspaces={[]}
        activeWorkspaceId={null}
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="session"
        onSelectTab={vi.fn()}
        isHubActive
        onSelectPluginRef={vi.fn()}
        pluginRefActive={false}
      />,
    );
    await userEvent.click(document.querySelector('.sidenav-add') as HTMLButtonElement);
    const dlg = await waitFor(() => {
      const el = document.querySelector('.dlg[role="dialog"]');
      if (!el) throw new Error('no dialog');
      return el;
    });
    expect(dlg.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('#dlg-title')?.textContent).toContain('Attach workspace');
    // path input + browse affordance present
    expect(document.querySelector('input[placeholder*="project"]')).not.toBeNull();
    expect(document.querySelector('.dlg-browse')).not.toBeNull();
  });

  it('SPEC-ui-008: Escape closes the dialog (onClose invoked)', async () => {
    const onClose = vi.fn();
    render(<AttachWorkspaceDialog onClose={onClose} onAttached={vi.fn()} />);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('SPEC-ui-008: backdrop click closes the dialog (onClose invoked)', async () => {
    const onClose = vi.fn();
    render(<AttachWorkspaceDialog onClose={onClose} onAttached={vi.fn()} />);
    const overlay = document.querySelector('.dlg-overlay') as HTMLElement;
    // mousedown on the overlay itself (not its children) closes
    await userEvent.pointer({ keys: '[MouseLeft>]', target: overlay });
    await userEvent.pointer({ keys: '[/MouseLeft]', target: overlay });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-009 — plugin reference pinned to bottom (outside scroll area)
// ---------------------------------------------------------------------------
describe('SPEC-ui-009 — plugin reference pinned to sidenav bottom', () => {
  const props = {
    workspaces: [{ id: 'ws-1', name: 'Repo', path: '/repo' }],
    activeWorkspaceId: 'ws-1',
    onSelectWorkspace: vi.fn(),
    onSelectHub: vi.fn(),
    activeTab: 'targets',
    onSelectTab: vi.fn(),
    isHubActive: false,
    onSelectPluginRef: vi.fn(),
    pluginRefActive: false,
  };

  it('SPEC-ui-009: plugin-ref section is a direct child of the sidenav, outside the scroll container', () => {
    render(<Sidenav {...props} />);
    const sidenav = document.querySelector('.sidenav');
    const scroll = document.querySelector('.sidenav-scroll');
    const pluginRef = document.querySelector('.sidenav-plugin-ref-section');
    expect(pluginRef).not.toBeNull();
    // pinned: not inside the scrollable region, and a direct child of the nav
    expect(scroll!.contains(pluginRef)).toBe(false);
    expect(pluginRef!.parentElement).toBe(sidenav);
  });

  it('SPEC-ui-009: plugin reference row renders regardless of whether a workspace is active', () => {
    const { rerender } = render(<Sidenav {...props} />);
    expect(document.querySelector('.sidenav-plugin-ref-label')?.textContent).toContain('plugin reference');
    rerender(<Sidenav {...props} workspaces={[]} activeWorkspaceId={null} isHubActive />);
    expect(document.querySelector('.sidenav-plugin-ref-label')?.textContent).toContain('plugin reference');
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-010 — alert badge = awaiting-user target count
// ---------------------------------------------------------------------------
describe('SPEC-ui-010 — sidenav alert badge from awaiting-user targets', () => {
  it('SPEC-ui-010: badge shows the count of awaiting-user targets for the active workspace', async () => {
    const targets = [
      { id: 'TGT-001', status: 'awaiting-user', created: '2026-05-17T00:00:00Z', domain: 'ui', statement: 'A' },
      { id: 'TGT-002', status: 'awaiting-user', created: '2026-05-17T00:00:00Z', domain: 'ui', statement: 'B' },
      { id: 'TGT-003', status: 'awaiting-agent', created: '2026-05-17T00:00:00Z', domain: 'ui', statement: 'C' },
    ];
    fetchWithWorkspaces((url) => (url.includes('/targets') ? targets : undefined));
    render(<App />);
    await selectWorkspace();
    await waitFor(() => {
      const badge = document.querySelector('.sidenav-badge');
      expect(badge).not.toBeNull();
      expect(badge!.textContent).toContain('2');
    });
  });

  it('SPEC-ui-010: badge is absent when no targets are awaiting-user', async () => {
    const targets = [
      { id: 'TGT-001', status: 'awaiting-agent', created: '2026-05-17T00:00:00Z', domain: 'ui', statement: 'A' },
    ];
    fetchWithWorkspaces((url) => (url.includes('/targets') ? targets : undefined));
    render(<App />);
    await selectWorkspace();
    await waitFor(() => {
      expect(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls.some((c) =>
          (c[0] as string).includes('/targets'),
        ),
      ).toBe(true);
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('.sidenav-badge')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-011 — NAVIGATE section conditional on active workspace
// ---------------------------------------------------------------------------
describe('SPEC-ui-011 — NAVIGATE section renders only when a workspace is active', () => {
  const base = {
    workspaces: [{ id: 'ws-1', name: 'Repo', path: '/repo' }],
    onSelectWorkspace: vi.fn(),
    onSelectHub: vi.fn(),
    activeTab: 'targets',
    onSelectTab: vi.fn(),
    onSelectPluginRef: vi.fn(),
    pluginRefActive: false,
  };

  it('SPEC-ui-011: nav rows are present when activeWorkspaceId is truthy', () => {
    render(<Sidenav {...base} activeWorkspaceId="ws-1" isHubActive={false} />);
    expect(document.querySelectorAll('.sidenav-nav-row').length).toBeGreaterThan(0);
  });

  it('SPEC-ui-011: nav rows are absent when no workspace is active (hub view)', () => {
    render(<Sidenav {...base} activeWorkspaceId={null} isHubActive />);
    expect(document.querySelectorAll('.sidenav-nav-row').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-012 — empty state when no workspaces attached
// ---------------------------------------------------------------------------
describe('SPEC-ui-012 — empty state with no workspaces attached', () => {
  beforeEach(() => { fetchNoWorkspaces(); });

  it('SPEC-ui-012: main shows the centred empty-state prompt and no dashboard grid', async () => {
    render(<App />);
    await waitFor(() => {
      const empty = document.querySelector('.app-empty-state');
      expect(empty).not.toBeNull();
      expect(empty!.textContent).toContain('No workspace attached');
    });
    expect(document.querySelector('.dashboard')).toBeNull();
  });

  it('SPEC-ui-012: sidenav shows the attach affordance and no NAVIGATE rows when no workspaces exist', async () => {
    render(<App />);
    await waitFor(() => expect(document.querySelector('.sidenav-add')).not.toBeNull());
    // no workspace rows, and NAVIGATE hidden
    expect(document.querySelector('.sidenav-ws-panel-row')).toBeNull();
    expect(document.querySelectorAll('.sidenav-nav-row').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-013 — header clock UTC, updates every minute
// ---------------------------------------------------------------------------
describe('SPEC-ui-013 — header clock updates every minute and displays UTC', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('SPEC-ui-013: clock displays HH:mm UTC matching the ISO time at render', () => {
    vi.setSystemTime(new Date('2026-05-19T09:07:00Z'));
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    const text = document.querySelector('.header-mono')?.textContent ?? '';
    expect(text).toContain('2026-05-19');
    expect(text).toContain('09:07 UTC');
  });

  it('SPEC-ui-013: after advancing 60s the displayed time updates off the initial render time', async () => {
    vi.setSystemTime(new Date('2026-05-19T09:00:00Z'));
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    expect(document.querySelector('.header-mono')?.textContent).toContain('09:00 UTC');
    vi.setSystemTime(new Date('2026-05-19T09:01:00Z'));
    vi.advanceTimersByTime(60_000);
    await vi.waitFor(() => {
      const text = document.querySelector('.header-mono')?.textContent ?? '';
      // the interval tick re-reads the clock — time has moved past the initial 09:00
      expect(text).not.toContain('09:00 UTC');
      expect(text).toContain('UTC');
    });
  });

  it('SPEC-ui-013: unmounting clears the interval (no pending timers)', () => {
    const { unmount } = render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-014 — name + description fields
// ---------------------------------------------------------------------------
describe('SPEC-ui-014 — dialog collects name and description fields', () => {
  function setupFetch(onPost?: (body: unknown) => void) {
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      if (url === '/recent-workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if (url === '/workspaces' && init?.method === 'POST') {
        onPost?.(JSON.parse(init.body as string));
        return Promise.resolve({ json: () => Promise.resolve({ id: 'ws-1' }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
  }

  it('SPEC-ui-014: name auto-derives from the path basename and a description field appears', async () => {
    setupFetch();
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/code/my-cool-repo');
    const nameInput = await waitFor(() => {
      const el = document.querySelector('input[placeholder*="identifier"]') as HTMLInputElement;
      if (!el) throw new Error('no name input');
      return el;
    });
    expect(nameInput.value).toBe('my-cool-repo');
    expect(document.querySelector('input[placeholder*="one line"]')).not.toBeNull();
  });

  it('SPEC-ui-014: user edit to name overrides the auto-derived basename', async () => {
    setupFetch();
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/code/first');
    const nameInput = await waitFor(() => {
      const el = document.querySelector('input[placeholder*="identifier"]') as HTMLInputElement;
      if (!el) throw new Error('no name input');
      return el;
    });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'custom-name');
    // changing the path again must not clobber the user-overridden name
    await userEvent.type(pathInput, '-changed');
    expect((document.querySelector('input[placeholder*="identifier"]') as HTMLInputElement).value).toBe('custom-name');
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-015 — SDD detection preview + command peek
// ---------------------------------------------------------------------------
describe('SPEC-ui-015 — SDD detection preview and command peek', () => {
  it('SPEC-ui-015: detected .sdd shows "attach workspace" label and an "Existing .sdd/ detected" preview', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/recent-workspaces')) {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if (url.includes('/check-sdd')) {
        return Promise.resolve({ json: () => Promise.resolve({ hasSdd: true }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/existing/sdd/repo');
    await waitFor(() => {
      const preview = document.querySelector('.dlg-preview');
      expect(preview).not.toBeNull();
      expect(preview!.textContent).toContain('detected');
    }, { timeout: 1500 });
    expect((document.querySelector('.dlg-submit') as HTMLButtonElement).textContent).toContain('attach workspace');
    // no command peek when .sdd already exists
    expect(document.querySelector('.dlg-cmd-peek')).toBeNull();
  });

  it('SPEC-ui-015: missing .sdd shows "initialize & attach" label and a /sdd:init command peek', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/recent-workspaces')) {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if (url.includes('/check-sdd')) {
        return Promise.resolve({ json: () => Promise.resolve({ hasSdd: false }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/fresh/repo');
    await waitFor(() => {
      const preview = document.querySelector('.dlg-preview');
      expect(preview).not.toBeNull();
      expect(preview!.textContent).toContain('No');
    }, { timeout: 1500 });
    expect((document.querySelector('.dlg-submit') as HTMLButtonElement).textContent).toContain('initialize & attach');
    await waitFor(() => {
      const peek = document.querySelector('.dlg-cmd-peek');
      expect(peek).not.toBeNull();
      expect(peek!.textContent).toContain('/sdd:init');
    });
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-016 — recent folders from live API
// ---------------------------------------------------------------------------
describe('SPEC-ui-016 — recent folders sourced from GET /recent-workspaces', () => {
  it('SPEC-ui-016: dialog open fetches /recent-workspaces and lists returned paths', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/recent-workspaces')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ path: '/live/repo', label: 'repo', desc: 'desc', hasSdd: true }]),
        } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    await waitFor(() => {
      expect(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls.some((c) =>
          (c[0] as string).includes('/recent-workspaces'),
        ),
      ).toBe(true);
      expect(document.querySelector('.dlg-suggest')).not.toBeNull();
      expect(document.body.textContent).toContain('/live/repo');
    });
  });

  it('SPEC-ui-016: an empty /recent-workspaces response hides the RECENT FOLDERS section', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) } as Response),
    ) as unknown as typeof fetch;
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('.dlg-suggest')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-017 — POST body includes name, path, description
// ---------------------------------------------------------------------------
describe('SPEC-ui-017 — POST /workspaces body includes name, path, description', () => {
  function setupFetch(onPost: (body: Record<string, unknown>) => void) {
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      if (url === '/recent-workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if (url === '/workspaces' && init?.method === 'POST') {
        onPost(JSON.parse(init.body as string) as Record<string, unknown>);
        return Promise.resolve({ json: () => Promise.resolve({ id: 'ws-1' }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
  }

  it('SPEC-ui-017: submit with a description sends { name, path, description } all present', async () => {
    let body: Record<string, unknown> | undefined;
    setupFetch((b) => { body = b; });
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    await userEvent.type(document.querySelector('input[placeholder*="project"]') as HTMLInputElement, '/my/repo');
    const descInput = await waitFor(() => {
      const el = document.querySelector('input[placeholder*="one line"]') as HTMLInputElement;
      if (!el) throw new Error('no desc');
      return el;
    });
    await userEvent.type(descInput, 'a project');
    await userEvent.click(document.querySelector('.dlg-submit') as HTMLButtonElement);
    await waitFor(() => expect(body).toBeDefined());
    expect(body).toMatchObject({ name: 'repo', path: '/my/repo', description: 'a project' });
  });

  it('SPEC-ui-017: submit with empty description sends description: null (field still present)', async () => {
    let body: Record<string, unknown> | undefined;
    setupFetch((b) => { body = b; });
    render(<AttachWorkspaceDialog onClose={vi.fn()} onAttached={vi.fn()} />);
    await userEvent.type(document.querySelector('input[placeholder*="project"]') as HTMLInputElement, '/my/repo');
    const submit = await waitFor(() => {
      const btn = document.querySelector('.dlg-submit') as HTMLButtonElement;
      if (btn?.disabled) throw new Error('disabled');
      return btn;
    });
    await userEvent.click(submit);
    await waitFor(() => expect(body).toBeDefined());
    expect(body).toHaveProperty('description', null);
    expect(body).toMatchObject({ name: 'repo', path: '/my/repo' });
  });
});
