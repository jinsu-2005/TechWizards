import { clamp01 } from "../../lib/format";
import type { NodeStatus } from "../../lib/types";
import { TEXT, spinDuration, type Pt } from "./geometry";
import { STATUS_COLOR } from "./status";

interface TankProps {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Physical level, %. */
  level: number;
  /** Level as reported to SCADA, %; drawn as a tick so spoofing is visible. */
  reported: number;
  status: NodeStatus;
}

export function Tank({ label, x, y, w, h, level, reported, status }: TankProps) {
  const fillH = (clamp01(level / 100) * h) | 0;
  const extreme = level >= 90 || level <= 10;
  const rep = y + h - clamp01(reported / 100) * h;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="var(--bg)" stroke="var(--border)" strokeWidth={2} />
      <rect
        x={x + 2}
        y={y + h - fillH}
        width={w - 4}
        height={fillH}
        rx={4}
        fill={extreme ? "var(--affected)" : "var(--accent)"}
        fillOpacity={0.4}
        style={{ transition: "all 500ms linear" }}
      />
      <line
        x1={x - 6}
        x2={x + w + 6}
        y1={rep}
        y2={rep}
        stroke={STATUS_COLOR[status]}
        strokeWidth={2}
        strokeDasharray="4 3"
        style={{ transition: "all 500ms linear" }}
      >
        <title>{`${label} reported ${reported.toFixed(1)}%`}</title>
      </line>
      <text x={x + 8} y={y + 20} className="fill-muted font-mono" fontSize={TEXT}>
        {label}
      </text>
    </g>
  );
}

interface PumpProps {
  at: Pt;
  /** Physical speed 0..1. */
  speed: number;
  status: NodeStatus;
}

export function Pump({ at, speed, status }: PumpProps) {
  const dur = spinDuration(speed);
  return (
    <g>
      <circle cx={at.x} cy={at.y} r={26} fill="var(--bg)" stroke={STATUS_COLOR[status]} strokeWidth={status === "normal" ? 1 : 2} />
      <g
        className={dur === null ? "" : "spin"}
        style={{ transformOrigin: `${at.x}px ${at.y}px`, animationDuration: dur === null ? undefined : `${dur}s` }}
      >
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            d={`M${at.x} ${at.y} L${at.x} ${at.y - 18}`}
            stroke="var(--muted)"
            strokeWidth={4}
            strokeLinecap="round"
            transform={`rotate(${a} ${at.x} ${at.y})`}
          />
        ))}
      </g>
      <circle cx={at.x} cy={at.y} r={4} fill="var(--muted)" />
    </g>
  );
}

interface ValveProps {
  at: Pt;
  /** Physical opening 0..1. */
  open: number;
  status: NodeStatus;
}

export function Valve({ at, open, status }: ValveProps) {
  const { x, y } = at;
  return (
    <g>
      <polygon
        points={`${x - 16},${y - 14} ${x + 16},${y + 14} ${x + 16},${y - 14} ${x - 16},${y + 14}`}
        fill="var(--accent)"
        fillOpacity={0.15 + 0.6 * clamp01(open)}
        stroke={STATUS_COLOR[status]}
        strokeWidth={status === "normal" ? 1 : 2}
        style={{ transition: "fill-opacity 500ms linear" }}
      />
    </g>
  );
}
