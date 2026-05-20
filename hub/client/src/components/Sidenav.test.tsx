import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Sidenav } from './Sidenav';

const SHADOW_RE = /box-shadow:\s*(?!none)[^;]+;/;

const defaultProps = {
  workspaces: [],
  activeWorkspaceId: null,
  onSelectWorkspace: vi.fn(),
  onSelectHub: vi.fn(),
  activeTab: 'session',
  onSelectTab: vi.fn(),
  isHubActive: true,
  onSelectPluginRef: vi.fn(),
  pluginRefActive: false,
};

describe('Sidenav — plugin-ref pinned outside scroll area', () => {
  it('plugin-ref section is NOT a descendant of the scrollable inner container', () => {
    render(<Sidenav {...defaultProps} />);
    const scrollContainer = document.querySelector('.sidenav-scroll');
    const pluginRefSection = document.querySelector('.sidenav-plugin-ref-section');
    expect(scrollContainer).not.toBeNull();
    expect(pluginRefSection).not.toBeNull();
    expect(scrollContainer!.contains(pluginRefSection)).toBe(false);
  });

  it('plugin-ref section is a direct child of the sidenav element', () => {
    render(<Sidenav {...defaultProps} />);
    const sidenav = document.querySelector('.sidenav');
    const pluginRefSection = document.querySelector('.sidenav-plugin-ref-section');
    expect(pluginRefSection!.parentElement).toBe(sidenav);
  });

  it('hub-row IS inside the scrollable inner container', () => {
    render(<Sidenav {...defaultProps} />);
    const scrollContainer = document.querySelector('.sidenav-scroll');
    const hubRow = document.querySelector('.sidenav-hub-row');
    expect(scrollContainer!.contains(hubRow)).toBe(true);
  });
});

describe('Sidenav — specs tab count badge reflects live spec count (WI-scr-021)', () => {
  const workspaceProps = {
    ...defaultProps,
    workspaces: [{ id: 'ws-1', name: 'test', path: '/test' }],
    activeWorkspaceId: 'ws-1',
    isHubActive: false,
  };

  it('shows the specs count badge when tabCounts.specs > 0', () => {
    const { container } = render(
      <Sidenav {...workspaceProps} tabCounts={{ specs: 5 }} />,
    );
    const navRows = Array.from(container.querySelectorAll('.sidenav-nav-row'));
    const specsRow = navRows.find((r) => r.textContent?.includes('specs'));
    expect(specsRow).not.toBeNull();
    const badge = specsRow!.querySelector('.sidenav-nav-count');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('5');
  });

  it('does not show the specs count badge when tabCounts.specs is 0', () => {
    const { container } = render(
      <Sidenav {...workspaceProps} tabCounts={{ specs: 0 }} />,
    );
    const navRows = Array.from(container.querySelectorAll('.sidenav-nav-row'));
    const specsRow = navRows.find((r) => r.textContent?.includes('specs'));
    expect(specsRow).not.toBeNull();
    const badge = specsRow!.querySelector('.sidenav-nav-count');
    expect(badge).toBeNull();
  });
});

describe('Sidenav — hub overview dot reflects connection state', () => {
  it('renders sidenav-dot--active on the hub row when isConnected=true', () => {
    const { container } = render(<Sidenav {...defaultProps} isConnected={true} />);
    const hubRow = container.querySelector('.sidenav-hub-row');
    expect(hubRow).not.toBeNull();
    const dot = hubRow!.querySelector('.sidenav-dot');
    expect(dot).not.toBeNull();
    expect(dot!.classList.contains('sidenav-dot--active')).toBe(true);
    expect(dot!.classList.contains('sidenav-dot--idle')).toBe(false);
  });

  it('renders sidenav-dot--idle on the hub row when isConnected=false', () => {
    const { container } = render(<Sidenav {...defaultProps} isConnected={false} />);
    const hubRow = container.querySelector('.sidenav-hub-row');
    const dot = hubRow!.querySelector('.sidenav-dot');
    expect(dot!.classList.contains('sidenav-dot--idle')).toBe(true);
    expect(dot!.classList.contains('sidenav-dot--active')).toBe(false);
  });

  it('defaults to sidenav-dot--idle when isConnected prop is omitted', () => {
    const { container } = render(<Sidenav {...defaultProps} />);
    const hubRow = container.querySelector('.sidenav-hub-row');
    const dot = hubRow!.querySelector('.sidenav-dot');
    expect(dot!.classList.contains('sidenav-dot--idle')).toBe(true);
  });
});

describe('No drop shadows in shell CSS (WI-ui-010 / SPEC-ui-005)', () => {
  it('Sidenav.css contains no positive box-shadow', () => {
    const css = readFileSync(join(__dirname, 'Sidenav.css'), 'utf-8');
    expect(SHADOW_RE.test(css)).toBe(false);
  });

  it('AttachWorkspaceDialog.css contains no positive box-shadow', () => {
    const css = readFileSync(join(__dirname, 'AttachWorkspaceDialog.css'), 'utf-8');
    expect(SHADOW_RE.test(css)).toBe(false);
  });

  it('CommandPalette.css contains no positive box-shadow', () => {
    const css = readFileSync(join(__dirname, 'CommandPalette.css'), 'utf-8');
    expect(SHADOW_RE.test(css)).toBe(false);
  });
});

describe('Sidenav — CSS layout', () => {
  const css = readFileSync(join(__dirname, 'Sidenav.css'), 'utf-8');

  it('.sidenav does not use overflow-y: auto on the root element', () => {
    expect(css).not.toMatch(/\.sidenav\s*\{[^}]*overflow-y:\s*auto/s);
  });

  it('.sidenav-plugin-ref-section has position: absolute', () => {
    expect(css).toMatch(/\.sidenav-plugin-ref-section\s*\{[^}]*position:\s*absolute/s);
  });

  it('.sidenav-plugin-ref-section has bottom: 0', () => {
    expect(css).toMatch(/\.sidenav-plugin-ref-section\s*\{[^}]*bottom:\s*0/s);
  });

  it('.sidenav-scroll has overflow-y: auto', () => {
    expect(css).toMatch(/\.sidenav-scroll\s*\{[^}]*overflow-y:\s*auto/s);
  });

  it('.sidenav-plugin-ref-section has a hairline border-top', () => {
    expect(css).toMatch(/\.sidenav-plugin-ref-section\s*\{[^}]*border-top:\s*1px solid var\(--hair\)/s);
  });
});
