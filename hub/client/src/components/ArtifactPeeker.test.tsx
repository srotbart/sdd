import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactPeeker } from './ArtifactPeeker';
import { PeekerProvider, usePeeker } from './PeekerContext';
import type { Target, Spec, Gap, WorkItem, Issue, Improvement } from '../types';

// -----------------------------------------------------------------------
// Test fixtures
// -----------------------------------------------------------------------

const MOCK_TARGET: Target = {
  id: 'TGT-001',
  status: 'awaiting-user',
  domain: 'architecture',
  domainAbbrev: 'arch',
  title: 'Add workspace attachment API',
  created: '2026-05-17T00:00:00Z',
  statement: 'The hub server exposes a POST /workspaces endpoint.',
  dialog: [],
};

const MOCK_SPEC: Spec = {
  id: 'SPEC-uic',
  domain: 'ui-components',
  abbrev: 'uic',
  version: '12345678',
  items: [
    {
      id: 'SPEC-uic-001',
      title: 'StatusPill renders all statuses',
      status: 'active',
      body: 'All status values render a colored pill.',
      refs: [],
      testStatus: { status: 'passing' },
    },
  ],
};

const MOCK_GAP: Gap = {
  id: 'GAP-uic-001',
  specItem: 'SPEC-uic-001',
  domain: 'ui-components',
  abbrev: 'uic',
  status: 'open',
  discovered: '2026-06-01T00:00:00Z',
  auditVersion: 'abcdef12',
  title: 'StatusPill missing deferred style',
  location: 'hub/client/src/components/StatusPill.tsx:10',
  reasoning: 'The STATUS_MAP does not include deferred.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: null,
};

const MOCK_WORK_ITEM: WorkItem = {
  id: 'WI-uic-001',
  gapId: 'GAP-uic-001',
  title: 'Add deferred style to StatusPill',
  status: 'done',
  domain: 'ui-components',
  agent: null,
  created: '2026-06-01T01:00:00Z',
  scope: 'hub/client/src/components/StatusPill.tsx',
  acceptance: ['StatusPill renders deferred with stale style'],
};

const MOCK_ISSUE: Issue = {
  id: 'ISS-001',
  domain: 'ui-screens',
  severity: 'high',
  status: 'open',
  title: 'Missing error boundary',
  body: 'The Gaps screen crashes on malformed data.',
  discovered: '2026-06-01T00:00:00Z',
};

const MOCK_IMPROVEMENT: Improvement = {
  id: 'IMP-001',
  domain: 'ui-screens',
  effort: 'low',
  impact: 'medium',
  status: 'open',
  title: 'Add keyboard shortcuts to sidenav',
  body: 'Allow tab navigation without mouse.',
  discovered: '2026-06-01T00:00:00Z',
};

// -----------------------------------------------------------------------
// Helper: renders ArtifactPeeker inside PeekerProvider and opens it
// -----------------------------------------------------------------------

function OpenPeekerButton({ id, kind }: { id: string; kind: 'TGT' | 'SPEC' | 'GAP' | 'WI' | 'ISS' | 'IMP' }) {
  const { openPeeker } = usePeeker();
  return (
    <button data-testid="open-btn" onClick={() => openPeeker(id, kind)}>
      open
    </button>
  );
}

interface WrapperProps {
  id: string;
  kind: 'TGT' | 'SPEC' | 'GAP' | 'WI' | 'ISS' | 'IMP';
  onNav?: (tab: string, id?: string) => void;
}

function Wrapper({ id, kind, onNav = vi.fn() }: WrapperProps) {
  return (
    <PeekerProvider>
      <OpenPeekerButton id={id} kind={kind} />
      <ArtifactPeeker
        targets={[MOCK_TARGET]}
        specs={[MOCK_SPEC]}
        gaps={[MOCK_GAP]}
        workItems={[MOCK_WORK_ITEM]}
        issues={[MOCK_ISSUE]}
        improvements={[MOCK_IMPROVEMENT]}
        onNav={onNav}
      />
    </PeekerProvider>
  );
}

// -----------------------------------------------------------------------
// SPEC-uic-011: ArtifactPeeker — open / close / Esc / click-outside
// -----------------------------------------------------------------------

describe('SPEC-uic-011 ArtifactPeeker — open and show content', () => {
  it('peeker is not visible before opening', () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    expect(document.querySelector('.peeker-overlay')).toBeNull();
  });

  it('peeker becomes visible after openPeeker is called', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
  });

  it('peeker panel shows the artifact id in the header', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const idEl = document.querySelector('.peeker-panel__id');
    expect(idEl?.textContent).toBe('TGT-001');
  });
});

describe('SPEC-uic-011 ArtifactPeeker — TGT type renders target content', () => {
  it('renders target title when kind is TGT', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.body.textContent).toContain('Add workspace attachment API');
  });

  it('renders target statement when kind is TGT', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.body.textContent).toContain('POST /workspaces endpoint');
  });
});

describe('SPEC-uic-011 ArtifactPeeker — close button dismisses peeker', () => {
  it('clicking the close button removes the peeker overlay', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();

    const closeBtn = document.querySelector('.peeker-panel__close') as HTMLElement;
    expect(closeBtn).not.toBeNull();
    await userEvent.click(closeBtn);
    expect(document.querySelector('.peeker-overlay')).toBeNull();
  });
});

describe('SPEC-uic-011 ArtifactPeeker — Esc key dismisses peeker', () => {
  it('pressing Esc closes the peeker', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();

    await userEvent.keyboard('{Escape}');
    expect(document.querySelector('.peeker-overlay')).toBeNull();
  });
});

describe('SPEC-uic-011 ArtifactPeeker — click-outside (overlay backdrop) dismisses peeker', () => {
  it('clicking the overlay backdrop closes the peeker', async () => {
    render(<Wrapper id="TGT-001" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const overlay = document.querySelector('.peeker-overlay') as HTMLElement;
    expect(overlay).not.toBeNull();

    // Click directly on the overlay (not the panel inside it)
    await userEvent.click(overlay);
    expect(document.querySelector('.peeker-overlay')).toBeNull();
  });
});

describe('SPEC-uic-011 ArtifactPeeker — go to artifact control navigates', () => {
  it('clicking go-to-artifact button calls onNav with correct tab and id for TGT', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="TGT-001" kind="TGT" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));

    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    expect(gotoBtn).not.toBeNull();
    await userEvent.click(gotoBtn);

    expect(onNav).toHaveBeenCalledWith('targets', 'TGT-001');
  });

  it('clicking go-to-artifact for GAP calls onNav with gaps tab', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="GAP-uic-001" kind="GAP" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));

    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    await userEvent.click(gotoBtn);
    expect(onNav).toHaveBeenCalledWith('gaps', 'GAP-uic-001');
  });

  it('clicking go-to-artifact also closes the peeker', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="TGT-001" kind="TGT" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    await userEvent.click(gotoBtn);
    expect(document.querySelector('.peeker-overlay')).toBeNull();
  });
});

describe('SPEC-uic-011 ArtifactPeeker — per-type rendering without crash', () => {
  it('renders SPEC type without crashing', async () => {
    render(<Wrapper id="SPEC-uic-001" kind="SPEC" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
    expect(document.body.textContent).toContain('SPEC-uic-001');
  });

  it('renders GAP type without crashing and shows gap title', async () => {
    render(<Wrapper id="GAP-uic-001" kind="GAP" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
    expect(document.body.textContent).toContain('StatusPill missing deferred style');
  });

  it('renders WI type without crashing and shows work item title', async () => {
    render(<Wrapper id="WI-uic-001" kind="WI" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
    expect(document.body.textContent).toContain('Add deferred style to StatusPill');
  });

  it('renders ISS type without crashing and shows issue title', async () => {
    render(<Wrapper id="ISS-001" kind="ISS" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
    expect(document.body.textContent).toContain('Missing error boundary');
  });

  it('renders IMP type without crashing and shows improvement title', async () => {
    render(<Wrapper id="IMP-001" kind="IMP" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.querySelector('.peeker-overlay')).not.toBeNull();
    expect(document.body.textContent).toContain('Add keyboard shortcuts to sidenav');
  });

  it('renders not-found state when id is unknown', async () => {
    render(<Wrapper id="TGT-UNKNOWN" kind="TGT" />);
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.body.textContent).toContain('not found in loaded data');
  });

  it('resolves a SPEC item case-insensitively (server uppercases the abbrev, markdown refs use lowercase)', async () => {
    // Production: the server's spec parser uppercases the abbrev (SPEC-UIC-014), but artifact
    // references written in markdown use the canonical lowercase abbrev (SPEC-uic-014). The peeker
    // lookup must match regardless of case, or every spec reference shows "not found".
    const upperSpec: Spec = {
      id: 'SPEC-uic',
      domain: 'ui-components',
      abbrev: 'uic',
      version: '1',
      items: [
        { id: 'SPEC-UIC-014', title: 'Artifact IDs auto-link', status: 'active', body: 'b', refs: [], testStatus: { status: 'passing' } },
      ],
    };
    render(
      <PeekerProvider>
        <OpenPeekerButton id="SPEC-uic-014" kind="SPEC" />
        <ArtifactPeeker targets={[]} specs={[upperSpec]} gaps={[]} workItems={[]} issues={[]} improvements={[]} onNav={vi.fn()} />
      </PeekerProvider>
    );
    await userEvent.click(screen.getByTestId('open-btn'));
    expect(document.body.textContent).toContain('Artifact IDs auto-link');
    expect(document.body.textContent).not.toContain('not found in loaded data');
  });

  it('go-to-artifact for WI calls onNav with work items tab', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="WI-uic-001" kind="WI" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    await userEvent.click(gotoBtn);
    expect(onNav).toHaveBeenCalledWith('work items', 'WI-uic-001');
  });

  it('go-to-artifact for ISS calls onNav with issues tab', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="ISS-001" kind="ISS" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    await userEvent.click(gotoBtn);
    expect(onNav).toHaveBeenCalledWith('issues', 'ISS-001');
  });

  it('go-to-artifact for IMP calls onNav with improvements tab', async () => {
    const onNav = vi.fn();
    render(<Wrapper id="IMP-001" kind="IMP" onNav={onNav} />);
    await userEvent.click(screen.getByTestId('open-btn'));
    const gotoBtn = document.querySelector('.peeker-panel__goto') as HTMLElement;
    await userEvent.click(gotoBtn);
    expect(onNav).toHaveBeenCalledWith('improvements', 'IMP-001');
  });
});

describe('SPEC-uic-011 ArtifactPeeker — single app-level instance via context', () => {
  it('PeekerContext provides openPeeker and closePeeker', () => {
    let contextValue: ReturnType<typeof usePeeker> | null = null;
    function Capturer() {
      contextValue = usePeeker();
      return null;
    }
    render(
      <PeekerProvider>
        <Capturer />
      </PeekerProvider>,
    );
    expect(contextValue).not.toBeNull();
    expect(typeof (contextValue as NonNullable<typeof contextValue>).openPeeker).toBe('function');
    expect(typeof (contextValue as NonNullable<typeof contextValue>).closePeeker).toBe('function');
    expect((contextValue as NonNullable<typeof contextValue>).peeker).toBeNull();
  });
});
