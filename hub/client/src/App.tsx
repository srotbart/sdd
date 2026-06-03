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
import { Projections } from './screens/Projections';
import { Designs } from './screens/Designs';
import { CommandPalette } from './components/CommandPalette';
import type { WorkspaceData, Target, TargetStatus, Spec, Gap, WorkItem, ActivityLine, Agent } from './types';

const VALID_STATUSES = new Set<TargetStatus>([
  'awaiting-user', 'awaiting-agent', 'ready', 'draft', 'accepted', 'archived',
]);

const URL_TAB_TO_INTERNAL: Record<string, string> = {
  'session': 'session',
  'targets': 'targets',
  'specs': 'specs',
  'projections': 'projections',
  'designs': 'designs',
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
  'projections': 'projections',
  'designs': 'designs',
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
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [liveAgents, setLiveAgents] = useState<Agent[]>([]);
  const [liveSpecs, setLiveSpecs] = useState<Spec[]>([]);
  const [liveTargets, setLiveTargets] = useState<Target[]>([]);
  const [liveGaps, setLiveGaps] = useState<Gap[]>([]);
  const [liveWorkItems, setLiveWorkItems] = useState<WorkItem[]>([]);
  const [liveActivity, setLiveActivity] = useState<ActivityLine[]>([]);
  const [projectionsRefreshToken, setProjectionsRefreshToken] = useState<number>(0);
  const [designsRefreshToken, setDesignsRefreshToken] = useState<number>(0);

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
      .then((data: WorkspaceData[]) => setWorkspaces(data))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  useEffect(() => {
    let destroyed = false;
    let reconnectDelay = 1000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (destroyed) { return; }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);

      ws.onopen = () => {
        reconnectDelay = 1000;
        setHubConnected(true);
      };

      ws.onclose = () => {
        setHubConnected(false);
        if (!destroyed) {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = () => {
        setHubConnected(false);
      };

      ws.onmessage = (event: MessageEvent) => {
        let msg: unknown;
        try { msg = JSON.parse(event.data as string); } catch { return; }
        if (typeof msg !== 'object' || msg === null) { return; }
        const m = msg as Record<string, unknown>;
        if (m.type === 'snapshot' || m.type === 'update') {
          if (Array.isArray(m.workspaces)) {
            setWorkspaces(m.workspaces as WorkspaceData[]);
          }
          if (Array.isArray(m.agents)) {
            setLiveAgents(m.agents as Agent[]);
          }
          return;
        }
        if (m.type === 'agent-registered') {
          return;
        }
        if (m.type === 'activity') {
          const line: ActivityLine = {
            t: typeof m['t'] === 'string' ? m['t'] : new Date().toISOString().slice(11, 19),
            agent: typeof m['agentId'] === 'string' ? m['agentId'] : '',
            kind: (m['kind'] as ActivityLine['kind']) ?? 'in',
            msg: typeof m['msg'] === 'string' ? m['msg'] : '',
          };
          setLiveActivity((prev) => [line, ...prev].slice(0, 500));
          return;
        }
        if (m.type !== 'sdd-changed') { return; }
        const { workspaceId, artifact } = m as { workspaceId: string; artifact: string };
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
        } else if (artifact === 'projections') {
          setProjectionsRefreshToken((n) => n + 1);
        } else if (artifact === 'designs') {
          setDesignsRefreshToken((n) => n + 1);
        }
      };

      return ws;
    }

    const ws = connect();

    return () => {
      destroyed = true;
      if (reconnectTimer !== null) { clearTimeout(reconnectTimer); }
      ws?.close();
    };
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
      if (workspaces.length === 0) {
        return (
          <div className="app-empty-state">
            No workspace attached — use the sidenav to attach a project folder.
          </div>
        );
      }
      return (
        <Dashboard
          workspaces={workspaces}
          agents={liveAgents}
          activity={liveActivity}
          now={new Date()}
          onOpenWorkspace={handleSelectWorkspace}
        />
      );
    }
    switch (activeTab) {
      case 'session':
        return <Session targets={liveTargets} specs={liveSpecs} gaps={liveGaps} workItems={liveWorkItems} staleDomains={[]} agents={liveAgents} onNav={setActiveTab} />;
      case 'targets':
        return <Targets targets={liveTargets} initialTargetId={selectedItemId ?? undefined} />;
      case 'specs':
        return <Specs specs={liveSpecs} gaps={liveGaps} workItems={liveWorkItems} initialSpecId={selectedItemId ?? undefined} onNav={() => {}} />;
      case 'projections':
        return <Projections workspaceId={activeWorkspace.id} refreshToken={projectionsRefreshToken} />;
      case 'designs':
        return <Designs workspaceId={activeWorkspace.id} refreshToken={designsRefreshToken} />;
      case 'gaps':
        return <Gaps gaps={liveGaps} specs={liveSpecs} workItems={liveWorkItems} initialGapId={selectedItemId ?? undefined} onNav={() => {}} />;
      case 'work items':
        return <WorkItems workItems={liveWorkItems} gaps={liveGaps} specs={liveSpecs} agents={liveAgents} initialWiId={selectedItemId ?? undefined} onNav={() => {}} />;
      case 'activity':
        return <Activity lines={liveActivity} agents={liveAgents} />;
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
        agentCount={liveAgents.length}
        hubAddress="localhost:22351"
      />
      <Sidenav
        workspaces={workspaces.map((ws) => ({
          id: ws.id,
          name: ws.name,
          path: ws.path,
          alertCount: ws.id === activeWorkspaceId
            ? liveTargets.filter((t) => t.status === 'awaiting-user').length
            : ws.counts?.targetsAwaitingUser ?? 0,
        }))}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onSelectHub={handleSelectHub}
        isConnected={hubConnected}
        activeTab={activeTab}
        onSelectTab={(tab) => { setPluginRefActive(false); setSelectedItemId(null); setActiveTab(tab); }}
        tabCounts={{
          targets: liveTargets.filter((t) => t.status !== 'accepted' && t.status !== 'archived').length,
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
          specs={liveSpecs}
          activeWorkspaceName={activeWorkspace?.name}
          onNavigate={(kind, id) => {
            const tabMap: Record<string, string> = {
              'target': 'targets',
              'gap': 'gaps',
              'work-item': 'work items',
              'spec-item': 'specs',
              'spec-file': 'specs',
            };
            const tab = tabMap[kind];
            if (tab) {
              setPluginRefActive(false);
              setActiveTab(tab);
              setSelectedItemId(id ?? null);
              setPaletteOpen(false);
            }
          }}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </div>
  );
}
