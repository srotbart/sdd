import { useState, useEffect, useRef } from 'react';
import './PluginReference.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'artifacts', label: 'Artifacts' },
  { id: 'lifecycles', label: 'Status lifecycles' },
  { id: 'skills', label: 'Skills' },
  { id: 'schemas', label: 'Schemas' },
  { id: 'decisions', label: 'Design decisions' },
] as const;

const PIPELINE_ASCII = `
  target ──► spec item ──► gap ──► work item ──► done
     │                               │
     └── awaiting-user               └── pending
     └── awaiting-agent                  in-progress
     └── ready                           blocked
     └── draft
`.trim();

const ARTIFACTS = [
  { id: 'TGT', name: 'Target', path: '.sdd/targets/', desc: 'Declared user intent, negotiated through dialog to a settled statement.' },
  { id: 'SPEC', name: 'Spec item', path: '.sdd/specs/', desc: 'Durable invariant derived from one or more accepted targets. Never archived.' },
  { id: 'GAP', name: 'Gap', path: '.sdd/gaps/', desc: 'Divergence between spec and codebase, discovered by spec-audit.' },
  { id: 'WI', name: 'Work item', path: '.sdd/work-items/', desc: 'Scoped implementation task that closes one or more gaps.' },
];

const SKILLS = [
  { name: 'sdd:session-start', desc: 'Show urgency-ordered state of all active SDD artifacts.' },
  { name: 'sdd:target-engage', desc: 'Respond to a target, negotiate to ready, fold into spec.' },
  { name: 'sdd:spec-audit', desc: 'Enumerate code paths, find divergences, write gap files.' },
  { name: 'sdd:gap-to-work-items', desc: 'Decompose open gaps into concrete scoped work items.' },
  { name: 'sdd:work-item-close', desc: 'Implement a work item, verify tests, close the gap.' },
  { name: 'sdd:spec-test', desc: 'Generate integration tests linked back to spec items.' },
  { name: 'sdd:spec-collapse', desc: 'Propose consolidation of redundant spec items.' },
];

const TARGET_SCHEMA = `---
id: TGT-001
status: awaiting-user | awaiting-agent | ready | draft | accepted
domain: ui-screens
created: "2026-05-17T00:00:00Z"
---
# Target: <title>
## Current statement
<prose>
### YYYY-MM-DD — User
<turn>`;

const GAP_SCHEMA = `---
id: GAP-scr-001
spec-item: SPEC-scr-009
status: open | closed | deferred
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: <hash>
closed-by: null | WI-scr-001
---
**Location:** path/to/file.ts:42
**Reasoning:** one-line justification`;

const WI_SCHEMA = `---
id: WI-scr-001
gap-id: GAP-scr-001
status: pending | in-progress | done | abandoned
created: "2026-05-17T00:00:00Z"
---
**Scope:** path/to/file.ts — what to change
**Acceptance criteria:**
- criterion one
- Test: what to verify`;

const LIFECYCLE_ROWS = [
  { artifact: 'Target', states: 'draft → awaiting-agent → awaiting-user → ready → accepted', terminal: 'accepted' },
  { artifact: 'Gap', states: 'open → closed | deferred', terminal: 'closed / deferred' },
  { artifact: 'Work item', states: 'pending → in-progress → done | abandoned', terminal: 'done / abandoned' },
];

const DESIGN_DECISIONS = [
  'Specs are never archived — they are the durable source of truth.',
  'Gaps are written by audit, never by hand — verifiability over vibes.',
  'Work items require at least one test criterion — no implementation without verification.',
  'Many-gaps-to-one work item is allowed when the root cause is shared.',
  'Spec version hash stamps every gap so stale audits are detectable.',
  'Targets negotiate to a settled statement before folding into spec items.',
];

export function PluginReference() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    function onScroll() {
      const scrollTop = el!.scrollTop;
      let current = SECTIONS[0].id as string;
      for (const s of SECTIONS) {
        const ref = sectionRefs.current[s.id];
        if (ref && ref.offsetTop - el!.offsetTop <= scrollTop + 40) {
          current = s.id;
        }
      }
      setActiveSection(current);
    }

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    const ref = sectionRefs.current[id];
    if (ref && contentRef.current) {
      contentRef.current.scrollTo({ top: ref.offsetTop - contentRef.current.offsetTop, behavior: 'smooth' });
    }
  }

  function setRef(id: string) {
    return (el: HTMLElement | null) => { sectionRefs.current[id] = el; };
  }

  return (
    <div className="pr-shell">
      <div className="pr-toolbar">
        <span className="pr-toolbar__glyph">❡</span>
        <span className="pr-toolbar__title">plugin reference</span>
        <span className="pr-toolbar__sub">— SDD workflow, artifacts, and skills</span>
        <a
          className="pr-toolbar__github"
          href="https://github.com/anthropics/claude-code"
          target="_blank"
          rel="noopener noreferrer"
        >
          view source on github ↗
        </a>
      </div>
      <div className="pr-toolbar-rule" />

      <div className="pr-body">
        <nav className="pr-toc">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`pr-toc__item${activeSection === s.id ? ' pr-toc__item--active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="pr-content" ref={contentRef}>
          <section ref={setRef('overview')} className="pr-section" id="pr-overview">
            <h2 className="pr-section__title">Overview</h2>
            <p className="pr-section__body">
              Spec-Driven Development (SDD) is a Claude Code plugin that maintains a living spec
              alongside your codebase. Targets capture intent, specs capture invariants, gaps
              capture divergences, and work items close them — all traceable, all auditable.
            </p>
          </section>

          <section ref={setRef('pipeline')} className="pr-section" id="pr-pipeline">
            <h2 className="pr-section__title">Pipeline</h2>
            <pre className="pr-pre">{PIPELINE_ASCII}</pre>
          </section>

          <section ref={setRef('artifacts')} className="pr-section" id="pr-artifacts">
            <h2 className="pr-section__title">Artifacts</h2>
            <div className="pr-artifact-list">
              {ARTIFACTS.map((a) => (
                <div key={a.id} className="pr-artifact-card">
                  <div className="pr-artifact-card__head">
                    <span className="pr-artifact-card__id">{a.id}</span>
                    <span className="pr-artifact-card__name">{a.name}</span>
                    <span className="pr-artifact-card__path">{a.path}</span>
                  </div>
                  <p className="pr-artifact-card__desc">{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section ref={setRef('lifecycles')} className="pr-section" id="pr-lifecycles">
            <h2 className="pr-section__title">Status lifecycles</h2>
            <table className="pr-lifecycle-table">
              <thead>
                <tr>
                  <th>Artifact</th>
                  <th>States</th>
                  <th>Terminal</th>
                </tr>
              </thead>
              <tbody>
                {LIFECYCLE_ROWS.map((r) => (
                  <tr key={r.artifact}>
                    <td>{r.artifact}</td>
                    <td><code>{r.states}</code></td>
                    <td><code>{r.terminal}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section ref={setRef('skills')} className="pr-section" id="pr-skills">
            <h2 className="pr-section__title">Skills</h2>
            <div className="pr-skill-list">
              {SKILLS.map((s) => (
                <div key={s.name} className="pr-skill-row">
                  <code className="pr-skill-row__name">/{s.name}</code>
                  <span className="pr-skill-row__desc">{s.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section ref={setRef('schemas')} className="pr-section" id="pr-schemas">
            <h2 className="pr-section__title">Schemas</h2>
            <h3 className="pr-schema__label">Target</h3>
            <pre className="pr-pre">{TARGET_SCHEMA}</pre>
            <h3 className="pr-schema__label">Gap</h3>
            <pre className="pr-pre">{GAP_SCHEMA}</pre>
            <h3 className="pr-schema__label">Work item</h3>
            <pre className="pr-pre">{WI_SCHEMA}</pre>
          </section>

          <section ref={setRef('decisions')} className="pr-section" id="pr-decisions">
            <h2 className="pr-section__title">Design decisions</h2>
            <ul className="pr-decisions-list">
              {DESIGN_DECISIONS.map((d, i) => (
                <li key={i} className="pr-decisions-list__item">{d}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
