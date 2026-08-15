import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './Map.css';

export interface MapNode {
  path: string;
  area: string;
  depth: number;
  abbrev: string | null;
  description: string;
  hasManifest: boolean;
  itemCount: number;
  subtreeItemCount: number;
  openGaps: number;
  uncovered: number;
  failing: number;
  dependsOn: string[];
  contracts: MapContract[];
}

export type BindingStatus = 'in-sync' | 'producer-drifted' | 'consumer-drifted' | 'unknown';

export interface MapEdge {
  from: string;
  to: string;
  kind: 'depends-on' | 'contract';
  contractItem?: string;
  status?: BindingStatus;
}

export interface MapContract {
  item: string;
  consumer: string;
  status: BindingStatus;
}

interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
}

interface MapProps {
  workspaceId: string;
  refreshToken?: number;
}

interface EdgePath {
  d: string;
  key: string;
  kind: MapEdge['kind'];
  status?: BindingStatus;
  label: string;
}

function childrenOf(nodes: MapNode[], parentPath: string): MapNode[] {
  return nodes.filter(
    (n) => n.path.startsWith(parentPath + '/') && n.path.split('/').length === parentPath.split('/').length + 1
  );
}

function NodeCard({
  node,
  nodes,
  selected,
  onSelect,
  registerRef,
}: {
  node: MapNode;
  nodes: MapNode[];
  selected: string | null;
  onSelect: (path: string) => void;
  registerRef: (path: string, el: HTMLDivElement | null) => void;
}) {
  const kids = childrenOf(nodes, node.path);
  const name = node.path.split('/').pop() ?? node.path;
  return (
    <div
      ref={(el) => registerRef(node.path, el)}
      className={`map-node${selected === node.path ? ' map-node--selected' : ''}`}
      data-path={node.path}
    >
      <button className="map-node__head" onClick={() => onSelect(node.path)}>
        <span className="map-node__name">{name}</span>
        {node.abbrev ? <span className="map-node__abbrev">{node.abbrev}</span> : null}
        <span className="map-node__badges">
          <span className="map-badge" title={`${node.subtreeItemCount} spec items in subtree`}>
            {node.subtreeItemCount}
          </span>
          {node.openGaps > 0 ? (
            <span className="map-badge map-badge--gaps" title={`${node.openGaps} open gap${node.openGaps === 1 ? '' : 's'} in subtree`}>
              {node.openGaps} gap{node.openGaps === 1 ? '' : 's'}
            </span>
          ) : null}
          {node.failing > 0 ? (
            <span className="map-badge map-badge--failing" title={`${node.failing} items with failing tests`}>
              {node.failing} failing
            </span>
          ) : null}
          {node.uncovered > 0 ? (
            <span className="map-badge map-badge--uncovered" title={`${node.uncovered} items without tests`}>
              {node.uncovered} uncovered
            </span>
          ) : null}
        </span>
      </button>
      {kids.length > 0 ? (
        <div className="map-node__children">
          {kids.map((k) => (
            <NodeCard key={k.path} node={k} nodes={nodes} selected={selected} onSelect={onSelect} registerRef={registerRef} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Map({ workspaceId, refreshToken }: MapProps) {
  const [graph, setGraph] = useState<MapGraph | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [edgePaths, setEdgePaths] = useState<EdgePath[]>([]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeEls = useRef(new window.Map<string, HTMLDivElement>());

  useEffect(() => {
    let cancelled = false;
    fetch(`/workspaces/${workspaceId}/component-graph`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: MapGraph) => {
        if (!cancelled) setGraph(data);
      })
      .catch(() => {
        if (!cancelled) setGraph({ nodes: [], edges: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, refreshToken]);

  const registerRef = (path: string, el: HTMLDivElement | null): void => {
    if (el) {
      nodeEls.current.set(path, el);
    } else {
      nodeEls.current.delete(path);
    }
  };

  // Edge geometry: measured after layout, relative to the canvas. jsdom (and a
  // collapsed layout) yields zero-size rects — draw nothing in that case.
  useLayoutEffect(() => {
    const compute = (): void => {
      const canvas = canvasRef.current;
      if (!canvas || !graph) {
        setEdgePaths([]);
        return;
      }
      const canvasRect = canvas.getBoundingClientRect();
      if (canvasRect.width === 0) {
        setEdgePaths([]);
        return;
      }
      // Anchor edges on the cards' left edges and route them through the
      // canvas gutter — anchored top/bottom they run underneath the cards and
      // disappear. Staggered bulges keep parallel edges distinguishable.
      const paths: EdgePath[] = [];
      let i = 0;
      for (const edge of graph.edges) {
        const fromEl = nodeEls.current.get(edge.from);
        const toEl = nodeEls.current.get(edge.to);
        if (!fromEl || !toEl) continue;
        const a = fromEl.getBoundingClientRect();
        const b = toEl.getBoundingClientRect();
        if (a.width === 0 || b.width === 0) continue;
        const x1 = a.left - canvasRect.left;
        const y1 = a.top - canvasRect.top + a.height / 2;
        const x2 = b.left - canvasRect.left;
        const y2 = b.top - canvasRect.top + b.height / 2;
        const bulge = 26 + (i % 3) * 12;
        i += 1;
        paths.push({
          key: `${edge.kind}:${edge.contractItem ?? ''}:${edge.from}→${edge.to}`,
          d: `M ${x1} ${y1} C ${x1 - bulge} ${y1}, ${x2 - bulge} ${y2}, ${x2} ${y2}`,
          kind: edge.kind,
          status: edge.status,
          label:
            edge.kind === 'contract'
              ? `${edge.contractItem}: ${edge.from} → ${edge.to} (${edge.status})`
              : `${edge.from} depends on ${edge.to}`,
        });
      }
      setEdgePaths(paths);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [graph]);

  if (!graph) {
    return <div className="map-screen map-screen--empty">Loading component map…</div>;
  }

  const areas = graph.nodes.filter((n) => n.depth === 1);
  const selectedNode = graph.nodes.find((n) => n.path === selected) ?? null;

  if (areas.length === 0) {
    return (
      <div className="map-screen map-screen--empty">
        No components yet — the map builds itself from spec items under <code>.sdd/specs/</code>.
      </div>
    );
  }

  return (
    <div className="map-screen">
      <div className="map-canvas" ref={canvasRef}>
        <svg className="map-edges" aria-hidden="true">
          <defs>
            <marker id="map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 8 4 L 0 8 z" className="map-edges__arrow" />
            </marker>
          </defs>
          {edgePaths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              className={`map-edges__line map-edges__line--${p.kind}${p.status ? ` map-edges__line--${p.status}` : ''}`}
              markerEnd="url(#map-arrow)"
            >
              <title>{p.label}</title>
            </path>
          ))}
        </svg>
        <div className="map-areas">
          {areas.map((area) => (
            <section key={area.path} className="map-area">
              <div className="map-area__title">{area.path}</div>
              <NodeCard node={area} nodes={graph.nodes} selected={selected} onSelect={setSelected} registerRef={registerRef} />
            </section>
          ))}
        </div>
        {graph.edges.length === 0 ? (
          <div className="map-hint">
            Dependency edges appear when <code>component.md</code> manifests declare <code>depends-on</code>.
          </div>
        ) : null}
      </div>
      {selectedNode ? (
        <aside className="map-detail">
          <div className="map-detail__head">
            <span className="map-detail__path">{selectedNode.path}</span>
            <button className="map-detail__close" onClick={() => setSelected(null)} title="Close">
              ×
            </button>
          </div>
          {selectedNode.description ? <p className="map-detail__desc">{selectedNode.description}</p> : null}
          <dl className="map-detail__facts">
            <div>
              <dt>spec items</dt>
              <dd>
                {selectedNode.itemCount} direct · {selectedNode.subtreeItemCount} in subtree
              </dd>
            </div>
            <div>
              <dt>open gaps</dt>
              <dd>{selectedNode.openGaps}</dd>
            </div>
            <div>
              <dt>tests</dt>
              <dd>
                {selectedNode.failing} failing · {selectedNode.uncovered} uncovered
              </dd>
            </div>
            <div>
              <dt>depends on</dt>
              <dd>{selectedNode.dependsOn.length > 0 ? selectedNode.dependsOn.join(', ') : '—'}</dd>
            </div>
            <div>
              <dt>manifest</dt>
              <dd>{selectedNode.hasManifest ? 'component.md' : 'none (derived from items)'}</dd>
            </div>
            {selectedNode.contracts.length > 0 ? (
              <div>
                <dt>contracts (as producer)</dt>
                <dd>
                  <ul className="map-detail__contracts">
                    {selectedNode.contracts.map((c) => (
                      <li key={c.item}>
                        <span className={`map-binding map-binding--${c.status}`} title={c.status} />
                        {c.item} → {c.consumer}
                        <span className="map-binding-status">{c.status}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      ) : null}
    </div>
  );
}
