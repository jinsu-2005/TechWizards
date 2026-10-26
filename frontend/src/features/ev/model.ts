export type ComponentKind = "Sensor" | "Actuator" | "Controller";
export interface Component { id: string; name: string; kind: ComponentKind; system: string; unit: string; tolerance: number }
export interface Reading { id: string; value: number; expected: number; unit: string; residual: number; time_s: number; quality: string }
export interface Candidate { id: string; score: number; share: number; deviation: number; onset: number; topology: number; residual: number; onset_s: number }
export interface Analysis { candidates: Candidate[]; affected: string[]; path: { source: string; target: string; onset_s: number }[]; ambiguous: boolean; method: string; weights: { deviation: number; onset: number; topology: number } }
export interface Frame { time_s: number; readings: Reading[]; analysis: Analysis }
export interface Incident { id: string; detected_s: number; status: string; recovered_s: number | null; analysis: Analysis; first_readings: Reading[] }
export interface Snapshot extends Frame {
  running: boolean; speed: number; actual_speed: number; attack_active: boolean; attack_remaining_s: number;
  history: Frame[]; incident: Incident | null; incidents: Incident[];
  events: { id: string; time_s: number; category: string; text: string; asset_id: string | null }[];
  truth: { kind: string; target: string; magnitude: number; duration_s: number; started_s: number } | null;
  components: Component[]; edges: { source: string; target: string }[];
  detector: { kind: string; threshold: number; persistence: number; dt_s: number; trained: boolean; reference: string };
}
export type AttackKind = "bias" | "freeze" | "replay" | "delay" | "tamper" | "failure";
export interface AttackConfig { kind: AttackKind; target: string; magnitude: number; duration: number }
export interface PilotResult { reply: string; model: string; fallback: boolean; reason: string | null; time_s: number; tools: Record<string, unknown> }
export interface Message { role: "user" | "assistant"; text: string; model?: string; fallback?: boolean; reason?: string | null; time_s?: number; tools?: string[] }
export const attackLabels: Record<AttackKind, string> = { bias: "Sensor bias", freeze: "Sensor freeze", replay: "Recorded-signal replay", delay: "CAN message delay", tamper: "Actuator command tampering", failure: "Physical coolant pump failure" };
export const presets: { label: string; detail: string; config: AttackConfig }[] = [
  { label: "Battery sensor spoofing", detail: "A biased temperature signal causes thermal and torque responses.", config: { kind: "bias", target: "TEMP", magnitude: 22, duration: 25 } },
  { label: "CAN gateway delay", detail: "Delayed messages trigger a reduced torque request.", config: { kind: "delay", target: "CAN", magnitude: 180, duration: 20 } },
  { label: "Cooling command tampering", detail: "Pump feedback departs from its command; thermal effects follow.", config: { kind: "tamper", target: "COOL", magnitude: -38, duration: 25 } },
  { label: "Pedal signal freeze", detail: "Freeze the signal, then change cruise demand to expose inconsistency.", config: { kind: "freeze", target: "PEDAL", magnitude: 0, duration: 30 } },
  { label: "Wheel-speed replay", detail: "Replay pre-attack readings while changing cruise demand.", config: { kind: "replay", target: "WHEEL", magnitude: 0, duration: 30 } },
  { label: "Physical pump failure", detail: "Compare a physical fault with command tampering: telemetry may not distinguish them.", config: { kind: "failure", target: "COOL", magnitude: 0, duration: 25 } },
];
export function validTargets(kind: AttackKind, components: Component[]): Component[] {
  return components.filter((c) => kind === "delay" ? c.id === "CAN" : kind === "failure" ? c.id === "COOL" : kind === "tamper" ? c.kind === "Actuator" : c.kind === "Sensor");
}
export function getReading(frame: Frame, id: string): Reading | undefined { return frame.readings.find((r) => r.id === id); }
export function formatReading(reading: Reading | undefined): string { return reading ? `${reading.value.toFixed(1)} ${reading.unit}` : "No sample"; }
export function componentStatus(frame: Frame, id: string): string {
  if (frame.analysis.candidates[0]?.id === id) return "Leading hypothesis";
  if (frame.analysis.affected.includes(id)) return "Anomalous";
  return "Within reference";
}
