import ReactMarkdown from 'react-markdown';
import { StatusPill } from '../components/StatusPill';
import { TestStatusDot } from '../components/TestStatusDot';
import { ArtifactIdLink } from '../components/ArtifactIdLink';
import type { SpecItem, Gap, WorkItem, PerTestResult } from '../types';

interface SpecItemDetailProps {
  item: SpecItem;
  gaps: Gap[];
  workItems: WorkItem[];
  onBack: () => void;
  onNav: (tab: string, id?: string) => void;
}

export function SpecItemDetail({ item, gaps, workItems, onBack, onNav }: SpecItemDetailProps) {
  const itemGaps = gaps.filter((g) => g.specItem === item.id);
  const openGaps = itemGaps.filter((g) => g.status === 'open');
  const itemWIs = workItems.filter((w) =>
    itemGaps.some((g) => g.id === w.gapId)
  );

  return (
    <div className="spec-item-detail">
      <button className="spec-item-detail__back" onClick={onBack}>
        ← items
      </button>

      <div className="specs-item__id-line">
        <span className="specs-item__id">{item.id}</span>
        <TestStatusDot status={item.testStatus.status} lastRun={item.testStatus.lastRun} skipReason={item.testStatus.skipReason} />
        <StatusPill status="active" />
        {openGaps.length > 0 && (
          <span className="specs-item__gap-pill">
            <span className="specs-item__gap-led" />
            {openGaps.length} open gap{openGaps.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <h3 className="specs-item__title">{item.title}</h3>

      {item.testStatus.status === 'skipped' && item.testStatus.skipReason && (
        <div className="spec-item-detail__skip-reason">
          <span className="spec-item-detail__skip-label">skip reason:</span>{' '}
          {item.testStatus.skipReason}
        </div>
      )}

      <div className="spec-item-detail__tests">
        {(item.testStatus.tests ?? []).length === 0 ? (
          <div className="spec-item-detail__tests-empty">no test results</div>
        ) : (
          (item.testStatus.tests as PerTestResult[]).map((t) => (
            <div key={t.fullName} className="spec-item-detail__test-row">
              <TestStatusDot status={t.status} lastRun={t.lastRun} />
              <span className="spec-item-detail__test-name">{t.fullName}</span>
            </div>
          ))
        )}
      </div>

      <div className="spec-item-detail__body">
        <ReactMarkdown>{item.body}</ReactMarkdown>
      </div>

      {(itemGaps.length > 0 || itemWIs.length > 0) && (
        <div className="specs-item__refs">
          {itemGaps.map((g) => (
            <span
              key={g.id}
              className="specs-ref-pill"
            >
              <span
                className="specs-ref-pill__led"
                style={{
                  background:
                    g.status === 'open'
                      ? 'var(--st-open)'
                      : 'var(--st-done)',
                }}
              />
              <ArtifactIdLink id={g.id} />
            </span>
          ))}
          {itemWIs.map((w) => (
            <span
              key={w.id}
              className="specs-ref-pill"
            >
              <span
                className="specs-ref-pill__led"
                style={{ background: 'var(--st-progress)' }}
              />
              <ArtifactIdLink id={w.id} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
