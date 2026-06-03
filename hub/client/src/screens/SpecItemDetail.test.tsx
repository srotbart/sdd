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
