import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Header } from './Header';

const defaultProps = {
  breadcrumb: ['hub'],
  agentCount: 0,
  hubAddress: 'localhost:22351',
};

describe('Header clock (WI-ui-013)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('after advancing fake timers by 60 s the displayed time updates', async () => {
    vi.setSystemTime(new Date('2026-05-19T09:00:00Z'));

    const { container } = render(<Header {...defaultProps} />);
    expect(container.querySelector('.header-mono')?.textContent).toContain('09:00 UTC');

    vi.advanceTimersByTime(60_000);

    await vi.waitFor(() => {
      const text = container.querySelector('.header-mono')?.textContent ?? '';
      expect(text).not.toContain('09:00 UTC');
      expect(text).toContain('UTC');
    });
  });

  it('unmounting Header clears the interval — no pending timers', () => {
    const { unmount } = render(<Header {...defaultProps} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
