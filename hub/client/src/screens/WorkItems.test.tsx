import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkItems } from './WorkItems';
import type { WorkItem, Gap, Spec } from '../types';

const NOW = Date.now();

function makeItem(overrides: Partial<WorkItem>): WorkItem {
  return {
    id: 'WI-test-001',
    gapId: 'GAP-test-001',
    title: 'Test item',
    status: 'pending',
    domain: 'test',
    agent: null,
    created: new Date(NOW - 86400000 * 5).toISOString(),
    scope: 'src/foo.tsx',
    acceptance: [],
    ...overrides,
  };
}

const doneRecent: WorkItem = makeItem({
  id: 'WI-recent',
  status: 'done',
  closed: new Date(NOW - 3600000).toISOString(),
  title: 'Recent done',
});

const doneOld: WorkItem = makeItem({
  id: 'WI-old',
  status: 'done',
  closed: new Date(NOW - 25 * 3600000).toISOString(),
  title: 'Old done',
});

const abandonedItem: WorkItem = makeItem({
  id: 'WI-abandoned',
  status: 'abandoned',
  closed: new Date(NOW - 7200000).toISOString(),
  title: 'Abandoned task',
});

const gaps: Gap[] = [];
const specs: Spec[] = [];
const agents: import('../types').Agent[] = [];
const onNav = vi.fn();

describe('WorkItems — done column 24h filter', () => {
  it('done item closed 1h ago appears in kanban done column', () => {
    render(
      <WorkItems
        workItems={[doneRecent]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const doneCols = document.querySelectorAll('.kanban-col');
    const doneCol = Array.from(doneCols).find((c) =>
      c.querySelector('.kanban-col__head')?.textContent?.includes('done · today'),
    );
    expect(doneCol).not.toBeNull();
    expect(doneCol!.textContent).toContain('Recent done');
  });

  it('done item closed 25h ago does not appear in kanban done column', () => {
    render(
      <WorkItems
        workItems={[doneOld]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const doneCols = document.querySelectorAll('.kanban-col');
    const doneCol = Array.from(doneCols).find((c) =>
      c.querySelector('.kanban-col__head')?.textContent?.includes('done · today'),
    );
    expect(doneCol!.textContent).not.toContain('Old done');
  });

  it('done item closed 25h ago appears in ArchiveFooter', async () => {
    render(
      <WorkItems
        workItems={[doneOld]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const bar = document.querySelector('.archive-footer__bar');
    expect(bar).not.toBeNull();
    await userEvent.click(bar!);
    expect(document.querySelector('.archive-footer__body')!.textContent).toContain('Old done');
  });

  it('done item closed 1h ago does not appear in ArchiveFooter', () => {
    render(
      <WorkItems
        workItems={[doneRecent]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.archive-footer')).toBeNull();
  });
});

describe('WorkItems — abandoned items', () => {
  it('abandoned item does not appear in any kanban column', () => {
    render(
      <WorkItems
        workItems={[abandonedItem]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const kanban = document.querySelector('.kanban');
    expect(kanban!.textContent).not.toContain('Abandoned task');
  });

  it('abandoned item appears in ArchiveFooter', async () => {
    render(
      <WorkItems
        workItems={[abandonedItem]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const bar = document.querySelector('.archive-footer__bar');
    expect(bar).not.toBeNull();
    await userEvent.click(bar!);
    expect(document.querySelector('.archive-footer__body')!.textContent).toContain('Abandoned task');
  });
});

describe('WorkItems — ArchiveFooter wiring', () => {
  it('ArchiveFooter activeId reflects the open drawer item', async () => {
    render(
      <WorkItems
        workItems={[doneOld]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card')!;
    await userEvent.click(card);
    expect(card.classList.contains('arch-card--active')).toBe(true);
  });

  it('ArchiveFooter is not rendered when no archive items exist', () => {
    const pending = makeItem({ id: 'WI-pend', status: 'pending' });
    render(
      <WorkItems
        workItems={[pending]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.archive-footer')).toBeNull();
  });
});

describe('WorkItems — scope renders via the shared Markdown component (GAP-uic-020)', () => {
  it('renders inline code in the scope as a <code> element, not via dangerouslySetInnerHTML', async () => {
    const item = makeItem({
      id: 'WI-md',
      status: 'pending',
      scope: 'edit `hub/server/ws-pty.ts` to guard cwd',
    });
    render(
      <WorkItems workItems={[item]} gaps={gaps} specs={specs} agents={agents} onNav={onNav} />,
    );
    await userEvent.click(document.querySelector('.kcard')!);
    const scope = document.querySelector('.wi-drawer__scope');
    expect(scope).not.toBeNull();
    // The shared Markdown component renders inline code as a real <code> element,
    // replacing the old hand-rolled `.drawer-code` span injected via innerHTML.
    expect(scope!.querySelector('code')).not.toBeNull();
    expect(scope!.querySelector('code')!.textContent).toBe('hub/server/ws-pty.ts');
    expect(scope!.querySelector('.drawer-code')).toBeNull();
  });
});

describe('WorkItems — kanban fills full board width (SPEC-scr-038)', () => {
  it('kanban CSS rule does not contain align-self: start', async () => {
    const css = await import('./WorkItems.css?raw');
    const kanbanBlock = css.default.match(/\.kanban\s*\{[^}]*\}/s)?.[0] ?? '';
    expect(kanbanBlock).not.toContain('align-self: start');
  });

  it('all four kanban columns are always rendered regardless of item count', () => {
    render(
      <WorkItems
        workItems={[]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const cols = document.querySelectorAll('.kanban-col');
    expect(cols).toHaveLength(4);
  });

  it('an empty column renders the same column element as a populated column', () => {
    const pending = makeItem({ id: 'WI-p-full', status: 'pending', title: 'Full col item' });
    render(
      <WorkItems
        workItems={[pending]}
        gaps={gaps}
        specs={specs}
        agents={agents}
        onNav={onNav}
      />,
    );
    const cols = document.querySelectorAll('.kanban-col');
    expect(cols).toHaveLength(4);
    const emptyCol = Array.from(cols).find((c) =>
      c.querySelector('.kanban-col__empty') !== null,
    );
    expect(emptyCol).not.toBeUndefined();
  });
});

describe('WorkItems — STATUS_BORDER removed (WI-uic-016)', () => {
  it('kanban renders successfully — no STATUS_BORDER constant needed', () => {
    const pending = makeItem({ id: 'WI-p', status: 'pending', title: 'Pending task' });
    expect(() => render(
      <WorkItems workItems={[pending]} gaps={gaps} specs={specs} agents={agents} onNav={onNav} />,
    )).not.toThrow();
  });

  it('pending column card has a border-left-color style set', () => {
    const pending = makeItem({ id: 'WI-p2', status: 'pending', title: 'Pending task 2' });
    render(
      <WorkItems workItems={[pending]} gaps={gaps} specs={specs} agents={agents} onNav={onNav} />,
    );
    const card = document.querySelector('.kcard') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.style.borderLeftColor).not.toBe('');
  });

  it('in-progress column card has a border-left-color style set', () => {
    const inProgress = makeItem({ id: 'WI-ip', status: 'in-progress', title: 'In progress task' });
    render(
      <WorkItems workItems={[inProgress]} gaps={gaps} specs={specs} agents={agents} onNav={onNav} />,
    );
    const card = document.querySelector('.kcard') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.style.borderLeftColor).not.toBe('');
  });
});
