import { useState } from 'react';
import './Issues.css';
import { StatusPill } from '../components/StatusPill';
import { ArtifactList } from '../components/ArtifactList';
import { ArtifactIdLink } from '../components/ArtifactIdLink';
import type { Issue } from '../types';

interface IssuesProps {
  issues: Issue[];
  initialIssueId?: string;
}

export function Issues({ issues, initialIssueId }: IssuesProps) {
  const [activeId, setActiveId] = useState<string>(
    initialIssueId ?? issues[0]?.id ?? ''
  );

  const active = issues.find((iss) => iss.id === activeId);

  return (
    <div className="issues-layout">
      <div className="issues-list">
        <div className="issues-list__scroll">
          {issues.length === 0 ? (
            <div className="issues-empty">no issues found</div>
          ) : (
            <ArtifactList
              items={issues}
              filterKey="domain"
              archivedKey="status"
              archivedValues={['resolved', 'wont-fix']}
              getKey={(iss) => iss.id}
              renderRow={(iss) => (
                <div
                  key={iss.id}
                  className={`issues-row${activeId === iss.id ? ' issues-row--active' : ''}`}
                  onClick={() => setActiveId(iss.id)}
                >
                  <div className="issues-row__top">
                    <ArtifactIdLink id={iss.id} className="issues-row__id" />
                    <span className={`issues-row__severity issues-row__severity--${iss.severity}`}>
                      {iss.severity}
                    </span>
                    <StatusPill status={iss.status === 'open' ? 'open' : iss.status === 'in-progress' ? 'in-progress' : 'closed'} />
                  </div>
                  <div className="issues-row__title">{iss.title}</div>
                  <div className="issues-row__meta">
                    {iss.domain} · {iss.discovered.split('T')[0]}
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {active ? (
        <IssueDetail issue={active} />
      ) : (
        <div className="issue-detail__empty">select an issue</div>
      )}
    </div>
  );
}

interface IssueDetailProps {
  issue: Issue;
}

function IssueDetail({ issue }: IssueDetailProps) {
  const pillStatus = issue.status === 'open' ? 'open'
    : issue.status === 'in-progress' ? 'in-progress'
    : 'closed';

  return (
    <div className="issue-detail">
      <div className="issue-detail__header">
        <div className="issue-detail__header-top">
          <span className="issue-detail__id">{issue.id}</span>
          <span className={`issues-row__severity issues-row__severity--${issue.severity}`}>
            {issue.severity}
          </span>
          <StatusPill status={pillStatus} />
        </div>
        <h2 className="issue-detail__title">{issue.title}</h2>
      </div>
      <div className="issue-detail__body">
        <div className="issue-eyebrow">description</div>
        <div className="issue-detail__content">{issue.body}</div>
        <div className="issue-detail__meta">
          <div><span className="issue-detail__meta-key">domain</span>{issue.domain}</div>
          <div><span className="issue-detail__meta-key">severity</span>{issue.severity}</div>
          <div><span className="issue-detail__meta-key">status</span>{issue.status}</div>
          <div><span className="issue-detail__meta-key">discovered</span>{issue.discovered.split('T')[0]}</div>
        </div>
      </div>
    </div>
  );
}
