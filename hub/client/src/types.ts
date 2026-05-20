export type ArtifactStatus =
  | 'awaiting-user'
  | 'awaiting-agent'
  | 'ready'
  | 'draft'
  | 'accepted'
  | 'open'
  | 'pending'
  | 'in-progress'
  | 'blocked'
  | 'done'
  | 'closed'
  | 'active'
  | 'stale';

export type TargetStatus = 'awaiting-user' | 'awaiting-agent' | 'ready' | 'draft' | 'accepted';

export interface DialogTurn {
  who: 'user' | 'agent';
  date: string;
  text: string;
}

export interface Target {
  id: string;
  status: TargetStatus;
  domain: string;
  domainAbbrev: string;
  title: string;
  created: string;
  statement: string;
  dialog: DialogTurn[];
  foldedInto?: string;
}

export interface WorkspaceCounts {
  targetsAwaitingUser: number;
  targetsAwaitingAgent: number;
  targetsReady: number;
  targetsDraft: number;
  specs: number;
  specItems: number;
  openGaps: number;
  staleAuditDomains: number;
  workPending: number;
  workInProgress: number;
  workBlocked: number;
  workDoneToday: number;
}

export interface WorkspaceData {
  id: string;
  name: string;
  path: string;
  description: string;
  pinned?: boolean;
  lastActivity: string;
  agents: string[];
  counts: WorkspaceCounts;
}

export interface PipelineStage {
  key: string;
  label: string;
  n: number;
}

export interface Agent {
  id: string;
  initials: string;
  name: string;
  host: string;
  status: 'busy' | 'idle';
  pid: number;
}

export interface CodeLine {
  n: number;
  src: string;
  hl?: boolean;
}

export interface CodeContext {
  lang: string;
  lines: CodeLine[];
}

export interface SpecItem {
  id: string;
  title: string;
  status: ArtifactStatus;
  body: string;
  refs: Array<{ kind: 'gap' | 'wi'; id: string }>;
}

export interface Spec {
  id: string;
  domain: string;
  abbrev: string;
  version: string;
  items: SpecItem[];
}

export interface Gap {
  id: string;
  specItem: string;
  domain: string;
  abbrev: string;
  status: ArtifactStatus;
  discovered: string;
  auditVersion: string;
  title: string;
  location: string;
  reasoning: string;
  codeContext: CodeContext;
  closedBy: string | null;
}

export interface WorkItem {
  id: string;
  gapId: string;
  title: string;
  status: ArtifactStatus;
  domain: string;
  agent: string | null;
  created: string;
  closed?: string;
  scope: string;
  acceptance: string[];
  progressNote?: string;
  blockedReason?: string;
}

export interface ActivityLine {
  t: string;
  agent: string;
  kind: 'in' | 'note' | 'err';
  msg: string;
}
