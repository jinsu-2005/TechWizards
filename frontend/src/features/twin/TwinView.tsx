import { ChevronDown, ChevronUp, Hand, ScanSearch } from "lucide-react";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { nodeMap, selectView, useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { useAttackRun } from "../../store/attackRun";
import { describeAttack } from "../../lib/briefing";
import { attacksByNode, stateAtDetection } from "./attack";
import { Equipment } from "./EquipmentLayer";
import { Links } from "./Links";
import { FILTER, VIEW } from "./geometry";

export interface TwinViewProps {
  hideToolbar?: boolean;
  hideHint?: boolean;
}

/** Pure-SVG plant: tanks fill with the physical level, pipes flow, pumps spin. */
export function TwinView({ hideToolbar = false, hideHint = false }: TwinViewProps = {}) {
  const [zoom, setZoom] = useState(1);
  const [panEnabled, setPanEnabled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null);
  const latest = useLive(selectView);
  const buffer = useLive((s) => s.buffer);
  const topology = useLive((s) => s.topology);
  const liveHealth = useLive((s) => s.cursor === null ? s.liveHealth : null);
  const nodes = useMemo(() => new Map((latest?.nodes ?? []).map((n) => [n.id, n])), [latest]);
  const topo = useMemo(() => nodeMap(topology), [topology]);
  const ageByNode = useMemo(
    () => new Map((liveHealth ?? []).map((h) => [h.node_id, h.age_ms])),
    [liveHealth],
  );
  const attacks = useMemo(() => attacksByNode(latest, topo, buffer), [latest, topo, buffer]);
  // The instant a test is accepted the twin points at the component, before the plant moves.
  const run = useAttackRun((s) => s.run);
  const runPhase = useAttackRun((s) => s.phase);
  const pending = useMemo(() => {
    if (!run || (runPhase !== "accepted" && runPhase !== "active")) return null;
    if (attacks.has(run.target)) return null; // the real attack mark has taken over
    return {
      target: run.target,
      direction: describeAttack(run.scenario, run.target, run.magnitude, topo.get(run.target)).direction,
    };
  }, [run, runPhase, attacks, topo]);
  const incidentId = latest?.incident && latest.incident.status !== "closed" ? latest.incident.id : null;
  const atDetection = useMemo(() => stateAtDetection(buffer, incidentId), [buffer, incidentId]);
  const isHazard = Boolean(
    latest?.incident &&
    latest.incident.status !== "closed" &&
    latest.incident.status !== "contained"
  );
  const toolbarCollapsed = useUi((s) => s.twinToolbarCollapsed);
  const toggleTwinToolbar = useUi((s) => s.toggleTwinToolbar);

  const setTwinZoom = (next: number) => {
    const value = Math.min(2.5, Math.max(1, next));
    setZoom(value);
    if (value === 1) {
      setPanEnabled(false);
      viewport.current?.scrollTo({ left: 0, top: 0 });
    }
  };

  const focusFilter = () => {
    setZoom((current) => Math.max(current, (viewport.current?.clientWidth ?? 900) < 480 ? 2.5 : 2));
    setPanEnabled(true);
    // Wait for the larger SVG to lay out, then center the actual SVG coordinate.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const canvas = viewport.current;
      const drawing = svg.current;
      const matrix = drawing?.getScreenCTM();
      if (!canvas || !drawing || !matrix) return;
      const point = drawing.createSVGPoint();
      point.x = FILTER.x + FILTER.w / 2;
      point.y = FILTER.y + FILTER.h / 2;
      const screen = point.matrixTransform(matrix);
      const rect = canvas.getBoundingClientRect();
      canvas.scrollBy({
        left: screen.x - rect.left - rect.width / 2,
        top: screen.y - rect.top - rect.height / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }));
  };

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panEnabled || zoom <= 1 || event.button !== 0) return;
    const canvas = event.currentTarget;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: canvas.scrollLeft, top: canvas.scrollTop };
    canvas.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  };
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = drag.current;
    if (!origin || origin.id !== event.pointerId) return;
    event.currentTarget.scrollTo({ left: origin.left - (event.clientX - origin.x), top: origin.top - (event.clientY - origin.y) });
  };
  const stopPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  if (!latest) return null;
  return (
    <div className="flex h-full min-h-0 flex-col">
      {!hideToolbar && !toolbarCollapsed && (
        <div className="twin-toolbar flex flex-wrap items-center gap-2 border-b border-border px-3 py-1.5 text-xs text-muted">
          <span className="mr-auto truncate">Equipment and process flow · select a tag for evidence</span>
          <div className="flex items-center gap-1">
            <button aria-label="Zoom out twin" disabled={zoom <= 1} onClick={() => setTwinZoom(zoom - .25)} className="twin-tool-button" title="Zoom out">−</button>
            <output aria-label="Twin zoom level" className="min-w-10 text-center font-mono text-text">{Math.round(zoom * 100)}%</output>
            <button aria-label="Zoom in twin" disabled={zoom >= 2.5} onClick={() => setTwinZoom(zoom + .25)} className="twin-tool-button" title="Zoom in">+</button>
            <button type="button" aria-label="Pan zoomed twin" aria-pressed={panEnabled} disabled={zoom <= 1} onClick={() => setPanEnabled(!panEnabled)} className="twin-tool-button" title="Hand tool · drag to move"><Hand size={15} aria-hidden /></button>
            <button type="button" aria-label="Zoom to FIL-01 filter" onClick={focusFilter} className="twin-tool-button twin-filter-control" title="Zoom to FIL-01 filter"><ScanSearch size={15} aria-hidden /><span>FIL-01</span></button>
            <button onClick={() => setTwinZoom(1)} className="twin-tool-button twin-fit-button" title="Fit to view">Fit</button>
          </div>
          <button
            type="button"
            aria-label="Collapse toolbar"
            aria-expanded={!toolbarCollapsed}
            onClick={toggleTwinToolbar}
            className="twin-tool-button text-muted hover:text-text ml-0.5"
            title="Hide toolbar (^)"
          >
            <ChevronUp size={15} aria-hidden />
          </button>
        </div>
      )}
      <div ref={viewport} role="region" aria-label="Scrollable plant diagram; use arrow keys to move when zoomed" tabIndex={0}
        onKeyDown={(event) => {
          if (zoom <= 1 || event.target !== event.currentTarget) return;
          const offsets: Record<string, [number, number]> = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] };
          const offset = offsets[event.key];
          if (offset) { event.preventDefault(); event.currentTarget.scrollBy({ left: offset[0], top: offset[1] }); }
        }}
        onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan}
        className={`twin-viewport relative min-h-0 flex-1 overflow-auto rounded-md ${panEnabled ? "twin-pan-enabled" : ""} ${dragging ? "twin-dragging" : ""} ${isHazard ? "ring-1 ring-origin/40" : ""}`}>
        <div className="pointer-events-none sticky left-3 top-2 z-10 flex items-center justify-between pr-4 h-0">
          {!hideHint && (
            <span className="twin-hint inline-block rounded bg-surface/90 px-2 py-1 text-xs text-muted">
              {panEnabled ? "Drag to move · arrow keys also work" : zoom > 1 ? "Select the hand to move the view" : "Select FIL-01 to zoom into the filter"}
            </span>
          )}
          {!hideToolbar && toolbarCollapsed && (
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-border/80 bg-surface/95 px-2 py-1 shadow-md backdrop-blur-sm">
              <button
                type="button"
                aria-label="Zoom out"
                disabled={zoom <= 1}
                onClick={() => setTwinZoom(zoom - .25)}
                className="text-xs px-1 text-muted hover:text-text disabled:opacity-40"
                title="Zoom out"
              >
                −
              </button>
              <span className="font-mono text-xs text-text">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                disabled={zoom >= 2.5}
                onClick={() => setTwinZoom(zoom + .25)}
                className="text-xs px-1 text-muted hover:text-text disabled:opacity-40"
                title="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setTwinZoom(1)}
                disabled={zoom === 1}
                className="rounded border border-border/50 px-1.5 py-0.5 text-xs text-muted hover:text-text disabled:opacity-40"
                title="Fit"
              >
                Fit
              </button>
              <button
                type="button"
                aria-label="Reopen toolbar"
                aria-expanded={false}
                onClick={toggleTwinToolbar}
                className="flex items-center gap-1 rounded bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent hover:bg-accent/25 transition-colors"
                title="Reopen toolbar (v)"
              >
                <span>Controls</span>
                <ChevronDown size={13} aria-hidden />
              </button>
            </div>
          )}
        </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
        role="group"
        aria-label="Plant digital twin"
      >
        <defs>
          <pattern id="plant-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="0.8" fill="var(--border)" fillOpacity="0.4" />
          </pattern>
        </defs>

        {/* Plant Floor Layout Grid */}
        <rect width={VIEW.w} height={VIEW.h} fill="url(#plant-grid)" opacity={0.6} />

        {/* Sub-Process Stage Boundary Demarcations */}
        <line x1={320} y1={80} x2={320} y2={370} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 6" strokeOpacity={0.3} />
        <line x1={600} y1={80} x2={600} y2={370} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 6" strokeOpacity={0.3} />

        <g className="select-none pointer-events-none">
          <text x={185} y={422} textAnchor="middle" className="fill-muted font-mono text-[12px] uppercase tracking-wide font-semibold">
            STAGE 1 · RAW INTAKE & STORAGE
          </text>
          <text x={470} y={422} textAnchor="middle" className="fill-muted font-mono text-[12px] uppercase tracking-wide font-semibold">
            STAGE 2 · FILTRATION & DOSING
          </text>
          <text x={765} y={422} textAnchor="middle" className="fill-muted font-mono text-[12px] uppercase tracking-wide font-semibold">
            STAGE 3 · DISINFECTION & DISPATCH
          </text>
        </g>

        <Links nodes={nodes} incident={latest.incident} />
        <Equipment
          nodes={nodes}
          topo={topo}
          ageByNode={ageByNode}
          attacks={attacks}
          setpoints={latest.setpoints}
          atDetection={atDetection}
          pending={pending}
          onFocusFilter={focusFilter}
        />
      </svg>
    </div></div>
  );
}
