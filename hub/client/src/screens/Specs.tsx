import { useState } from 'react';
import './Specs.css';
import { useSpecSearch } from './useSpecSearch';
import { SpecItemList } from './SpecItemList';
import { SpecItemDetail } from './SpecItemDetail';
import type { Spec, Gap, WorkItem } from '../types';

interface DomainCoverage {
  id: string;
  domain: string;
  covered: number;
  total: number;
  passing: number;
  failing: number;
  missing: number;
  notRun: number;
  skipped: number;
}

function computeDomainCoverage(spec: Spec): DomainCoverage {
  let passing = 0, failing = 0, missing = 0, notRun = 0, skipped = 0;
  for (const item of spec.items) {
    const s = item.testStatus.status;
    if (s === 'passing') passing++;
    else if (s === 'failing') failing++;
    else if (s === 'missing') missing++;
    else if (s === 'skipped') skipped++;
    else notRun++;
  }
  const covered = passing + failing + missing;
  return { id: spec.id, domain: spec.domain, covered, total: spec.items.length, passing, failing, missing, notRun, skipped };
}

interface SpecsProps {
  specs: Spec[];
  gaps: Gap[];
  workItems: WorkItem[];
  initialSpecId?: string;
  onNav: (tab: string, id?: string) => void;
}

export function Specs({ specs, gaps, workItems, initialSpecId, onNav }: SpecsProps) {
  const initialItem = initialSpecId
    ? specs.flatMap((s) => s.items).find((i) => i.id === initialSpecId)
    : undefined;

  const initialDomain = initialItem
    ? (specs.find((s) => s.items.some((i) => i.id === initialSpecId))?.id ?? specs[0]?.id ?? '')
    : (specs[0]?.id ?? '');

  const [activeSpecId, setActiveSpecId] = useState<string>(initialDomain);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    initialSpecId ?? null
  );

  const activeSpec = specs.find((s) => s.id === activeSpecId);
  const selectedItem = selectedItemId
    ? specs.flatMap((s) => s.items).find((i) => i.id === selectedItemId) ?? null
    : null;

  const totalItems = specs.reduce((n, s) => n + s.items.length, 0);
  const coverageRows = specs.map(computeDomainCoverage);

  const filteredItems = useSpecSearch(activeSpec?.items ?? [], searchQuery);

  function handleSelectDomain(id: string) {
    setActiveSpecId(id);
    setSearchQuery('');
    setSelectedItemId(null);
    onNav('specs');
  }

  function handleSelectItem(id: string) {
    setSelectedItemId(id);
    onNav('specs', id);
  }

  function handleBack() {
    setSelectedItemId(null);
    onNav('specs');
  }

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

      <div className="specs-coverage-strip">
        {coverageRows.map((cov) => (
          <div key={cov.id} className="specs-coverage-row">
            <span className="specs-coverage-domain">{cov.domain}</span>
            <span className="specs-coverage-fraction">{cov.covered}/{cov.total} covered</span>
            <span className="specs-coverage-counts">
              <span className="specs-coverage-passing">{cov.passing} passing</span>
              <span className="specs-coverage-failing">{cov.failing} failing</span>
              <span className="specs-coverage-missing">{cov.missing} missing</span>
              <span className="specs-coverage-not-run">{cov.notRun} not-run</span>
              <span className="specs-coverage-skipped">{cov.skipped} skipped</span>
            </span>
          </div>
        ))}
      </div>

    <div className="specs-layout">
      <div className="specs-sidebar">
        <div className="specs-sidebar__label">domains</div>
        {specs.map((spec) => (
          <div
            key={spec.id}
            className={`specs-domain-row${activeSpecId === spec.id ? ' specs-domain-row--active' : ''}`}
            onClick={() => handleSelectDomain(spec.id)}
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
        {activeSpec && selectedItem ? (
          <SpecItemDetail
            item={selectedItem}
            gaps={gaps}
            workItems={workItems}
            onBack={handleBack}
            onNav={onNav}
          />
        ) : activeSpec ? (
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

            <div className="specs-search-bar">
              <input
                className="specs-search-input"
                type="text"
                placeholder="Search items…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <SpecItemList
              items={filteredItems}
              gaps={gaps}
              workItems={workItems}
              onSelectItem={handleSelectItem}
              onNav={onNav}
            />
          </>
        ) : null}
      </div>
    </div>
    </div>
  );
}
