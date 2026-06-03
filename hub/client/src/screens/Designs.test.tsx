import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Designs } from './Designs';
import type { Design } from '../types';

function makeFetch(designs: Design[], contentMap: Record<string, string> = {}) {
  return vi.fn((url: string) => {
    if ((url as string).endsWith('/designs')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(designs),
      });
    }
    const nameMatch = /\/designs\/(.+)$/.exec(url as string);
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

describe('Designs screen (SPEC-scr-043)', () => {
  it('renders design rows in the left panel from fetched data', async () => {
    const designs: Design[] = [
      { name: 'auth-flow', lastModified: new Date(Date.now() - 120000).toISOString() },
      { name: 'dashboard', lastModified: new Date(Date.now() - 3600000).toISOString() },
    ];
    global.fetch = makeFetch(designs, {
      'auth-flow': '# Auth Flow\n\nContent.',
      'dashboard': '# Dashboard\n\nContent.',
    });

    render(<Designs workspaceId="ws-1" />);

    await waitFor(() => {
      const rows = document.querySelectorAll('.designs-row');
      expect(rows.length).toBe(2);
    });

    const names = Array.from(document.querySelectorAll('.designs-row__name')).map(
      (el) => el.textContent
    );
    expect(names).toContain('auth-flow');
    expect(names).toContain('dashboard');
  });

  it('each design row shows a relative timestamp', async () => {
    const designs: Design[] = [
      { name: 'auth-flow', lastModified: new Date(Date.now() - 120000).toISOString() },
    ];
    global.fetch = makeFetch(designs, { 'auth-flow': '# Auth Flow' });

    render(<Designs workspaceId="ws-1" />);

    await waitFor(() => {
      const time = document.querySelector('.designs-row__time');
      expect(time).not.toBeNull();
      expect(time!.textContent).toMatch(/ago/);
    });
  });

  it('right panel renders markdown content of selected design', async () => {
    const designs: Design[] = [
      { name: 'auth-flow', lastModified: new Date().toISOString() },
    ];
    global.fetch = makeFetch(designs, {
      'auth-flow': '# Auth Flow\n\n**bold text** here.',
    });

    render(<Designs workspaceId="ws-1" />);

    await waitFor(() => {
      const body = document.querySelector('.designs-body');
      expect(body).not.toBeNull();
      const strong = body!.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong!.textContent).toBe('bold text');
    });
  });

  it('shows empty state when no designs exist', async () => {
    global.fetch = makeFetch([]);

    render(<Designs workspaceId="ws-1" />);

    await waitFor(() => {
      const empty = document.querySelector('.designs-empty');
      expect(empty).not.toBeNull();
    });
  });

  it('re-fetches designs when refreshToken changes', async () => {
    const designs: Design[] = [
      { name: 'auth-flow', lastModified: new Date().toISOString() },
    ];
    const mockFetch = makeFetch(designs, { 'auth-flow': '# Auth Flow' });
    global.fetch = mockFetch;

    const { rerender } = render(<Designs workspaceId="ws-1" refreshToken={0} />);

    await waitFor(() => expect(document.querySelectorAll('.designs-row').length).toBe(1));

    const callsBefore = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.length;
    rerender(<Designs workspaceId="ws-1" refreshToken={1} />);

    await waitFor(() => {
      const callsAfter = (mockFetch as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callsAfter).toBeGreaterThan(callsBefore);
    });
  });
});

describe('Sidenav designs entry', () => {
  it('designs nav item appears in the sidenav', async () => {
    const { Sidenav } = await import('../components/Sidenav');

    render(
      <Sidenav
        workspaces={[{ id: 'ws-1', name: 'Test', path: '/test' }]}
        activeWorkspaceId="ws-1"
        onSelectWorkspace={vi.fn()}
        onSelectHub={vi.fn()}
        activeTab="designs"
        onSelectTab={vi.fn()}
        isHubActive={false}
      />
    );

    const navLabels = Array.from(document.querySelectorAll('.sidenav-nav-label')).map(
      (el) => el.textContent
    );
    expect(navLabels).toContain('designs');
  });

  it('designs nav item is positioned between projections and gaps', async () => {
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
    const projectionsIdx = navLabels.indexOf('projections');
    const designsIdx = navLabels.indexOf('designs');
    const gapsIdx = navLabels.indexOf('gaps');
    expect(projectionsIdx).toBeGreaterThanOrEqual(0);
    expect(designsIdx).toBeGreaterThan(projectionsIdx);
    expect(gapsIdx).toBeGreaterThan(designsIdx);
  });
});
