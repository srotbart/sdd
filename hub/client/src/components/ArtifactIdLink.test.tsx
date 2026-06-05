import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtifactIdLink } from './ArtifactIdLink';
import { PeekerProvider, usePeeker } from './PeekerContext';
import type { ArtifactKind } from './PeekerContext';

// -----------------------------------------------------------------------
// Helper: wrap in PeekerProvider and capture context state
// -----------------------------------------------------------------------

interface CaptureProps {
  onPeekerChange: (id: string | null, kind: ArtifactKind | null) => void;
}

function PeekerCapture({ onPeekerChange }: CaptureProps) {
  const { peeker } = usePeeker();
  // Report state after every render
  if (peeker) {
    onPeekerChange(peeker.id, peeker.kind);
  } else {
    onPeekerChange(null, null);
  }
  return null;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <PeekerProvider>{children}</PeekerProvider>;
}

// -----------------------------------------------------------------------
// SPEC-uic-012: ArtifactIdLink — renders as a link element
// -----------------------------------------------------------------------

describe('SPEC-uic-012 ArtifactIdLink — renders as a button element (not plain span)', () => {
  it('renders a button element for a TGT- prefixed id', () => {
    render(
      <Wrapper>
        <ArtifactIdLink id="TGT-001" />
      </Wrapper>,
    );
    const btn = document.querySelector('.artifact-id-link');
    expect(btn).not.toBeNull();
    expect(btn!.tagName).toBe('BUTTON');
  });

  it('renders button with the id as text content', () => {
    render(
      <Wrapper>
        <ArtifactIdLink id="GAP-uic-001" />
      </Wrapper>,
    );
    const btn = document.querySelector('.artifact-id-link');
    expect(btn?.textContent).toBe('GAP-uic-001');
  });

  it('renders a plain span (not a button) for an unknown prefix', () => {
    render(
      <Wrapper>
        <ArtifactIdLink id="UNKNOWN-001" />
      </Wrapper>,
    );
    // Should NOT render a button with the link class
    expect(document.querySelector('.artifact-id-link')).toBeNull();
    expect(document.querySelector('span')?.textContent).toBe('UNKNOWN-001');
  });
});

describe('SPEC-uic-012 ArtifactIdLink — clicking opens the ArtifactPeeker via context', () => {
  it('clicking the link calls openPeeker with correct id and kind for TGT', async () => {
    let capturedId: string | null = null;
    let capturedKind: ArtifactKind | null = null;

    render(
      <PeekerProvider>
        <ArtifactIdLink id="TGT-001" />
        <PeekerCapture
          onPeekerChange={(id, kind) => {
            capturedId = id;
            capturedKind = kind;
          }}
        />
      </PeekerProvider>,
    );

    const btn = document.querySelector('.artifact-id-link') as HTMLElement;
    await userEvent.click(btn);

    expect(capturedId).toBe('TGT-001');
    expect(capturedKind).toBe('TGT');
  });

  it('clicking the link calls openPeeker with correct id and kind for GAP', async () => {
    let capturedId: string | null = null;
    let capturedKind: ArtifactKind | null = null;

    render(
      <PeekerProvider>
        <ArtifactIdLink id="GAP-uic-005" />
        <PeekerCapture
          onPeekerChange={(id, kind) => {
            capturedId = id;
            capturedKind = kind;
          }}
        />
      </PeekerProvider>,
    );

    const btn = document.querySelector('.artifact-id-link') as HTMLElement;
    await userEvent.click(btn);

    expect(capturedId).toBe('GAP-uic-005');
    expect(capturedKind).toBe('GAP');
  });
});

describe('SPEC-uic-012 ArtifactIdLink — works for all artifact-type ID prefixes', () => {
  const cases: Array<[string, ArtifactKind]> = [
    ['TGT-001', 'TGT'],
    ['SPEC-uic-001', 'SPEC'],
    ['GAP-uic-003', 'GAP'],
    ['WI-uic-007', 'WI'],
    ['ISS-002', 'ISS'],
    ['IMP-004', 'IMP'],
  ];

  for (const [id, expectedKind] of cases) {
    it(`renders a button and opens peeker for ${id} (kind: ${expectedKind})`, async () => {
      let capturedKind: ArtifactKind | null = null;

      render(
        <PeekerProvider>
          <ArtifactIdLink id={id} />
          <PeekerCapture
            onPeekerChange={(_id, kind) => {
              capturedKind = kind;
            }}
          />
        </PeekerProvider>,
      );

      const btn = document.querySelector('.artifact-id-link') as HTMLElement;
      expect(btn).not.toBeNull();
      await userEvent.click(btn);
      expect(capturedKind).toBe(expectedKind);
    });
  }
});

describe('SPEC-uic-012 ArtifactIdLink — stopPropagation prevents parent click firing', () => {
  it('click on ArtifactIdLink does not bubble to parent element', async () => {
    const parentClick = vi.fn();

    render(
      <Wrapper>
        <div onClick={parentClick}>
          <ArtifactIdLink id="TGT-001" />
        </div>
      </Wrapper>,
    );

    const btn = document.querySelector('.artifact-id-link') as HTMLElement;
    await userEvent.click(btn);
    expect(parentClick).not.toHaveBeenCalled();
  });
});

describe('SPEC-uic-012 ArtifactIdLink — className prop is forwarded', () => {
  it('passes additional className to the button element', () => {
    render(
      <Wrapper>
        <ArtifactIdLink id="TGT-001" className="custom-class" />
      </Wrapper>,
    );
    const btn = document.querySelector('.artifact-id-link');
    expect(btn?.classList.contains('custom-class')).toBe(true);
  });
});
