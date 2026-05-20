import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Sidenav } from './components/Sidenav';
import { Header } from './components/Header';
import { Dashboard } from './screens/Dashboard';
import { Session } from './screens/Session';
import { Targets } from './screens/Targets';
import { Specs } from './screens/Specs';
import { Gaps } from './screens/Gaps';
import { WorkItems } from './screens/WorkItems';
import { Activity } from './screens/Activity';
import { Settings } from './screens/Settings';
import { PluginReference } from './screens/PluginReference';
import { CommandPalette } from './components/CommandPalette';
import type { WorkspaceData, Target, TargetStatus, Spec, Gap, WorkItem, ActivityLine, Agent } from './types';

const VALID_STATUSES = new Set<TargetStatus>([
  'awaiting-user', 'awaiting-agent', 'ready', 'draft', 'accepted',
]);

const URL_TAB_TO_INTERNAL: Record<string, string> = {
  'session': 'session',
  'targets': 'targets',
  'specs': 'specs',
  'gaps': 'gaps',
  'work-items': 'work items',
  'settings': 'settings',
  'plugin-reference': 'plugin-reference',
  'activity': 'activity',
};

const INTERNAL_TAB_TO_URL: Record<string, string> = {
  'session': 'session',
  'targets': 'targets',
  'specs': 'specs',
  'gaps': 'gaps',
  'work items': 'work-items',
  'settings': 'settings',
  'plugin-reference': 'plugin-reference',
  'activity': 'activity',
};

function parseUrlParams(): { workspaceId: string | null; tab: string; itemId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const workspaceId = params.get('w');
  const rawTab = params.get('v') ?? '';
  const tab = URL_TAB_TO_INTERNAL[rawTab] ?? 'targets';
  const itemId = params.get('id');
  return { workspaceId, tab, itemId };
}

function pushUrlState(workspaceId: string | null, tab: string, itemId: string | null): void {
  const params = new URLSearchParams();
  if (workspaceId) {
    params.set('w', workspaceId);
    params.set('v', INTERNAL_TAB_TO_URL[tab] ?? tab);
    if (itemId) {
      params.set('id', itemId);
    }
  }
  const search = params.toString() ? `?${params.toString()}` : '';
  history.replaceState(null, '', `${window.location.pathname}${search}`);
}

function mapApiGap(raw: Record<string, unknown>): Gap {
  const id = typeof raw['id'] === 'string' ? raw['id'] : '';
  const abbrevMatch = /^GAP-([a-z]+)-\d+$/i.exec(id);
  const abbrev = abbrevMatch ? abbrevMatch[1].toLowerCase() : '';
  return {
    id,
    specItem: typeof raw['specItem'] === 'string' ? raw['specItem'] : '',
    domain: typeof raw['domain'] === 'string' ? raw['domain'] : '',
    abbrev,
    status: (raw['status'] as Gap['status']) ?? 'open',
    discovered: typeof raw['discovered'] === 'string' ? raw['discovered'] : '',
    auditVersion: typeof raw['auditVersion'] === 'string' ? raw['auditVersion'] : '',
    title: typeof raw['title'] === 'string' ? raw['title'] : '',
    location: typeof raw['location'] === 'string' ? raw['location'] : '',
    reasoning: typeof raw['reasoning'] === 'string' ? raw['reasoning'] : '',
    codeContext: { lang: 'typescript', lines: [] },
    closedBy: typeof raw['closedBy'] === 'string' ? raw['closedBy'] : null,
  };
}

function mapApiWorkItem(raw: Record<string, unknown>): WorkItem {
  const gapId = typeof raw['gapId'] === 'string'
    ? raw['gapId']
    : Array.isArray(raw['gapId']) ? (raw['gapId'][0] as string) ?? '' : '';
  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : '',
    gapId,
    title: typeof raw['title'] === 'string' ? raw['title'] : '',
    status: (raw['status'] as WorkItem['status']) ?? 'pending',
    domain: typeof raw['domain'] === 'string' ? raw['domain'] : '',
    agent: null,
    created: typeof raw['created'] === 'string' ? raw['created'] : '',
    closed: typeof raw['closed'] === 'string' ? raw['closed'] : undefined,
    scope: typeof raw['scope'] === 'string' ? raw['scope'] : '',
    acceptance: Array.isArray(raw['acceptance']) ? (raw['acceptance'] as string[]) : [],
    progressNote: typeof raw['progressNote'] === 'string' ? raw['progressNote'] : undefined,
    blockedReason: typeof raw['blockedReason'] === 'string' ? raw['blockedReason'] : undefined,
  };
}

function mapApiTarget(raw: Record<string, unknown>): Target {
  const status = VALID_STATUSES.has(raw['status'] as TargetStatus)
    ? (raw['status'] as TargetStatus)
    : 'draft';
  const domain = typeof raw['domain'] === 'string' ? raw['domain'] : '';
  const domainAbbrev = typeof raw['domainAbbrev'] === 'string'
    ? raw['domainAbbrev']
    : domain.split('-').map((p: string) => p.slice(0, 2)).join('').slice(0, 6) || domain;
  const statement = typeof raw['statement'] === 'string' ? raw['statement'] : '';
  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : '',
    status,
    domain,
    domainAbbrev,
    title: typeof raw['title'] === 'string' ? raw['title'] : statement,
    created: typeof raw['created'] === 'string' ? raw['created'] : '',
    statement,
    dialog: Array.isArray(raw['dialog']) ? raw['dialog'] : [],
    foldedInto: typeof raw['foldedInto'] === 'string' ? raw['foldedInto'] : undefined,
  };
}

const MOCK_AGENTS: Record<string, Agent> = {
  'claude-a': { id: 'a1', initials: 'CA', name: 'claude-a', host: 'localhost', status: 'busy', pid: 12345 },
  'claude-b': { id: 'a2', initials: 'CB', name: 'claude-b', host: 'localhost', status: 'idle', pid: 12346 },
};

interface DbWorkspace {
  id: string;
  name: string;
  path: string;
  description: string | null;
  created_at: string;
}

const MOCK_WORKSPACES: WorkspaceData[] = [
  {
    id: 'sdd-hub',
    name: 'sdd-hub',
    path: '/Users/dev/sdd-hub',
    description: 'The SDD Hub project itself',
    lastActivity: new Date().toISOString(),
    agents: ['claude-a', 'claude-b'],
    counts: {
      targetsAwaitingUser: 1,
      targetsAwaitingAgent: 0,
      targetsReady: 0,
      targetsDraft: 1,
      specs: 3,
      specItems: 14,
      openGaps: 2,
      staleAuditDomains: 0,
      workPending: 3,
      workInProgress: 1,
      workBlocked: 0,
      workDoneToday: 4,
    },
  },
];


const MOCK_SPECS: Spec[] = [
  {
    id: 'SPEC-arch',
    domain: 'architecture',
    abbrev: 'arch',
    version: '689ddaf6',
    items: [
      { id: 'SPEC-arch-001', title: 'Server runtime is Node.js', status: 'active', body: 'The hub server runs on Node.js. No other server runtime is permitted.', refs: [] },
      { id: 'SPEC-arch-002', title: 'Frontend is React + TypeScript, bundled with Vite', status: 'active', body: 'The UI is a React application written in TypeScript and bundled with Vite.', refs: [{ kind: 'gap', id: 'GAP-arch-010' }] },
    ],
  },
];

const MOCK_GAPS: Gap[] = [
  {
    id: 'GAP-arch-010',
    specItem: 'SPEC-arch-001',
    domain: 'architecture',
    abbrev: 'arch',
    status: 'open',
    discovered: '2026-05-15T00:00:00Z',
    auditVersion: '689ddaf6',
    title: 'Workspace attachment endpoint missing',
    location: 'server/index.ts:63',
    reasoning: 'No POST /workspaces route is registered on the HTTP server.',
    codeContext: {
      lang: 'typescript',
      lines: [
        { n: 61, src: 'export const server = http.createServer((req, res) => {' },
        { n: 62, src: '  serveStatic(req, res);' },
        { n: 63, src: '});', hl: true },
      ],
    },
    closedBy: null,
  },
];

const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'WI-arch-010',
    gapId: 'GAP-arch-010',
    title: 'Add POST /workspaces endpoint',
    status: 'in-progress',
    domain: 'architecture',
    agent: 'claude-a',
    created: '2026-05-15T00:00:00Z',
    scope: 'server/index.ts — add route handler for POST /workspaces',
    acceptance: ['Accepts { name, path } body', 'Validates .sdd/ exists at path', 'Inserts workspace into SQLite', 'Starts chokidar watcher for the new workspace'],
    progressNote: 'Route handler stubbed, validation logic next',
  },
  {
    id: 'WI-arch-011',
    gapId: 'GAP-arch-010',
    title: 'Add GET /workspaces endpoint',
    status: 'pending',
    domain: 'architecture',
    agent: null,
    created: '2026-05-15T00:00:00Z',
    scope: 'server/index.ts — add route handler for GET /workspaces',
    acceptance: ['Returns all workspaces from SQLite', 'Includes live agent count per workspace'],
  },
];

const MOCK_ACTIVITY: ActivityLine[] = [
  { t: '14:32:01', agent: 'claude-a', kind: 'in', msg: 'Reading server/index.ts' },
  { t: '14:32:03', agent: 'claude-a', kind: 'in', msg: 'Writing server/index.ts' },
  { t: '14:32:05', agent: 'claude-a', kind: 'note', msg: 'Route handler stubbed, moving to validation' },
  { t: '14:32:10', agent: 'claude-b', kind: 'in', msg: 'Running tsc --noEmit' },
  { t: '14:32:12', agent: 'claude-b', kind: 'note', msg: 'Zero errors' },
];


export function App() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    const { workspaceId } = parseUrlParams();
    return workspaceId ?? localStorage.getItem('hub.activeWorkspaceId');
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const { workspaceId, tab } = parseUrlParams();
    return workspaceId ? tab : 'session';
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() => {
    const { workspaceId, itemId } = parseUrlParams();
    return workspaceId ? itemId : null;
  });
  const [pluginRefActive, setPluginRefActive] = useState<boolean>(() => {
    const { workspaceId, tab } = parseUrlParams();
    return workspaceId ? tab === 'plugin-reference' : false;
  });
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [hubConnected, setHubConnected] = useState<boolean>(false);
  const appRef = useRef<HTMLDivElement>(null);
  const activeWorkspaceIdRef = useRef<string | null>(activeWorkspaceId);
  const [workspaces, setWorkspaces] = useState<DbWorkspace[]>([]);
  const [liveSpecs, setLiveSpecs] = useState<Spec[]>([]);
  const [liveTargets, setLiveTargets] = useState<Target[]>([]);
  const [liveGaps, setLiveGaps] = useState<Gap[]>([]);
  const [liveWorkItems, setLiveWorkItems] = useState<WorkItem[]>([]);

  useEffect(() => {
    activeWorkspaceIdRef.current = activeWorkspaceId;
  }, [activeWorkspaceId]);

  useEffect(() => {
    const tab = pluginRefActive ? 'plugin-reference' : activeTab;
    pushUrlState(activeWorkspaceId, tab, selectedItemId);
  }, [activeWorkspaceId, activeTab, selectedItemId, pluginRefActive]);

  const fetchWorkspaces = useCallback(() => {
    fetch('/workspaces')
      .then((r) => r.json())
      .then((data: DbWorkspace[]) => setWorkspaces(data))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    ws.onopen = () => setHubConnected(true);
    ws.onclose = () => setHubConnected(false);
    ws.onerror = () => setHubConnected(false);
    ws.onmessage = (event: MessageEvent) => {
      let msg: unknown;
      try { msg = JSON.parse(event.data as string); } catch { return; }
      if (
        typeof msg !== 'object' || msg === null ||
        (msg as Record<string, unknown>).type !== 'sdd-changed'
      ) { return; }
      const { workspaceId, artifact } = msg as { workspaceId: string; artifact: string };
      if (workspaceId !== activeWorkspaceIdRef.current) { return; }
      if (artifact === 'targets') {
        fetch(`/workspaces/${workspaceId}/targets`)
          .then((r) => r.json())
          .then((data: Record<string, unknown>[]) => setLiveTargets(data.map(mapApiTarget)))
          .catch(() => {});
      } else if (artifact === 'specs') {
        fetch(`/workspaces/${workspaceId}/specs`)
          .then((r) => r.json())
          .then((data: Spec[]) => setLiveSpecs(data))
          .catch(() => {});
      } else if (artifact === 'gaps') {
        fetch(`/workspaces/${workspaceId}/gaps`)
          .then((r) => r.json())
          .then((data: Record<string, unknown>[]) => setLiveGaps(data.map(mapApiGap)))
          .catch(() => {});
      } else if (artifact === 'work-items') {
        fetch(`/workspaces/${workspaceId}/work-items`)
          .then((r) => r.json())
          .then((data: Record<string, unknown>[]) => setLiveWorkItems(data.map(mapApiWorkItem)))
          .catch(() => {});
      }
    };
    return () => { ws.close(); };
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) { return; }
    const { workspaceId: urlWsId } = parseUrlParams();
    if (urlWsId && workspaces.some((ws) => ws.id === urlWsId)) { return; }
    const persisted = localStorage.getItem('hub.activeWorkspaceId');
    if (persisted && workspaces.some((ws) => ws.id === persisted)) {
      setActiveWorkspaceId(persisted);
      return;
    }
    setActiveWorkspaceId(workspaces[0].id);
  }, [workspaces]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!activeWorkspaceId) { setLiveSpecs([]); return; }
    fetch(`/workspaces/${activeWorkspaceId}/specs`)
      .then((r) => r.json())
      .then((data: Spec[]) => setLiveSpecs(data))
      .catch(() => setLiveSpecs([]));
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!activeWorkspaceId) { setLiveTargets([]); return; }
    fetch(`/workspaces/${activeWorkspaceId}/targets`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => setLiveTargets(data.map(mapApiTarget)))
      .catch(() => setLiveTargets([]));
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!activeWorkspaceId) { setLiveGaps([]); return; }
    fetch(`/workspaces/${activeWorkspaceId}/gaps`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => setLiveGaps(data.map(mapApiGap)))
      .catch(() => setLiveGaps([]));
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!activeWorkspaceId) { setLiveWorkItems([]); return; }
    fetch(`/workspaces/${activeWorkspaceId}/work-items`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => setLiveWorkItems(data.map(mapApiWorkItem)))
      .catch(() => setLiveWorkItems([]));
  }, [activeWorkspaceId]);

  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId) ?? null;
  const isHubActive = activeWorkspaceId === null;

  const breadcrumb: string[] = ['hub'];
  if (activeWorkspace) {
    breadcrumb.push(activeWorkspace.name);
    breadcrumb.push(activeTab);
  }

  function handleSelectWorkspace(id: string) {
    localStorage.setItem('hub.activeWorkspaceId', id);
    setActiveWorkspaceId(id);
    setActiveTab('session');
    setSelectedItemId(null);
    setPluginRefActive(false);
  }

  function handleSelectHub() {
    localStorage.removeItem('hub.activeWorkspaceId');
    setActiveWorkspaceId(null);
    setSelectedItemId(null);
    setPluginRefActive(false);
  }

  function renderMain() {
    if (pluginRefActive) {
      return <PluginReference />;
    }
    if (!activeWorkspace) {
      return (
        <Dashboard
          workspaces={MOCK_WORKSPACES}
          agents={MOCK_AGENTS}
          activity={MOCK_ACTIVITY}
          now={new Date()}
          onOpenWorkspace={handleSelectWorkspace}
        />
      );
    }
    switch (activeTab) {
      case 'session':
        return <Session targets={liveTargets} specs={MOCK_SPECS} gaps={liveGaps} workItems={liveWorkItems} staleDomains={[]} agents={MOCK_AGENTS} onNav={setActiveTab} />;
      case 'targets':
        return <Targets targets={liveTargets} />;
      case 'specs':
        return <Specs specs={liveSpecs} gaps={liveGaps} workItems={liveWorkItems} onNav={() => {}} />;
      case 'gaps':
        return <Gaps gaps={liveGaps} specs={MOCK_SPECS} workItems={liveWorkItems} onNav={() => {}} />;
      case 'work items':
        return <WorkItems workItems={liveWorkItems} gaps={liveGaps} specs={MOCK_SPECS} agents={MOCK_AGENTS} onNav={() => {}} />;
      case 'activity':
        return <Activity lines={MOCK_ACTIVITY} agents={MOCK_AGENTS} />;
      case 'settings':
        return <Settings workspaceId={activeWorkspace.id} />;
      default:
        return <div style={{ padding: 32, color: 'var(--ink-3)', fontFamily: 'Geist, sans-serif', fontSize: 13 }}>{activeTab} — coming soon</div>;
    }
  }

  return (
    <div className="app-shell">
      <Header
        breadcrumb={breadcrumb}
        agentCount={Object.values(MOCK_AGENTS).length}
        hubAddress="localhost:22351"
      />
      <Sidenav
        workspaces={workspaces.map((ws) => ({
          id: ws.id,
          name: ws.name,
          path: ws.path,
        }))}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onSelectHub={handleSelectHub}
        isConnected={hubConnected}
        activeTab={activeTab}
        onSelectTab={(tab) => { setPluginRefActive(false); setSelectedItemId(null); setActiveTab(tab); }}
        tabCounts={{
          targets: liveTargets.filter((t) => t.status !== 'accepted').length,
          gaps: liveGaps.filter((g) => g.status !== 'closed' && g.status !== 'deferred').length,
          'work items': liveWorkItems.filter((w) => w.status !== 'done' && w.status !== 'abandoned').length,
          specs: liveSpecs.length,
        }}
        isHubActive={isHubActive}
        onWorkspaceAttached={fetchWorkspaces}
        onSelectPluginRef={() => { setSelectedItemId(null); setPluginRefActive(true); }}
        pluginRefActive={pluginRefActive}
      />
      <main className="app-main">
        {renderMain()}
      </main>
      {paletteOpen && (
        <CommandPalette
          targets={liveTargets}
          gaps={liveGaps}
          workItems={liveWorkItems}
          specs={MOCK_SPECS}
          activeWorkspaceName={activeWorkspace?.name}
          onNavigate={(kind, _id) => {
            const tabMap: Record<string, string> = {
              'target': 'targets',
              'gap': 'gaps',
              'work-item': 'work items',
              'spec-item': 'specs',
              'spec-file': 'specs',
            };
            const tab = tabMap[kind];
            if (tab) { setPluginRefActive(false); setActiveTab(tab); }
          }}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
}
