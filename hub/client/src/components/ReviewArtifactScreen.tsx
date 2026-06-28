import { useState } from 'react';
import type { ReactNode } from 'react';
import { StatusPill } from './StatusPill';
import { ArtifactList } from './ArtifactList';
import { ArtifactIdLink } from './ArtifactIdLink';
import { dayOf } from '../util/date';
import type { ArtifactStatus } from '../types';

/**
 * Minimal shape required by ReviewArtifactScreen — both Issue and Improvement satisfy this.
 * The caller's CSS classes are generated from `plural`/`singular` prefixes, so the rendered
 * output is identical to the hand-written screen it replaces.
 */
export interface ReviewArtifactItem {
  id: string;
  status: string;
  title: string;
  discovered: string;
  domain: string;
  body: string;
}

export interface ReviewArtifactScreenProps<T extends ReviewArtifactItem> {
  items: T[];
  initialItemId?: string;
  /** BEM class prefix for list elements (e.g. "issues" → ".issues-layout", ".issues-row"). */
  plural: string;
  /** BEM class prefix for detail elements (e.g. "issue" → ".issue-detail__id"). */
  singular: string;
  archivedValues: string[];
  emptyListText: string;
  emptyDetailText: string;
  /** Narrows the raw status string to the ArtifactStatus union accepted by StatusPill. */
  mapPillStatus: (status: string) => ArtifactStatus;
  /** Rendered in both the list row top-bar and the detail header (e.g. severity badge). */
  renderBadge: (item: T) => ReactNode;
  /** Rendered inside the detail meta grid between the domain row and the status row. */
  renderDetailExtraMeta: (item: T) => ReactNode;
}

export function ReviewArtifactScreen<T extends ReviewArtifactItem>({
  items,
  initialItemId,
  plural,
  singular,
  archivedValues,
  emptyListText,
  emptyDetailText,
  mapPillStatus,
  renderBadge,
  renderDetailExtraMeta,
}: ReviewArtifactScreenProps<T>) {
  const [activeId, setActiveId] = useState<string>(
    initialItemId ?? items[0]?.id ?? ''
  );

  const active = items.find((item) => item.id === activeId);

  return (
    <div className={`${plural}-layout`}>
      <div className={`${plural}-list`}>
        <div className={`${plural}-list__scroll`}>
          {items.length === 0 ? (
            <div className={`${plural}-empty`}>{emptyListText}</div>
          ) : (
            <ArtifactList
              items={items}
              filterKey={'domain' as keyof T}
              archivedKey={'status' as keyof T}
              archivedValues={archivedValues}
              getKey={(item) => item.id}
              renderRow={(item) => (
                <div
                  key={item.id}
                  className={`${plural}-row${activeId === item.id ? ` ${plural}-row--active` : ''}`}
                  onClick={() => setActiveId(item.id)}
                >
                  <div className={`${plural}-row__top`}>
                    <ArtifactIdLink id={item.id} className={`${plural}-row__id`} />
                    {renderBadge(item)}
                    <StatusPill status={mapPillStatus(item.status)} />
                  </div>
                  <div className={`${plural}-row__title`}>{item.title}</div>
                  <div className={`${plural}-row__meta`}>
                    {item.domain} · {dayOf(item.discovered)}
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {active ? (
        <ReviewArtifactDetail
          item={active}
          singular={singular}
          mapPillStatus={mapPillStatus}
          renderBadge={renderBadge}
          renderDetailExtraMeta={renderDetailExtraMeta}
        />
      ) : (
        <div className={`${singular}-detail__empty`}>{emptyDetailText}</div>
      )}
    </div>
  );
}

interface ReviewArtifactDetailProps<T extends ReviewArtifactItem> {
  item: T;
  singular: string;
  mapPillStatus: (status: string) => ArtifactStatus;
  renderBadge: (item: T) => ReactNode;
  renderDetailExtraMeta: (item: T) => ReactNode;
}

function ReviewArtifactDetail<T extends ReviewArtifactItem>({
  item,
  singular,
  mapPillStatus,
  renderBadge,
  renderDetailExtraMeta,
}: ReviewArtifactDetailProps<T>) {
  const pillStatus = mapPillStatus(item.status);

  return (
    <div className={`${singular}-detail`}>
      <div className={`${singular}-detail__header`}>
        <div className={`${singular}-detail__header-top`}>
          <span className={`${singular}-detail__id`}>{item.id}</span>
          {renderBadge(item)}
          <StatusPill status={pillStatus} />
        </div>
        <h2 className={`${singular}-detail__title`}>{item.title}</h2>
      </div>
      <div className={`${singular}-detail__body`}>
        <div className={`${singular}-eyebrow`}>description</div>
        <div className={`${singular}-detail__content`}>{item.body}</div>
        <div className={`${singular}-detail__meta`}>
          <div><span className={`${singular}-detail__meta-key`}>domain</span>{item.domain}</div>
          {renderDetailExtraMeta(item)}
          <div><span className={`${singular}-detail__meta-key`}>status</span>{item.status}</div>
          <div><span className={`${singular}-detail__meta-key`}>discovered</span>{dayOf(item.discovered)}</div>
        </div>
      </div>
    </div>
  );
}
