import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { Sidenav } from './components/Sidenav';
import { Header } from './components/Header';
import { AttachWorkspaceDialog } from './components/AttachWorkspaceDialog';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read the token CSS at test time via Node fs (jsdom does not process external CSS)
const tokensRaw = readFileSync(resolve(__dirname, 'styles/tokens.css'), 'utf8');

// Read index.html at test time for structural assertions (SPEC-ui-020)
const indexHtml = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

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

// ---------------------------------------------------------------------------
// SPEC-ui-018 — Dark theme token set
// ---------------------------------------------------------------------------
describe('SPEC-ui-018 — dark-theme token set declared in tokens.css', () => {
  const LIGHT_TOKENS = [
    '--paper', '--paper-2', '--paper-3',
    '--ink', '--ink-2', '--ink-3', '--ink-4',
    '--hair', '--hair-2',
    '--accent', '--accent-deep', '--accent-soft',
    '--st-open', '--st-progress', '--st-blocked', '--st-done', '--st-draft', '--st-stale',
  ];

  it('SPEC-ui-018: tokens.css contains a [data-theme="dark"] selector block', () => {
    expect(tokensRaw).toMatch(/\[data-theme="dark"\]/);
  });

  it('SPEC-ui-018: every :root token has a corresponding dark override', () => {
    const darkBlockMatch = tokensRaw.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
    expect(darkBlockMatch, '[data-theme="dark"] block not found').toBeTruthy();
    const darkBlock = darkBlockMatch![1];
    for (const token of LIGHT_TOKENS) {
      expect(darkBlock, `token ${token} missing from dark block`).toContain(token);
    }
  });

  it('SPEC-ui-018: dark surface tokens differ from light surface tokens', () => {
    const rootMatch = tokensRaw.match(/:root\s*\{([\s\S]*?)\}/);
    const darkMatch = tokensRaw.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
    expect(rootMatch).toBeTruthy();
    expect(darkMatch).toBeTruthy();
    function extractValue(block: string, token: string): string {
      const escaped = token.replace(/[-]/g, '\\$&');
      const m = block.match(new RegExp(`${escaped}:\\s*([^;]+);`));
      return m ? m[1].trim() : '';
    }
    const lightPaper = extractValue(rootMatch![1], '--paper');
    const darkPaper = extractValue(darkMatch![1], '--paper');
    expect(darkPaper).not.toBe('');
    expect(darkPaper).not.toBe(lightPaper);
  });

  it('SPEC-ui-018: dark ink tokens differ from light ink tokens (ink is lightened for dark surfaces)', () => {
    const rootMatch = tokensRaw.match(/:root\s*\{([\s\S]*?)\}/);
    const darkMatch = tokensRaw.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
    expect(rootMatch).toBeTruthy();
    expect(darkMatch).toBeTruthy();
    function extractValue(block: string, token: string): string {
      const escaped = token.replace(/[-]/g, '\\$&');
      const m = block.match(new RegExp(`${escaped}:\\s*([^;]+);`));
      return m ? m[1].trim() : '';
    }
    const lightInk = extractValue(rootMatch![1], '--ink');
    const darkInk = extractValue(darkMatch![1], '--ink');
    expect(darkInk).not.toBe('');
    expect(darkInk).not.toBe(lightInk);
  });

  it('SPEC-ui-018: all six status tokens are present in the dark block and are distinct from each other', () => {
    const darkMatch = tokensRaw.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
    expect(darkMatch, '[data-theme="dark"] block not found').toBeTruthy();
    const darkBlock = darkMatch![1];
    const statusTokens = ['--st-open', '--st-progress', '--st-blocked', '--st-done', '--st-draft', '--st-stale'];
    const values: string[] = [];
    for (const tok of statusTokens) {
      const escaped = tok.replace(/[-]/g, '\\$&');
      const m = darkBlock.match(new RegExp(`${escaped}:\\s*([^;]+);`));
      expect(m, `${tok} not found in dark block`).toBeTruthy();
      values.push(m![1].trim());
    }
    // all six values must be distinct from one another
    const unique = new Set(values);
    expect(unique.size).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-019 — theme toggle in Header
// ---------------------------------------------------------------------------
describe('SPEC-ui-019 — Header theme toggle control', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    // default matchMedia stub (light OS preference)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('SPEC-ui-019: header renders a theme-toggle button', () => {
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    expect(document.querySelector('.header-theme-toggle')).not.toBeNull();
  });

  it('SPEC-ui-019: toggle button aria-label reflects current mode', () => {
    localStorage.setItem('hub.themeMode', 'dark');
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    const btn = document.querySelector('.header-theme-toggle') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toContain('dark');
  });

  it('SPEC-ui-019: clicking toggle cycles mode from system → light', async () => {
    localStorage.setItem('hub.themeMode', 'system');
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    const btn = document.querySelector('.header-theme-toggle') as HTMLButtonElement;
    // system → light (next in cycle after system)
    await userEvent.click(btn);
    await waitFor(() => {
      expect(btn.getAttribute('aria-label')).toContain('light');
    });
    expect(localStorage.getItem('hub.themeMode')).toBe('light');
  });

  it('SPEC-ui-019: clicking from light → dark applies data-theme="dark"', async () => {
    localStorage.setItem('hub.themeMode', 'light');
    render(<Header breadcrumb={['hub']} agentCount={0} hubAddress="localhost:22351" />);
    const btn = document.querySelector('.header-theme-toggle') as HTMLButtonElement;
    await userEvent.click(btn);
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    expect(localStorage.getItem('hub.themeMode')).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-020 — pre-paint theme application in index.html
// ---------------------------------------------------------------------------
describe('SPEC-ui-020 — inline script applies theme before first paint', () => {
  // Extract the IIFE body from index.html for direct execution tests
  function extractPrePaintScript(): string {
    // Match an inline <script> in <head> (no src= attribute) that references hub.themeMode
    const m = indexHtml.match(/<script>([\s\S]*?)<\/script>/);
    return m ? m[1] : '';
  }

  function runScript(mockStorage: Record<string, string>, prefersDark: boolean): void {
    // Set up jsdom localStorage
    localStorage.clear();
    Object.entries(mockStorage).forEach(([k, v]) => localStorage.setItem(k, v));
    // Reset data-theme
    document.documentElement.removeAttribute('data-theme');
    // Override matchMedia for this run
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (_: string) => ({ matches: prefersDark, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
    // Execute the IIFE
    const script = extractPrePaintScript();
    // eslint-disable-next-line no-eval
    eval(script);
  }

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('SPEC-ui-020: index.html contains an inline script in <head> before the module script tag', () => {
    // The inline script must appear before <script type="module"
    const inlinePos = indexHtml.indexOf('<script>');
    const modulePos = indexHtml.indexOf('<script type="module"');
    expect(inlinePos, 'No inline <script> found in index.html').toBeGreaterThan(-1);
    expect(modulePos, 'No module script found in index.html').toBeGreaterThan(-1);
    expect(inlinePos).toBeLessThan(modulePos);
  });

  it('SPEC-ui-020: script references the hub.themeMode localStorage key', () => {
    expect(indexHtml).toContain('hub.themeMode');
  });

  it('SPEC-ui-020: stored "dark" sets data-theme="dark" regardless of OS preference', () => {
    runScript({ 'hub.themeMode': 'dark' }, false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-020: stored "light" leaves data-theme absent even when OS prefers dark', () => {
    runScript({ 'hub.themeMode': 'light' }, true);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('SPEC-ui-020: stored "system" with dark OS preference sets data-theme="dark"', () => {
    runScript({ 'hub.themeMode': 'system' }, true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-020: stored "system" with light OS preference leaves data-theme absent', () => {
    runScript({ 'hub.themeMode': 'system' }, false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('SPEC-ui-020: no stored preference with dark OS (defaults to system) sets data-theme="dark"', () => {
    runScript({}, true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-020: no stored preference with light OS leaves data-theme absent', () => {
    runScript({}, false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-ui-021 — component CSS uses tokens not hex literals
// ---------------------------------------------------------------------------
describe('SPEC-ui-021 — component CSS references tokens, not hex literals', () => {
  const specsCss  = readFileSync(resolve(__dirname, 'screens/Specs.css'), 'utf8');
  const gapsCss   = readFileSync(resolve(__dirname, 'screens/Gaps.css'), 'utf8');
  const chipCss   = readFileSync(resolve(__dirname, 'components/AgentChip.css'), 'utf8');

  // Helper: extract the lines that define a class's property
  function classLines(css: string, className: string): string[] {
    const m = css.match(new RegExp(`\\.${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g'));
    return m ?? [];
  }

  it('SPEC-ui-021: Specs.css coverage-dot classes use var(--dot-*) not hex literals', () => {
    const coverageClasses = [
      'specs-coverage-passing',
      'specs-coverage-failing',
      'specs-coverage-missing',
      'specs-coverage-not-run',
      'specs-coverage-skipped',
    ];
    for (const cls of coverageClasses) {
      const lines = classLines(specsCss, cls);
      expect(lines.length, `class .${cls} not found in Specs.css`).toBeGreaterThan(0);
      const combined = lines.join('');
      expect(combined, `.${cls} still uses a hex literal`).not.toMatch(/#[0-9a-fA-F]{3,6}/);
      expect(combined, `.${cls} should reference a CSS var`).toContain('var(--');
    }
  });

  it('SPEC-ui-021: Gaps.css syntax-highlight classes use var(--hl-*) not hex literals', () => {
    const hlClasses = ['gap-hl-kw', 'gap-hl-fn', 'gap-hl-str', 'gap-hl-num'];
    for (const cls of hlClasses) {
      const lines = classLines(gapsCss, cls);
      expect(lines.length, `class .${cls} not found in Gaps.css`).toBeGreaterThan(0);
      const combined = lines.join('');
      expect(combined, `.${cls} still uses a hex literal`).not.toMatch(/#[0-9a-fA-F]{3,6}/);
      expect(combined, `.${cls} should reference a CSS var`).toContain('var(--');
    }
  });

  it('SPEC-ui-021: AgentChip.css avatar-colour classes use var(--chip-av-*) not hex background literals', () => {
    const avClasses = [
      'agent-chip__av--c0', 'agent-chip__av--c1', 'agent-chip__av--c2',
      'agent-chip__av--c3', 'agent-chip__av--c4', 'agent-chip__av--c5',
    ];
    for (const cls of avClasses) {
      const lines = classLines(chipCss, cls);
      expect(lines.length, `class .${cls} not found in AgentChip.css`).toBeGreaterThan(0);
      const combined = lines.join('');
      // background should not be a hex literal (color: #fff for white text is acceptable)
      const withoutColorProp = combined.replace(/color:\s*#fff/g, '');
      expect(withoutColorProp, `.${cls} background still uses a hex literal`).not.toMatch(/#[0-9a-fA-F]{3,6}/);
      expect(combined, `.${cls} background should reference a CSS var`).toContain('var(--chip-av-');
    }
  });

  it('SPEC-ui-021: tokens.css defines all new dot/hl/chip-av tokens in :root', () => {
    const newTokens = [
      '--dot-passing', '--dot-failing', '--dot-missing', '--dot-not-run', '--dot-skipped',
      '--hl-kw', '--hl-fn', '--hl-str', '--hl-num',
      '--chip-av-0', '--chip-av-1', '--chip-av-2', '--chip-av-3', '--chip-av-4', '--chip-av-5',
    ];
    const rootMatch = tokensRaw.match(/:root\s*\{([\s\S]*?)\}/);
    expect(rootMatch, ':root block not found in tokens.css').toBeTruthy();
    for (const tok of newTokens) {
      expect(rootMatch![1], `${tok} missing from :root`).toContain(tok);
    }
  });

  it('SPEC-ui-021: tokens.css defines all new dot/hl/chip-av tokens in [data-theme="dark"]', () => {
    const newTokens = [
      '--dot-passing', '--dot-failing', '--dot-missing', '--dot-not-run', '--dot-skipped',
      '--hl-kw', '--hl-fn', '--hl-str', '--hl-num',
      '--chip-av-0', '--chip-av-1', '--chip-av-2', '--chip-av-3', '--chip-av-4', '--chip-av-5',
    ];
    const darkMatch = tokensRaw.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\}/);
    expect(darkMatch, '[data-theme="dark"] block not found in tokens.css').toBeTruthy();
    for (const tok of newTokens) {
      expect(darkMatch![1], `${tok} missing from dark block`).toContain(tok);
    }
  });
});
