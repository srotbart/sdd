import { useState } from 'react';
import './Improvements.css';
import { StatusPill } from '../components/StatusPill';
import { ArtifactList } from '../components/ArtifactList';
import type { Improvement } from '../types';

interface ImprovementsProps {
  improvements: Improvement[];
  initialImprovementId?: string;
}

export function Improvements({ improvements, initialImprovementId }: ImprovementsProps) {
  const [activeId, setActiveId] = useState<string>(
    initialImprovementId ?? improvements[0]?.id ?? ''
  );

  const active = improvements.find((imp) => imp.id === activeId);

  return (
    <div className="improvements-layout">
      <div className="improvements-list">
        <div className="improvements-list__scroll">
          {improvements.length === 0 ? (
            <div className="improvements-empty">no improvements found</div>
          ) : (
            <ArtifactList
              items={improvements}
              filterKey="domain"
              archivedKey="status"
              archivedValues={['done', 'wont-do']}
              getKey={(imp) => imp.id}
              renderRow={(imp) => (
                <div
                  key={imp.id}
                  className={`improvements-row${activeId === imp.id ? ' improvements-row--active' : ''}`}
                  onClick={() => setActiveId(imp.id)}
                >
                  <div className="improvements-row__top">
                    <span className="improvements-row__id">{imp.id}</span>
                    <span className="improvements-row__effort-impact">
                      effort:{imp.effort} / impact:{imp.impact}
                    </span>
                    <StatusPill status={imp.status === 'open' ? 'open' : imp.status === 'in-progress' ? 'in-progress' : 'done'} />
                  </div>
                  <div className="improvements-row__title">{imp.title}</div>
                  <div className="improvements-row__meta">
                    {imp.domain} · {imp.discovered.split('T')[0]}
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {active ? (
        <ImprovementDetail improvement={active} />
      ) : (
        <div className="improvement-detail__empty">select an improvement</div>
      )}
    </div>
  );
}

interface ImprovementDetailProps {
  improvement: Improvement;
}

function ImprovementDetail({ improvement: imp }: ImprovementDetailProps) {
  const pillStatus = imp.status === 'open' ? 'open'
    : imp.status === 'in-progress' ? 'in-progress'
    : 'done';

  return (
    <div className="improvement-detail">
      <div className="improvement-detail__header">
        <div className="improvement-detail__header-top">
          <span className="improvement-detail__id">{imp.id}</span>
          <span className="improvements-row__effort-impact">
            effort:{imp.effort} / impact:{imp.impact}
          </span>
          <StatusPill status={pillStatus} />
        </div>
        <h2 className="improvement-detail__title">{imp.title}</h2>
      </div>
      <div className="improvement-detail__body">
        <div className="improvement-eyebrow">description</div>
        <div className="improvement-detail__content">{imp.body}</div>
        <div className="improvement-detail__meta">
          <div><span className="improvement-detail__meta-key">domain</span>{imp.domain}</div>
          <div><span className="improvement-detail__meta-key">effort</span>{imp.effort}</div>
          <div><span className="improvement-detail__meta-key">impact</span>{imp.impact}</div>
          <div><span className="improvement-detail__meta-key">status</span>{imp.status}</div>
          <div><span className="improvement-detail__meta-key">discovered</span>{imp.discovered.split('T')[0]}</div>
        </div>
      </div>
    </div>
  );
}
