import { useEffect, useRef, useCallback } from 'react';
import './ArtifactPeeker.css';
import { usePeeker } from './PeekerContext';
import { StatusPill } from './StatusPill';
import { dayOf } from '../util/date';
import type { Target, Spec, Gap, WorkItem, Issue, Improvement } from '../types';

interface ArtifactPeekerProps {
  targets: Target[];
  specs: Spec[];
  gaps: Gap[];
  workItems: WorkItem[];
  issues: Issue[];
  improvements: Improvement[];
  onNav: (tab: string, id?: string) => void;
}

// Maps artifact kind to the tab name used by onNav
const KIND_TO_TAB: Record<string, string> = {
  TGT: 'targets',
  SPEC: 'specs',
  GAP: 'gaps',
  WI: 'work items',
  ISS: 'issues',
  IMP: 'improvements',
};

export function ArtifactPeeker({
  targets,
  specs,
  gaps,
  workItems,
  issues,
  improvements,
  onNav,
}: ArtifactPeekerProps) {
  const { peeker, closePeeker } = usePeeker();
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && peeker) {
        closePeeker();
      }
    },
    [peeker, closePeeker],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [handleEsc]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) {
        closePeeker();
      }
    },
    [closePeeker],
  );

  if (!peeker) return null;

  const { id, kind } = peeker;
  const tab = KIND_TO_TAB[kind] ?? kind;

  function handleGoTo() {
    closePeeker();
    onNav(tab, id);
  }

  return (
    <div
      className="peeker-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Artifact peeker: ${id}`}
    >
      <div className="peeker-panel">
        <div className="peeker-panel__header">
          <span className="peeker-panel__id">{id}</span>
          <button
            className="peeker-panel__goto"
            onClick={handleGoTo}
            title={`Go to ${id} in ${tab}`}
          >
            go to artifact ↗
          </button>
          <button
            className="peeker-panel__close"
            onClick={closePeeker}
            aria-label="Close peeker"
          >
            ✕
          </button>
        </div>
        <div className="peeker-panel__body">
          <PeekerContent
            id={id}
            kind={kind}
            targets={targets}
            specs={specs}
            gaps={gaps}
            workItems={workItems}
            issues={issues}
            improvements={improvements}
          />
        </div>
      </div>
    </div>
  );
}

interface PeekerContentProps {
  id: string;
  kind: string;
  targets: Target[];
  specs: Spec[];
  gaps: Gap[];
  workItems: WorkItem[];
  issues: Issue[];
  improvements: Improvement[];
}

// Artifact IDs are case-insensitive identifiers, but the server's spec parser uppercases the
// domain abbrev (SPEC-UIC-014) while references in markdown use the canonical lowercase form
// (SPEC-uic-014). Compare case-insensitively so lookups resolve regardless of normalization.
function idEq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function PeekerContent({
  id,
  kind,
  targets,
  specs,
  gaps,
  workItems,
  issues,
  improvements,
}: PeekerContentProps) {
  if (kind === 'TGT') {
    const target = targets.find((t) => idEq(t.id, id));
    if (!target) return <GenericNotFound id={id} />;
    return <TargetPeekView target={target} />;
  }

  if (kind === 'SPEC') {
    const item = specs.flatMap((s) => s.items).find((i) => idEq(i.id, id));
    if (!item) return <GenericNotFound id={id} />;
    return (
      <div className="peeker-spec">
        <div className="peeker-spec__id-line">
          <span className="peeker-spec__id">{item.id}</span>
          <StatusPill status="active" />
        </div>
        <h3 className="peeker-spec__title">{item.title}</h3>
        <div className="peeker-spec__body">{item.body}</div>
      </div>
    );
  }

  if (kind === 'GAP') {
    const gap = gaps.find((g) => idEq(g.id, id));
    if (!gap) return <GenericNotFound id={id} />;
    return <GapPeekView gap={gap} />;
  }

  if (kind === 'WI') {
    const wi = workItems.find((w) => idEq(w.id, id));
    if (!wi) return <GenericNotFound id={id} />;
    return <WorkItemPeekView wi={wi} />;
  }

  if (kind === 'ISS') {
    const issue = issues.find((iss) => idEq(iss.id, id));
    if (!issue) return <GenericNotFound id={id} />;
    return <IssuePeekView issue={issue} />;
  }

  if (kind === 'IMP') {
    const imp = improvements.find((i) => idEq(i.id, id));
    if (!imp) return <GenericNotFound id={id} />;
    return <ImprovementPeekView imp={imp} />;
  }

  return <GenericNotFound id={id} />;
}

function GenericNotFound({ id }: { id: string }) {
  return (
    <div className="peeker-not-found">
      <span className="peeker-not-found__id">{id}</span>
      <span className="peeker-not-found__msg">not found in loaded data</span>
    </div>
  );
}

function TargetPeekView({ target }: { target: Target }) {
  return (
    <div className="peeker-target">
      <div className="peeker-target__meta">
        <StatusPill status={target.status} />
        <span className="peeker-target__domain">{target.domain}</span>
        <span className="peeker-target__created">{dayOf(target.created)}</span>
      </div>
      <h3 className="peeker-target__title">{target.title || '(unnamed draft)'}</h3>
      {target.statement && (
        <div className="peeker-target__statement">{target.statement}</div>
      )}
    </div>
  );
}

function GapPeekView({ gap }: { gap: Gap }) {
  return (
    <div className="peeker-gap">
      <div className="peeker-gap__meta">
        <StatusPill status={gap.status} />
        <span className="peeker-gap__spec">↑ {gap.specItem}</span>
      </div>
      <h3 className="peeker-gap__title">{gap.title}</h3>
      <div className="peeker-gap__eyebrow">location</div>
      <div className="peeker-gap__location">{gap.location}</div>
      <div className="peeker-gap__eyebrow">reasoning</div>
      <div className="peeker-gap__reasoning">{gap.reasoning}</div>
    </div>
  );
}

function WorkItemPeekView({ wi }: { wi: WorkItem }) {
  return (
    <div className="peeker-wi">
      <div className="peeker-wi__meta">
        <StatusPill status={wi.status} />
        <span className="peeker-wi__gap">↑ {wi.gapId}</span>
      </div>
      <h3 className="peeker-wi__title">{wi.title}</h3>
      <div className="peeker-wi__eyebrow">scope</div>
      <div className="peeker-wi__scope">{wi.scope}</div>
      {wi.acceptance.length > 0 && (
        <>
          <div className="peeker-wi__eyebrow">acceptance criteria</div>
          <ul className="peeker-wi__criteria">
            {wi.acceptance.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function IssuePeekView({ issue }: { issue: Issue }) {
  return (
    <div className="peeker-issue">
      <div className="peeker-issue__meta">
        <StatusPill status={issue.status === 'open' ? 'open' : issue.status === 'in-progress' ? 'in-progress' : 'closed'} />
        <span className={`peeker-issue__severity peeker-issue__severity--${issue.severity}`}>
          {issue.severity}
        </span>
        <span className="peeker-issue__domain">{issue.domain}</span>
      </div>
      <h3 className="peeker-issue__title">{issue.title}</h3>
      <div className="peeker-issue__body">{issue.body}</div>
    </div>
  );
}

function ImprovementPeekView({ imp }: { imp: Improvement }) {
  return (
    <div className="peeker-imp">
      <div className="peeker-imp__meta">
        <StatusPill status={imp.status === 'open' ? 'open' : imp.status === 'in-progress' ? 'in-progress' : 'done'} />
        <span className="peeker-imp__effort-impact">effort:{imp.effort} / impact:{imp.impact}</span>
        <span className="peeker-imp__domain">{imp.domain}</span>
      </div>
      <h3 className="peeker-imp__title">{imp.title}</h3>
      <div className="peeker-imp__body">{imp.body}</div>
    </div>
  );
}
