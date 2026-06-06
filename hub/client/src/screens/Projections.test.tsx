import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Projections } from './Projections';
import type { Projection } from '../types';

interface CommentEntry {
  id: string;
  action: 'clarify' | 're-evaluate' | 'expand' | 'condense';
  selectedText: string;
  line: number;
  note: string;
  createdAt: string;
}

function makeFetch(
  projections: Projection[],
  contentMap: Record<string, string> = {},
  initialComments: CommentEntry[] = [],
) {
  let comments = [...initialComments];
  return vi.fn((url: string, init?: RequestInit) => {
    // Comments PUT
    if (/\/projections\/[^/]+\/comments$/.test(url) && init?.method === 'PUT') {
      const body = JSON.parse(init.body as string) as CommentEntry[];
      comments = body;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(comments),
      });
    }
    // Comments GET
    if (/\/projections\/[^/]+\/comments$/.test(url)) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(comments),
      });
    }
    // Projections list
    if (url.endsWith('/projections')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(projections),
      });
    }
    // Projection content
    const nameMatch = /\/projections\/([^/]+)$/.exec(url);
    if (nameMatch) {
      const name = nameMatch[1];
      if (name in contentMap) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(contentMap[name]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Projections screen (SPEC-scr-041)', () => {
  it('renders projection rows in the left panel from fetched data', async () => {
    const projections: Projection[] = [
      { name: 'overview', lastModified: new Date(Date.now() - 120000).toISOString() },
      { name: 'status', lastModified: new Date(Date.now() - 3600000).toISOString() },
    ];
    global.fetch = makeFetch(projections, {
      overview: '# Overview\n\nContent.',
      status: '# Status\n\nAll good.',
    });

    render(<Projections workspaceId="ws-1" />);

    await waitFor(() => {
      const rows = document.querySelectorAll('.projections-row');
      expect(rows.length).toBe(2);
    });

    const names = Array.from(document.querySelectorAll('.projections-row__name')).map(
      (el) => el.textContent
    );
    expect(names).toContain('overview');
    expect(names).toContain('status');
  });

  it('each projection row shows a relative timestamp', async () => {
    const projections: Projection[] = [
      { name: 'overview', lastModified: new Date(Date.now() - 120000).toISOString() },
    ];
    global.fetch = makeFetch(projections, { overview: '# Overview' });

    render(<Projections workspaceId="ws-1" />);

    await waitFor(() => {
      const time = document.querySelector('.projections-row__time');
      expect(time).not.toBeNull();
      expect(time!.textContent).toMatch(/ago/);
    });
  });

  it('right panel renders markdown content of selected projection', async () => {
    const projections: Projection[] = [
      { name: 'overview', lastModified: new Date().toISOString() },
    ];
    global.fetch = makeFetch(projections, {
      overview: '# Overview\n\n**bold text** here.',
    });

    render(<Projections workspaceId="ws-1" />);

    await waitFor(() => {
      const body = document.querySelector('.projections-body');
      expect(body).not.toBeNull();
      const strong = body!.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong!.textContent).toBe('bold text');
    });
  });

  it('shows empty state when no projections exist', async () => {
    global.fetch = makeFetch([]);

    render(<Projections workspaceId="ws-1" />);

    await waitFor(() => {
      const empty = document.querySelector('.projections-empty');
      expect(empty).not.toBeNull();
    });
  });

  it('re-fetches projections when refreshToken changes', async () => {
    const projections: Projection[] = [
      { name: 'overview', lastModified: new Date().toISOString() },
    ];
    const mockFetch = makeFetch(projections, { overview: '# Overview' });
    global.fetch = mockFetch;

    const { rerender } = render(<Projections workspaceId="ws-1" refreshToken={0} />);

    await waitFor(() => expect(document.querySelectorAll('.projections-row').length).toBe(1));

    const callsBefore = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.length;
    rerender(<Projections workspaceId="ws-1" refreshToken={1} />);

    await waitFor(() => {
      const callsAfter = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    });
  });
});

describe('Sidenav projections entry', () => {
  it('projections nav item appears in the sidenav', async () => {
    const { Sidenav } = await import('../components/Sidenav');

    render(
      <Sidenav
        workspaces={[{ id: 'ws-1', name: 'Test', path: '/test' }]}
        activeWorkspaceId="ws-1"
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="projections"
        onSelectTab={vi.fn()}
        isHubActive={false}
      />
    );

    const navLabels = Array.from(document.querySelectorAll('.sidenav-nav-label')).map(
      (el) => el.textContent
    );
    expect(navLabels).toContain('projections');
  });

  it('projections nav item is positioned between specs and gaps', async () => {
    const { Sidenav } = await import('../components/Sidenav');

    render(
      <Sidenav
        workspaces={[{ id: 'ws-1', name: 'Test', path: '/test' }]}
        activeWorkspaceId="ws-1"
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="session"
        onSelectTab={vi.fn()}
        isHubActive={false}
      />
    );

    const navLabels = Array.from(document.querySelectorAll('.sidenav-nav-label')).map(
      (el) => el.textContent
    );
    const specsIdx = navLabels.indexOf('specs');
    const projectionsIdx = navLabels.indexOf('projections');
    const gapsIdx = navLabels.indexOf('gaps');
    expect(specsIdx).toBeGreaterThanOrEqual(0);
    expect(projectionsIdx).toBeGreaterThan(specsIdx);
    expect(gapsIdx).toBeGreaterThan(projectionsIdx);
  });
});

describe('Projections view — text-select comment feature (SPEC-scr-053)', () => {
  const proj: Projection[] = [{ name: 'overview', lastModified: new Date().toISOString() }];
  const mdContent = 'First line here.\n\nSecond line text.\n';

  it('action menu renders clarify, re-evaluate, expand, condense buttons', async () => {
    global.fetch = makeFetch(proj, { overview: mdContent });

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    // Simulate revealing the action menu directly (click the marker button if present, or fire custom event)
    // Since selection API is limited in jsdom, we test the menu UI by setting state via the marker btn data-testid
    // We trigger the menu by simulating a mouseup that results in selected text — but jsdom doesn't support
    // real text selection, so we test the menu rendering path by firing a synthetic mouseup with Selection mocked.
    const getSelectionOrig = window.getSelection;
    window.getSelection = () => ({
      toString: () => 'First line',
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ left: 10, right: 80, top: 200, bottom: 216 }),
      } as unknown as Range),
      rangeCount: 1,
    } as unknown as Selection);

    const body = document.querySelector('.projections-body') as HTMLElement;
    fireEvent.mouseUp(body);

    window.getSelection = getSelectionOrig;

    await waitFor(() => {
      expect(document.querySelector('[data-testid="proj-marker"]')).not.toBeNull();
    });

    const marker = document.querySelector('[data-testid="proj-marker"]') as HTMLElement;
    fireEvent.click(marker);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="proj-action-menu"]')).not.toBeNull();
    });

    const actions = ['clarify', 're-evaluate', 'expand', 'condense'];
    for (const a of actions) {
      expect(document.querySelector(`[data-testid="proj-action-${a}"]`)).not.toBeNull();
    }
  });

  it('selecting an action reveals note input and confirm button', async () => {
    global.fetch = makeFetch(proj, { overview: mdContent });

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    const getSelectionOrig = window.getSelection;
    window.getSelection = () => ({
      toString: () => 'Second line',
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ left: 10, right: 90, top: 300, bottom: 316 }),
      } as unknown as Range),
      rangeCount: 1,
    } as unknown as Selection);

    const body = document.querySelector('.projections-body') as HTMLElement;
    fireEvent.mouseUp(body);
    window.getSelection = getSelectionOrig;

    await waitFor(() => expect(document.querySelector('[data-testid="proj-marker"]')).not.toBeNull());
    fireEvent.click(document.querySelector('[data-testid="proj-marker"]') as HTMLElement);

    await waitFor(() => expect(document.querySelector('[data-testid="proj-action-menu"]')).not.toBeNull());

    fireEvent.click(document.querySelector('[data-testid="proj-action-clarify"]') as HTMLElement);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="proj-note-input"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="proj-confirm"]')).not.toBeNull();
    });
  });

  it('confirming an action calls PUT with the new entry and closes the menu', async () => {
    const mockFetch = makeFetch(proj, { overview: mdContent });
    global.fetch = mockFetch;

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    const getSelectionOrig = window.getSelection;
    window.getSelection = () => ({
      toString: () => 'First line',
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ left: 10, right: 80, top: 200, bottom: 216 }),
      } as unknown as Range),
      removeAllRanges: vi.fn(),
      rangeCount: 1,
    } as unknown as Selection);

    const body = document.querySelector('.projections-body') as HTMLElement;
    fireEvent.mouseUp(body);
    window.getSelection = getSelectionOrig;

    await waitFor(() => expect(document.querySelector('[data-testid="proj-marker"]')).not.toBeNull());
    fireEvent.click(document.querySelector('[data-testid="proj-marker"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-testid="proj-action-menu"]')).not.toBeNull());

    fireEvent.click(document.querySelector('[data-testid="proj-action-expand"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-testid="proj-confirm"]')).not.toBeNull());

    await act(async () => {
      fireEvent.click(document.querySelector('[data-testid="proj-confirm"]') as HTMLElement);
    });

    await waitFor(() => {
      // Menu closes after confirm
      expect(document.querySelector('[data-testid="proj-action-menu"]')).toBeNull();
    });

    // PUT was called with correct shape
    const putCall = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => (call[1] as RequestInit)?.method === 'PUT'
    );
    expect(putCall).toBeDefined();
    const body2 = JSON.parse((putCall![1] as RequestInit).body as string) as CommentEntry[];
    expect(body2.length).toBe(1);
    expect(body2[0].action).toBe('expand');
    expect(body2[0].selectedText).toBe('First line');
    expect(typeof body2[0].line).toBe('number');
    expect(body2[0].line).toBeGreaterThanOrEqual(1);
  });

  it('line is derived from first occurrence of selectedText in raw markdown (1-based)', async () => {
    const mockFetch = makeFetch(proj, { overview: 'line one\nline two\nline three\n' });
    global.fetch = mockFetch;

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    const getSelectionOrig = window.getSelection;
    window.getSelection = () => ({
      toString: () => 'line two',
      getRangeAt: () => ({
        getBoundingClientRect: () => ({ left: 10, right: 80, top: 200, bottom: 216 }),
      } as unknown as Range),
      removeAllRanges: vi.fn(),
      rangeCount: 1,
    } as unknown as Selection);

    fireEvent.mouseUp(document.querySelector('.projections-body') as HTMLElement);
    window.getSelection = getSelectionOrig;

    await waitFor(() => expect(document.querySelector('[data-testid="proj-marker"]')).not.toBeNull());
    fireEvent.click(document.querySelector('[data-testid="proj-marker"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-testid="proj-action-menu"]')).not.toBeNull());
    fireEvent.click(document.querySelector('[data-testid="proj-action-condense"]') as HTMLElement);
    await waitFor(() => expect(document.querySelector('[data-testid="proj-confirm"]')).not.toBeNull());

    await act(async () => {
      fireEvent.click(document.querySelector('[data-testid="proj-confirm"]') as HTMLElement);
    });

    const putCall = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => (call[1] as RequestInit)?.method === 'PUT'
    );
    const body = JSON.parse((putCall![1] as RequestInit).body as string) as CommentEntry[];
    expect(body[0].line).toBe(2); // 'line two' is on line 2
  });

  it('comments loaded from server are reflected in the component state', async () => {
    const existing: CommentEntry[] = [
      {
        id: 'cmt-existing',
        action: 'clarify',
        selectedText: 'First line',
        line: 1,
        note: 'pls clarify',
        createdAt: new Date().toISOString(),
      },
    ];
    global.fetch = makeFetch(proj, { overview: mdContent }, existing);

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    // The GET comments call should have been made
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as string[][];
    const commentsCalls = calls.filter((c) => /\/comments/.test(c[0]));
    expect(commentsCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('multiple comments on same selectedText are supported additively', async () => {
    const mockFetch = makeFetch(proj, { overview: mdContent });
    global.fetch = mockFetch;

    render(<Projections workspaceId="ws-1" />);
    await waitFor(() => expect(document.querySelector('.projections-body')).not.toBeNull());

    // Add first comment
    const addComment = async (action: string) => {
      const getSelectionOrig = window.getSelection;
      window.getSelection = () => ({
        toString: () => 'First line',
        getRangeAt: () => ({
          getBoundingClientRect: () => ({ left: 10, right: 80, top: 200, bottom: 216 }),
        } as unknown as Range),
        removeAllRanges: vi.fn(),
        rangeCount: 1,
      } as unknown as Selection);
      fireEvent.mouseUp(document.querySelector('.projections-body') as HTMLElement);
      window.getSelection = getSelectionOrig;

      await waitFor(() => expect(document.querySelector('[data-testid="proj-marker"]')).not.toBeNull());
      fireEvent.click(document.querySelector('[data-testid="proj-marker"]') as HTMLElement);
      await waitFor(() => expect(document.querySelector('[data-testid="proj-action-menu"]')).not.toBeNull());
      fireEvent.click(document.querySelector(`[data-testid="proj-action-${action}"]`) as HTMLElement);
      await waitFor(() => expect(document.querySelector('[data-testid="proj-confirm"]')).not.toBeNull());
      await act(async () => {
        fireEvent.click(document.querySelector('[data-testid="proj-confirm"]') as HTMLElement);
      });
      await waitFor(() => expect(document.querySelector('[data-testid="proj-action-menu"]')).toBeNull());
    };

    await addComment('clarify');
    await addComment('expand');

    const putCalls = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      (call: unknown[]) => (call[1] as RequestInit)?.method === 'PUT'
    );
    // Second PUT should have 2 entries
    const lastPutBody = JSON.parse(
      (putCalls[putCalls.length - 1][1] as RequestInit).body as string
    ) as CommentEntry[];
    expect(lastPutBody.length).toBe(2);
    expect(lastPutBody.map((e: CommentEntry) => e.selectedText).every((t: string) => t === 'First line')).toBe(true);
  });
});
