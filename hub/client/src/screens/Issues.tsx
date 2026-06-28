import './Issues.css';
import { ReviewArtifactScreen } from '../components/ReviewArtifactScreen';
import type { Issue } from '../types';

interface IssuesProps {
  issues: Issue[];
  initialIssueId?: string;
}

export function Issues({ issues, initialIssueId }: IssuesProps) {
  return (
    <ReviewArtifactScreen
      items={issues}
      initialItemId={initialIssueId}
      plural="issues"
      singular="issue"
      archivedValues={['resolved', 'wont-fix']}
      emptyListText="no issues found"
      emptyDetailText="select an issue"
      mapPillStatus={(s) => s === 'open' ? 'open' : s === 'in-progress' ? 'in-progress' : 'closed'}
      renderBadge={(iss) => (
        <span className={`issues-row__severity issues-row__severity--${iss.severity}`}>
          {iss.severity}
        </span>
      )}
      renderDetailExtraMeta={(iss) => (
        <div><span className="issue-detail__meta-key">severity</span>{iss.severity}</div>
      )}
    />
  );
}
