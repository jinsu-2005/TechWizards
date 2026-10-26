import { isActive } from "../../lib/incident";
import type { Incident, LiveMessage, NodeState, Scenario, TopologyNode } from "../../lib/types";

/**
 * What an attack does to one piece of equipment, in terms the twin can draw.
 *
 * `freeze`/`offset`/`ramp` act on a sensor, so the drawing shows the gap between what the
 * plant really is and what SCADA is told. `force` acts on an actuator, so it shows the
 * command being overridden. `setpoint` acts on a controller, so it shows the target the
 * controller is now chasing against the authorized one.
 */
export type AttackKind = "freeze" | "offset" | "ramp" | "force" | "setpoint";

export interface NodeAttack {
  kind: AttackKind;
  /** Short all-caps chip, e.g. "SENSOR FROZEN". */
  label: string;
  /** One line of evidence under the chip, e.g. "reads 50.7 %, really 78.1 %". */
  detail: string | null;
}

const KIND_OF: Record<Scenario, AttackKind> = {
  sensor_freeze: "freeze",
  sensor_offset: "offset",
  sensor_ramp: "ramp",
  actuator_force: "force",
  rogue_setpoint: "setpoint",
};

export const ATTACK_LABEL: Record<AttackKind, string> = {
  freeze: "SENSOR FROZEN",
  offset: "READING BIASED",
  ramp: "READING DRIFTING",
  force: "COMMAND FORCED",
  setpoint: "SETPOINT TAMPERED",
};

/** Nominal setpoints the controllers are authorized to hold (mirrors PlantParams sp1/sp2). */
export const NOMINAL_SETPOINT: Record<string, number> = { PLC1: 50, PLC2: 50 };

/** Significant enough to draw: more than 2% of the tag's range. */
export function spoofDelta(node: NodeState, topo: TopologyNode | undefined): number | null {
  if (!topo || node.truth === null || node.truth === undefined) return null;
  const d = node.value - node.truth;
  return Math.abs(d) > 0.02 * (topo.hi - topo.lo) ? d : null;
}

/** Setpoint displacement from the authorized value, or null when it is where it should be. */
export function setpointDelta(id: string, setpoints: Record<string, number> | null | undefined): number | null {
  const nominal = NOMINAL_SETPOINT[id];
  const held = setpoints?.[id];
  if (nominal === undefined || held === undefined) return null;
  const d = held - nominal;
  return Math.abs(d) > 0.5 ? d : null;
}

function fmt(value: number, unit: string): string {
  const digits = Math.abs(value) >= 10 ? 1 : 2;
  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

function detailFor(
  kind: AttackKind,
  node: NodeState | undefined,
  topo: TopologyNode | undefined,
  setpoints: Record<string, number> | null | undefined,
): string | null {
  if (!node) return null;
  const unit = topo?.unit ?? "";
  if (kind === "setpoint") {
    const d = setpointDelta(node.id, setpoints);
    return d === null ? null : `target moved ${d > 0 ? "+" : ""}${fmt(d, "%")}`;
  }
  // Actuator feedback carries measurement noise, which must not read as "held at 100.2 %".
  if (kind === "force") return `held at ${fmt(Math.min(100, Math.max(0, node.value * 100)), "%")}`;
  if (node.truth === null || node.truth === undefined) return null;
  return `reads ${fmt(node.value, unit)} · really ${fmt(node.truth, unit)}`;
}

/** How many recent samples the kind inference looks at (30 s at the 500 ms emit period). A ramp
 *  is deliberately slow, so a shorter window cannot tell its growth apart from a settled bias. */
export const INFER_WINDOW = 60;

/**
 * Tell a frozen reading from a biased one from a drifting one, using only what is observable.
 *
 * A frozen sensor repeats one number while the plant moves under it. A ramp's error grows
 * sample over sample. Anything else that is spoofed is a fixed bias. Ground truth, when the
 * backend has revealed it, always wins over this.
 */
export function inferSensorKind(
  reported: readonly number[],
  deltas: readonly number[],
  span: number,
): AttackKind {
  if (reported.length >= 4) {
    const spread = Math.max(...reported) - Math.min(...reported);
    if (spread < 0.002 * span) return "freeze";
  }
  if (deltas.length >= 8) {
    const mag = deltas.map(Math.abs);
    const growth = (mag[mag.length - 1] ?? 0) - (mag[0] ?? 0);
    // A bias arrives as one step and then holds, so only a single pair grows. A ramp grows in
    // nearly every pair, which is what separates the two without knowing the scenario.
    let rising = 0;
    for (let i = 1; i < mag.length; i++) if ((mag[i] ?? 0) > (mag[i - 1] ?? 0)) rising++;
    if (growth > 0.005 * span && rising / (mag.length - 1) > 0.7) return "ramp";
  }
  return "offset";
}

/**
 * Per-node attack overlay for the twin.
 *
 * Ground truth names the scenario once the incident is localized (SIM). Before that — and in
 * LIVE or HAI, where no ground truth exists — the kind is inferred from what can be observed:
 * a spoofed sensor, a displaced setpoint, or an actuator ranked as the origin.
 */
export function attacksByNode(
  msg: LiveMessage | null,
  topo: ReadonlyMap<string, TopologyNode>,
  history: readonly LiveMessage[] = [],
): Map<string, NodeAttack> {
  const out = new Map<string, NodeAttack>();
  if (!msg) return out;
  const recent = history.slice(-INFER_WINDOW);
  const incident: Incident | null = isActive(msg.incident) ? msg.incident : null;
  const byId = new Map(msg.nodes.map((n) => [n.id, n]));
  const truth = incident?.ground_truth ?? null;

  const add = (id: string, kind: AttackKind) => {
    if (out.has(id)) return;
    out.set(id, {
      kind,
      label: ATTACK_LABEL[kind],
      detail: detailFor(kind, byId.get(id), topo.get(id), msg.setpoints),
    });
  };

  /** Is the attack still doing something a reader could point at on the twin? An incident stays
   *  open past the end of the attack, and a chip over equipment that has recovered is a lie of
   *  its own. */
  const stillActing = (id: string, kind: AttackKind): boolean => {
    const n = byId.get(id);
    if (!n) return false;
    if (kind === "setpoint") return setpointDelta(id, msg.setpoints) !== null;
    if (kind === "force") return n.status === "origin" || n.status === "affected";
    return spoofDelta(n, topo.get(id)) !== null;
  };

  // 1. The named scenario, when the backend has revealed it and it is still acting.
  if (truth && stillActing(truth.target, KIND_OF[truth.scenario])) {
    add(truth.target, KIND_OF[truth.scenario]);
  }

  // 2. Anything else that is observably tampered with, named or not.
  for (const node of msg.nodes) {
    const kind = topo.get(node.id)?.type;
    if (kind === "controller" && setpointDelta(node.id, msg.setpoints) !== null) {
      add(node.id, "setpoint");
    } else if (kind === "sensor" && spoofDelta(node, topo.get(node.id)) !== null) {
      const t = topo.get(node.id);
      const samples = recent
        .map((m) => m.nodes.find((n) => n.id === node.id))
        .filter((n): n is NodeState => !!n && n.truth !== null && n.truth !== undefined);
      add(
        node.id,
        inferSensorKind(
          samples.map((n) => n.value),
          samples.map((n) => n.value - (n.truth ?? 0)),
          t ? t.hi - t.lo : 100,
        ),
      );
    } else if (kind === "actuator" && incident && node.status === "origin") {
      add(node.id, "force");
    }
  }
  return out;
}

/**
 * The reading each node had when this incident was first raised, so the twin can show how far
 * the plant has moved since. Scans back through the ring for the first sample carrying this id.
 */
export function stateAtDetection(
  buffer: readonly LiveMessage[],
  incidentId: string | null,
): Map<string, NodeState> {
  const out = new Map<string, NodeState>();
  if (!incidentId) return out;
  let first: LiveMessage | undefined;
  for (let i = buffer.length - 1; i >= 0; i--) {
    const m = buffer[i];
    if (!m || m.incident?.id !== incidentId) break;
    first = m;
  }
  for (const n of first?.nodes ?? []) out.set(n.id, n);
  return out;
}
