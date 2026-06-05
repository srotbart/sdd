import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown } from './Markdown';
import { PeekerProvider } from './PeekerContext';

// Helper: render inside PeekerProvider (required by ArtifactIdLink → usePeeker)
function renderWithPeeker(ui: React.ReactElement) {
  return render(<PeekerProvider>{ui}</PeekerProvider>);
}

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

describe('Markdown component — artifact ID linkification (SPEC-uic-014)', () => {
  it('(a) an artifact ID in a paragraph renders as an artifact-id-link button', () => {
    const { container } = renderWithPeeker(
      <Markdown>{'See TGT-001 for context.'}</Markdown>
    );
    // ArtifactIdLink renders as a <button> with class artifact-id-link
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toBe('TGT-001');
  });

  it('(a) multi-segment IDs (SPEC-uic-014, GAP-uic-001, WI-uic-001) also linkify', () => {
    const { container } = renderWithPeeker(
      <Markdown>{'Check SPEC-uic-014 and GAP-uic-001 and WI-uic-001.'}</Markdown>
    );
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toBe('SPEC-uic-014');
    expect(buttons[1].textContent).toBe('GAP-uic-001');
    expect(buttons[2].textContent).toBe('WI-uic-001');
  });

  it('(a) all supported prefixes linkify: TGT SPEC GAP WI ISS IMP', () => {
    const md = 'TGT-001 SPEC-auth-002 GAP-uic-003 WI-auth-004 ISS-005 IMP-006';
    const { container } = renderWithPeeker(<Markdown>{md}</Markdown>);
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(6);
  });

  it('(b) an artifact ID inside a fenced code block is NOT linkified', () => {
    const md = '```\nSee TGT-001 here\n```';
    const { container } = renderWithPeeker(<Markdown>{md}</Markdown>);
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(0);
    // The ID still appears as plain text inside the code block
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.textContent).toContain('TGT-001');
  });

  it('(b) an artifact ID inside inline code is NOT linkified', () => {
    const md = 'Use `SPEC-uic-014` to reference the spec.';
    const { container } = renderWithPeeker(<Markdown>{md}</Markdown>);
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(0);
    // The ID still appears as plain text inside the inline code
    const code = container.querySelector('code');
    expect(code).not.toBeNull();
    expect(code!.textContent).toBe('SPEC-uic-014');
  });

  it('(c) a normal markdown link still renders as a plain <a> element', () => {
    const md = '[click here](https://example.com)';
    const { container } = renderWithPeeker(<Markdown>{md}</Markdown>);
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].href).toBe('https://example.com/');
    expect(links[0].textContent).toBe('click here');
    // Must not produce an artifact-id-link button
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(0);
  });

  it('(d) GFM table still renders correctly alongside artifact linkification (regression)', () => {
    const md = [
      '| ID | Status |',
      '| -- | ------ |',
      '| TGT-001 | open |',
    ].join('\n');
    const { container } = renderWithPeeker(<Markdown>{md}</Markdown>);
    // Table structure intact
    expect(container.querySelector('table')).not.toBeNull();
    // TGT-001 inside a table cell is still linkified (it's a text node)
    const buttons = container.querySelectorAll('button.artifact-id-link');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toBe('TGT-001');
  });
});
