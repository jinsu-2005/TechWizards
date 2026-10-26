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

/** Samples with no observable effect before a run that had one is called ended. */
export const QUIET_SAMPLES_TO_END = 4;

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
): boolean {
  const node = message.nodes.find((n) => n.id === run.target);
  if (!node) return false;
  if (run.scenario === "rogue_setpoint") return setpointDelta(run.target, message.setpoints) !== null;
  if (run.scenario === "actuator_force") {
    const held = node.truth ?? node.value;
    // A forced actuator sits on its injected command; released, it drifts back under control.
    return Math.abs(held - run.magnitude) < 0.06 || node.status === "origin";
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
  /** Consecutive samples with no observable effect, after the run had one. */
  quiet: number;
  /** Bumped on each phase change, so narration fires once per phase. */
  phaseSeq: number;
  start: (run: AttackRun) => void;
  observe: (message: LiveMessage, topo: ReadonlyMap<string, TopologyNode>) => void;
  markReset: () => void;
  clear: () => void;
}

const IDLE = { run: null, phase: "idle" as AttackPhase, detectedOrigin: null, quiet: 0 };

export const useAttackRun = create<AttackRunState>((set) => ({
  ...IDLE,
  phaseSeq: 0,
  start: (run) =>
    set((s) => ({ run, phase: "accepted", detectedOrigin: null, quiet: 0, phaseSeq: s.phaseSeq + 1 })),
  markReset: () =>
    set((s) => ({ ...IDLE, phase: "reset", phaseSeq: s.phaseSeq + 1 })),
  clear: () => set((s) => ({ ...IDLE, phaseSeq: s.phaseSeq + 1 })),
  observe: (message, topo) =>
    set((s) => {
      const run = s.run;
      if (!run || s.phase === "idle" || s.phase === "reset" || s.phase === "ended") return s;
      const acting = effectVisible(run, message, topo);
      const detected = detectedAfterLaunch(run, message);
      const origin = detected ? (message.incident?.origin[0]?.id ?? null) : null;
      const quiet = acting ? 0 : s.phase === "accepted" ? 0 : s.quiet + 1;

      // A run that acted and has now been quiet for a few samples is over.
      if (quiet >= QUIET_SAMPLES_TO_END) {
        return { ...s, phase: "ended", quiet, phaseSeq: s.phaseSeq + 1 };
      }
      // Detection is the detector's word, never ours, and it outranks "active".
      const phase: AttackPhase = detected ? "detected" : acting ? "active" : s.phase;
      if (phase === s.phase && origin === s.detectedOrigin) return { ...s, quiet };
      return {
        ...s,
        phase,
        quiet,
        detectedOrigin: origin ?? s.detectedOrigin,
        phaseSeq: phase === s.phase ? s.phaseSeq : s.phaseSeq + 1,
      };
    }),
}));
