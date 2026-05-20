import { useState } from 'react';
import './Specs.css';
import { StatusPill } from '../components/StatusPill';
import type { Spec, Gap, WorkItem } from '../types';

interface SpecsProps {
  specs: Spec[];
  gaps: Gap[];
  workItems: WorkItem[];
  initialSpecId?: string;
  onNav: (tab: string, id?: string) => void;
}

export function Specs({ specs, gaps, workItems, initialSpecId, onNav }: SpecsProps) {
  const [activeSpecId, setActiveSpecId] = useState<string>(
    initialSpecId ?? specs[0]?.id ?? ''
  );

  const activeSpec = specs.find((s) => s.id === activeSpecId);

  const totalItems = specs.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="specs-root">
      <div className="specs-title-bar">
        <span className="specs-title-bullet">▪</span>
        <span className="specs-title-word">specs</span>
        <span className="specs-title-sub">
          — durable source of truth — {specs.length} domain{specs.length !== 1 ? 's' : ''}, {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="specs-title-rule" />

    <div className="specs-layout">
      <div className="specs-sidebar">
        <div className="specs-sidebar__label">domains</div>
        {specs.map((spec) => (
          <div
            key={spec.id}
            className={`specs-domain-row${activeSpecId === spec.id ? ' specs-domain-row--active' : ''}`}
            onClick={() => setActiveSpecId(spec.id)}
          >
            <div className="specs-domain-row__inner">
              <div className="specs-domain-row__name">{spec.domain}</div>
              <div className="specs-domain-row__meta">
                {spec.id} · &lt;{spec.version}&gt;
              </div>
            </div>
            <span className="specs-count">{spec.items.length}</span>
          </div>
        ))}
      </div>

      <div className="specs-content">
        {activeSpec && (
          <>
            <div className="specs-file-header">
              <div className="specs-eyebrow">spec file</div>
              <div className="specs-file-header__ids">
                <h2 className="specs-file-header__title">{activeSpec.id}</h2>
                <span className="specs-id-chip">domain: {activeSpec.domain}</span>
                <span className="specs-id-chip">abbrev: {activeSpec.abbrev}</span>
                <span className="specs-id-chip">version: &lt;{activeSpec.version}&gt;</span>
              </div>
              <div className="specs-file-header__count">
                {activeSpec.items.length} active spec items · never archived
              </div>
            </div>

            <div className="specs-items">
              {activeSpec.items.map((item) => {
                const itemGaps = gaps.filter((g) => g.specItem === item.id);
                const openGaps = itemGaps.filter((g) => g.status === 'open');
                const itemWIs = workItems.filter((w) =>
                  itemGaps.some((g) => g.id === w.gapId)
                );

                return (
                  <div key={item.id} id={item.id} className="specs-item">
                    <div className="specs-item__id-line">
                      <span className="specs-item__id">{item.id}</span>
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
                    <p className="specs-item__body">{item.body}</p>

                    {(itemGaps.length > 0 || itemWIs.length > 0) && (
                      <div className="specs-item__refs">
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
          </>
        )}
      </div>
    </div>
    </div>
  );
}
