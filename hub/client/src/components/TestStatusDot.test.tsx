import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TestStatusDot } from './TestStatusDot';

describe('TestStatusDot — color rendering', () => {
  it('passing status renders circle with green (rgb 76,175,80)', () => {
    const { container } = render(<TestStatusDot status="passing" lastRun="2026-05-19T10:30:00.000Z" />);
    const circle = container.querySelector('.test-status-dot__circle') as HTMLElement;
    expect(circle).not.toBeNull();
    expect(circle.style.background).toBe('rgb(76, 175, 80)');
  });

  it('failing status renders circle with red (rgb 244,67,54)', () => {
    const { container } = render(<TestStatusDot status="failing" lastRun="2026-05-19T10:30:00.000Z" />);
    const circle = container.querySelector('.test-status-dot__circle') as HTMLElement;
    expect(circle.style.background).toBe('rgb(244, 67, 54)');
  });

  it('missing status renders circle with amber (rgb 255,152,0)', () => {
    const { container } = render(<TestStatusDot status="missing" lastRun="2026-05-19T10:30:00.000Z" />);
    const circle = container.querySelector('.test-status-dot__circle') as HTMLElement;
    expect(circle.style.background).toBe('rgb(255, 152, 0)');
  });

  it('not-run status renders circle with gray (rgb 158,158,158)', () => {
    const { container } = render(<TestStatusDot status="not-run" />);
    const circle = container.querySelector('.test-status-dot__circle') as HTMLElement;
    expect(circle.style.background).toBe('rgb(158, 158, 158)');
  });

  it('each status renders a circle with the aria-label matching the status', () => {
    for (const status of ['passing', 'failing', 'missing', 'not-run'] as const) {
      const { container } = render(<TestStatusDot status={status} />);
      const circle = container.querySelector('.test-status-dot__circle');
      expect(circle?.getAttribute('aria-label')).toBe(status);
    }
  });
});

describe('TestStatusDot — skipped status (SPEC-scr-047)', () => {
  it('skipped status renders circle with blue color distinct from not-run gray', () => {
    const { container: containerSkipped } = render(<TestStatusDot status="skipped" />);
    const { container: containerNotRun } = render(<TestStatusDot status="not-run" />);
    const skippedCircle = containerSkipped.querySelector('.test-status-dot__circle') as HTMLElement;
    const notRunCircle = containerNotRun.querySelector('.test-status-dot__circle') as HTMLElement;
    expect(skippedCircle.style.background).not.toBe(notRunCircle.style.background);
  });

  it('skipped status renders circle with aria-label "skipped"', () => {
    const { container } = render(<TestStatusDot status="skipped" />);
    const circle = container.querySelector('.test-status-dot__circle');
    expect(circle?.getAttribute('aria-label')).toBe('skipped');
  });

  it('skipped status omits the timestamp element', () => {
    const { container } = render(<TestStatusDot status="skipped" skipReason="no code boundary" />);
    expect(container.querySelector('.test-status-dot__time')).toBeNull();
  });

  it('skipped status with skipReason includes reason in the title tooltip', () => {
    const { container } = render(<TestStatusDot status="skipped" skipReason="no code boundary" />);
    const dot = container.querySelector('.test-status-dot');
    expect(dot?.getAttribute('title')).toBe('skipped — no code boundary');
  });

  it('skipped status without skipReason uses "skipped" as the title', () => {
    const { container } = render(<TestStatusDot status="skipped" />);
    const dot = container.querySelector('.test-status-dot');
    expect(dot?.getAttribute('title')).toBe('skipped');
  });
});

describe('TestStatusDot — timestamp display', () => {
  it('shows timestamp for passing status', () => {
    const { container } = render(<TestStatusDot status="passing" lastRun="2026-05-19T10:30:00.000Z" />);
    const time = container.querySelector('.test-status-dot__time');
    expect(time).not.toBeNull();
    expect(time!.textContent).toMatch(/2026-05-19/);
  });

  it('shows timestamp for failing status', () => {
    const { container } = render(<TestStatusDot status="failing" lastRun="2026-05-19T10:30:00.000Z" />);
    expect(container.querySelector('.test-status-dot__time')).not.toBeNull();
  });

  it('shows timestamp for missing status', () => {
    const { container } = render(<TestStatusDot status="missing" lastRun="2026-05-19T08:00:00.000Z" />);
    expect(container.querySelector('.test-status-dot__time')).not.toBeNull();
  });

  it('omits timestamp for not-run status', () => {
    const { container } = render(<TestStatusDot status="not-run" />);
    expect(container.querySelector('.test-status-dot__time')).toBeNull();
  });

  it('omits timestamp for not-run even when lastRun is provided', () => {
    const { container } = render(<TestStatusDot status="not-run" lastRun="2026-05-19T10:30:00.000Z" />);
    expect(container.querySelector('.test-status-dot__time')).toBeNull();
  });

  it('formats timestamp as YYYY-MM-DD HH:mm in local time', () => {
    const iso = '2026-05-19T10:30:00.000Z';
    const { container } = render(<TestStatusDot status="passing" lastRun={iso} />);
    const time = container.querySelector('.test-status-dot__time');
    expect(time!.textContent).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('status="missing" with no lastRun renders timestamp element with placeholder — not empty (WI-uic-014)', () => {
    const { container } = render(<TestStatusDot status="missing" />);
    const time = container.querySelector('.test-status-dot__time');
    expect(time).not.toBeNull();
    expect(time!.textContent!.trim().length).toBeGreaterThan(0);
  });

  it('status="not-run" renders no timestamp element (WI-uic-014)', () => {
    const { container } = render(<TestStatusDot status="not-run" />);
    expect(container.querySelector('.test-status-dot__time')).toBeNull();
  });

  it('status="passing" with lastRun renders formatted timestamp element (WI-uic-014)', () => {
    const { container } = render(<TestStatusDot status="passing" lastRun="2026-05-28T08:00:00.000Z" />);
    const time = container.querySelector('.test-status-dot__time');
    expect(time).not.toBeNull();
    expect(time!.textContent).toMatch(/2026-05-28/);
  });
});
