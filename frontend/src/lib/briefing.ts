import type { LiveMessage, Mode, Scenario, TopologyNode } from "./types";

/**
 * Plain-language narration of a launched test, for a viewer who has never seen the plant.
 *
 * The wording is deliberately causal rather than alarming, and it never claims the detector
 * has found anything: `detected` is reached only when the backend actually reports an
 * incident. Every sentence here describes what the test does to the process, which is true
 * whether or not the detector ever notices.
 */
export type AttackPhase = "idle" | "accepted" | "active" | "detected" | "ended" | "reset";

export interface AttackBriefing {
  phase: AttackPhase;
  /** Chip label for the phase. */
  state: string;
  /** What the test is doing. One short sentence. */
  what: string;
  /** What the viewer should expect next. One short sentence; empty for `idle`. */
  next: string;
  /** Which way the injected change pushes the reading or command, for the twin highlight. */
  direction: "up" | "down" | "hold" | "none";
  /** Live reported-versus-true line, or null when there is nothing to compare. */
  evidence: string | null;
}

export const PHASE_LABEL: Record<AttackPhase, string> = {
  idle: "Ready",
  accepted: "Accepted",
  active: "Active",
  detected: "Detected",
  ended: "Ended",
  reset: "Reset",
};

/** Which controller reads a level sensor, and which equipment that controller drives. */
const CONTROL_LOOP: Record<string, { controller: string; raises: string; lowers: string }> = {
  LIT101: {
    controller: "PLC1",
    raises: "opening inlet valve MV101 further and slowing transfer pump P101",
    lowers: "closing inlet valve MV101 and speeding up transfer pump P101",
  },
  LIT301: {
    controller: "PLC2",
    raises: "slowing outlet pump P301",
    lowers: "speeding up outlet pump P301",
  },
};

/** Sensors that are displayed and analysed but drive no equipment in this simulator. */
const NO_CONTROL_NOTE =
  "The plant itself has not changed, because no equipment here is controlled from this reading.";

const TANK_OF: Record<string, string> = { LIT101: "T1", LIT301: "T2" };

function amount(magnitude: number, unit: string): string {
  const size = Math.abs(magnitude);
  const digits = size >= 10 ? 0 : size >= 1 ? 1 : 2;
  return `${size.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}

function label(node: TopologyNode | undefined, id: string): string {
  return node ? `${node.label} ${id}` : id;
}

/** What a falsely high or falsely low level reading makes the controller do, and to the tank. */
function levelLie(target: string, high: boolean): string {
  const loop = CONTROL_LOOP[target];
  const tank = TANK_OF[target] ?? "the tank";
  if (!loop) return NO_CONTROL_NOTE;
  // A controller chases the number it is shown: told the tank is too full, it drains it.
  const action = high ? loop.lowers : loop.raises;
  const drift = high ? "falls" : "rises";
  return `${loop.controller} believes it and responds by ${action}, so the real ${tank} level ${drift}.`;
}

function freezeEffect(target: string): string {
  const loop = CONTROL_LOOP[target];
  const tank = TANK_OF[target] ?? "the tank";
  if (!loop) return NO_CONTROL_NOTE;
  return `${loop.controller} still trusts the stale number, so it holds its last correction while ${tank} keeps changing underneath it.`;
}

const FORCE_EFFECT: Record<string, { on: string; off: string }> = {
  MV101: {
    on: "Inflow into T1 rises, so the tank tends to fill and can reach its upper limit.",
    off: "Inflow into T1 stops, so the tank tends to drain while P101 keeps drawing from it.",
  },
  P101: {
    on: "More water moves from T1 toward T2, so T1 tends to fall and T2 tends to rise.",
    off: "Transfer out of T1 drops, so T1 tends to rise and T2 tends to fall.",
  },
  P301: {
    on: "T2 discharges faster, so that tank tends to drain.",
    off: "Discharge from T2 drops, so that tank tends to fill.",
  },
};

const SETPOINT_EFFECT: Record<string, { up: string; down: string }> = {
  PLC1: {
    up: "It opens MV101 further and slows P101 until the reported T1 level reaches that target.",
    down: "It closes MV101 and speeds up P101 until the reported T1 level reaches that target.",
  },
  PLC2: {
    up: "It slows P301 until the reported T2 level reaches that target.",
    down: "It speeds up P301 until the reported T2 level reaches that target.",
  },
};

interface Sentences {
  what: string;
  next: string;
  direction: AttackBriefing["direction"];
}

/** The causal story for one scenario/target/magnitude, independent of phase. */
export function describeAttack(
  scenario: Scenario,
  target: string,
  magnitude: number,
  topo: TopologyNode | undefined,
): Sentences {
  const name = label(topo, target);
  const unit = topo?.unit ?? "";
  const high = magnitude > 0;
  const controls = CONTROL_LOOP[target] !== undefined;
  switch (scenario) {
    case "sensor_freeze":
      return {
        what: `${name} is now repeating one captured reading while the real value keeps moving.`,
        next: freezeEffect(target),
        direction: "hold",
      };
    case "sensor_offset":
      return {
        what: `${name} is reporting ${amount(magnitude, unit)} ${high ? "above" : "below"} its real value.`,
        next: controls ? levelLie(target, high) : NO_CONTROL_NOTE,
        direction: high ? "up" : "down",
      };
    case "sensor_ramp":
      return {
        what: `${name} is drifting ${high ? "above" : "below"} its real value, growing toward ${amount(magnitude, unit)}.`,
        next: controls
          ? `The error is still building, and ${lowerFirst(levelLie(target, high))}`
          : `${NO_CONTROL_NOTE} Only the reported trend moves.`,
        direction: high ? "up" : "down",
      };
    case "actuator_force": {
      const on = magnitude >= 0.5;
      const word = target === "MV101" ? (on ? "open" : "closed") : on ? "on" : "off";
      return {
        what: `${name} is being held ${word} no matter what its controller commands.`,
        next:
          FORCE_EFFECT[target]?.[on ? "on" : "off"] ?? "Downstream equipment follows this command.",
        direction: on ? "up" : "down",
      };
    }
    case "rogue_setpoint": {
      const tank = target === "PLC1" ? "T1" : "T2";
      const effect =
        SETPOINT_EFFECT[target]?.[high ? "up" : "down"] ??
        "It drives its equipment toward the new target.";
      return {
        what: `${name} has been asked to hold ${tank} ${amount(magnitude, "%")} ${high ? "above" : "below"} its authorized target.`,
        next: `${effect} The target moved, not the tank level itself.`,
        direction: high ? "up" : "down",
      };
    }
  }
}

function lowerFirst(sentence: string): string {
  return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}

/** Reported-versus-true for the target, in words, when the simulator exposes both. */
export function evidenceLine(
  mode: Mode,
  target: string,
  message: LiveMessage | null,
  topo: TopologyNode | undefined,
): string | null {
  if (mode !== "sim" || !message) return null;
  const node = message.nodes.find((n) => n.id === target);
  if (!node || node.truth === null || node.truth === undefined) return null;
  const unit = topo?.unit ?? "";
  const digits = Math.abs(node.value) >= 10 ? 1 : 2;
  const span = (topo?.hi ?? 100) - (topo?.lo ?? 0);
  const reported = `${node.value.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
  const real = `${node.truth.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
  if (Math.abs(node.value - node.truth) <= 0.02 * span) {
    return `${target} reports ${reported}, which matches the real value.`;
  }
  return `${target} reports ${reported}. The real value is ${real}.`;
}

export interface BriefingInput {
  scenario: Scenario;
  target: string;
  magnitude: number;
  phase: AttackPhase;
  mode: Mode;
  message: LiveMessage | null;
  topo: TopologyNode | undefined;
  /** Leading origin candidate, only once the detector has actually raised an incident. */
  detectedOrigin: string | null;
}

/** Everything the briefing card and the spoken narration need, for one phase. */
export function buildBriefing(input: BriefingInput): AttackBriefing {
  const { scenario, target, magnitude, phase, mode, message, topo, detectedOrigin } = input;
  const story = describeAttack(scenario, target, magnitude, topo);
  const evidence = evidenceLine(mode, target, message, topo);
  const base = { state: PHASE_LABEL[phase], direction: story.direction, evidence };

  switch (phase) {
    case "idle":
      return { ...base, phase, direction: "none", evidence: null, what: "No test is running.", next: "" };
    case "accepted":
      return {
        ...base,
        phase,
        what: `Test accepted for ${target}.`,
        next: `${story.what} Watch ${target} on the twin for the first change.`,
      };
    case "active":
      return { ...base, phase, what: story.what, next: story.next };
    case "detected":
      return {
        ...base,
        phase,
        what: story.what,
        next: detectedOrigin
          ? `The detector has raised an incident and ranks ${detectedOrigin} as its leading origin, which is a hypothesis rather than a confirmed source.`
          : "The detector has raised an incident; its origin is still being ranked.",
      };
    case "ended":
      return {
        ...base,
        phase,
        direction: "none",
        what: `The test on ${target} has ended.`,
        next: "It is reporting honestly again, and the plant settles back under normal control.",
      };
    case "reset":
      return {
        ...base,
        phase,
        direction: "none",
        evidence: null,
        what: "Scenario reset.",
        next: "The plant is back at its starting state. Saved investigations are kept.",
      };
  }
}

/** One spoken line, within the speech endpoint's 400-character limit. */
export function narrationFor(brief: AttackBriefing): string {
  return `${brief.what} ${brief.next}`.replace(/\s+/g, " ").trim().slice(0, 390);
}
