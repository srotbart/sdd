import './ArtifactIdLink.css';
import { usePeeker } from './PeekerContext';
import type { ArtifactKind } from './PeekerContext';

// Maps ID prefix to artifact kind used by PeekerContext
const PREFIX_TO_KIND: Record<string, ArtifactKind> = {
  TGT: 'TGT',
  SPEC: 'SPEC',
  GAP: 'GAP',
  WI: 'WI',
  ISS: 'ISS',
  IMP: 'IMP',
};

function prefixOf(id: string): string {
  // IDs are like TGT-001, SPEC-uic-001, GAP-uic-001, WI-uic-001, ISS-001, IMP-001
  return id.split('-')[0].toUpperCase();
}

interface ArtifactIdLinkProps {
  id: string;
  className?: string;
}

/**
 * Renders an artifact ID as a clickable link that opens it in the ArtifactPeeker.
 * Use this in rows, meta lines, and reference pills — NOT in titles/headings.
 */
export function ArtifactIdLink({ id, className }: ArtifactIdLinkProps) {
  const { openPeeker } = usePeeker();
  const prefix = prefixOf(id);
  const kind = PREFIX_TO_KIND[prefix];

  if (!kind) {
    // Unknown prefix — render plain text
    return <span className={className}>{id}</span>;
  }

  return (
    <button
      type="button"
      className={`artifact-id-link${className ? ` ${className}` : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        openPeeker(id, kind);
      }}
      title={`Peek ${id}`}
    >
      {id}
    </button>
  );
}
