import './StatusPill.css';
import type { ArtifactStatus } from '../types';

interface StatusPillProps {
  status: ArtifactStatus;
  label?: string;
}

const STATUS_MAP: Record<string, [string, string]> = {
  'awaiting-user':  ['open',     'awaiting user'],
  'awaiting-agent': ['progress', 'awaiting agent'],
  'ready':          ['phosphor', 'ready'],
  'draft':          ['draft',    'draft'],
  'accepted':       ['done',     'accepted'],
  'open':           ['open',     'open'],
  'pending':        ['draft',    'pending'],
  'in-progress':    ['progress', 'in progress'],
  'blocked':        ['blocked',  'blocked'],
  'done':           ['done',     'done'],
  'closed':         ['done',     'closed'],
  'deferred':       ['stale',    'deferred'],
  'abandoned':      ['stale',    'abandoned'],
  'active':         ['phosphor', 'active'],
  'stale':          ['stale',    'stale'],
  'archived':       ['done',     'archived'],
};

export function StatusPill({ status, label }: StatusPillProps) {
  const [cls, txt] = STATUS_MAP[status] ?? ['draft', status];
  return (
    <span className={`status-pill status-pill--${cls}`}>
      <span className="status-pill__led" />
      {label ?? txt}
    </span>
  );
}
