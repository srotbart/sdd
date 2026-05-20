import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Targets } from './Targets';
import type { Target } from '../types';

const artifactListCss = readFileSync(
  join(__dirname, '../components/ArtifactList.css'),
  'utf-8',
);

const TARGET: Target = {
  id: 'TGT-001',
  status: 'awaiting-user',
  domain: 'architecture',
  domainAbbrev: 'arch',
  title: 'Add workspace attachment API',
  created: '2026-05-17T00:00:00Z',
  statement: 'The hub server exposes a POST /workspaces endpoint.',
  dialog: [],
};

const ARCHIVED_TARGET: Target = {
  id: 'TGT-002',
  status: 'accepted',
  domain: 'architecture',
  domainAbbrev: 'arch',
  title: 'Old feature',
  created: '2026-05-10T00:00:00Z',
  statement: 'This was accepted.',
  dialog: [],
  foldedInto: 'SPEC-arch-001',
};

describe('Targets title bar', () => {
  it('renders the title bar above the two-pane layout', () => {
    render(<Targets targets={[TARGET]} />);
    const titleBar = document.querySelector('.targets-title-bar');
    const layout = document.querySelector('.targets-layout');
    expect(titleBar).not.toBeNull();
    expect(layout).not.toBeNull();
    expect(titleBar!.compareDocumentPosition(layout!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('title bar contains the bullet, italic word, and subtitle', () => {
    render(<Targets targets={[TARGET]} />);
    expect(document.querySelector('.targets-title-bullet')?.textContent).toBe('▪');
    expect(document.querySelector('.targets-title-word')?.textContent).toBe('targets');
    expect(document.querySelector('.targets-title-sub')?.textContent).toBe(
      '— declared intent, negotiated to spec',
    );
  });

  it('title bar contains the + new target button', () => {
    render(<Targets targets={[TARGET]} />);
    expect(screen.getByText('+ new target')).toBeTruthy();
  });
});

describe('Targets archived tab and section', () => {
  it('archived tab appears in the filter bar with accepted target count', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const archivedBtn = screen.getByText('archived', { selector: '.filter-btn' });
    expect(archivedBtn).toBeTruthy();
    const count = archivedBtn.querySelector('.filter-btn__count');
    expect(count?.textContent).toBe('1');
  });

  it('when all is selected, active targets appear before the ARCHIVED divider', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const divider = document.querySelector('.artifact-list-divider');
    expect(divider).not.toBeNull();
    expect(divider!.textContent).toMatch(/ARCHIVED 1/);
    const rows = document.querySelectorAll('.target-row');
    expect(rows.length).toBe(2);
  });

  it('clicking archived shows only accepted targets in the list', async () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const archivedBtn = screen.getByText('archived', { selector: '.filter-btn' });
    await userEvent.click(archivedBtn);
    const listTitles = Array.from(
      document.querySelectorAll('.target-row__title'),
    ).map((el) => el.textContent);
    expect(listTitles).not.toContain('Add workspace attachment API');
    expect(listTitles).toContain('Old feature');
  });

  it('archived row with foldedInto shows folded → SPEC-xxx footer', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const folded = document.querySelector('.target-row__folded');
    expect(folded?.textContent).toContain('folded → SPEC-arch-001');
  });

  it('no archived divider when no accepted targets exist', () => {
    render(<Targets targets={[TARGET]} />);
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
  });
});

describe('Target row background (WI-scr-014)', () => {
  const css = readFileSync(join(__dirname, 'Targets.css'), 'utf-8');

  it('.target-row has an explicit background declaration (not inherited)', () => {
    expect(css).toMatch(/\.target-row\s*\{[^}]*background:/s);
  });

  it('.target-row background token is var(--paper)', () => {
    expect(css).toMatch(/\.target-row\s*\{[^}]*background:\s*var\(--paper\)/s);
  });
});

describe('Targets archived divider visual treatment (WI-scr-013)', () => {
  it('divider label contains ARCHIVED and the count', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toMatch(/ARCHIVED/);
    expect(label!.textContent).toMatch(/1/);
  });

  it('divider has two flanking hr elements on both sides of the label', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const divider = document.querySelector('.artifact-list-divider');
    expect(divider).not.toBeNull();
    const rules = divider!.querySelectorAll('.artifact-list-divider__rule');
    expect(rules.length).toBe(2);
  });
});

describe('Targets composer hint and mark-ready button (WI-scr-003)', () => {
  it('hint text reads "sets status → awaiting-agent" when status is awaiting-user', () => {
    render(<Targets targets={[TARGET]} />);
    const hint = document.querySelector('.composer__action-hint');
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toBe('sets status → awaiting-agent');
  });

  it('"mark ready" button is present in the toolbar when status is awaiting-user', () => {
    render(<Targets targets={[TARGET]} />);
    const actions = document.querySelector('.composer__actions');
    expect(actions).not.toBeNull();
    const buttons = Array.from(actions!.querySelectorAll('button'));
    const markReady = buttons.find((b) => b.textContent?.trim() === 'mark ready');
    expect(markReady).toBeTruthy();
  });

  it('"mark ready" button is not present when status is awaiting-agent', () => {
    const agentTarget: Target = { ...TARGET, status: 'awaiting-agent' };
    render(<Targets targets={[agentTarget]} />);
    const actions = document.querySelector('.composer__actions');
    expect(actions).not.toBeNull();
    const buttons = Array.from(actions!.querySelectorAll('button'));
    const markReady = buttons.find((b) => b.textContent?.trim() === 'mark ready');
    expect(markReady).toBeUndefined();
  });
});

describe('Targets list background and archived row opacity (WI-scr-005)', () => {
  const css = readFileSync(join(__dirname, 'Targets.css'), 'utf-8');

  it('.targets-list has background: var(--paper)', () => {
    expect(css).toMatch(/\.targets-list\s*\{[^}]*background:\s*var\(--paper\)[^-2]/s);
  });

  it('archived target rows are wrapped in .artifact-list-archived-row', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(1);
  });

  it('active (non-archived) target rows are not wrapped in .artifact-list-archived-row', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(1);
  });

  it('.artifact-list-archived-row CSS rule sets opacity: 0.55', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-archived-row\s*\{[^}]*opacity:\s*0\.55/s);
  });

  it('.artifact-list-archived-row:hover CSS rule sets opacity: 0.85', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-archived-row:hover\s*\{[^}]*opacity:\s*0\.85/s);
  });
});

describe('Targets statement body serif font (WI-scr-004)', () => {
  const css = readFileSync(join(__dirname, 'Targets.css'), 'utf-8');

  it('.statement-block__text declares font-family: var(--serif)', () => {
    expect(css).toMatch(/\.statement-block__text\s*\{[^}]*font-family:\s*var\(--serif\)/s);
  });

  it('.statement-block__text declares font-size: 16px', () => {
    expect(css).toMatch(/\.statement-block__text\s*\{[^}]*font-size:\s*16px/s);
  });

  it('.statement-block__text declares line-height: 1.55', () => {
    expect(css).toMatch(/\.statement-block__text\s*\{[^}]*line-height:\s*1\.55/s);
  });
});

describe('Targets archived divider eyebrow styling (WI-scr-002)', () => {
  it('.artifact-list-divider__label has letter-spacing: 0.18em', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-divider__label\s*\{[^}]*letter-spacing:\s*0\.18em/s);
  });

  it('.artifact-list-divider__label has font-weight: 500', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-divider__label\s*\{[^}]*font-weight:\s*500/s);
  });

  it('.artifact-list-divider__label has font-size: 10px', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-divider__label\s*\{[^}]*font-size:\s*10px/s);
  });

  it('.artifact-list-divider__label has text-transform: uppercase', () => {
    expect(artifactListCss).toMatch(/\.artifact-list-divider__label\s*\{[^}]*text-transform:\s*uppercase/s);
  });
});

describe('Targets dialog layout (WI-scr-007)', () => {
  const css = readFileSync(join(__dirname, 'Targets.css'), 'utf-8');

  it('.dialog has padding: 24px 36px 120px', () => {
    expect(css).toMatch(/\.dialog\s*\{[^}]*padding:\s*24px 36px 120px/s);
  });

  it('.dialog has gap: 22px for vertical rhythm between turns', () => {
    expect(css).toMatch(/\.dialog\s*\{[^}]*gap:\s*22px/s);
  });

  it('.dialog-turn__who has font-size: 10px', () => {
    expect(css).toMatch(/\.dialog-turn__who\s*\{[^}]*font-size:\s*10px/s);
  });

  it('.dialog-turn__who has letter-spacing: 0.18em', () => {
    expect(css).toMatch(/\.dialog-turn__who\s*\{[^}]*letter-spacing:\s*0\.18em/s);
  });

  it('.dialog-turn__bubble has left-only padding: 0 0 0 20px', () => {
    expect(css).toMatch(/\.dialog-turn__bubble\s*\{[^}]*padding:\s*0 0 0 20px/s);
  });

  it('.dialog-turn__body has font-size: 14px', () => {
    expect(css).toMatch(/\.dialog-turn__body\s*\{[^}]*font-size:\s*14px/s);
  });

  it('.dialog-turn__body has line-height: 1.65', () => {
    expect(css).toMatch(/\.dialog-turn__body\s*\{[^}]*line-height:\s*1\.65/s);
  });
});

describe('Targets list uses ArtifactList for all filter tabs (WI-scr-023)', () => {
  const READY_TARGET: Target = {
    id: 'TGT-003',
    status: 'ready',
    domain: 'architecture',
    domainAbbrev: 'arch',
    title: 'Ready feature',
    created: '2026-05-10T00:00:00Z',
    statement: 'Ready.',
    dialog: [],
  };

  it('non-all filter tab renders rows without a bare map — no divider when no archived items', async () => {
    render(<Targets targets={[TARGET, READY_TARGET, ARCHIVED_TARGET]} />);
    const readyBtn = screen.getByText('ready', { selector: '.filter-btn' });
    await userEvent.click(readyBtn);
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
    const rows = document.querySelectorAll('.target-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Ready feature');
  });

  it('awaiting-you filter renders only awaiting-user rows via ArtifactList', async () => {
    render(<Targets targets={[TARGET, READY_TARGET, ARCHIVED_TARGET]} />);
    const awaitingBtn = screen.getByText('awaiting you', { selector: '.filter-btn' });
    await userEvent.click(awaitingBtn);
    const rows = document.querySelectorAll('.target-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Add workspace attachment API');
  });

  it('archived filter tab renders accepted rows without a divider', async () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const archivedBtn = screen.getByText('archived', { selector: '.filter-btn' });
    await userEvent.click(archivedBtn);
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
    const rows = document.querySelectorAll('.target-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Old feature');
  });
});

describe('Targets archived divider collapsible (WI-scr-006)', () => {
  it('divider label starts with ▾ (caret open) when archived section is open', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toMatch(/^▾/);
  });

  it('clicking divider hides archived rows', async () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const divider = document.querySelector('.artifact-list-divider');
    expect(divider).not.toBeNull();
    await userEvent.click(divider!);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(0);
  });

  it('clicking divider twice shows archived rows again', async () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const divider = document.querySelector('.artifact-list-divider');
    expect(divider).not.toBeNull();
    await userEvent.click(divider!);
    await userEvent.click(divider!);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(1);
  });

  it('divider label shows ▸ when archived section is collapsed', async () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const divider = document.querySelector('.artifact-list-divider');
    await userEvent.click(divider!);
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label!.textContent).toMatch(/^▸/);
  });

  it('archived count is rendered in a .artifact-list-divider__count span', () => {
    render(<Targets targets={[TARGET, ARCHIVED_TARGET]} />);
    const countSpan = document.querySelector('.artifact-list-divider__count');
    expect(countSpan).not.toBeNull();
    expect(countSpan!.textContent).toBe('1');
  });
});
