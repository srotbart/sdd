import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Standards } from './Standards';

const STANDARDS_CONTENT = `# Coding Standards

## Formatting and Style

- 2-space indentation; no tabs
- Max line length: 100 characters

## Best Practices and Anti-Patterns

- Prefer explicit error handling over silent catches
- Avoid mutation of function parameters
`;

function mockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
}

describe('SPEC-scr-051 Standards screen — empty state', () => {
  beforeEach(() => {
    global.fetch = mockFetch([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty state when no standards files are returned', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    expect(document.querySelector('.standards-empty')).not.toBeNull();
    expect(document.querySelector('.standards-empty')!.textContent).toContain('no standards files found');
  });

  it('renders the standards layout container', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    expect(document.querySelector('.standards-layout')).not.toBeNull();
  });

  it('shows title bar with the word standards', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    const titleWord = document.querySelector('.standards-title-word');
    expect(titleWord).not.toBeNull();
    expect(titleWord!.textContent).toBe('standards');
  });

  it('renders empty state when workspaceId is null — no fetch made', async () => {
    const fetchMock = mockFetch([]);
    global.fetch = fetchMock;
    await act(async () => {
      render(<Standards workspaceId={null} />);
    });
    // No fetch call is made when workspaceId is null
    expect(fetchMock).not.toHaveBeenCalled();
    // The screen still renders its empty state message
    expect(document.querySelector('.standards-empty')).not.toBeNull();
  });
});

describe('SPEC-scr-051 Standards screen — with content', () => {
  beforeEach(() => {
    global.fetch = mockFetch([
      { name: 'standards-template.md', content: STANDARDS_CONTENT },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section headings from the standards content', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    const headings = Array.from(document.querySelectorAll('.standards-section__heading')).map(
      (h) => h.textContent
    );
    expect(headings).toContain('Formatting and Style');
    expect(headings).toContain('Best Practices and Anti-Patterns');
  });

  it('renders standards content as readable sections, not an artifact list', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    // No artifact-list rows — this is not an ID'd artifact list
    expect(document.querySelector('.artifact-list-active-row')).toBeNull();
    expect(document.querySelector('.standards-section')).not.toBeNull();
  });

  it('renders the file source label', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    const source = document.querySelector('.standards-file-source');
    expect(source).not.toBeNull();
    expect(source!.textContent).toContain('standards-template.md');
  });

  it('fetches from the correct endpoint', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-test-123" />);
    });
    expect(global.fetch).toHaveBeenCalledWith('/workspaces/ws-test-123/standards');
  });

  it('screen has no create/edit buttons — read-only', async () => {
    await act(async () => {
      render(<Standards workspaceId="ws-001" />);
    });
    const buttons = Array.from(document.querySelectorAll('button'));
    const editButtons = buttons.filter((b) =>
      /create|edit|engage|new|delete/i.test(b.textContent ?? '')
    );
    expect(editButtons.length).toBe(0);
  });
});
