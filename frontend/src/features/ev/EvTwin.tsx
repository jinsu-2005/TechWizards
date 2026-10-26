import { useState } from "react";
import { Box, Network, Radio } from "lucide-react";
import type { Frame, Snapshot } from "./model";
import { useEv } from "./store";
import { EvCanvas } from "./3d/EvCanvas";

const positions: Record<string, [number, number]> = {
  WHEEL: [100, 80], BRAKE: [290, 80], PRESSURE: [480, 80], ANGLE: [670, 80], EPS: [860, 80],
  PEDAL: [100, 205], VCU: [290, 205], INV: [480, 205], MOTOR: [670, 205], RPM: [860, 205],
  PACK: [100, 330], CURRENT: [290, 330], BMS: [480, 330], CELL: [670, 330], SOC: [860, 330],
  CAN: [100, 455], COOL: [290, 455], FLOW: [480, 455], CTEMP: [670, 455], TEMP: [860, 455],
  MTEMP: [670, 267], DCDC: [100, 267],
};

export function EvTwin({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const selected = useEv((s) => s.selected);
  const select = useEv((s) => s.select);
  const leader = frame.analysis.candidates[0]?.id;

  // Toggle between 3D Digital Twin and 2D Causal Schematic
  const [twinMode, setTwinMode] = useState<"3d" | "2d">("3d");

  return (
    <div className="ev-twin">
      <div className="ev-twin-caption">
        <div className="ev-twin-title-group">
          <span>
            <Radio size={14} aria-hidden /> EV DIGITAL TWIN
          </span>
          <span className="ev-sub-caption">
            {twinMode === "3d"
              ? "Photorealistic 3D Skateboard Architecture · Interactive Subsystems"
              : "Causal Dependency Graph · Inferred Propagation Topology"}
          </span>
        </div>

        {/* View Switcher: 3D Twin vs 2D Schematic */}
        <div className="ev-twin-view-toggle" role="group" aria-label="Digital Twin View Style">
          <button
            type="button"
            className={twinMode === "3d" ? "is-active" : ""}
            onClick={() => setTwinMode("3d")}
            title="Interactive 3D Vehicle Twin"
          >
            <Box size={13} aria-hidden />
            <span>3D Twin</span>
          </button>
          <button
            type="button"
            className={twinMode === "2d" ? "is-active" : ""}
            onClick={() => setTwinMode("2d")}
            title="2D Causal Dependency Schematic"
          >
            <Network size={13} aria-hidden />
            <span>2D Schematic</span>
          </button>
        </div>
      </div>

      {twinMode === "3d" ? (
        <div className="ev-3d-wrap">
          <EvCanvas snapshot={snapshot} frame={frame} />
          {/* Quick Component Accessible Bar */}
          <div className="ev-accessible-quick-select" role="group" aria-label="Selectable vehicle components">
            {snapshot.components.slice(0, 10).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`ev-quick-btn ${selected === c.id ? "is-selected" : ""}`}
                onClick={() => select(c.id)}
                aria-label={`Inspect ${c.name}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ev-diagram-scroll" tabIndex={0} role="region" aria-label="Scrollable interactive EV diagram">
          <svg viewBox="0 0 960 540" role="group" aria-label="EV sensors, controllers and actuators with inferred propagation">
            <defs>
              <pattern id="ev-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity=".06" />
              </pattern>
              <marker id="ev-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0 0L7 3.5L0 7" fill="var(--ev-accent)" />
              </marker>
            </defs>
            <rect width="960" height="540" fill="url(#ev-grid)" />
            <path
              d="M195 147Q195 117 240 117H730Q770 120 778 170L792 267L778 364Q770 414 730 417H240Q195 417 195 387Z"
              fill="var(--bg)"
              stroke="var(--muted)"
              strokeOpacity=".24"
              strokeWidth="2"
            />
            <rect x="370" y="243" width="226" height="110" rx="12" fill="var(--ev-accent)" fillOpacity=".035" stroke="var(--ev-accent)" strokeOpacity=".15" />
            {snapshot.edges.map((e) => {
              const a = positions[e.source];
              const b = positions[e.target];
              if (!a || !b) return null;
              const active = frame.analysis.path.some((p) => p.source === e.source && p.target === e.target);
              return (
                <path
                  key={`${e.source}-${e.target}`}
                  d={`M${a[0]} ${a[1]}C${a[0]} ${(a[1] + b[1]) / 2},${b[0]} ${(a[1] + b[1]) / 2},${b[0]} ${b[1]}`}
                  stroke={active ? "var(--ev-accent)" : "var(--muted)"}
                  strokeWidth={active ? 2.5 : 1}
                  opacity={active ? 0.85 : 0.16}
                  fill="none"
                  markerEnd={active ? "url(#ev-arrow)" : undefined}
                />
              );
            })}
            {snapshot.components.map((c) => {
              const pos = positions[c.id];
              if (!pos) return null;
              const [x, y] = pos;
              const origin = leader === c.id;
              const affected = frame.analysis.affected.includes(c.id);
              const color = origin ? "var(--origin)" : affected ? "var(--suspect)" : "var(--ev-accent)";
              const reading = frame.readings.find((r) => r.id === c.id);
              return (
                <g
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect ${c.name}`}
                  aria-pressed={selected === c.id}
                  className="ev-node"
                  onClick={() => select(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(c.id);
                    }
                  }}
                >
                  <title>
                    {c.name} · {c.kind} · {origin ? "Leading hypothesis" : affected ? "Anomalous" : "Within reference"}
                  </title>
                  <rect
                    x={x - 67}
                    y={y - 27}
                    width="134"
                    height="54"
                    rx="8"
                    fill="var(--surface)"
                    stroke={color}
                    strokeOpacity={selected === c.id ? 1 : 0.5}
                    strokeWidth={selected === c.id ? 3 : 1}
                  />
                  <text x={x - 54} y={y - 9} fontSize="11" fontWeight="600" fill={color}>
                    {c.id}
                    <tspan x={x + 54} textAnchor="end" fontSize="8" fontWeight="400">
                      {c.kind.toUpperCase()}
                    </tspan>
                  </text>
                  <text x={x - 54} y={y + 7} fontSize="10" fill="var(--text)">
                    {c.name}
                  </text>
                  <text x={x - 54} y={y + 20} fontSize="9" fill="var(--muted)">
                    {reading?.value.toFixed(1)} {c.unit}
                  </text>
                </g>
              );
            })}
            <text x="480" y="523" textAnchor="middle" fill="var(--muted)" fontSize="11">
              Dependency model · inferred paths use observed onset order
            </text>
          </svg>
        </div>
      )}

      <div className="ev-legend">
        <span>
          <i /> Within reference
        </span>
        <span>
          <i className="ev-dot-warning" /> Anomalous
        </span>
        <span>
          <i className="ev-dot-danger" /> Leading hypothesis
        </span>
      </div>
    </div>
  );
}
