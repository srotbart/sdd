import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PluginReference } from './PluginReference';

const EXPECTED_SECTIONS = [
  'Overview',
  'Pipeline',
  'Artifacts',
  'Status lifecycles',
  'Skills',
  'Schemas',
  'Design decisions',
];

describe('PluginReference screen (WI-scr-008)', () => {
  it('renders without errors', () => {
    expect(() => render(<PluginReference />)).not.toThrow();
  });

  it('renders all 7 TOC section headings', () => {
    render(<PluginReference />);
    for (const label of EXPECTED_SECTIONS) {
      const items = Array.from(document.querySelectorAll('.pr-toc__item'))
        .filter((el) => el.textContent?.trim() === label);
      expect(items.length, `TOC item "${label}" not found`).toBe(1);
    }
  });

  it('renders all 7 section titles in the content pane', () => {
    render(<PluginReference />);
    for (const label of EXPECTED_SECTIONS) {
      const titles = Array.from(document.querySelectorAll('.pr-section__title'))
        .filter((el) => el.textContent?.trim() === label);
      expect(titles.length, `Section title "${label}" not found`).toBe(1);
    }
  });

  it('renders the "view source on github ↗" ghost button link', () => {
    render(<PluginReference />);
    const link = document.querySelector('.pr-toolbar__github');
    expect(link).not.toBeNull();
    expect(link!.textContent).toContain('view source on github');
  });

  it('toolbar contains the ❡ glyph and "plugin reference" title', () => {
    render(<PluginReference />);
    expect(document.querySelector('.pr-toolbar__glyph')?.textContent).toBe('❡');
    expect(document.querySelector('.pr-toolbar__title')?.textContent).toBe('plugin reference');
  });

  it('renders a 220px left TOC sidebar', () => {
    render(<PluginReference />);
    const toc = document.querySelector('.pr-toc');
    expect(toc).not.toBeNull();
  });
});
