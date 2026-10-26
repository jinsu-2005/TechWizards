import { Background, Controls, MarkerType, MiniMap, ReactFlow, type ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Pause, Play } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState, useEffect, useRef } from "react";
import { selectView, useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { edgeDelay, edgeId, layoutEdges, visibleEdges } from "./edges";
import { groupLayout, layerLayout } from "./layout";
import { PlantNodeView, PulseEdgeView, StageNodeView, type GraphNode, type PlantNode, type PulseEdgeT } from "./GraphParts";
import { useTheme } from "../../store/theme";
import { filterAssets, graphLinks, reachable, type FocusDirection } from "./filter";

import { PROCESS_LABELS, processGroup, pulsePhase } from "./presentation";

const nodeTypes = { plant: PlantNodeView, stage: StageNodeView };
const edgeTypes = { pulse: PulseEdgeView };
const STAGES: Record<string, string> = { LIT101: "1 Intake", MV101: "1 Intake", P101: "1 Intake", PLC1: "1 Intake", FIT201: "2 Filtration", PIT301: "3 Dispatch", LIT301: "3 Dispatch", P301: "3 Dispatch", PLC2: "3 Dispatch" };
const field = "rounded border border-border bg-bg px-2 py-1.5 text-xs text-text";

export function GraphView() {
  const theme = useTheme((s) => s.theme);
  const topology = useLive((s) => s.topology);
  const view = useLive(selectView);
  const liveHealth = useLive((s) => s.cursor === null ? s.liveHealth : null);
  const selected = useUi((s) => s.selectedAsset);
  const select = useUi((s) => s.selectAsset);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [zoom, setZoom] = useState(1);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [process, setProcess] = useState("all");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [flagged, setFlagged] = useState(false);
  const [learned, setLearned] = useState(view?.mode === "hai");
  const [propagation, setPropagation] = useState(true);
  const [direction, setDirection] = useState<FocusDirection>("all");
  const flow = useRef<ReactFlowInstance<GraphNode, PulseEdgeT> | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const autoFit = useRef(true);
  const motionDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200;
  const sourceEdges = useMemo(() => visibleEdges(topology?.edges ?? []).filter((e) => learned || e.kind !== "learned"), [topology, learned]);
  const neighborhood = useMemo(() => reachable(selected, sourceEdges, direction), [selected, sourceEdges, direction]);
  const ids = useMemo(() => filterAssets((topology?.nodes ?? []).filter((n) => process === "all" || processGroup(n.id) === process), view?.nodes ?? [], query, kind, flagged, neighborhood), [topology, view, query, kind, flagged, neighborhood, process]);
  const positions = useMemo(() => {
    if (!topology) return {};
    if (view?.mode === "hai" && process !== "all") {
      const shown = topology.nodes.filter((n) => ids.has(n.id)).map((n) => n.id);
      const columns = Math.max(1, Math.floor((canvasWidth - 40) / 230));
      return groupLayout(shown, () => process, Math.min(5, Math.max(1, Math.ceil(shown.length / columns))), 230, 110, 80);
    }
    return topology.nodes.every((n) => n.id in STAGES)
      ? groupLayout(topology.nodes.map((n) => n.id), (id) => STAGES[id] ?? "Other", canvasWidth >= 600 && canvasHeight < 360 ? 2 : 4, 188, 100, 82)
      : topology.edges.some((e) => e.kind === "static")
        ? layerLayout(topology.nodes.map((n) => n.id), layoutEdges(topology.edges), 210, 108)
        : groupLayout(topology.nodes.map((n) => n.id), undefined, 8, 190, 90);
  }, [topology, view?.mode, process, ids, canvasWidth, canvasHeight]);
  const nodes = useMemo<PlantNode[]>(() => {
    const values = new Map(view?.nodes.map((n) => [n.id, n]));
    return (topology?.nodes ?? []).filter((n) => ids.has(n.id)).map((n) => {
      const reading = values.get(n.id);
      return { id: n.id, type: "plant", position: positions[n.id] ?? { x: 0, y: 0 }, selected: selected === n.id,
        data: { id: n.id, kind: n.type, label: n.label, stage: STAGES[n.id], value: reading?.value ?? null,
          status: reading?.status ?? "normal", quality: reading?.quality, ageMs: liveHealth?.find((h) => h.node_id === n.id)?.age_ms },
        draggable: false, selectable: true };
    });
  }, [topology, view, ids, positions, selected, liveHealth]);
  const framedNodes = useMemo<GraphNode[]>(() => {
    const groups = new Map<string, PlantNode[]>();
    for (const node of nodes) {
      const key = STAGES[node.id] ?? processGroup(node.id);
      groups.set(key, [...(groups.get(key) ?? []), node]);
    }
    return [...[...groups].map(([key, items]) => {
      const x = Math.min(...items.map((n) => n.position.x)) - 20;
      const y = Math.min(...items.map((n) => n.position.y)) - 54;
      const width = Math.max(...items.map((n) => n.position.x)) + 184 - x;
      const height = Math.max(...items.map((n) => n.position.y)) + 102 - y;
      return { id: `stage:${key}`, type: "stage" as const, position: { x, y }, data: { title: PROCESS_LABELS[key] ?? key, count: items.length },
        style: { width, height, pointerEvents: "none" as const }, zIndex: -1, selectable: false, draggable: false, focusable: false };
    }), ...nodes];
  }, [nodes]);
  const incident = view?.incident;
  const maxDelay = Math.max(1, ...(incident?.path_edges.map(([src, dst]) => edgeDelay(src, dst, incident) ?? 0) ?? []));
  const edges = useMemo<PulseEdgeT[]>(() => graphLinks(sourceEdges, topology?.edges ?? [], incident, propagation).filter((e) => ids.has(e.src) && ids.has(e.dst)).map((e) => {
    const delay = propagation ? edgeDelay(e.src, e.dst, incident) : null;
    return { id: edgeId(e), source: e.src, target: e.dst, type: "pulse",
      data: { learned: e.kind === "learned", delay, onset: incident?.path.find((step) => step.id === e.src)?.t, phase: pulsePhase(delay, maxDelay), cycle: 7 / speed, dimmed: !!selected && e.src !== selected && e.dst !== selected && delay === null, uncertain: e.uncertain, feedback: (positions[e.dst]?.x ?? 0) <= (positions[e.src]?.x ?? 0) },
      markerEnd: e.uncertain ? undefined : { type: MarkerType.ArrowClosed, width: 14, height: 14, color: delay === null ? "var(--muted)" : "var(--origin)" }, selectable: false };
  }), [sourceEdges, topology, ids, incident, propagation, positions, maxDelay, speed, selected]);
  const visibleKey = [...ids].map((id) => `${id}:${positions[id]?.x}:${positions[id]?.y}`).join("|");
  const readable = () => {
    autoFit.current = false;
    const anchor = nodes.find((n) => n.id === selected) ?? nodes[0];
    if (anchor) void flow.current?.setCenter(anchor.position.x + 82, anchor.position.y + 41, { zoom: 1, duration: motionDuration });
  };
  useEffect(() => {
    autoFit.current = true;
    let timer: ReturnType<typeof setTimeout>;
    const fit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
      // Start with the entire topology visible; the explicit 100% action provides inspection scale.
      if (autoFit.current) void flow.current?.fitView({ padding: .15, minZoom: .08, maxZoom: 1, duration: motionDuration });
      }, 80);
    };
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      const height = entries[0]?.contentRect.height;
      if (width) setCanvasWidth(Math.round(width));
      if (height) setCanvasHeight(Math.round(height));
      fit();
    });
    if (canvas.current) observer.observe(canvas.current);
    fit();
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [visibleKey, motionDuration]);
  return <div className={`process-graph flex h-full min-h-0 w-full flex-col ${paused ? "graph-paused" : ""}`} style={{ "--graph-cycle": `${7 / speed}s` } as CSSProperties} aria-label="Process graph">
    <div className="graph-toolbar flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface p-2">
      <input className={`${field} min-w-0 w-32 flex-1`} aria-label="Search graph assets" placeholder="Search assets…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {view?.mode === "hai" && <select aria-label="HAI process" className={`${field} min-w-0 max-w-[180px]`} value={process} onChange={(e) => setProcess(e.target.value)}><option value="all">All processes</option>{Object.entries(PROCESS_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>}
      <details className="graph-options">
        <summary className="cursor-pointer text-xs text-muted">Filters &amp; motion <span className="ml-1 font-mono text-text">{nodes.length}/{topology?.nodes.length ?? 0} assets</span></summary>
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <select aria-label="Asset type" className={field} value={kind} onChange={(e) => setKind(e.target.value)}><option value="all">All types</option><option value="sensor">Sensors</option><option value="controller">Controllers</option><option value="actuator">Actuators</option></select>
          <select aria-label="Graph direction" className={`${field} max-w-full`} value={direction} disabled={!selected} onChange={(e) => setDirection(e.target.value as FocusDirection)}><option value="all">Whole process</option><option value="upstream">Upstream of selection</option><option value="downstream">Downstream of selection</option></select>
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />Flagged</label>
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={learned} onChange={(e) => setLearned(e.target.checked)} />Learned links</label>
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={propagation} onChange={(e) => setPropagation(e.target.checked)} />Inferred path</label>
          <button className={`${field} flex items-center gap-1.5`} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}{paused ? "Resume motion" : "Pause motion"}</button>
          <select aria-label="Graph animation speed" className={field} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}><option value={.5}>Motion 0.5×</option><option value={1}>Motion 1×</option><option value={2}>Motion 2×</option></select>
          <p className="w-full text-[11px] leading-relaxed text-muted">Solid: configured topology. Dashed: learned association. Red: inferred effects. Amber without arrows: uncertain direction. Motion illustrates order, not measured packet timing.</p>
        </div>
      </details>
      {(query || kind !== "all" || flagged || direction !== "all" || process !== "all") && <button className={field} onClick={() => { setQuery(""); setKind("all"); setFlagged(false); setDirection("all"); setProcess("all"); }}>Reset filters</button>}
      {/* Zoom sits on the filter row rather than a row of its own: a second full-width bar cost
          the canvas about forty pixels of height on every screen. */}
      <div className="ml-auto flex shrink-0 items-center gap-1" aria-label="Graph zoom controls">
        <output className="min-w-10 px-1 text-center font-mono text-xs" aria-label="Graph zoom level">{Math.round(zoom * 100)}%</output>
        <button className={field} onClick={readable} title="Center on the selected or first asset at readable scale">100%</button>
        <button className={field} onClick={() => { autoFit.current = true; void flow.current?.fitView({ padding: .15, minZoom: .08, maxZoom: 1, duration: motionDuration }); }}>Overview</button>
      </div>
    </div>
    <div ref={canvas} className="graph-viewport relative min-h-0 flex-1">
      {nodes.length === 0 && <div role="status" className="absolute inset-0 z-10 flex items-center justify-center bg-bg/90 p-4 text-sm text-muted">No assets match these filters.</div>}
      <span className="pointer-events-none absolute bottom-2 left-12 z-10 rounded bg-surface/90 px-2 py-1 text-[11px] text-muted">{zoom < .65 ? "Overview · choose 100% to read labels" : "Drag to explore · pinch to zoom"}</span>
      <ReactFlow nodes={framedNodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onInit={(instance) => { flow.current = instance; }} onMoveEnd={(_, viewport) => setZoom(viewport.zoom)} onNodeClick={(_, n) => { if (n.type === "plant") select(n.id); }}
        onMoveStart={(event) => { if (event) autoFit.current = false; }}
        onNodeDoubleClick={(_, n) => n.type === "plant" && void flow.current?.fitView({ nodes: [{ id: n.id }], maxZoom: 1.4, duration: 300 })}
        colorMode={theme === "titanium-clean" ? "light" : "dark"} fitView fitViewOptions={{ padding: .15, minZoom: .08, maxZoom: 1 }} minZoom={.08} maxZoom={2}
        nodesDraggable={false} nodesConnectable={false} zoomOnPinch zoomOnScroll={false} preventScrolling={false}>
        <Background color="var(--border)" gap={24} />
        <Controls showInteractive={false} position="bottom-left" />
        {nodes.length > 12 && <MiniMap pannable zoomable nodeColor={(n) => n.type === "stage" ? "transparent" : "var(--muted)"} maskColor="rgb(var(--bg-rgb) / .75)" style={{ background: "var(--surface)" }} />}
      </ReactFlow>
    </div>
  </div>;
}
