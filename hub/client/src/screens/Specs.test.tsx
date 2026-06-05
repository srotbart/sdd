import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Specs } from './Specs';
import type { Spec, Gap, WorkItem } from '../types';

const onNav = vi.fn();

const SPEC_A: Spec = {
  id: 'SPEC-scr',
  domain: 'ui-screens',
  abbrev: 'scr',
  version: 'abc12345',
  items: [
    {
      id: 'SPEC-scr-001',
      title: 'Hub Dashboard screen',
      status: 'active',
      body: 'Renders a cross-workspace overview.',
      refs: [],
      testStatus: { status: 'not-run' },
    },
    {
      id: 'SPEC-scr-002',
      title: 'Workspace Session screen',
      status: 'active',
      body: 'Mirrors session-start output.',
      refs: [],
      testStatus: { status: 'not-run' },
    },
    {
      id: 'SPEC-scr-036',
      title: 'Specs screen fuzzy search',
      status: 'active',
      body: 'A text input filters items.',
      refs: [],
      testStatus: { status: 'not-run' },
    },
  ],
};

const SPEC_B: Spec = {
  id: 'SPEC-arch',
  domain: 'architecture',
  abbrev: 'arch',
  version: 'def67890',
  items: [
    {
      id: 'SPEC-arch-001',
      title: 'WebSocket event bus',
      status: 'active',
      body: 'Backend emits events over WebSocket.',
      refs: [],
      testStatus: { status: 'not-run' },
    },
  ],
};

const GAPS: Gap[] = [];
const WORK_ITEMS: WorkItem[] = [];

const SPEC_MIXED: Spec = {
  id: 'SPEC-scr',
  domain: 'ui-screens',
  abbrev: 'scr',
  version: 'abc12345',
  items: [
    { id: 'SPEC-scr-001', title: 'Passing item', status: 'active', body: '', refs: [], testStatus: { status: 'passing', tests: [] } },
    { id: 'SPEC-scr-002', title: 'Failing item', status: 'active', body: '', refs: [], testStatus: { status: 'failing', tests: [] } },
    { id: 'SPEC-scr-003', title: 'Missing item', status: 'active', body: '', refs: [], testStatus: { status: 'missing', tests: [] } },
    { id: 'SPEC-scr-004', title: 'Not-run item', status: 'active', body: '', refs: [], testStatus: { status: 'not-run', tests: [] } },
    { id: 'SPEC-scr-005', title: 'Skipped item', status: 'active', body: '', refs: [], testStatus: { status: 'skipped', skipReason: 'no code boundary', tests: [] } },
  ],
};

describe('Specs screen coverage summary strip (SPEC-scr-046)', () => {
  it('renders a coverage strip with one row per domain', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const rows = container.querySelectorAll('.specs-coverage-row');
    expect(rows).toHaveLength(1);
  });

  it('renders one coverage row per domain when multiple domains are provided', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED, SPEC_B]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const rows = container.querySelectorAll('.specs-coverage-row');
    expect(rows).toHaveLength(2);
  });

  it('covered/total fraction counts passing + failing + missing as covered', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const fraction = container.querySelector('.specs-coverage-fraction');
    // covered = passing(1) + failing(1) + missing(1) = 3; total = 5
    expect(fraction!.textContent).toContain('3/5');
  });

  it('not-run and skipped are not counted as covered', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const fraction = container.querySelector('.specs-coverage-fraction');
    expect(fraction!.textContent).not.toContain('4/5');
    expect(fraction!.textContent).not.toContain('5/5');
  });

  it('shows correct passing count', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const passing = container.querySelector('.specs-coverage-passing');
    expect(passing!.textContent).toContain('1');
  });

  it('shows correct failing count', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const failing = container.querySelector('.specs-coverage-failing');
    expect(failing!.textContent).toContain('1');
  });

  it('shows correct missing count', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const missing = container.querySelector('.specs-coverage-missing');
    expect(missing!.textContent).toContain('1');
  });

  it('shows correct not-run count separately from skipped', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const notRun = container.querySelector('.specs-coverage-not-run');
    const skipped = container.querySelector('.specs-coverage-skipped');
    expect(notRun!.textContent).toContain('1');
    expect(skipped!.textContent).toContain('1');
  });

  it('skipped count is shown separately from not-run count', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const notRun = container.querySelector('.specs-coverage-not-run');
    const skipped = container.querySelector('.specs-coverage-skipped');
    // both exist as distinct elements
    expect(notRun).not.toBeNull();
    expect(skipped).not.toBeNull();
    // they are not the same element
    expect(notRun).not.toBe(skipped);
  });

  it('coverage strip updates when specs prop changes', () => {
    const specAllPassing: Spec = {
      ...SPEC_MIXED,
      items: SPEC_MIXED.items.map((item) => ({ ...item, testStatus: { status: 'passing', tests: [] } })),
    };
    const { container, rerender } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    expect(container.querySelector('.specs-coverage-fraction')!.textContent).toContain('3/5');

    rerender(<Specs specs={[specAllPassing]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />);
    expect(container.querySelector('.specs-coverage-fraction')!.textContent).toContain('5/5');
  });
});

describe('Specs screen sidebar domain aggregate TestStatusDot (SPEC-scr-049)', () => {
  const SPEC_ALL_PASSING: Spec = {
    id: 'SPEC-scr',
    domain: 'ui-screens',
    abbrev: 'scr',
    version: 'abc12345',
    items: [
      { id: 'SPEC-scr-001', title: 'Item A', status: 'active', body: '', refs: [], testStatus: { status: 'passing', tests: [] } },
      { id: 'SPEC-scr-002', title: 'Item B', status: 'active', body: '', refs: [], testStatus: { status: 'passing', tests: [] } },
    ],
  };

  const SPEC_WITH_FAILING: Spec = {
    id: 'SPEC-scr',
    domain: 'ui-screens',
    abbrev: 'scr',
    version: 'abc12345',
    items: [
      { id: 'SPEC-scr-001', title: 'Item A', status: 'active', body: '', refs: [], testStatus: { status: 'passing', tests: [] } },
      { id: 'SPEC-scr-002', title: 'Item B', status: 'active', body: '', refs: [], testStatus: { status: 'failing', tests: [] } },
    ],
  };

  const SPEC_NOT_RUN: Spec = {
    id: 'SPEC-scr',
    domain: 'ui-screens',
    abbrev: 'scr',
    version: 'abc12345',
    items: [
      { id: 'SPEC-scr-001', title: 'Item A', status: 'active', body: '', refs: [], testStatus: { status: 'not-run' } },
    ],
  };

  it('SPEC-scr-049 each specs-domain-row shows exactly one TestStatusDot', () => {
    const { container } = render(
      <Specs specs={[SPEC_A, SPEC_B]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const domainRows = container.querySelectorAll('.specs-domain-row');
    expect(domainRows.length).toBe(2);
    domainRows.forEach((row) => {
      const dots = row.querySelectorAll('.test-status-dot');
      expect(dots.length).toBe(1);
    });
  });

  it('SPEC-scr-049 domain with all passing items shows a passing dot (green circle)', () => {
    const { container } = render(
      <Specs specs={[SPEC_ALL_PASSING]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const dot = container.querySelector('.specs-domain-row .test-status-dot__circle') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(dot.getAttribute('aria-label')).toBe('passing');
  });

  it('SPEC-scr-049 domain with one failing item shows a failing dot', () => {
    const { container } = render(
      <Specs specs={[SPEC_WITH_FAILING]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const dot = container.querySelector('.specs-domain-row .test-status-dot__circle') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(dot.getAttribute('aria-label')).toBe('failing');
  });

  it('SPEC-scr-049 domain with no test runs shows a not-run dot', () => {
    const { container } = render(
      <Specs specs={[SPEC_NOT_RUN]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const dot = container.querySelector('.specs-domain-row .test-status-dot__circle') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(dot.getAttribute('aria-label')).toBe('not-run');
  });

  it('SPEC-scr-049 the existing coverage strip is still rendered alongside the sidebar dots', () => {
    const { container } = render(
      <Specs specs={[SPEC_MIXED]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    expect(container.querySelector('.specs-coverage-strip')).not.toBeNull();
    expect(container.querySelector('.specs-domain-row .test-status-dot')).not.toBeNull();
  });
});

describe('Specs screen TestStatusDot (SPEC-scr-027)', () => {
  it('renders a TestStatusDot for every spec item in the list', () => {
    const { container } = render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const content = container.querySelector('.specs-content');
    expect(content).not.toBeNull();
    const dots = content!.querySelectorAll('.test-status-dot');
    expect(dots.length).toBe(SPEC_A.items.length);
  });
});

describe('Specs screen fuzzy search (SPEC-scr-036)', () => {
  it('renders a search input above the item list', () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const input = document.querySelector('.specs-search-input');
    expect(input).not.toBeNull();
  });

  it('typing a query that matches one item leaves only that item in the list', async () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const input = document.querySelector('.specs-search-input') as HTMLInputElement;
    expect(input).not.toBeNull();

    await userEvent.type(input, 'Dashboard');

    const items = document.querySelectorAll('.specs-item');
    expect(items.length).toBe(1);
    expect(items[0].querySelector('.specs-item__title')?.textContent).toBe('Hub Dashboard screen');
  });

  it('clearing the query restores all items', async () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const input = document.querySelector('.specs-search-input') as HTMLInputElement;

    await userEvent.type(input, 'Dashboard');
    expect(document.querySelectorAll('.specs-item').length).toBe(1);

    await userEvent.clear(input);
    expect(document.querySelectorAll('.specs-item').length).toBe(3);
  });

  it('switching domains clears the search input', async () => {
    render(
      <Specs specs={[SPEC_A, SPEC_B]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const input = document.querySelector('.specs-search-input') as HTMLInputElement;
    await userEvent.type(input, 'Dashboard');
    expect(input.value).toBe('Dashboard');

    const domainRows = document.querySelectorAll('.specs-domain-row');
    const archRow = Array.from(domainRows).find((r) =>
      r.textContent?.includes('architecture'),
    );
    expect(archRow).not.toBeUndefined();
    await userEvent.click(archRow!);

    expect((document.querySelector('.specs-search-input') as HTMLInputElement).value).toBe('');
  });
});

describe('Specs screen item detail view (SPEC-scr-037)', () => {
  it('clicking an item replaces the list with the detail view showing that item title', async () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const items = document.querySelectorAll('.specs-item');
    expect(items.length).toBe(3);

    await userEvent.click(items[0]);

    expect(document.querySelector('.specs-item')).toBeNull();
    expect(document.querySelector('.spec-item-detail')).not.toBeNull();
    expect(document.querySelector('.specs-item__title')?.textContent).toBe('Hub Dashboard screen');
  });

  it('clicking the back button restores the item list', async () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const firstItem = document.querySelector('.specs-item') as HTMLElement;
    await userEvent.click(firstItem);

    expect(document.querySelector('.spec-item-detail')).not.toBeNull();

    const backBtn = document.querySelector('.spec-item-detail__back') as HTMLElement;
    await userEvent.click(backBtn);

    expect(document.querySelector('.spec-item-detail')).toBeNull();
    expect(document.querySelectorAll('.specs-item').length).toBe(3);
  });

  it('domain sidebar remains visible in the detail view', async () => {
    render(
      <Specs specs={[SPEC_A]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    await userEvent.click(document.querySelector('.specs-item') as HTMLElement);

    expect(document.querySelector('.specs-sidebar')).not.toBeNull();
  });

  it('initialSpecId pre-selects the detail view on mount', () => {
    render(
      <Specs
        specs={[SPEC_A]}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        initialSpecId="SPEC-scr-002"
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.spec-item-detail')).not.toBeNull();
    expect(document.querySelector('.specs-item__title')?.textContent).toBe('Workspace Session screen');
  });
});

describe('Specs screen item list markdown body and line-clamp (SPEC-scr-039)', () => {
  const specsCss = readFileSync(join(__dirname, 'Specs.css'), 'utf-8');

  const SPEC_WITH_MARKDOWN: Spec = {
    id: 'SPEC-scr',
    domain: 'ui-screens',
    abbrev: 'scr',
    version: 'abc12345',
    items: [
      {
        id: 'SPEC-scr-039',
        title: 'Spec item list markdown body',
        status: 'active',
        body: 'Renders **bold** and `code` via react-markdown.',
        refs: [],
        testStatus: { status: 'not-run' },
      },
    ],
  };

  it('renders markdown in the list row — **bold** becomes <strong>', () => {
    render(
      <Specs specs={[SPEC_WITH_MARKDOWN]} gaps={GAPS} workItems={WORK_ITEMS} onNav={onNav} />,
    );
    const body = document.querySelector('.specs-item__body');
    expect(body).not.toBeNull();
    const strong = body!.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe('bold');
  });

  it('.specs-item__body has -webkit-line-clamp: 5', () => {
    expect(specsCss).toMatch(/\.specs-item__body\s*\{[^}]*-webkit-line-clamp:\s*5/s);
  });

  it('.specs-item__body has overflow: hidden', () => {
    expect(specsCss).toMatch(/\.specs-item__body\s*\{[^}]*overflow:\s*hidden/s);
  });
});
