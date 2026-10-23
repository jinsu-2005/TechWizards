import { magnitudeFor, SCENARIOS, SCENARIO_LABEL, validTargets } from "./scenarios";
import type { AttackRequest, Mode, TopologyNode } from "./types";

export type PilotAction =
  | { kind: "source"; mode: Mode; label: string }
  | { kind: "attack"; request: AttackRequest; label: string }
  | { kind: "haiReplay"; paused: boolean; label: string }
  | { kind: "timeline"; action: "pause" | "play" | "live" | "replay"; label: string }
  | { kind: "reset"; label: string };

/** Parse only explicit, narrow app commands. Ordinary questions always go to chat. */
export function parsePilotAction(text: string, nodes: readonly TopologyNode[]): PilotAction | null {
  const command = text.trim().replace(/[.!]$/, "");
  const timelineCommands: Record<string, PilotAction> = {
    "pause timeline": { kind: "timeline", action: "pause", label: "Pause timeline" },
    "resume timeline": { kind: "timeline", action: "play", label: "Resume timeline" },
    "play timeline": { kind: "timeline", action: "play", label: "Resume timeline" },
    "replay incident": { kind: "timeline", action: "replay", label: "Replay incident" },
    "go live": { kind: "timeline", action: "live", label: "Return timeline to current readings" },
    "return to live": { kind: "timeline", action: "live", label: "Return timeline to current readings" },
  };
  const timelineAction = timelineCommands[command.toLowerCase()];
  if (timelineAction) return timelineAction;
  const source = /^(?:switch|change|set) (?:the )?(?:data )?source to (sim|hai|live)$/i.exec(command);
  if (source?.[1]) {
    const mode = source[1].toLowerCase() as Mode;
    return { kind: "source", mode, label: `Switch data source to ${mode.toUpperCase()}` };
  }
  if (/^(?:reset|clear) (?:the )?(?:simulator|simulation|test attack|attack|scenario)$/i.test(command)) {
    return { kind: "reset", label: "Reset the current test scenario" };
  }
  const replay = /^(pause|resume) (?:the )?(?:hai |dataset )?replay$/i.exec(command);
  if (replay?.[1]) {
    const paused = replay[1].toLowerCase() === "pause";
    return { kind: "haiReplay", paused, label: `${paused ? "Pause" : "Resume"} HAI replay` };
  }
  const launch = /^(?:launch|start|run) (?:a |the )?(sensor freeze|sensor offset|sensor ramp|actuator force|rogue setpoint)(?: attack| test)? (?:on|for) ([a-z0-9]+)(?: (?:with|at) (?:magnitude )?(-?\d+(?:\.\d+)?)%?)?$/i.exec(command);
  if (!launch) return null;
  const [, rawScenario, rawTarget, raw] = launch;
  if (!rawScenario || !rawTarget) return null;
  const scenarioName = rawScenario.toLowerCase();
  const targetName = rawTarget.toLowerCase();
  const scenario = SCENARIOS.find((item) => SCENARIO_LABEL[item]?.toLowerCase() === scenarioName);
  if (!scenario) return null;
  const target = validTargets(scenario, nodes).find((node) => node.id.toLowerCase() === targetName);
  if (!target) return null;
  const spec = magnitudeFor(scenario, target);
  if (spec.kind !== "none" && raw === undefined) return null;
  const magnitude = spec.kind === "none" ? 0 : Number(raw);
  if (!Number.isFinite(magnitude)) return null;
  if (spec.kind === "number" && (magnitude < spec.min || magnitude > spec.max)) return null;
  if (spec.kind === "toggle" && magnitude !== 0 && magnitude !== 1) return null;
  const request: AttackRequest = { scenario, target: target.id, magnitude };
  return { kind: "attack", request, label: `Launch ${SCENARIO_LABEL[scenario]} on ${target.id}${spec.kind === "none" ? "" : ` at ${magnitude}${spec.kind === "number" ? spec.unit : ""}`}` };
}
