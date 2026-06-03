import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe("StatusPill 'archived' status (WI-uic-008)", () => {
  it("renders a pill with text 'archived' for status 'archived'", () => {
    render(<StatusPill status="archived" />);
    expect(document.body.textContent).toContain('archived');
  });

  it("does not use the draft fallback style class for status 'archived'", () => {
    render(<StatusPill status="archived" />);
    const pill = document.querySelector('.status-pill');
    expect(pill).not.toBeNull();
    expect(pill!.classList.contains('status-pill--draft')).toBe(false);
    expect(pill!.className).toMatch(/status-pill--\w+/);
  });
});

describe("StatusPill 'deferred' and 'abandoned' status (SPEC-uic-005)", () => {
  it("renders label 'deferred' for status='deferred' — not the raw fallback", () => {
    render(<StatusPill status="deferred" />);
    expect(document.body.textContent).toContain('deferred');
    const pill = document.querySelector('.status-pill');
    expect(pill!.classList.contains('status-pill--draft')).toBe(false);
  });

  it("renders label 'abandoned' for status='abandoned' — not the raw fallback", () => {
    render(<StatusPill status="abandoned" />);
    expect(document.body.textContent).toContain('abandoned');
    const pill = document.querySelector('.status-pill');
    expect(pill!.classList.contains('status-pill--draft')).toBe(false);
  });
});
