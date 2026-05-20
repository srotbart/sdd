import { useState, type ReactNode } from 'react';
import './ArtifactList.css';

interface ArtifactListProps<T> {
  items: T[];
  archivedItems: T[];
  renderRow: (item: T, archived: boolean) => ReactNode;
  getKey: (item: T) => string;
}

export function ArtifactList<T>({
  items,
  archivedItems,
  renderRow,
  getKey,
}: ArtifactListProps<T>) {
  const [archivedOpen, setArchivedOpen] = useState(true);

  return (
    <>
      {items.map((item) => renderRow(item, false))}
      {archivedItems.length > 0 && (
        <>
          <div
            className="artifact-list-divider"
            onClick={() => setArchivedOpen((o) => !o)}
          >
            <hr className="artifact-list-divider__rule" />
            <span className="artifact-list-divider__label">
              {archivedOpen ? '▾' : '▸'} · ARCHIVED{' '}
              <span className="artifact-list-divider__count">{archivedItems.length}</span>
              {' '}·
            </span>
            <hr className="artifact-list-divider__rule" />
          </div>
          {archivedOpen &&
            archivedItems.map((item) => (
              <div key={getKey(item)} className="artifact-list-archived-row">
                {renderRow(item, true)}
              </div>
            ))}
        </>
      )}
    </>
  );
}
