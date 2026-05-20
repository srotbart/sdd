import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ArchiveFooter } from './ArchiveFooter';
import type { WorkItem, Agent } from '../types';

const NOW = Date.now();
const doneItem: WorkItem = {
  id: 'WI-uic-001',
  gapId: 'GAP-uic-001',
  title: 'Build ArtifactList',
  status: 'done',
  domain: 'ui-components',
  agent: null,
  created: new Date(NOW - 86400000 * 2).toISOString(),
  closed: new Date(NOW - 3600000).toISOString(),
  scope: 'components/ArtifactList.tsx',
  acceptance: [],
};

const abandonedItem: WorkItem = {
  id: 'WI-uic-002',
  gapId: 'GAP-uic-002',
  title: 'Abandoned task',
  status: 'abandoned',
  domain: 'ui-components',
  agent: null,
  created: new Date(NOW - 86400000 * 3).toISOString(),
  closed: new Date(NOW - 7200000).toISOString(),
  scope: 'components/Foo.tsx',
  acceptance: [],
};

const mockAgent: Agent = {
  id: 'agent-1',
  initials: 'SR',
  name: 'Sergey',
  host: 'localhost',
  status: 'idle',
  pid: 1234,
};

const agents: Record<string, Agent> = {
  'agent-1': mockAgent,
};

describe('ArchiveFooter — collapsed state (default)', () => {
  it('renders collapsed by default showing count and last-closed time', () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    expect(document.querySelector('.archive-footer__caret')!.textContent).toBe('▸');
    expect(document.querySelector('.archive-footer__count')!.textContent).toBe('1');
    expect(document.querySelector('.archive-footer__last-closed')).not.toBeNull();
  });

  it('does not render body when collapsed', () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    expect(document.querySelector('.archive-footer__body')).toBeNull();
  });

  it('returns null when items is empty', () => {
    const { container } = render(
      <ArchiveFooter items={[]} agents={{}} onOpenItem={vi.fn()} activeId={null} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('ArchiveFooter — expand/collapse behaviour', () => {
  it('expanding shows search input and filter buttons', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    expect(document.querySelector('.archive-footer__search')).not.toBeNull();
    expect(document.querySelectorAll('.archive-footer__filter-btn').length).toBeGreaterThan(0);
    expect(document.querySelector('.archive-footer__body')).not.toBeNull();
  });

  it('caret shows ▾ when expanded', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    expect(document.querySelector('.archive-footer__caret')!.textContent).toBe('▾');
  });

  it('collapsing resets filters and search', async () => {
    render(
      <ArchiveFooter
        items={[doneItem, abandonedItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    const bar = document.querySelector('.archive-footer__bar')!;
    await userEvent.click(bar);

    const search = document.querySelector('.archive-footer__search') as HTMLInputElement;
    await userEvent.type(search, 'hello');
    expect(search.value).toBe('hello');

    const abandonedBtn = Array.from(
      document.querySelectorAll('.archive-footer__filter-btn'),
    ).find((b) => b.textContent?.includes('abandoned'))!;
    await userEvent.click(abandonedBtn);
    expect(abandonedBtn.classList.contains('archive-footer__filter-btn--active')).toBe(true);

    await userEvent.click(bar);

    await userEvent.click(bar);
    const searchAfter = document.querySelector('.archive-footer__search') as HTMLInputElement;
    expect(searchAfter.value).toBe('');
    const allBtn = Array.from(
      document.querySelectorAll('.archive-footer__filter-btn'),
    ).find((b) => b.textContent?.startsWith('all') && !b.textContent?.includes('domain'))!;
    expect(allBtn.classList.contains('archive-footer__filter-btn--active')).toBe(true);
  });
});

describe('ArchiveFooter — arch-card styling', () => {
  it('done cards have var(--st-done) left border color', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.style.borderLeftColor).toBe('var(--st-done)');
  });

  it('abandoned cards have var(--ink-4) left border and abandoned class', async () => {
    render(
      <ArchiveFooter
        items={[abandonedItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card') as HTMLElement;
    expect(card.style.borderLeftColor).toBe('var(--ink-4)');
    expect(card.classList.contains('arch-card--abandoned')).toBe(true);
  });

  it('active card has arch-card--active class', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId="WI-uic-001"
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card');
    expect(card!.classList.contains('arch-card--active')).toBe(true);
  });

  it('non-active card does not have arch-card--active class', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId="WI-other"
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    const card = document.querySelector('.arch-card');
    expect(card!.classList.contains('arch-card--active')).toBe(false);
  });

  it('clicking a card calls onOpenItem with the item id', async () => {
    const onOpenItem = vi.fn();
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={onOpenItem}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    await userEvent.click(document.querySelector('.arch-card')!);
    expect(onOpenItem).toHaveBeenCalledWith('WI-uic-001');
  });

  it('shows agent chip when agent is present', async () => {
    const itemWithAgent = { ...doneItem, agent: 'agent-1' };
    render(
      <ArchiveFooter
        items={[itemWithAgent]}
        agents={agents}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    expect(document.querySelector('.agent-chip')).not.toBeNull();
  });

  it('shows unassigned label when no agent', async () => {
    render(
      <ArchiveFooter
        items={[doneItem]}
        agents={{}}
        onOpenItem={vi.fn()}
        activeId={null}
      />,
    );
    await userEvent.click(document.querySelector('.archive-footer__bar')!);
    expect(document.querySelector('.arch-card__unassigned')).not.toBeNull();
  });
});

describe('ArchiveFooter — CSS', () => {
  const css = readFileSync(join(__dirname, 'ArchiveFooter.css'), 'utf-8');

  it('.archive-footer__label has letter-spacing: 0.18em', () => {
    expect(css).toMatch(/\.archive-footer__label\s*\{[^}]*letter-spacing:\s*0\.18em/s);
  });

  it('.archive-footer__label has font-weight: 500', () => {
    expect(css).toMatch(/\.archive-footer__label\s*\{[^}]*font-weight:\s*500/s);
  });

  it('.archive-footer__label has text-transform: uppercase', () => {
    expect(css).toMatch(/\.archive-footer__label\s*\{[^}]*text-transform:\s*uppercase/s);
  });

  it('.arch-card--abandoned has opacity: 0.85', () => {
    expect(css).toMatch(/\.arch-card--abandoned\s*\{[^}]*opacity:\s*0\.85/s);
  });
});
