import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from './Markdown';

describe('Markdown component — GFM support (SPEC-uic-013)', () => {
  it('renders a GFM table as an HTML <table> element', () => {
    const tableMarkdown = [
      '| Name | Value |',
      '| ---- | ----- |',
      '| foo  | bar   |',
    ].join('\n');

    const { container } = render(<Markdown>{tableMarkdown}</Markdown>);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(container.querySelector('thead')).not.toBeNull();
    expect(container.querySelector('tbody')).not.toBeNull();
    expect(container.querySelector('td')).not.toBeNull();
  });

  it('renders strikethrough ~~text~~ as a <del> element (SPEC-uic-013)', () => {
    const { container } = render(<Markdown>{'~~deleted text~~'}</Markdown>);
    const del = container.querySelector('del');
    expect(del).not.toBeNull();
    expect(del!.textContent).toBe('deleted text');
  });

  it('renders a GFM task list item as a checkbox input (SPEC-uic-013)', () => {
    const taskList = '- [ ] unchecked item\n- [x] checked item';
    const { container } = render(<Markdown>{taskList}</Markdown>);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(false);
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(true);
  });

  it('does not render raw HTML (no rehype-raw) — script tag is escaped (SPEC-uic-013)', () => {
    const { container } = render(<Markdown>{'<script>alert(1)</script>'}</Markdown>);
    // Without rehype-raw, raw HTML should not produce a <script> element
    expect(container.querySelector('script')).toBeNull();
  });
});
