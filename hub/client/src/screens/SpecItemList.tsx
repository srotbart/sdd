import { Markdown } from '../components/Markdown';
import { StatusPill } from '../components/StatusPill';
import { TestStatusDot } from '../components/TestStatusDot';
import type { SpecItem, Gap, WorkItem } from '../types';

interface SpecItemListProps {
  items: SpecItem[];
  gaps: Gap[];
  workItems: WorkItem[];
  onSelectItem: (id: string) => void;
  onNav: (tab: string, id?: string) => void;
}

export function SpecItemList({ items, gaps, workItems, onSelectItem, onNav }: SpecItemListProps) {
  return (
    <div className="specs-items">
      {items.map((item) => {
        const itemGaps = gaps.filter((g) => g.specItem === item.id);
        const openGaps = itemGaps.filter((g) => g.status === 'open');
        const itemWIs = workItems.filter((w) =>
          itemGaps.some((g) => g.id === w.gapId)
        );

        return (
          <div
            key={item.id}
            id={item.id}
            className="specs-item specs-item--clickable"
            onClick={() => onSelectItem(item.id)}
          >
            <div className="specs-item__id-line">
              <span className="specs-item__id">{item.id}</span>
              <TestStatusDot status={item.testStatus.status} lastRun={item.testStatus.lastRun} />
              <StatusPill status="active" />
              {openGaps.length > 0 && (
                <span className="specs-item__gap-pill">
                  <span className="specs-item__gap-led" />
                  {openGaps.length} open gap{openGaps.length === 1 ? '' : 's'}
                </span>
              )}
              <span className="specs-item__aliases">aliases: none</span>
            </div>
            <h3 className="specs-item__title">{item.title}</h3>
            <div className="specs-item__body">
              <Markdown>{item.body}</Markdown>
            </div>

            {(itemGaps.length > 0 || itemWIs.length > 0) && (
              <div className="specs-item__refs" onClick={(e) => e.stopPropagation()}>
                {itemGaps.map((g) => (
                  <button
                    key={g.id}
                    className="specs-ref-pill"
                    onClick={() => onNav('gaps', g.id)}
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
                    {g.id}
                  </button>
                ))}
                {itemWIs.map((w) => (
                  <button
                    key={w.id}
                    className="specs-ref-pill"
                    onClick={() => onNav('work items', w.id)}
                  >
                    <span
                      className="specs-ref-pill__led"
                      style={{ background: 'var(--st-progress)' }}
                    />
                    {w.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
