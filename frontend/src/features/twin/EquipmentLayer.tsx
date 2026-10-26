import type { NodeState, TopologyNode } from "../../lib/types";
import { NOMINAL_SETPOINT, type NodeAttack } from "./attack";
import { TargetLock } from "./AttackMarks";
import { Pump, Tank, Valve } from "./Equipment";
import { ANCHOR, FILTER, TANKS, anchorOf } from "./geometry";
import { NodeBadge } from "./NodeBadge";

interface Props {
  nodes: ReadonlyMap<string, NodeState>;
  topo: ReadonlyMap<string, TopologyNode>;
  onFocusFilter?: () => void;
  /** LIVE only: node_id -> age of its last reading, for the quality tooltip. */
  ageByNode?: ReadonlyMap<string, number | null>;
  /** node_id -> what an active attack is doing to it, for the twin's attack overlay. */
  attacks?: ReadonlyMap<string, NodeAttack>;
  /** Controller setpoints as held right now (SIM only). */
  setpoints?: Record<string, number> | null;
  /** node_id -> physical value when the open incident was raised. */
  atDetection?: ReadonlyMap<string, NodeState>;
  /** A test just accepted for this node, drawn before any telemetry could have moved. */
  pending?: { target: string; direction: "up" | "down" | "hold" | "none" } | null;
}

const truth = (n: NodeState | undefined): number => n?.truth ?? n?.value ?? 0;

export function Equipment({ nodes, topo, ageByNode, attacks, setpoints, atDetection, pending, onFocusFilter }: Props) {
  const get = (id: string) => nodes.get(id);
  const atk = (id: string) => attacks?.get(id);
  // A level sensor and the controller that reads it share a tank, so a rogue setpoint on the
  // controller has to show on the tank it moves.
  const tankAttack = (sensor: string, controller: string) => atk(sensor) ?? atk(controller);
  const startLevel = (id: string) => {
    const n = atDetection?.get(id);
    const v = n?.truth ?? n?.value;
    return v === undefined || v === null ? null : v;
  };
  const lit101 = get("LIT101");
  const lit301 = get("LIT301");
  const mv = get("MV101");
  const p101 = get("P101");
  const p301 = get("P301");
  const fit201 = get("FIT201");
  const flowVal = truth(fit201);
  const isFiltering = flowVal > 0.1;
  const turbineDur = isFiltering ? `${Math.max(0.6, 3.5 - (flowVal / 12) * 2.8).toFixed(2)}s` : undefined;
  return (
    <g>
      {lit101 && (
        <Tank
          label="T1"
          {...TANKS.T1}
          level={truth(lit101)}
          reported={lit101.value}
          status={lit101.status}
          attack={tankAttack("LIT101", "PLC1")}
          setpoint={setpoints?.PLC1 ?? null}
          nominalSetpoint={NOMINAL_SETPOINT.PLC1}
          levelAtDetection={startLevel("LIT101")}
        />
      )}
      {lit301 && (
        <Tank
          label="T2"
          {...TANKS.T2}
          level={truth(lit301)}
          reported={lit301.value}
          status={lit301.status}
          attack={tankAttack("LIT301", "PLC2")}
          setpoint={setpoints?.PLC2 ?? null}
          nominalSetpoint={NOMINAL_SETPOINT.PLC2}
          levelAtDetection={startLevel("LIT301")}
        />
      )}
      {/* Industrial Multimedia Pressure Vessel Filter */}
      <defs>
        <linearGradient id="vessel-body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity={0.95} />
          <stop offset="30%" stopColor="var(--border)" stopOpacity={0.4} />
          <stop offset="70%" stopColor="var(--surface)" stopOpacity={0.9} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity={0.95} />
        </linearGradient>
        <linearGradient id="media-bed-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity={0.25} />
          <stop offset="40%" stopColor="#0d9488" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#0369a1" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      {/* Structural Support Legs */}
      <rect x={FILTER.x + 14} y={FILTER.y + FILTER.h - 4} width={8} height={12} rx={1.5} fill="var(--border)" />
      <rect x={FILTER.x + FILTER.w - 22} y={FILTER.y + FILTER.h - 4} width={8} height={12} rx={1.5} fill="var(--border)" />

      {/* Main Cylindrical Shell */}
      <rect
        x={FILTER.x}
        y={FILTER.y + 12}
        width={FILTER.w}
        height={FILTER.h - 24}
        rx={6}
        fill="url(#vessel-body-grad)"
        stroke="var(--border)"
        strokeWidth={1.5}
        className="shadow-lg"
      />

      {/* Top Elliptical Head (Domed Cap) */}
      <ellipse
        cx={FILTER.x + FILTER.w / 2}
        cy={FILTER.y + 12}
        rx={FILTER.w / 2}
        ry={12}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      {/* Top Air Relief Valve & Manway */}
      <rect x={FILTER.x + FILTER.w / 2 - 6} y={FILTER.y - 4} width={12} height={8} rx={2} fill="var(--border)" />
      <circle cx={FILTER.x + FILTER.w / 2} cy={FILTER.y - 4} r={3} fill="var(--accent)" fillOpacity={0.8} />

      {/* Bottom Elliptical Head (Domed Base) */}
      <ellipse
        cx={FILTER.x + FILTER.w / 2}
        cy={FILTER.y + FILTER.h - 12}
        rx={FILTER.w / 2}
        ry={12}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />

      {/* Internal Multi-Layer Filtration Media Bed */}
      <rect
        x={FILTER.x + 4}
        y={FILTER.y + 20}
        width={FILTER.w - 8}
        height={FILTER.h - 40}
        rx={4}
        fill="url(#media-bed-grad)"
        stroke="var(--border)"
        strokeWidth={0.8}
        strokeDasharray="2 3"
      />

      {/* Media Bed Stratification Lines */}
      <line x1={FILTER.x + 6} y1={FILTER.y + 36} x2={FILTER.x + FILTER.w - 6} y2={FILTER.y + 36} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="3 3" />
      <line x1={FILTER.x + 6} y1={FILTER.y + 54} x2={FILTER.x + FILTER.w - 6} y2={FILTER.y + 54} stroke="var(--border)" strokeWidth={0.8} strokeDasharray="3 3" />

      {/* Inner Inspection Sightglass & Flow Turbine */}
      <circle
        cx={FILTER.x + FILTER.w / 2}
        cy={FILTER.y + 44}
        r={17}
        fill="var(--bg)"
        fillOpacity={0.85}
        stroke="var(--accent)"
        strokeWidth={1.2}
      />
      <g
        className={isFiltering ? "spin" : ""}
        style={{
          transformOrigin: `${FILTER.x + FILTER.w / 2}px ${FILTER.y + 44}px`,
          animationDuration: turbineDur,
        }}
      >
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            d={`M${FILTER.x + FILTER.w / 2} ${FILTER.y + 44} Q${FILTER.x + FILTER.w / 2 + 5} ${FILTER.y + 37} ${FILTER.x + FILTER.w / 2} ${FILTER.y + 30}`}
            stroke="var(--accent)"
            strokeOpacity={isFiltering ? 0.9 : 0.4}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(${deg} ${FILTER.x + FILTER.w / 2} ${FILTER.y + 44})`}
          />
        ))}
      </g>
      <circle cx={FILTER.x + FILTER.w / 2} cy={FILTER.y + 44} r={3.5} fill={isFiltering ? "var(--accent)" : "var(--muted)"} />

      {/* Differential Pressure Tag Pill */}
      <rect
        x={FILTER.x + 8}
        y={FILTER.y + FILTER.h - 26}
        width={FILTER.w - 16}
        height={16}
        rx={3}
        fill="var(--surface)"
        fillOpacity={0.9}
        stroke="var(--border)"
        strokeWidth={0.8}
      />
      <text
        x={FILTER.x + FILTER.w / 2}
        y={FILTER.y + FILTER.h - 15}
        textAnchor="middle"
        className="fill-text font-mono font-semibold"
        fontSize={9}
      >
        {isFiltering ? `FIL-01 · ${flowVal.toFixed(1)} L/s` : "FIL-01 · STANDBY"}
      </text>
      {onFocusFilter && <g
        role="button"
        tabIndex={0}
        aria-label="Zoom to FIL-01 filter"
        className="twin-filter-target"
        onClick={onFocusFilter}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onFocusFilter();
          }
        }}
      >
        <title>Zoom to FIL-01 filter</title>
        <rect className="twin-filter-outline" x={FILTER.x - 2} y={FILTER.y - 6}
          width={FILTER.w + 4} height={FILTER.h + 12} rx={10} fill="transparent"
          stroke="var(--accent)" strokeWidth={2} />
      </g>}
      {mv && <Valve at={ANCHOR.MV101} open={truth(mv)} status={mv.status} attack={atk("MV101")} />}
      {p101 && <Pump at={ANCHOR.P101} speed={truth(p101)} status={p101.status} attack={atk("P101")} />}
      {p301 && <Pump at={ANCHOR.P301} speed={truth(p301)} status={p301.status} attack={atk("P301")} />}
      {(() => {
        const at = pending ? anchorOf(pending.target) : undefined;
        return at && pending ? <TargetLock x={at.x} y={at.y} direction={pending.direction} /> : null;
      })()}
      {[...nodes.values()].map((n) => {
        const a = anchorOf(n.id);
        if (!a) return null;
        const below = n.id === "MV101" || n.id === "P101" || n.id === "P301";
        const at = below ? { x: a.x, y: a.y + (n.id === "MV101" ? 44 : 56) } : a;
        return (
          <NodeBadge
            key={n.id}
            node={n}
            at={at}
            topo={topo.get(n.id)}
            ageMs={ageByNode?.get(n.id)}
          />
        );
      })}
    </g>
  );
}
