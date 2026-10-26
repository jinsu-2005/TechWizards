import { create } from "zustand";
import type { AttackPhase } from "../lib/briefing";
import type { LiveMessage, Scenario, TopologyNode } from "../lib/types";
import { setpointDelta, spoofDelta } from "../features/twin/attack";

/** A test the operator launched from this browser, and how far along it is. */
export interface AttackRun {
  attackId: string;
  scenario: Scenario;
  target: string;
  magnitude: number;
  /** Date.now() at the moment the backend accepted it. */
  launchedAt: number;
}

/**
 * How long a run that was acting must show no effect before it is called ended.
 *
 * Measured in wall-clock time, not samples, for two reasons. A frozen reading crosses the
 * real value whenever the plant drifts past it, so the gap briefly reads as nothing; and fast
 * demo mode delivers samples six times sooner, which would make any sample count six times
 * stricter. Two and a half seconds is longer than either transient.
 */
export const QUIET_MS_TO_END = 2500;

/**
 * How long `accepted` is held before telemetry may advance it.
 *
 * In fast demo mode the first sample lands within about 80 ms, and a step offset is visible
 * in it, so without this floor the acknowledgement would flash past unread. It delays the
 * label, never the data: the twin and timeline keep updating underneath.
 */
export const ACCEPTED_DWELL_MS = 700;

/**
 * Is this test still doing something to the process right now?
 *
 * Read from telemetry only, never from a timer, so it stays correct at any demo speed and
 * does not depend on the backend's attack duration.
 */
export function effectVisible(
  run: AttackRun,
  message: LiveMessage,
  topo: ReadonlyMap<string, TopologyNode>,
  previousReported: number | null = null,
): boolean {
  const node = message.nodes.find((n) => n.id === run.target);
  if (!node) return false;
  if (run.scenario === "rogue_setpoint") return setpointDelta(run.target, message.setpoints) !== null;
  if (run.scenario === "actuator_force") {
    const held = node.truth ?? node.value;
    // A forced actuator sits on its injected command; released, it drifts back under control.
    return Math.abs(held - run.magnitude) < 0.06 || node.status === "origin";
  }
  // A freeze is recognised by the reading not moving at all, which is what a freeze is.
  // The gap alone is not enough: the real value drifts past the captured one, and on a fast,
  // noisy tag like filter pressure it sits near it for seconds at a time.
  if (run.scenario === "sensor_freeze" && previousReported !== null && node.value === previousReported) {
    return true;
  }
  return spoofDelta(node, topo.get(run.target)) !== null;
}

/**
 * Did the detector raise this incident after we launched? An incident already open before the
 * launch belongs to something else, and claiming it would be claiming a detection we did not
 * earn. One emit period of slack covers clock skew between the browser and the backend.
 */
function detectedAfterLaunch(run: AttackRun, message: LiveMessage): boolean {
  const inc = message.incident;
  if (!inc || inc.status === "closed") return false;
  return inc.detected_at * 1000 >= run.launchedAt - 1500;
}

interface AttackRunState {
  run: AttackRun | null;
  phase: AttackPhase;
  /** Leading origin, set only once the detector actually reports an incident. */
  detectedOrigin: string | null;
  /** When the effect was last seen to stop, or null while it is still acting. */
  quietSince: number | null;
  /** The target's previous reported value, so a frozen reading can be told from a moving one. */
  lastReported: number | null;
  /** Bumped on each phase change, so narration fires once per phase. */
  phaseSeq: number;
  start: (run: AttackRun) => void;
  observe: (message: LiveMessage, topo: ReadonlyMap<string, TopologyNode>) => void;
  markReset: () => void;
  clear: () => void;
}

const IDLE = {
  run: null,
  phase: "idle" as AttackPhase,
  detectedOrigin: null,
  quietSince: null,
  lastReported: null,
};

export const useAttackRun = create<AttackRunState>((set) => ({
  ...IDLE,
  phaseSeq: 0,
  start: (run) =>
    set((s) => ({
      run,
      phase: "accepted",
      detectedOrigin: null,
      quietSince: null,
      lastReported: null,
      phaseSeq: s.phaseSeq + 1,
    })),
  // Reset keeps the run so the card can say so; its phase stops telemetry from advancing it.
  markReset: () =>
    set((s) => ({ ...IDLE, run: s.run, phase: "reset", phaseSeq: s.phaseSeq + 1 })),
  clear: () => set((s) => ({ ...IDLE, phaseSeq: s.phaseSeq + 1 })),
  observe: (message, topo) =>
    set((s) => {
      const run = s.run;
      if (!run || s.phase === "idle" || s.phase === "reset" || s.phase === "ended") return s;
      const now = Date.now();
      const acting = effectVisible(run, message, topo, s.lastReported);
      const lastReported = message.nodes.find((n) => n.id === run.target)?.value ?? s.lastReported;
      if (s.phase === "accepted" && now - run.launchedAt < ACCEPTED_DWELL_MS) return s;
      const detected = detectedAfterLaunch(run, message);
      const origin = detected ? (message.incident?.origin[0]?.id ?? null) : null;
      // The quiet clock only runs once the test has actually been seen to act.
      const quietSince = acting ? null : s.phase === "accepted" ? null : (s.quietSince ?? now);

      if (quietSince !== null && now - quietSince >= QUIET_MS_TO_END) {
        return { ...s, phase: "ended", quietSince, lastReported, phaseSeq: s.phaseSeq + 1 };
      }
      // Detection is the detector's word, never ours, and it outranks "active".
      const phase: AttackPhase = detected ? "detected" : acting ? "active" : s.phase;
      if (phase === s.phase && origin === s.detectedOrigin) return { ...s, quietSince, lastReported };
      return {
        ...s,
        phase,
        quietSince,
        lastReported,
        detectedOrigin: origin ?? s.detectedOrigin,
        phaseSeq: phase === s.phase ? s.phaseSeq : s.phaseSeq + 1,
      };
    }),
}));
