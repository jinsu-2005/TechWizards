import { clamp01 } from "../../lib/format";
import type { NodeStatus } from "../../lib/types";
import { spinDuration, type Pt } from "./geometry";
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
  const isT1 = label === "T1";
  const gradId = isT1 ? "tank-fluid-t1" : "tank-fluid-t2";
  const glowId = isT1 ? "tank-glow-t1" : "tank-glow-t2";

  const fillH = Math.max(4, (clamp01(level / 100) * (h - 16)) | 0);
  const extreme = level >= 90 || level <= 10;
  const repY = y + h - 8 - clamp01(reported / 100) * (h - 16);
  const fluidTopY = y + h - 8 - fillH;

  // Measurement graduation ticks at 0%, 25%, 50%, 75%, 100%
  const ticks = [
    { pct: 100, label: "100%" },
    { pct: 75, label: "75%" },
    { pct: 50, label: "50%" },
    { pct: 25, label: "25%" },
    { pct: 0, label: "0%" },
  ];

  return (
    <g className="transition-all duration-300">
      <defs>
        {/* Luminous fluid gradients with depth */}
        <linearGradient id="tank-fluid-t1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
          <stop offset="35%" stopColor="#06b6d4" stopOpacity={0.65} />
          <stop offset="100%" stopColor="#083344" stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id="tank-fluid-t2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.85} />
          <stop offset="35%" stopColor="#f59e0b" stopOpacity={0.65} />
          <stop offset="100%" stopColor="#451a03" stopOpacity={0.9} />
        </linearGradient>
        <linearGradient id="tank-fluid-hazard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
          <stop offset="40%" stopColor="#ef4444" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#450a0a" stopOpacity={0.95} />
        </linearGradient>

        {/* Specular glass reflection sheen */}
        <linearGradient id="tank-glass-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.03} />
          <stop offset="25%" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="45%" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="85%" stopColor="#ffffff" stopOpacity={0.0} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.08} />
        </linearGradient>

        {/* Surface meniscus glow filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Volumetric shadow under tank */}
      <ellipse
        cx={x + w / 2}
        cy={y + h + 4}
        rx={w / 2 - 2}
        ry={6}
        fill="black"
        fillOpacity={0.35}
      />

      {/* Tank Background Chamber */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill="var(--surface)"
        fillOpacity={0.7}
        stroke="var(--border)"
        strokeWidth={1.5}
      />

      {/* Cylindrical Top Header Rim */}
      <rect
        x={x + 4}
        y={y - 4}
        width={w - 8}
        height={7}
        rx={3}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      <circle cx={x + w / 2} cy={y - 4} r={3} fill="var(--border)" />

      {/* Fluid Volume */}
      <g>
        <clipPath id={`clip-${label}`}>
          <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={10} />
        </clipPath>

        <rect
          x={x + 2}
          y={fluidTopY}
          width={w - 4}
          height={fillH}
          rx={6}
          clipPath={`url(#clip-${label})`}
          fill={extreme ? "url(#tank-fluid-hazard)" : `url(#${gradId})`}
          style={{ transition: "y 400ms cubic-bezier(0.4, 0, 0.2, 1), height 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        />

        {/* Glowing fluid meniscus highlight */}
        <line
          x1={x + 4}
          x2={x + w - 4}
          y1={fluidTopY}
          y2={fluidTopY}
          stroke={extreme ? "#f87171" : isT1 ? "#67e8f9" : "#fde047"}
          strokeWidth={2}
          strokeOpacity={0.9}
          filter={`url(#${glowId})`}
          style={{ transition: "y 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </g>

      {/* Specular glass reflection layer across cylinder */}
      <rect
        x={x + 2}
        y={y + 2}
        width={w - 4}
        height={h - 4}
        rx={10}
        fill="url(#tank-glass-sheen)"
        pointerEvents="none"
      />

      {/* Vertical specular sheen streak */}
      <line
        x1={x + 10}
        x2={x + 10}
        y1={y + 12}
        y2={y + h - 12}
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeOpacity={0.16}
        strokeLinecap="round"
        pointerEvents="none"
      />

      {/* Measurement Graduation Ticks */}
      <g className="select-none font-mono text-[8px] fill-muted/70" pointerEvents="none">
        {ticks.map(({ pct, label: tickLabel }) => {
          const tickY = y + h - 8 - (pct / 100) * (h - 16);
          return (
            <g key={pct}>
              <line
                x1={x + w - 12}
                x2={x + w - 4}
                y1={tickY}
                y2={tickY}
                stroke="var(--border)"
                strokeOpacity={0.8}
                strokeWidth={pct % 50 === 0 ? 1.5 : 1}
              />
              {pct % 50 === 0 && (
                <text
                  x={x + w - 15}
                  y={tickY + 2.5}
                  textAnchor="end"
                  fontSize={7}
                  className="fill-muted/70 font-mono"
                >
                  {tickLabel}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Reported level dashed indicator line (what PLC reads) */}
      <g style={{ transition: "all 400ms linear" }}>
        <line
          x1={x - 6}
          x2={x + w + 6}
          y1={repY}
          y2={repY}
          stroke={STATUS_COLOR[status]}
          strokeWidth={2}
          strokeDasharray="4 3"
        >
          <title>{`${label} reported ${reported.toFixed(1)}% (Physical: ${level.toFixed(1)}%)`}</title>
        </line>
        <circle
          cx={x - 6}
          cy={repY}
          r={2.5}
          fill={STATUS_COLOR[status]}
        />
        <circle
          cx={x + w + 6}
          cy={repY}
          r={2.5}
          fill={STATUS_COLOR[status]}
        />
      </g>

      {/* Tank Label Badge */}
      <rect
        x={x + 8}
        y={y + 8}
        width={24}
        height={15}
        rx={3}
        fill="var(--surface)"
        fillOpacity={0.85}
        stroke="var(--border)"
        strokeWidth={1}
      />
      <text
        x={x + 20}
        y={y + 19}
        textAnchor="middle"
        className="fill-text font-mono font-bold"
        fontSize={9}
      >
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
  const color = STATUS_COLOR[status];
  const isSpinning = dur !== null;

  return (
    <g className="transition-all duration-300">
      {/* Outer Industrial Housing Ring */}
      <circle
        cx={at.x}
        cy={at.y}
        r={28}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={2}
        className="shadow-md"
      />

      {/* Active Motor Status Ring */}
      <circle
        cx={at.x}
        cy={at.y}
        r={24}
        fill="var(--bg)"
        fillOpacity={0.8}
        stroke={color}
        strokeWidth={status === "normal" ? 1.5 : 2.5}
        strokeOpacity={isSpinning ? 0.9 : 0.4}
      />

      {/* Aerodynamic Rotating Impeller Vanes */}
      <g
        className={isSpinning ? "spin" : ""}
        style={{
          transformOrigin: `${at.x}px ${at.y}px`,
          animationDuration: isSpinning ? `${dur}s` : undefined,
        }}
      >
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            d={`M${at.x} ${at.y} Q${at.x + 8} ${at.y - 10} ${at.x} ${at.y - 20}`}
            stroke={isSpinning ? "var(--accent)" : "var(--muted)"}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            strokeOpacity={isSpinning ? 0.9 : 0.5}
            transform={`rotate(${angle} ${at.x} ${at.y})`}
          />
        ))}
      </g>

      {/* Center Metallic Hub & Status LED */}
      <circle cx={at.x} cy={at.y} r={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
      <circle
        cx={at.x}
        cy={at.y}
        r={3}
        fill={color}
        className={status === "origin" ? "animate-pulse" : ""}
      />
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
  const color = STATUS_COLOR[status];
  const opening = clamp01(open);
  const strokeBarH = Math.round(opening * 12);
  const isOpen = opening > 0.05;

  return (
    <g className="transition-all duration-300">
      <defs>
        <linearGradient id="actuator-case-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity={0.95} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity={0.9} />
        </linearGradient>
      </defs>

      {/* Pipe Flange Collars (Left & Right) */}
      <rect x={x - 24} y={y - 14} width={5} height={28} rx={1.5} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
      <circle cx={x - 21.5} cy={y - 9} r={1.2} fill="var(--muted)" />
      <circle cx={x - 21.5} cy={y + 9} r={1.2} fill="var(--muted)" />

      <rect x={x + 19} y={y - 14} width={5} height={28} rx={1.5} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
      <circle cx={x + 21.5} cy={y - 9} r={1.2} fill="var(--muted)" />
      <circle cx={x + 21.5} cy={y + 9} r={1.2} fill="var(--muted)" />

      {/* Industrial Cast Valve Body (Opposing Cones) */}
      <polygon
        points={`${x - 19},${y - 13} ${x + 19},${y + 13} ${x + 19},${y - 13} ${x - 19},${y + 13}`}
        fill="var(--surface)"
        stroke={color}
        strokeWidth={status === "normal" ? 1.5 : 2.5}
      />
      {/* Dynamic Fluid Throughput Glow */}
      <polygon
        points={`${x - 16},${y - 11} ${x + 16},${y + 11} ${x + 16},${y - 11} ${x - 16},${y + 11}`}
        fill="var(--accent)"
        fillOpacity={0.12 + 0.68 * opening}
        style={{ transition: "fill-opacity 400ms ease" }}
      />

      {/* Rotating Butterfly Disc Indicator */}
      <ellipse
        cx={x}
        cy={y}
        rx={3}
        ry={11}
        fill="var(--border)"
        stroke={color}
        strokeWidth={1}
        transform={`rotate(${(1 - opening) * 65} ${x} ${y})`}
        style={{ transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      />
      <circle cx={x} cy={y} r={3.5} fill="var(--surface)" stroke={color} strokeWidth={1.5} />

      {/* Heavy-Duty Motorized Actuator Gearbox & Housing */}
      <line x1={x} x2={x} y1={y - 13} y2={y - 23} stroke="var(--border)" strokeWidth={3} />
      {/* Actuator Yoke Frame */}
      <path d={`M ${x - 6} ${y - 16} L ${x + 6} ${y - 16} M ${x - 4} ${y - 20} L ${x + 4} ${y - 20}`} stroke="var(--muted)" strokeWidth={1} />

      {/* Actuator Dome (Electric Motor Housing) */}
      <rect
        x={x - 14}
        y={y - 41}
        width={28}
        height={18}
        rx={4}
        fill="url(#actuator-case-grad)"
        stroke={status === "normal" ? "var(--border)" : color}
        strokeWidth={1.5}
        className="shadow-md"
      />

      {/* Actuator Stroke Level Window */}
      <rect x={x - 10} y={y - 37} width={6} height={12} rx={1} fill="var(--bg)" stroke="var(--border)" strokeWidth={0.8} />
      <rect
        x={x - 9}
        y={y - 25 - strokeBarH}
        width={4}
        height={strokeBarH}
        rx={0.5}
        fill={isOpen ? "var(--accent)" : "var(--muted)"}
        style={{ transition: "height 400ms ease, y 400ms ease" }}
      />

      {/* Actuator Motor Status LED */}
      <circle
        cx={x + 6}
        cy={y - 31}
        r={3}
        fill={color}
        className={status === "origin" ? "animate-pulse" : ""}
      />

      {/* Aperture Readout Pill */}
      <rect x={x - 16} y={y + 17} width={32} height={12} rx={3} fill="var(--surface)" fillOpacity={0.9} stroke="var(--border)" strokeWidth={0.8} />
      <text x={x} y={y + 26} textAnchor="middle" fontSize={7.5} fill="var(--text)" className="font-mono font-bold">
        {(opening * 100).toFixed(0)}%
      </text>
    </g>
  );
}
