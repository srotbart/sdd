import './TestStatusDot.css';

export type TestStatusKind = 'passing' | 'failing' | 'missing' | 'not-run';

interface TestStatusDotProps {
  status: TestStatusKind;
  lastRun?: string;
}

const STATUS_COLORS: Record<TestStatusKind, string> = {
  passing: '#4caf50',
  failing: '#f44336',
  missing: '#ff9800',
  'not-run': '#9e9e9e',
};

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function TestStatusDot({ status, lastRun }: TestStatusDotProps) {
  const color = STATUS_COLORS[status];

  return (
    <span className="test-status-dot" title={status}>
      <span
        className="test-status-dot__circle"
        style={{ background: color }}
        aria-label={status}
      />
      {status !== 'not-run' && (
        <span className="test-status-dot__time">
          {lastRun ? fmtTimestamp(lastRun) : '—'}
        </span>
      )}
    </span>
  );
}
