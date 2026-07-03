import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PluginReference } from './PluginReference';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([]) } as Response)
  ) as unknown as typeof fetch;
});

const EXPECTED_SECTIONS = [
  'Overview',
  'Pipeline',
  'Artifacts',
  'Status lifecycles',
  'Skills',
  'Schemas',
  'Design decisions',
];

describe('PluginReference screen (WI-scr-008)', () => {
  it('renders without errors', () => {
    expect(() => render(<PluginReference />)).not.toThrow();
  });

  it('renders all 7 TOC section headings', () => {
    render(<PluginReference />);
    for (const label of EXPECTED_SECTIONS) {
      const items = Array.from(document.querySelectorAll('.pr-toc__item'))
        .filter((el) => el.textContent?.trim() === label);
      expect(items.length, `TOC item "${label}" not found`).toBe(1);
    }
  });

  it('renders all 7 section titles in the content pane', () => {
    render(<PluginReference />);
    for (const label of EXPECTED_SECTIONS) {
      const titles = Array.from(document.querySelectorAll('.pr-section__title'))
        .filter((el) => el.textContent?.trim() === label);
      expect(titles.length, `Section title "${label}" not found`).toBe(1);
    }
  });

  it('renders the "view source on github ↗" ghost button link', () => {
    render(<PluginReference />);
    const link = document.querySelector('.pr-toolbar__github');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain('view source on github');
    expect(link!.getAttribute('href')).toBe('https://github.com/srotbart/sdd');
  });

  it('toolbar contains the ❡ glyph and "plugin reference" title', () => {
    render(<PluginReference />);
    expect(document.querySelector('.pr-toolbar__glyph')?.textContent).toBe('❡');
    expect(document.querySelector('.pr-toolbar__title')?.textContent).toBe('plugin reference');
  });

  it('renders a 220px left TOC sidebar', () => {
    render(<PluginReference />);
    const toc = document.querySelector('.pr-toc');
    expect(toc).not.toBeNull();
  });
});

describe('PluginReference skill list (SPEC-scr-044)', () => {
  it('fetches /plugin-skills on mount and renders returned skill names', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { name: 'sdd:spec-audit', description: 'Audit the spec.' },
          { name: 'sdd:work-item-close', description: 'Close a work item.' },
        ]),
      } as Response)
    ) as unknown as typeof fetch;

    render(<PluginReference />);

    await waitFor(() => {
      expect(screen.getByText('/sdd:spec-audit')).toBeInTheDocument();
    });
    expect(screen.getByText('/sdd:work-item-close')).toBeInTheDocument();
    expect(screen.getByText('Audit the spec.')).toBeInTheDocument();
    const calls = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0] as string
    );
    expect(calls).toContain('/plugin-skills');
  });

  it('shows fallback message when /plugin-skills fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network error'))) as unknown as typeof fetch;

    render(<PluginReference />);

    await waitFor(() => {
      expect(screen.getByText(/No skills found/)).toBeInTheDocument();
    });
  });

  it('shows fallback message when /plugin-skills returns empty array', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) } as Response)
    ) as unknown as typeof fetch;

    render(<PluginReference />);

    await waitFor(() => {
      expect(screen.getByText(/No skills found/)).toBeInTheDocument();
    });
  });
});

describe('PluginReference artifact model (WI-wf-f7bf4e6)', () => {
  it('lists the Issue and Improvement artifact types in the ARTIFACTS cards', () => {
    render(<PluginReference />);
    const ids = Array.from(document.querySelectorAll('.pr-artifact-card__id'))
      .map((el) => el.textContent?.trim());
    expect(ids).toContain('ISS');
    expect(ids).toContain('IMP');
    const body = document.body.textContent || '';
    expect(body).toContain('.sdd/issues/');
    expect(body).toContain('.sdd/improvements/');
  });

  it('includes Issue and Improvement rows in the status-lifecycle table', () => {
    render(<PluginReference />);
    const artifacts = Array.from(document.querySelectorAll('.pr-lifecycle-table tbody tr td:first-child'))
      .map((el) => el.textContent?.trim());
    expect(artifacts).toContain('Issue');
    expect(artifacts).toContain('Improvement');
  });

  it('reflects the tracked spec archive instead of claiming specs are flatly never archived', () => {
    render(<PluginReference />);
    const body = document.body.textContent || '';
    // The nuance is present…
    expect(body).toContain('tracked spec archive');
    // …and the old flat claims are gone.
    expect(body).not.toContain('Never archived.');
    expect(body).not.toContain('Specs are never archived');
  });

  it('shows {7hex} hash IDs in the gap and work-item schema examples', () => {
    render(<PluginReference />);
    const body = document.body.textContent || '';
    expect(body).toMatch(/GAP-scr-[0-9a-f]{7}/);
    expect(body).toMatch(/WI-scr-[0-9a-f]{7}/);
  });
});
