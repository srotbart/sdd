import { useState, type ReactNode } from 'react';
import './ArtifactList.css';

interface ArtifactListProps<T> {
  items: T[];
  archivedItems?: T[];
  renderRow: (item: T, archived: boolean) => ReactNode;
  getKey: (item: T) => string;
  filterKey?: keyof T;
  archivedValues?: string[];
  archivedKey?: keyof T;
  filterLabels?: Record<string, string>;
}

export function ArtifactList<T>({
  items,
  archivedItems,
  renderRow,
  getKey,
  filterKey,
  archivedValues,
  archivedKey,
  filterLabels,
}: ArtifactListProps<T>) {
  const [archivedOpen, setArchivedOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (filterKey !== undefined) {
    const allValues = Array.from(new Set(items.map((item) => String(item[filterKey])))).filter((v) => v !== '');
    const tabs = ['all', ...allValues];

    const archSet = new Set(archivedValues ?? []);
    const splitKey = archivedKey ?? filterKey;

    const tabCounts: Record<string, number> = { all: items.length };
    for (const val of allValues) {
      tabCounts[val] = items.filter((item) => String(item[filterKey]) === val).length;
    }

    const filtered = activeFilter === 'all'
      ? items
      : items.filter((item) => String(item[filterKey]) === activeFilter);
    const filterIsArchived = activeFilter !== 'all' && archSet.has(activeFilter);
    const activeItems = filterIsArchived
      ? filtered
      : filtered.filter((item) => !archSet.has(String(item[splitKey])));
    const archivedFiltered = filterIsArchived
      ? []
      : filtered.filter((item) => archSet.has(String(item[splitKey])));

    return (
      <>
        <div className="artifact-list-filter-bar">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`artifact-list-filter-btn${activeFilter === tab ? ' artifact-list-filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {filterLabels?.[tab] ?? tab}
              <span className="artifact-list-filter-count">{tabCounts[tab] ?? 0}</span>
            </button>
          ))}
        </div>
        {activeItems.map((item) => (
          <div key={getKey(item)} className="artifact-list-active-row">
            {renderRow(item, false)}
          </div>
        ))}
        {archivedFiltered.length > 0 && (
          <>
            <div
              className="artifact-list-divider"
              onClick={() => setArchivedOpen((o) => !o)}
            >
              <hr className="artifact-list-divider__rule" />
              <span className="artifact-list-divider__label">
                {archivedOpen ? '▾' : '▸'} · ARCHIVED{' '}
                <span className="artifact-list-divider__count">{archivedFiltered.length}</span>
                {' '}·
              </span>
              <hr className="artifact-list-divider__rule" />
            </div>
            {archivedOpen &&
              archivedFiltered.map((item) => (
                <div key={getKey(item)} className="artifact-list-archived-row">
                  {renderRow(item, true)}
                </div>
              ))}
          </>
        )}
      </>
    );
  }

  const resolvedArchived = archivedItems ?? [];

  return (
    <>
      {items.map((item) => (
        <div key={getKey(item)} className="artifact-list-active-row">
          {renderRow(item, false)}
        </div>
      ))}
      {resolvedArchived.length > 0 && (
        <>
          <div
            className="artifact-list-divider"
            onClick={() => setArchivedOpen((o) => !o)}
          >
            <hr className="artifact-list-divider__rule" />
            <span className="artifact-list-divider__label">
              {archivedOpen ? '▾' : '▸'} · ARCHIVED{' '}
              <span className="artifact-list-divider__count">{resolvedArchived.length}</span>
              {' '}·
            </span>
            <hr className="artifact-list-divider__rule" />
          </div>
          {archivedOpen &&
            resolvedArchived.map((item) => (
              <div key={getKey(item)} className="artifact-list-archived-row">
                {renderRow(item, true)}
              </div>
            ))}
        </>
      )}
    </>
  );
}
