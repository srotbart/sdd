import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpecItemDetail } from './SpecItemDetail';
import type { SpecItem, Gap, WorkItem } from '../types';

const onBack = vi.fn();
const onNav = vi.fn();

const ITEM: SpecItem = {
  id: 'SPEC-scr-037',
  title: 'Specs screen item detail view',
  status: 'active',
  body: 'Clicking a spec item replaces the list with a **detail view**.',
  refs: [],
  testStatus: { status: 'not-run' },
};

const GAPS: Gap[] = [];
const WORK_ITEMS: WorkItem[] = [];

const SKIPPED_ITEM: SpecItem = {
  id: 'SPEC-scr-047',
  title: 'Skipped spec item',
  status: 'active',
  body: 'This item has no code boundary.',
  refs: [],
  testStatus: { status: 'skipped', skipReason: 'no code boundary' },
};

const ITEM_WITH_TESTS: SpecItem = {
  id: 'SPEC-scr-045',
  title: 'Per-test breakdown item',
  status: 'active',
  body: 'Item with per-test data.',
  refs: [],
  testStatus: {
    status: 'failing',
    lastRun: '2026-06-03T00:00:00.000Z',
    tests: [
      { fullName: 'describe A > test passes', status: 'passing', lastRun: '2026-06-03T00:00:00.000Z' },
      { fullName: 'describe B > test fails', status: 'failing', lastRun: '2026-06-03T00:00:00.000Z' },
      { fullName: 'missing test substring', status: 'missing' },
    ],
  },
};

const ITEM_NO_TESTS: SpecItem = {
  id: 'SPEC-scr-045b',
  title: 'No tests item',
  status: 'active',
  body: 'Item with no test data.',
  refs: [],
  testStatus: { status: 'not-run', tests: [] },
};

describe('SpecItemDetail — per-test breakdown (SPEC-scr-045)', () => {
  it('renders one row per test in item.testStatus.tests', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM_WITH_TESTS}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const rows = container.querySelectorAll('.spec-item-detail__test-row');
    expect(rows).toHaveLength(3);
  });

  it('each test row shows the test full name', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM_WITH_TESTS}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const names = Array.from(container.querySelectorAll('.spec-item-detail__test-name')).map(
      (el) => el.textContent,
    );
    expect(names).toContain('describe A > test passes');
    expect(names).toContain('describe B > test fails');
    expect(names).toContain('missing test substring');
  });

  it('each test row contains a status dot with the per-test status', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM_WITH_TESTS}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const rows = container.querySelectorAll('.spec-item-detail__test-row');
    // First row: passing — aria-label should be 'passing'
    const firstDot = rows[0]!.querySelector('.test-status-dot__circle');
    expect(firstDot?.getAttribute('aria-label')).toBe('passing');
    // Second row: failing
    const secondDot = rows[1]!.querySelector('.test-status-dot__circle');
    expect(secondDot?.getAttribute('aria-label')).toBe('failing');
    // Third row: missing
    const thirdDot = rows[2]!.querySelector('.test-status-dot__circle');
    expect(thirdDot?.getAttribute('aria-label')).toBe('missing');
  });

  it('renders empty state when testStatus.tests is empty', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM_NO_TESTS}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const rows = container.querySelectorAll('.spec-item-detail__test-row');
    expect(rows).toHaveLength(0);
    const empty = container.querySelector('.spec-item-detail__tests-empty');
    expect(empty).not.toBeNull();
  });

  it('aggregate TestStatusDot continues to show the roll-up status', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM_WITH_TESTS}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    // The id-line dot should reflect the aggregate 'failing' status
    const idLine = container.querySelector('.specs-item__id-line');
    const aggregateDot = idLine!.querySelector('.test-status-dot__circle');
    expect(aggregateDot?.getAttribute('aria-label')).toBe('failing');
  });
});

describe('SpecItemDetail — skipped status (SPEC-scr-047)', () => {
  it('renders the skip reason when item has skipped status', () => {
    const { container } = render(
      <SpecItemDetail
        item={SKIPPED_ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const skipReason = container.querySelector('.spec-item-detail__skip-reason');
    expect(skipReason).not.toBeNull();
    expect(skipReason!.textContent).toContain('no code boundary');
  });

  it('does not render skip reason block for non-skipped items', () => {
    const { container } = render(
      <SpecItemDetail
        item={ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    expect(container.querySelector('.spec-item-detail__skip-reason')).toBeNull();
  });
});

describe('SpecItemDetail (SPEC-scr-037)', () => {
  it('renders the back button', () => {
    render(
      <SpecItemDetail
        item={ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const back = document.querySelector('.spec-item-detail__back');
    expect(back).not.toBeNull();
    expect(back!.textContent).toContain('← items');
  });

  it('calls onBack when the back button is clicked', async () => {
    onBack.mockClear();
    render(
      <SpecItemDetail
        item={ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const back = document.querySelector('.spec-item-detail__back') as HTMLElement;
    await userEvent.click(back);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders the item body as markdown — **bold** becomes <strong>', () => {
    render(
      <SpecItemDetail
        item={ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    const body = document.querySelector('.spec-item-detail__body');
    expect(body).not.toBeNull();
    const strong = body!.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe('detail view');
  });

  it('wraps the body in .spec-item-detail__body', () => {
    render(
      <SpecItemDetail
        item={ITEM}
        gaps={GAPS}
        workItems={WORK_ITEMS}
        onBack={onBack}
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.spec-item-detail__body')).not.toBeNull();
  });
});
