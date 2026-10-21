import { useMemo, useState } from "react";
import { nodeMap, selectView, useLive } from "../../store/live";
import { Equipment } from "./EquipmentLayer";
import { Links } from "./Links";
import { VIEW } from "./geometry";

/** Pure-SVG plant: tanks fill with the physical level, pipes flow, pumps spin. */
export function TwinView() {
  const [zoom, setZoom] = useState(1);
  const latest = useLive(selectView);
  const topology = useLive((s) => s.topology);
  const liveHealth = useLive((s) => s.cursor === null ? s.liveHealth : null);
  const nodes = useMemo(() => new Map((latest?.nodes ?? []).map((n) => [n.id, n])), [latest]);
  const topo = useMemo(() => nodeMap(topology), [topology]);
  const ageByNode = useMemo(
    () => new Map((liveHealth ?? []).map((h) => [h.node_id, h.age_ms])),
    [liveHealth],
  );
  const isHazard = Boolean(
    latest?.incident &&
    latest.incident.status !== "closed" &&
    latest.incident.status !== "contained"
  );

  if (!latest) return null;
  return (
    <div className="flex h-full min-h-0 flex-col"><div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted"><span className="mr-auto">Equipment and process flow · select a tag for evidence</span><button aria-label="Zoom out twin" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - .25))} className="rounded border border-border px-2 py-1 disabled:opacity-40">−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in twin" disabled={zoom >= 2.5} onClick={() => setZoom(Math.min(2.5, zoom + .25))} className="rounded border border-border px-2 py-1 disabled:opacity-40">+</button><button onClick={() => setZoom(1)} className="rounded border border-border px-2 py-1">Fit</button></div>
    <div role="region" aria-label="Scrollable plant diagram" tabIndex={0} className={`relative min-h-0 flex-1 overflow-auto rounded-md ${isHazard ? "ring-1 ring-origin/40" : ""}`}>
      <span className="absolute left-3 top-2 z-10 rounded bg-surface px-2 py-1 text-xs text-muted sm:hidden">Zoom in or select an asset above</span>
      <svg
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
        <Equipment nodes={nodes} topo={topo} ageByNode={ageByNode} />
      </svg>
    </div></div>
  );
}
