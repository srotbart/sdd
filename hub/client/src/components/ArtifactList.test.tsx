import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ArtifactList } from './ArtifactList';

const ITEMS = ['alpha', 'beta'];
const ARCHIVED_ITEMS = ['gamma', 'delta'];

function renderRow(item: string, _archived: boolean) {
  return <div data-testid={`row-${item}`}>{item}</div>;
}

function getKey(item: string) {
  return item;
}

describe('ArtifactList — active items', () => {
  it('renders all active items', () => {
    const { getByTestId } = render(
      <ArtifactList
        items={ITEMS}
        archivedItems={[]}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(getByTestId('row-alpha')).toBeTruthy();
    expect(getByTestId('row-beta')).toBeTruthy();
  });

  it('does not render the divider when archivedItems is empty', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={[]}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
  });
});

describe('ArtifactList — archived section', () => {
  it('renders the divider when archivedItems is non-empty', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(document.querySelector('.artifact-list-divider')).not.toBeNull();
  });

  it('divider label shows ARCHIVED count', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toMatch(/ARCHIVED/);
    expect(label!.textContent).toMatch(/2/);
  });

  it('divider starts with ▾ caret (open state)', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label!.textContent).toMatch(/^▾/);
  });

  it('divider has two flanking hr rules', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const divider = document.querySelector('.artifact-list-divider');
    const rules = divider!.querySelectorAll('.artifact-list-divider__rule');
    expect(rules.length).toBe(2);
  });

  it('archived items are visible by default', () => {
    const { getByTestId } = render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(getByTestId('row-gamma')).toBeTruthy();
    expect(getByTestId('row-delta')).toBeTruthy();
  });

  it('archived items are wrapped in .artifact-list-archived-row', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(2);
  });

  it('clicking divider hides archived items', async () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const divider = document.querySelector('.artifact-list-divider')!;
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(0);
  });

  it('clicking divider twice shows archived items again', async () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const divider = document.querySelector('.artifact-list-divider')!;
    await userEvent.click(divider);
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(2);
  });

  it('divider label shows ▸ when collapsed', async () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={ARCHIVED_ITEMS}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    const divider = document.querySelector('.artifact-list-divider')!;
    await userEvent.click(divider);
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label!.textContent).toMatch(/^▸/);
  });
});

describe('ArtifactList — filterKey pipeline (SPEC-uic-009)', () => {
  interface Item {
    id: string;
    status: string;
  }

  const filteredItems: Item[] = [
    { id: 'a', status: 'open' },
    { id: 'b', status: 'open' },
    { id: 'c', status: 'closed' },
  ];

  function renderItem(item: Item) {
    return <div data-testid={`item-${item.id}`}>{item.id}</div>;
  }

  it('renders a filter bar when filterKey is provided', () => {
    render(
      <ArtifactList
        items={filteredItems}
        renderRow={renderItem}
        getKey={(i) => i.id}
        filterKey="status"
        archivedValues={['closed']}
      />,
    );
    expect(document.querySelector('.artifact-list-filter-bar')).not.toBeNull();
  });

  it('clicking a tab hides items not matching that filter value', async () => {
    render(
      <ArtifactList
        items={filteredItems}
        renderRow={renderItem}
        getKey={(i) => i.id}
        filterKey="status"
        archivedValues={['closed']}
      />,
    );
    const buttons = document.querySelectorAll('.artifact-list-filter-btn');
    const openBtn = Array.from(buttons).find((b) => b.textContent?.includes('open'));
    await userEvent.click(openBtn!);
    expect(document.querySelector('[data-testid="item-a"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="item-c"]')).toBeNull();
  });

  it('does not render a filter bar when filterKey is absent', () => {
    render(
      <ArtifactList
        items={ITEMS}
        archivedItems={[]}
        renderRow={renderRow}
        getKey={getKey}
      />,
    );
    expect(document.querySelector('.artifact-list-filter-bar')).toBeNull();
  });
});

describe('ArtifactList — empty-string filterKey values excluded from tabs (WI-uic-017)', () => {
  interface DomainItem {
    id: string;
    domain: string;
  }

  const itemsWithEmptyDomain: DomainItem[] = [
    { id: 'a', domain: 'architecture' },
    { id: 'b', domain: '' },
    { id: 'c', domain: 'workflow' },
  ];

  function renderItem(item: DomainItem) {
    return <div data-testid={`item-${item.id}`}>{item.id}</div>;
  }

  it('items with empty domain string do not produce a blank filter tab', () => {
    render(
      <ArtifactList
        items={itemsWithEmptyDomain}
        renderRow={renderItem}
        getKey={(i) => i.id}
        filterKey="domain"
      />,
    );
    const buttons = Array.from(document.querySelectorAll('.artifact-list-filter-btn'));
    const blankBtn = buttons.find((b) => b.textContent?.trim() === '' || /^\d+$/.test(b.textContent?.trim() ?? ''));
    expect(blankBtn).toBeUndefined();
  });

  it('items with empty domain still appear when "all" tab is active', () => {
    render(
      <ArtifactList
        items={itemsWithEmptyDomain}
        renderRow={renderItem}
        getKey={(i) => i.id}
        filterKey="domain"
      />,
    );
    expect(document.querySelector('[data-testid="item-b"]')).not.toBeNull();
  });
});

describe('ArtifactList — CSS', () => {
  const css = readFileSync(join(__dirname, 'ArtifactList.css'), 'utf-8');

  it('.artifact-list-divider__label has letter-spacing: 0.18em', () => {
    expect(css).toMatch(/\.artifact-list-divider__label\s*\{[^}]*letter-spacing:\s*0\.18em/s);
  });

  it('.artifact-list-divider__label has font-weight: 500', () => {
    expect(css).toMatch(/\.artifact-list-divider__label\s*\{[^}]*font-weight:\s*500/s);
  });

  it('.artifact-list-divider__label has text-transform: uppercase', () => {
    expect(css).toMatch(/\.artifact-list-divider__label\s*\{[^}]*text-transform:\s*uppercase/s);
  });

  it('.artifact-list-archived-row has opacity: 0.55', () => {
    expect(css).toMatch(/\.artifact-list-archived-row\s*\{[^}]*opacity:\s*0\.55/s);
  });

  it('.artifact-list-archived-row:hover has opacity: 0.85', () => {
    expect(css).toMatch(/\.artifact-list-archived-row:hover\s*\{[^}]*opacity:\s*0\.85/s);
  });

  it('.artifact-list-archived-row:has(active descendant) overrides opacity to 1 (WI-scr-020)', () => {
    expect(css).toMatch(/\.artifact-list-archived-row:has\([^)]*--active[^)]*\)[^{]*\{[^}]*opacity:\s*1/s);
  });
});
