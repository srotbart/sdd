import './Improvements.css';
import { ReviewArtifactScreen } from '../components/ReviewArtifactScreen';
import type { Improvement } from '../types';

interface ImprovementsProps {
  improvements: Improvement[];
  initialImprovementId?: string;
}

export function Improvements({ improvements, initialImprovementId }: ImprovementsProps) {
  return (
    <ReviewArtifactScreen
      items={improvements}
      initialItemId={initialImprovementId}
      plural="improvements"
      singular="improvement"
      archivedValues={['done', 'wont-do']}
      emptyListText="no improvements found"
      emptyDetailText="select an improvement"
      mapPillStatus={(s) => s === 'open' ? 'open' : s === 'in-progress' ? 'in-progress' : 'done'}
      renderBadge={(imp) => (
        <span className="improvements-row__effort-impact">
          effort:{imp.effort} / impact:{imp.impact}
        </span>
      )}
      renderDetailExtraMeta={(imp) => (
        <>
          <div><span className="improvement-detail__meta-key">effort</span>{imp.effort}</div>
          <div><span className="improvement-detail__meta-key">impact</span>{imp.impact}</div>
        </>
      )}
    />
  );
}
