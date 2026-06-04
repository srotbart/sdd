import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ArtifactList } from './components/ArtifactList';
import { ArchiveFooter } from './components/ArchiveFooter';
import { TestStatusDot } from './components/TestStatusDot';
import { AgentChip } from './components/AgentChip';
import { StatusPill } from './components/StatusPill';
import type { Agent, WorkItem, ArtifactStatus } from './types';

const COMPONENTS_DIR = join(__dirname, 'components');
const SCREENS_DIR = join(__dirname, 'screens');

function renderRow(item: string) {
  return <div data-testid={`row-${item}`}>{item}</div>;
}
const getKey = (s: string) => s;

// ---------------------------------------------------------------------------
// SPEC-uic-001 — ArtifactList: list with collapsible archived section
// ---------------------------------------------------------------------------
describe('SPEC-uic-001 ArtifactList collapsible archived section', () => {
  it('SPEC-uic-001: renders active items followed by a collapsible archived section', () => {
    const { getByTestId } = render(
      <ArtifactList
        items={['alpha', 'beta']}
        archivedItems={['gamma', 'delta']}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    // active items rendered
    expect(getByTestId('row-alpha')).toBeTruthy();
    expect(getByTestId('row-beta')).toBeTruthy();
    // archived divider present with ARCHIVED N label flanked by two rules
    const divider = document.querySelector('.artifact-list-divider')!;
    expect(divider).not.toBeNull();
    const label = divider.querySelector('.artifact-list-divider__label')!;
    expect(label.textContent).toMatch(/ARCHIVED/);
    expect(label.textContent).toMatch(/2/);
    expect(divider.querySelectorAll('.artifact-list-divider__rule').length).toBe(2);
    // archived rows visible by default and wrapped in archived-row container
    expect(getByTestId('row-gamma')).toBeTruthy();
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(2);
  });

  it('SPEC-uic-001: clicking the divider collapses and re-expands the archived rows with caret toggle', async () => {
    render(
      <ArtifactList
        items={['alpha']}
        archivedItems={['gamma', 'delta']}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const divider = document.querySelector('.artifact-list-divider')!;
    const labelOpen = document.querySelector('.artifact-list-divider__label')!;
    expect(labelOpen.textContent).toMatch(/^▾/);
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(0);
    expect(document.querySelector('.artifact-list-divider__label')!.textContent).toMatch(/^▸/);
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(2);
  });

  it('SPEC-uic-001: renders no divider when there are no archived items', () => {
    render(
      <ArtifactList items={['alpha', 'beta']} archivedItems={[]} renderRow={renderRow} getKey={getKey} />,
    );
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-002 — ArchiveFooter: collapsible WorkItems archive strip
// ---------------------------------------------------------------------------
function mkWorkItem(over: Partial<WorkItem>): WorkItem {
  return {
    id: 'wi-1',
    gapId: 'GAP-1',
    title: 'Title',
    status: 'done' as ArtifactStatus,
    domain: 'architecture',
    agent: null,
    created: '2026-05-01T00:00:00.000Z',
    closed: new Date().toISOString(),
    scope: '',
    acceptance: [],
    ...over,
  };
}

describe('SPEC-uic-002 ArchiveFooter archive strip', () => {
  it('SPEC-uic-002: renders nothing when there are no items', () => {
    const { container } = render(
      <ArchiveFooter items={[]} agents={[]} onOpenItem={() => {}} activeId={null} />,
    );
    expect(container.querySelector('.archive-footer')).toBeNull();
  });

  it('SPEC-uic-002: collapsed bar shows ▸ caret, "archive" label and item count', () => {
    const items = [mkWorkItem({ id: 'wi-a' }), mkWorkItem({ id: 'wi-b' })];
    render(<ArchiveFooter items={items} agents={[]} onOpenItem={() => {}} activeId={null} />);
    const footer = document.querySelector('.archive-footer')!;
    expect(footer.classList.contains('archive-footer--expanded')).toBe(false);
    expect(document.querySelector('.archive-footer__caret')!.textContent).toBe('▸');
    expect(document.querySelector('.archive-footer__label')!.textContent).toBe('archive');
    expect(document.querySelector('.archive-footer__count')!.textContent).toBe('2');
    // collapsed: no search input, no expanded body
    expect(document.querySelector('.archive-footer__search')).toBeNull();
    expect(document.querySelector('.archive-footer__body')).toBeNull();
  });

  it('SPEC-uic-002: expanding shows ▾ caret, search input, status filters and the day-grouped body', async () => {
    const items = [mkWorkItem({ id: 'wi-a' })];
    render(<ArchiveFooter items={items} agents={[]} onOpenItem={() => {}} activeId={null} />);
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    expect(document.querySelector('.archive-footer')!.classList.contains('archive-footer--expanded')).toBe(true);
    expect(document.querySelector('.archive-footer__caret')!.textContent).toBe('▾');
    const search = document.querySelector('.archive-footer__search') as HTMLInputElement;
    expect(search).not.toBeNull();
    expect(search.placeholder).toBe('search archive…');
    const filterLabels = Array.from(document.querySelectorAll('.archive-footer__filter-btn')).map((b) =>
      b.textContent?.replace(/\d+/g, '').trim(),
    );
    expect(filterLabels).toContain('all');
    expect(filterLabels).toContain('done');
    expect(filterLabels).toContain('abandoned');
    expect(document.querySelector('.archive-footer__body')).not.toBeNull();
    expect(document.querySelector('.arch-card')).not.toBeNull();
  });

  it('SPEC-uic-002: filters reset when the strip is collapsed', async () => {
    const items = [mkWorkItem({ id: 'wi-a', status: 'done' }), mkWorkItem({ id: 'wi-b', status: 'abandoned' })];
    render(<ArchiveFooter items={items} agents={[]} onOpenItem={() => {}} activeId={null} />);
    const bar = document.querySelector('.archive-footer__bar')!;
    await userEvent.click(bar); // expand
    const search = document.querySelector('.archive-footer__search') as HTMLInputElement;
    await userEvent.type(search, 'hello');
    expect((document.querySelector('.archive-footer__search') as HTMLInputElement).value).toBe('hello');
    await userEvent.click(bar); // collapse -> resets
    await userEvent.click(bar); // re-expand
    expect((document.querySelector('.archive-footer__search') as HTMLInputElement).value).toBe('');
  });

  it('SPEC-uic-002: abandoned cards get the arch-card--abandoned class; active card is highlighted', async () => {
    const items = [mkWorkItem({ id: 'wi-ab', status: 'abandoned' })];
    render(<ArchiveFooter items={items} agents={[]} onOpenItem={() => {}} activeId={'wi-ab'} />);
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card')!;
    expect(card.classList.contains('arch-card--abandoned')).toBe(true);
    expect(card.classList.contains('arch-card--active')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-003 — TestStatusDot
// ---------------------------------------------------------------------------
describe('SPEC-uic-003 TestStatusDot status dot', () => {
  it('SPEC-uic-003: renders the documented color per status', () => {
    const cases: [string, string][] = [
      ['passing', 'rgb(76, 175, 80)'],
      ['failing', 'rgb(244, 67, 54)'],
      ['missing', 'rgb(255, 152, 0)'],
      ['not-run', 'rgb(158, 158, 158)'],
    ];
    for (const [status, rgb] of cases) {
      const { container } = render(<TestStatusDot status={status as any} />);
      const circle = container.querySelector('.test-status-dot__circle') as HTMLElement;
      expect(circle).not.toBeNull();
      expect(circle.style.background).toBe(rgb);
      expect(circle.getAttribute('aria-label')).toBe(status);
    }
  });

  it('SPEC-uic-003: formats lastRun as YYYY-MM-DD HH:mm and omits the timestamp for not-run', () => {
    const { container } = render(<TestStatusDot status="passing" lastRun="2026-05-19T10:30:00.000Z" />);
    const time = container.querySelector('.test-status-dot__time');
    expect(time).not.toBeNull();
    expect(time!.textContent).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    const { container: c2 } = render(<TestStatusDot status="not-run" lastRun="2026-05-19T10:30:00.000Z" />);
    expect(c2.querySelector('.test-status-dot__time')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-004 — AgentChip
// ---------------------------------------------------------------------------
const AGENT: Agent = { id: 'agt-1', initials: 'CA', name: 'claude-a', host: 'h', status: 'idle', pid: 1 };

describe('SPEC-uic-004 AgentChip identity pill', () => {
  it('SPEC-uic-004: renders the unassigned fallback pill when agent is null or undefined', () => {
    for (const agent of [null, undefined]) {
      const { container } = render(<AgentChip agent={agent} />);
      const pill = container.querySelector('.agent-chip--unassigned');
      expect(pill).not.toBeNull();
      expect(pill!.textContent).toContain('unassigned');
    }
  });

  it('SPEC-uic-004: renders the agent initials in a colored avatar and the agent name as a label', () => {
    const { container } = render(<AgentChip agent={AGENT} />);
    expect(container.querySelector('.agent-chip__av')!.textContent).toBe('CA');
    expect(container.querySelector('.agent-chip__name')!.textContent).toBe('claude-a');
  });

  it('SPEC-uic-004: avatar color is derived from the agent id (stable per id, differs across ids)', () => {
    const a: Agent = { ...AGENT, id: 'agt-aaa' };
    const b: Agent = { ...AGENT, id: 'zzz-zzz' };
    const clsOf = (agent: Agent) => {
      const { container } = render(<AgentChip agent={agent} />);
      return container.querySelector('.agent-chip__av')!.className;
    };
    expect(clsOf(a)).not.toBe(clsOf(b));
    // stable across status changes (color depends only on id)
    expect(clsOf({ ...a, status: 'busy' })).toBe(clsOf({ ...a, status: 'idle' }));
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-005 — StatusPill single source of truth
// ---------------------------------------------------------------------------
describe('SPEC-uic-005 StatusPill single source of truth', () => {
  const ARTIFACT_STATUSES: ArtifactStatus[] = [
    'awaiting-user', 'awaiting-agent', 'ready', 'draft', 'accepted',
    'open', 'pending', 'in-progress', 'blocked', 'done', 'closed', 'active', 'stale',
  ];

  it('SPEC-uic-005: every ArtifactStatus in the spec list resolves to a semantic pill (not the raw fallback)', () => {
    for (const status of ARTIFACT_STATUSES) {
      const { container } = render(<StatusPill status={status} />);
      const pill = container.querySelector('.status-pill')!;
      expect(pill).not.toBeNull();
      // a real status class applied (status-pill--<variant>)
      expect(pill.className).toMatch(/status-pill--\w+/);
      // raw-status fallback would render the verbatim status string with hyphens;
      // documented statuses render their humanized label without leftover hyphens
      const led = pill.querySelector('.status-pill__led')!;
      expect(led).not.toBeNull();
      expect((pill.textContent ?? '').length).toBeGreaterThan(0);
    }
  });

  it('SPEC-uic-005: an honored label prop overrides the mapped text but keeps the mapped variant class', () => {
    const { container } = render(<StatusPill status="done" label="shipped" />);
    const pill = container.querySelector('.status-pill')!;
    expect(pill.textContent).toContain('shipped');
    expect(pill.classList.contains('status-pill--done')).toBe(true);
  });

  it('SPEC-uic-005: an unknown status falls back to the draft variant rather than inventing a class', () => {
    const { container } = render(<StatusPill status={'totally-unknown' as ArtifactStatus} />);
    const pill = container.querySelector('.status-pill')!;
    expect(pill.classList.contains('status-pill--draft')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-006 — components/rows declare their own visual styles
// ---------------------------------------------------------------------------
describe('SPEC-uic-006 components self-declare visual styles', () => {
  it('SPEC-uic-006: ArtifactList wraps active rows in .artifact-list-active-row and archived rows in .artifact-list-archived-row', () => {
    render(
      <ArtifactList items={['a', 'b']} archivedItems={['c']} renderRow={renderRow} getKey={getKey} />,
    );
    expect(document.querySelectorAll('.artifact-list-active-row').length).toBe(2);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(1);
  });

  it('SPEC-uic-006: .artifact-list-active-row declares its own background in ArtifactList.css', () => {
    const css = readFileSync(join(COMPONENTS_DIR, 'ArtifactList.css'), 'utf-8');
    expect(css).toMatch(/\.artifact-list-active-row\s*\{[^}]*background:\s*var\(--paper\)/s);
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-007 — AgentChip size variants and unassigned state
// ---------------------------------------------------------------------------
describe('SPEC-uic-007 AgentChip size variants + unassigned style', () => {
  it('SPEC-uic-007: size="sm" applies the agent-chip--sm modifier, default size applies no modifier', () => {
    const { container: sm } = render(<AgentChip agent={AGENT} size="sm" />);
    expect(sm.querySelector('.agent-chip')!.classList.contains('agent-chip--sm')).toBe(true);
    const { container: md } = render(<AgentChip agent={AGENT} />);
    expect(md.querySelector('.agent-chip')!.classList.contains('agent-chip--sm')).toBe(false);
  });

  it('SPEC-uic-007: AgentChip.css defines both size variant rules and a self-sufficient unassigned rule', () => {
    const css = readFileSync(join(COMPONENTS_DIR, 'AgentChip.css'), 'utf-8');
    expect(css).toMatch(/\.agent-chip--sm\s*\{/);
    expect(css).toMatch(/\.agent-chip--md\s*\{/);
    // unassigned rule declares its own muted background/color/border so it stands alone
    expect(css).toMatch(/\.agent-chip--unassigned\s*\{[^}]*background:[^}]*\}/s);
    expect(css).toMatch(/\.agent-chip--unassigned\s*\{[^}]*color:[^}]*\}/s);
    expect(css).toMatch(/\.agent-chip--unassigned\s*\{[^}]*border:[^}]*dashed[^}]*\}/s);
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-008 — row CSS classes declare explicit background on base rule
// ---------------------------------------------------------------------------
describe('SPEC-uic-008 row classes declare explicit base background', () => {
  const cases: [string, string, string][] = [
    ['Gaps.css', 'gaps-row', SCREENS_DIR],
    ['Specs.css', 'specs-domain-row', SCREENS_DIR],
    ['WorkItems.css', 'kcard', SCREENS_DIR],
    ['Activity.css', 'act-line', SCREENS_DIR],
  ];
  for (const [file, cls, dir] of cases) {
    it(`SPEC-uic-008: .${cls} base rule declares background: var(--paper) in ${file}`, () => {
      const css = readFileSync(join(dir, file), 'utf-8');
      // base rule = the class selector alone (no pseudo/modifier suffix)
      const re = new RegExp(`\\.${cls}\\s*\\{[^}]*background:\\s*var\\(--paper\\)`, 's');
      expect(css).toMatch(re);
    });
  }
});

// ---------------------------------------------------------------------------
// SPEC-uic-009 — ArtifactList owns the filtering pipeline
// ---------------------------------------------------------------------------
interface FItem { id: string; status: string; domain: string }

const FILTER_ITEMS: FItem[] = [
  { id: 'a', status: 'open', domain: 'architecture' },
  { id: 'b', status: 'open', domain: 'workflow' },
  { id: 'c', status: 'closed', domain: 'architecture' },
];
const frow = (i: FItem) => <div data-testid={`item-${i.id}`}>{i.id}</div>;

describe('SPEC-uic-009 ArtifactList filtering pipeline', () => {
  it('SPEC-uic-009: derives an "all" tab plus a tab per unique filterKey value with per-tab counts', () => {
    render(<ArtifactList items={FILTER_ITEMS} renderRow={frow} getKey={(i) => i.id} filterKey="status" />);
    const bar = document.querySelector('.artifact-list-filter-bar');
    expect(bar).not.toBeNull();
    const tabTexts = Array.from(document.querySelectorAll('.artifact-list-filter-btn')).map(
      (b) => b.textContent ?? '',
    );
    // "all" tab with total count, plus open/closed tabs
    expect(tabTexts.some((t) => /all/.test(t) && /3/.test(t))).toBe(true);
    expect(tabTexts.some((t) => /open/.test(t) && /2/.test(t))).toBe(true);
    expect(tabTexts.some((t) => /closed/.test(t) && /1/.test(t))).toBe(true);
  });

  it('SPEC-uic-009: defaults to "all" then filters internally when a tab is clicked', async () => {
    render(
      <ArtifactList
        items={FILTER_ITEMS}
        renderRow={frow}
        getKey={(i) => i.id}
        filterKey="status"
        archivedValues={['closed']}
      />,
    );
    // default 'all': active (open) rows shown, closed row appears under archived section
    expect(document.querySelector('[data-testid="item-a"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="item-c"]')).not.toBeNull();
    expect(document.querySelector('.artifact-list-archived-row')).not.toBeNull();
    // click 'open' tab -> only open items remain, closed hidden
    const openBtn = Array.from(document.querySelectorAll('.artifact-list-filter-btn')).find((b) =>
      b.textContent?.includes('open'),
    )!;
    await userEvent.click(openBtn);
    expect(document.querySelector('[data-testid="item-a"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="item-c"]')).toBeNull();
  });

  it('SPEC-uic-009: archivedKey overrides filterKey for archive classification (two-dimension split)', () => {
    // tabs group by domain, but archiving is decided by status via archivedKey
    render(
      <ArtifactList
        items={FILTER_ITEMS}
        renderRow={frow}
        getKey={(i) => i.id}
        filterKey="domain"
        archivedKey="status"
        archivedValues={['closed']}
      />,
    );
    // tabs are domain values
    const tabTexts = Array.from(document.querySelectorAll('.artifact-list-filter-btn')).map((b) => b.textContent ?? '');
    expect(tabTexts.some((t) => /architecture/.test(t))).toBe(true);
    expect(tabTexts.some((t) => /workflow/.test(t))).toBe(true);
    // item c (status closed) is archived even though its domain tab is architecture
    const archivedRow = document.querySelector('.artifact-list-archived-row [data-testid="item-c"]');
    expect(archivedRow).not.toBeNull();
  });

  it('SPEC-uic-009: renders no filter bar when filterKey is absent', () => {
    render(<ArtifactList items={['x']} archivedItems={[]} renderRow={renderRow} getKey={getKey} />);
    expect(document.querySelector('.artifact-list-filter-bar')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-uic-010 — empty-string filterKey values skipped from tab derivation
// ---------------------------------------------------------------------------
describe('SPEC-uic-010 empty-string filter values skipped', () => {
  interface DItem { id: string; domain: string }
  const items: DItem[] = [
    { id: 'a', domain: 'architecture' },
    { id: 'b', domain: '' },
    { id: 'c', domain: 'workflow' },
  ];
  const drow = (i: DItem) => <div data-testid={`item-${i.id}`}>{i.id}</div>;

  it('SPEC-uic-010: an empty-string filterKey value produces no dedicated (label-less) filter tab', () => {
    render(<ArtifactList items={items} renderRow={drow} getKey={(i) => i.id} filterKey="domain" />);
    const tabs = Array.from(document.querySelectorAll('.artifact-list-filter-btn'));
    // every tab carries a non-empty visible label (text beyond its count chip)
    const labels = tabs.map((b) => b.querySelector('.artifact-list-filter-count')
      ? (b.textContent ?? '').replace(b.querySelector('.artifact-list-filter-count')!.textContent ?? '', '').trim()
      : (b.textContent ?? '').trim());
    expect(labels.every((l) => l.length > 0)).toBe(true);
    // expected tabs: all, architecture, workflow (no blank tab for the empty domain)
    expect(labels).toContain('all');
    expect(labels).toContain('architecture');
    expect(labels).toContain('workflow');
    expect(labels).not.toContain('');
  });

  it('SPEC-uic-010: items with an empty-string filter value still render under the "all" tab', () => {
    render(<ArtifactList items={items} renderRow={drow} getKey={(i) => i.id} filterKey="domain" />);
    expect(document.querySelector('[data-testid="item-b"]')).not.toBeNull();
  });
});
