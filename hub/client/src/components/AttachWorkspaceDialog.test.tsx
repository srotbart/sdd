import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttachWorkspaceDialog } from './AttachWorkspaceDialog';

const defaultProps = {
  onClose: vi.fn(),
  onAttached: vi.fn(),
};

describe('AttachWorkspaceDialog recent folders (WI-ui-014)', () => {
  const MOCK_RECENT = [
    { path: '/some/repo', label: 'repo', desc: 'a project', hasSdd: true },
  ];

  beforeEach(() => { vi.clearAllMocks(); });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successful fetch populates the recent folders list', async () => {
    global.fetch = vi.fn((url: string) => {
      if ((url as string).includes('/recent-workspaces')) {
        return Promise.resolve({ json: () => Promise.resolve(MOCK_RECENT) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    await waitFor(() => {
      expect(document.querySelector('.dlg-suggest')).not.toBeNull();
      expect(document.body.textContent).toContain('/some/repo');
    });
  });

  it('failed fetch hides the recent folders section', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network error'))) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('.dlg-suggest')).toBeNull();
  });

  it('empty response from GET /recent-workspaces hides the recent folders section', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) } as Response),
    ) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector('.dlg-suggest')).toBeNull();
  });
});

describe('AttachWorkspaceDialog hasSdd detection for typed paths (WI-ui-020)', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches /check-sdd when path is typed that is not in recentFolders', async () => {
    global.fetch = vi.fn((url: string) => {
      if ((url as string).includes('/recent-workspaces')) {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if ((url as string).includes('/check-sdd')) {
        return Promise.resolve({ json: () => Promise.resolve({ hasSdd: false }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/some/new/path');

    await waitFor(() => {
      const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls as unknown[][];
      expect(calls.some((c) => (c[0] as string).includes('/check-sdd'))).toBe(true);
    }, { timeout: 1000 });
  });

  it('shows "Existing .sdd/ detected" when server reports hasSdd: true for a typed path', async () => {
    global.fetch = vi.fn((url: string) => {
      if ((url as string).includes('/recent-workspaces')) {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if ((url as string).includes('/check-sdd')) {
        return Promise.resolve({ json: () => Promise.resolve({ hasSdd: true }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/existing/sdd/project');

    await waitFor(() => {
      const preview = document.querySelector('.dlg-preview');
      expect(preview).not.toBeNull();
      expect(preview!.textContent).toContain('.sdd/');
    }, { timeout: 1000 });
  });
});

describe('AttachWorkspaceDialog status chip text is uppercase (WI-ui-017)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders SDD READY chip (uppercase) for a recent folder with hasSdd: true', async () => {
    global.fetch = vi.fn((url: string) => {
      if ((url as string).includes('/recent-workspaces')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ path: '/some/repo', label: 'repo', desc: '', hasSdd: true }]),
        } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    await waitFor(() => {
      const tag = document.querySelector('.dlg-suggest-tag--has');
      expect(tag).not.toBeNull();
      expect(tag!.textContent).toContain('SDD READY');
      expect(tag!.textContent).not.toContain('sdd ready');
    });
  });

  it('renders FRESH chip (uppercase) for a recent folder with hasSdd: false', async () => {
    global.fetch = vi.fn((url: string) => {
      if ((url as string).includes('/recent-workspaces')) {
        return Promise.resolve({
          json: () => Promise.resolve([{ path: '/other/repo', label: 'repo', desc: '', hasSdd: false }]),
        } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
    }) as unknown as typeof fetch;

    render(<AttachWorkspaceDialog {...defaultProps} />);

    await waitFor(() => {
      const tag = document.querySelector('.dlg-suggest-tag--fresh');
      expect(tag).not.toBeNull();
      expect(tag!.textContent).toContain('FRESH');
      expect(tag!.textContent).not.toContain('fresh');
    });
  });
});

describe('AttachWorkspaceDialog POST body includes description (WI-ui-015)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  function setupFetch(onPost?: (body: unknown) => void) {
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      if ((url as string) === '/recent-workspaces') {
        return Promise.resolve({ json: () => Promise.resolve([]) } as Response);
      }
      if ((url as string) === '/workspaces' && init?.method === 'POST') {
        const body = JSON.parse(init.body as string) as unknown;
        onPost?.(body);
        return Promise.resolve({ json: () => Promise.resolve({ id: 'ws-1', name: 'myrepo', path: '/my/repo', description: null, created_at: '' }) } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve(null) } as Response);
    }) as unknown as typeof fetch;
  }

  it('submitting with a description sends { name, path, description: "the desc" }', async () => {
    let capturedBody: unknown;
    setupFetch((b) => { capturedBody = b; });

    render(<AttachWorkspaceDialog {...defaultProps} />);

    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/my/repo');

    const descInput = await waitFor(() => {
      const el = document.querySelector('input[placeholder*="one line"]') as HTMLInputElement;
      if (!el) throw new Error('no desc input');
      return el;
    });
    await userEvent.type(descInput, 'the desc');

    const submitBtn = document.querySelector('.dlg-submit') as HTMLButtonElement;
    await userEvent.click(submitBtn);

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(capturedBody).toMatchObject({ name: 'repo', path: '/my/repo', description: 'the desc' });
  });

  it('submitting with empty description sends { name, path, description: null }', async () => {
    let capturedBody: unknown;
    setupFetch((b) => { capturedBody = b; });

    render(<AttachWorkspaceDialog {...defaultProps} />);

    const pathInput = document.querySelector('input[placeholder*="project"]') as HTMLInputElement;
    await userEvent.type(pathInput, '/my/repo');

    const submitBtn = await waitFor(() => {
      const btn = document.querySelector('.dlg-submit') as HTMLButtonElement;
      if (btn?.disabled) throw new Error('button still disabled');
      return btn;
    });
    await userEvent.click(submitBtn);

    await waitFor(() => expect(capturedBody).toBeDefined());
    expect(capturedBody).toMatchObject({ name: 'repo', path: '/my/repo', description: null });
  });
});
