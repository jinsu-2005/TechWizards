import type { NodeAttack } from "./attack";

/** Colour each attack kind carries in the twin: tampering is always drawn in the origin hue. */
export const ATTACK_STROKE = "var(--origin)";

interface ChipProps {
  attack: NodeAttack;
  /** Centre of the chip, in view units. */
  x: number;
  y: number;
  /** Chip width; the detail line wraps to this. */
  w?: number;
}

/**
 * Caption pinned to attacked equipment: what is being done to it, and the evidence.
 * Drawn above the equipment so it never covers the value a reader is checking.
 */
export function AttackChip({ attack, x, y, w = 150 }: ChipProps) {
  const h = attack.detail ? 30 : 18;
  return (
    <g className="attack-chip" pointerEvents="none">
      <title>{`${attack.label}${attack.detail ? ` · ${attack.detail}` : ""}`}</title>
      <rect
        x={x - w / 2}
        y={y - h}
        width={w}
        height={h}
        rx={4}
        fill="var(--surface)"
        fillOpacity={0.96}
        stroke={ATTACK_STROKE}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - h + 12}
        textAnchor="middle"
        fontSize={10}
        fill={ATTACK_STROKE}
        className="font-mono font-bold tracking-wider"
      >
        {attack.label}
      </text>
      {attack.detail && (
        <text x={x} y={y - 5} textAnchor="middle" fontSize={8.5} fill="var(--muted)" className="font-mono">
          {attack.detail}
        </text>
      )}
    </g>
  );
}

interface BandProps {
  /** Left edge and width of the band, in view units. */
  x: number;
  w: number;
  /** y of the reported level and of the physical level. */
  reportedY: number;
  physicalY: number;
  /** Signed difference in engineering units, for the label. */
  delta: number;
  unit: string;
  /** A frozen reading gets a dashed cap and a steady band; a drifting one animates. */
  kind: "freeze" | "offset" | "ramp";
}

/**
 * The lie, drawn to scale: a hatched band spanning the gap between what SCADA is told and
 * where the water actually is. Nothing else on the twin shows the size of a spoof directly.
 */
export function SpoofBand({ x, w, reportedY, physicalY, delta, unit, kind }: BandProps) {
  const top = Math.min(reportedY, physicalY);
  const height = Math.abs(reportedY - physicalY);
  if (height < 2) return null;
  const label = `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${unit ? ` ${unit}` : ""}`;
  return (
    <g pointerEvents="none">
      <defs>
        <pattern id="spoof-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={ATTACK_STROKE} strokeWidth="2.2" strokeOpacity="0.5" />
        </pattern>
      </defs>
      <rect
        x={x}
        y={top}
        width={w}
        height={height}
        fill="url(#spoof-hatch)"
        className={kind === "ramp" ? "spoof-band-drift" : undefined}
        style={{ transition: "y var(--telemetry-ms, 400ms) ease, height var(--telemetry-ms, 400ms) ease" }}
      />
      <rect x={x} y={top} width={w} height={height} fill={ATTACK_STROKE} fillOpacity={0.08} />
      <g className={kind === "freeze" ? "freeze-blink" : undefined}>
        <rect
          x={x + w / 2 - 30}
          y={top + height / 2 - 8}
          width={60}
          height={16}
          rx={3}
          fill="var(--surface)"
          fillOpacity={0.95}
          stroke={ATTACK_STROKE}
          strokeWidth={1}
        />
        <text
          x={x + w / 2}
          y={top + height / 2 + 4}
          textAnchor="middle"
          fontSize={9.5}
          fill={ATTACK_STROKE}
          className="font-mono font-bold"
        >
          {label}
        </text>
      </g>
    </g>
  );
}

interface SetpointProps {
  x: number;
  w: number;
  /** y of the setpoint the controller now holds, and of the authorized one. */
  heldY: number;
  nominalY: number;
  delta: number;
  tampered: boolean;
}

/**
 * The level the controller is driving toward. Normally a quiet grey line; under a rogue
 * setpoint the authorized target stays put and a red target slides away from it.
 */
export function SetpointMark({ x, w, heldY, nominalY, delta, tampered }: SetpointProps) {
  return (
    <g pointerEvents="none">
      <title>{tampered ? `Setpoint moved ${delta > 0 ? "+" : ""}${delta.toFixed(1)} %` : "Authorized setpoint"}</title>
      {tampered && (
        <>
          <line
            x1={x}
            x2={x + w}
            y1={nominalY}
            y2={nominalY}
            stroke="var(--muted)"
            strokeWidth={1.5}
            strokeDasharray="2 4"
            strokeOpacity={0.7}
          />
          <line
            x1={x + w - 10}
            x2={x + w - 10}
            y1={nominalY}
            y2={heldY}
            stroke={ATTACK_STROKE}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </>
      )}
      <line
        x1={x}
        x2={x + w}
        y1={heldY}
        y2={heldY}
        stroke={tampered ? ATTACK_STROKE : "var(--muted)"}
        strokeWidth={tampered ? 2.5 : 1.5}
        strokeDasharray="8 4"
        strokeOpacity={tampered ? 1 : 0.55}
        className={tampered ? "setpoint-slide" : undefined}
        style={{ transition: "y1 var(--telemetry-ms, 400ms) ease, y2 var(--telemetry-ms, 400ms) ease" }}
      />
      <text
        x={x + 3}
        y={heldY - 4}
        fontSize={8.5}
        fill={tampered ? ATTACK_STROKE : "var(--muted)"}
        className="font-mono font-semibold"
      >
        SP
      </text>
    </g>
  );
}

interface ForcedProps {
  /** Centre of the actuator. */
  x: number;
  y: number;
  /** Radius of the warning ring. */
  r: number;
}

/** Counter-rotating warning ring around an actuator whose command has been overridden. */
export function ForcedRing({ x, y, r }: ForcedProps) {
  return (
    <g pointerEvents="none">
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={ATTACK_STROKE}
        strokeWidth={2.5}
        strokeDasharray="10 8"
        className="forced-ring"
        style={{ transformOrigin: `${x}px ${y}px` }}
      />
      <circle cx={x} cy={y} r={r + 5} fill="none" stroke={ATTACK_STROKE} strokeWidth={1.5} className="hazard-halo" style={{ transformOrigin: `${x}px ${y}px` }} />
    </g>
  );
}

interface DriftProps {
  x: number;
  w: number;
  /** y of the level when the incident was raised, and the level now. */
  fromY: number;
  toY: number;
  delta: number;
  unit: string;
}

/** How far the real level has travelled since the incident was raised. */
export function DriftMark({ x, w, fromY, toY, delta, unit }: DriftProps) {
  if (Math.abs(toY - fromY) < 3) return null;
  const falling = toY > fromY;
  return (
    <g pointerEvents="none">
      <title>{`Physical level has moved ${delta > 0 ? "+" : ""}${delta.toFixed(1)} ${unit} since detection`}</title>
      <line x1={x} x2={x + w} y1={fromY} y2={fromY} stroke="var(--suspect)" strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.75} />
      <path
        d={`M${x + w - 8} ${fromY} L${x + w - 8} ${toY} M${x + w - 12} ${toY + (falling ? -6 : 6)} L${x + w - 8} ${toY} L${x + w - 4} ${toY + (falling ? -6 : 6)}`}
        stroke="var(--suspect)"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <text
        x={x + w - 14}
        y={(fromY + toY) / 2 + 3}
        textAnchor="end"
        fontSize={9}
        fill="var(--suspect)"
        className="font-mono font-semibold"
      >
        {`${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
      </text>
    </g>
  );
}


interface LockProps {
  /** Centre of the targeted equipment, in view units. */
  x: number;
  y: number;
  /** Which way the injected change pushes the reading or command. */
  direction: "up" | "down" | "hold" | "none";
}

/**
 * Drawn the instant a test is accepted, before any telemetry could have changed.
 *
 * It states only what the operator just asked for -- which component and which way -- so the
 * twin responds immediately without implying the plant or the detector has reacted yet.
 */
export function TargetLock({ x, y, direction }: LockProps) {
  const arrow =
    direction === "up"
      ? `M${x} ${y - 46} l0 14 M${x - 5} ${y - 41} l5 -5 l5 5`
      : direction === "down"
        ? `M${x} ${y - 46} l0 14 M${x - 5} ${y - 37} l5 5 l5 -5`
        : `M${x - 6} ${y - 40} l12 0`;
  return (
    <g pointerEvents="none" className="target-lock">
      <title>Test accepted for this component</title>
      <circle cx={x} cy={y} r={30} fill="none" stroke={ATTACK_STROKE} strokeWidth={2} strokeDasharray="6 6" />
      <circle cx={x} cy={y} r={38} fill="none" stroke={ATTACK_STROKE} strokeWidth={1.5} className="hazard-halo" style={{ transformOrigin: `${x}px ${y}px` }} />
      {direction !== "none" && (
        <path d={arrow} stroke={ATTACK_STROKE} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
    </g>
  );
}
