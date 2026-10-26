import { Box, Network } from "lucide-react";
import type { Frame, Snapshot } from "./model";
import { useEv } from "./store";
import { EvCanvas } from "./3d/EvCanvas";

// Causal flow: columns are stages (left to right), chassis runs in its own lane.
const COLS = [110, 350, 590, 830, 1070] as const;
const COL_TITLES = ["Sensors", "Controllers", "Actuators", "Effects", "Feedback"];
const positions: Record<string, [number, number]> = {
  PEDAL: [COLS[0], 92], TEMP: [COLS[0], 160], PACK: [COLS[0], 228], CURRENT: [COLS[0], 296], CELL: [COLS[0], 364], SOC: [COLS[0], 432],
  VCU: [COLS[1], 126], CAN: [COLS[1], 228], BMS: [COLS[1], 330],
  INV: [COLS[2], 126], COOL: [COLS[2], 330], DCDC: [COLS[2], 432],
  MOTOR: [COLS[3], 126], FLOW: [COLS[3], 330],
  RPM: [COLS[4], 92], MTEMP: [COLS[4], 160], CTEMP: [COLS[4], 330],
  WHEEL: [COLS[0], 548], BRAKE: [COLS[1], 548], PRESSURE: [COLS[2], 548], ANGLE: [COLS[3], 548], EPS: [COLS[4], 548],
};
const W = 196;
const H = 52;

function edgePath(a: [number, number], b: [number, number]): string {
  if (b[0] > a[0]) {
    const sx = a[0] + W / 2, tx = b[0] - W / 2, mid = (sx + tx) / 2;
    return `M${sx} ${a[1]}C${mid} ${a[1]},${mid} ${b[1]},${tx} ${b[1]}`;
  }
  if (b[0] === a[0]) {
    // Same column: hop along the left edge.
    const sx = a[0] - W / 2, bend = sx - 40;
    return `M${sx} ${a[1]}C${bend} ${a[1]},${bend} ${b[1]},${sx} ${b[1]}`;
  }
  // Feedback loop (coolant temperature back to pack temperature): route under the graph body.
  const sy = a[1] + H / 2, ty = b[1] + H / 2, low = Math.max(sy, ty) + 90;
  return `M${a[0]} ${sy}C${a[0]} ${low},${b[0]} ${low},${b[0]} ${ty}`;
}

export function EvTwin({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const selected = useEv((s) => s.selected);
  const select = useEv((s) => s.select);
  const leader = frame.analysis.candidates[0]?.id;

  // 3D twin or 2D causal schematic; kept in the store so drawers and attacks don't reset it.
  const twinMode = useEv((s) => s.twinMode);
  const setTwinMode = useEv((s) => s.setTwinMode);

  return (
    <div className="ev-twin evs-twin">
      <div className="evs-viewtoggle" role="group" aria-label="Digital Twin View Style">
        <button type="button" className={twinMode === "3d" ? "is-active" : ""} onClick={() => setTwinMode("3d")} title="3D vehicle twin">
          <Box size={13} aria-hidden />
          <span>3D Twin</span>
        </button>
        <button type="button" className={twinMode === "2d" ? "is-active" : ""} onClick={() => setTwinMode("2d")} title="Causal dependency graph">
          <Network size={13} aria-hidden />
          <span>2D Schematic</span>
        </button>
      </div>

      {twinMode === "3d" ? (
        <div className="ev-3d-wrap">
          <EvCanvas snapshot={snapshot} frame={frame} />
        </div>
      ) : (
        <div className="ev-diagram-scroll evs-schematic" tabIndex={0} role="region" aria-label="Scrollable interactive EV diagram">
          <svg viewBox="0 0 1180 600" preserveAspectRatio="xMidYMid meet" role="group" aria-label="EV sensors, controllers and actuators with inferred propagation">
            <defs>
              <marker id="ev-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="var(--origin)" /></marker>
              <marker id="ev-arrow-dim" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#4b6275" /></marker>
            </defs>
            {COL_TITLES.map((t, i) => <text key={t} className="evs-sch-col" x={COLS[i]} y="40" textAnchor="middle">{t}</text>)}
            <rect className="evs-sch-lane" x="8" y="508" width="1164" height="80" rx="14" />
            <text className="evs-sch-lane-label" x="20" y="500">Chassis</text>
            {snapshot.edges.map((e) => {
              const a = positions[e.source];
              const b = positions[e.target];
              if (!a || !b) return null;
              const active = frame.analysis.path.some((p) => p.source === e.source && p.target === e.target);
              return <path key={`${e.source}-${e.target}`} className={`evs-sch-edge${active ? " is-active" : ""}`} d={edgePath(a, b)} markerEnd={active ? "url(#ev-arrow)" : "url(#ev-arrow-dim)"} />;
            })}
            {/* Particle flow: signals travel along every dependency; the inferred attack path runs red and fast. */}
            <g className="evs-sch-flow" aria-hidden>
              {snapshot.edges.map((e) => {
                const a = positions[e.source];
                const b = positions[e.target];
                if (!a || !b) return null;
                const active = frame.analysis.path.some((p) => p.source === e.source && p.target === e.target);
                const d = edgePath(a, b);
                const length = Math.hypot(b[0] - a[0], b[1] - a[1]) + 60;
                const dur = Math.min(6, Math.max(1.4, length / 70)) / (active ? 2.5 : 1);
                const count = active ? 4 : 2;
                return <g key={`${e.source}-${e.target}-${active ? "a" : "n"}`} className={active ? "is-active" : undefined}>
                  {Array.from({ length: count }, (_, i) => (
                    <g key={i}>
                      <circle className="evs-sch-glow" r={active ? 6 : 4.5} />
                      <circle className="evs-sch-dot" r={active ? 2.6 : 2} />
                      <animateMotion dur={`${dur.toFixed(2)}s`} begin={`${(-(dur * i) / count).toFixed(2)}s`} repeatCount="indefinite" path={d} calcMode="paced" />
                    </g>
                  ))}
                </g>;
              })}
            </g>
            {snapshot.components.map((c) => {
              const pos = positions[c.id];
              if (!pos) return null;
              const [x, y] = pos;
              const origin = leader === c.id;
              const affected = frame.analysis.affected.includes(c.id);
              const state = origin ? "origin" : affected ? "affected" : "ok";
              const reading = frame.readings.find((r) => r.id === c.id);
              const left = x - W / 2;
              const top = y - H / 2;
              return (
                <g
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${c.name}`}
                  aria-pressed={selected === c.id}
                  className={`ev-node evs-sch-node is-${state}${selected === c.id ? " is-selected" : ""}`}
                  onClick={() => select(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(c.id);
                    }
                  }}
                >
                  <title>{c.name} · {c.kind} · {origin ? "Leading hypothesis" : affected ? "Anomalous" : "Within reference"}</title>
                  {origin && <rect className="evs-sch-pulse" x={left} y={top} width={W} height={H} rx="12" />}
                  <rect className="evs-sch-card" x={left} y={top} width={W} height={H} rx="12" />
                  <rect className="evs-sch-bar" x={left} y={top + 10} width="3" height={H - 20} rx="1.5" />
                  <text className="evs-sch-id" x={left + 14} y={top + 21}>{c.id}</text>
                  <text className="evs-sch-value" x={left + W - 12} y={top + 21} textAnchor="end">{reading?.value.toFixed(1)} {c.unit}</text>
                  <text className="evs-sch-name" x={left + 14} y={top + 40}>{c.name.length > 24 ? `${c.name.slice(0, 23)}…` : c.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
