import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Projections } from './Projections';
import type { Projection } from '../types';

function makeFetch(projections: Projection[], contentMap: Record<string, string> = {}) {
  return vi.fn((url: string) => {
    if (url.endsWith('/projections')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(projections),
      });
    }
    const nameMatch = /\/projections\/(.+)$/.exec(url);
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
