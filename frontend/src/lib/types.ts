// Mirrors backend/app/schemas.py. FROZEN after Phase 4: change both together, with approval.
export type NodeStatus = "normal" | "suspect" | "affected" | "origin";
export type NodeKind = "sensor" | "actuator" | "controller";
export type Mode = "sim" | "hai" | "live";
export type Quality = "good" | "stale" | "missing" | "out_of_range" | "frozen";
export type IncidentStatus = "localizing" | "open" | "closed" | "contained";
export type Scenario =
  | "sensor_freeze"
  | "sensor_offset"
  | "sensor_ramp"
  | "actuator_force"
  | "rogue_setpoint";

// ---- live stream (/ws/live, one message every 500 ms)
export interface NodeState {
  id: string;
  value: number; // as reported to SCADA (may be spoofed)
  truth: number | null; // physical truth (SIM only)
  score: number;
  status: NodeStatus;
  quality?: Quality | null; // Phase 13: LIVE data quality; absent in SIM and HAI
  is_virtual?: boolean | null; // True when virtual sensor self-healing estimation is active
}

export interface AlertInfo {
  since: number; // unix seconds
  score: number;
  threshold: number;
}

export interface Triple {
  deviation: number;
  onset: number;
  causal: number;
}

export interface OriginCandidate {
  id: string;
  type: NodeKind;
  confidence: number;
  /** Phase 11: this node's own weight*term contributions and the weights used. */
  breakdown?: Triple | null;
  weights?: Triple | null;
}

export interface PathStep {
  id: string;
  t: number; // seconds after the first onset
  deviation: number;
}

export interface GroundTruthInfo {
  attack_id: string;
  scenario: Scenario;
  target: string;
  started_at: number;
  mitre: string;
}

export interface Incident {
  id: string;
  status: IncidentStatus;
  detected_at: number;
  origin: OriginCandidate[]; // top-3, best first
  path: PathStep[];
  path_edges: [string, string][];
  explanation: string;
  action: string;
  mitre: string;
  mitre_name: string;
  baseline_alarms: string[];
  ground_truth: GroundTruthInfo | null;
  mode?: Mode; // Phase 13: which source produced the incident
  ambiguous?: boolean; // Phase 11: top-1 and top-2 confidence too close to trust one
  contained_at?: number | null; // unix time the isolate action took effect (SIM only)
  time_to_contain_s?: number | null; // plant seconds from the isolate action to containment
  virtual_active?: boolean | null; // True when virtual sensor self-healing estimation is active
}

export interface Impact {
  t1_overflow_s: number | null;
  t1_dry_s: number | null;
  t2_overflow_s: number | null;
  t2_dry_s: number | null;
  pump_stress: Record<string, number>;
  energy_wasted_kwh: number;
}

export interface LiveMessage {
  t: number;
  mode: Mode;
  nodes: NodeState[];
  alert: AlertInfo | null;
  incident: Incident | null;
  impact: Impact | null;
  source_latency_ms?: number | null; // Phase 13: age of the newest LIVE sample
}

// ---- REST
export type SourceState = "connected" | "stale" | "connecting" | "down" | "calibrating";

export interface SourceInfo {
  mode: Mode;
  connected: boolean;
  protocol: string; // internal (SIM), replay (HAI), modbus (LIVE)
  state: SourceState;
  latency_ms_p50?: number | null;
  latency_ms_p95?: number | null;
  samples_per_s?: number;
  dropped?: number;
  reason?: string | null; // why it is not connected, or which tags are faulty
  progress?: number | null; // 0..1 while calibrating
  calibration?: {
    stage: "collecting" | "blocked" | "training" | "failed";
    collected_samples: number;
    target_samples: number;
    skipped_samples: number;
    elapsed_s: number;
    remaining_s?: number | null;
    blockers: string[];
    notice?: string | null;
  } | null;
}

export interface TagHealth {
  tag: string;
  node_id: string;
  quality: Quality;
  age_ms: number | null;
  last_value: number | null;
}

export interface LiveModelInfo {
  source_fingerprint: string;
  fingerprint_scope: string;
  model_loaded: boolean;
  model_id: string | null;
  trained_at: string | null;
  recorded_samples: number | null;
  sample_s: number | null;
  active_model: string | null;
  validation_samples?: number | null;
  validation_mse?: number | null;
  calibration: NonNullable<SourceInfo["calibration"]> | null;
}

export interface Status {
  mode: Mode;
  hai_available: boolean;
  hai_reason?: string | null;
  detector_active: string | null;
  uptime_s: number;
  source?: SourceInfo | null; // Phase 13
  live_available?: boolean; // Phase 13: the LIVE source answers right now
  live_reason?: string | null;
}

export interface AttackRequest {
  scenario: Scenario;
  target: string;
  magnitude?: number;
  duration_s?: number;
}

export interface AttackResponse {
  attack_id: string;
}

export interface TopologyNode {
  id: string;
  type: NodeKind;
  label: string;
  unit: string;
  lo: number;
  hi: number;
}

export interface TopologyEdge {
  src: string;
  dst: string;
  weight: number;
  kind: "static" | "learned";
}

export interface Topology {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface IsolateRequest {
  incident_id: string;
  node_id: string;
}

export interface IsolateResponse {
  accepted: boolean; // applied; containment is reported later by incident.status
  reason?: string | null;
}

export interface CopilotChatRequest {
  message: string;
  incident_id?: string | null;
  history?: { role: "user" | "assistant"; content: string }[];
  asset_id?: string | null;
  as_of?: number | null;
}

export interface CopilotChatResponse {
  reply: string;
  suggestions: string[];
  action_recommended?: string | null;
  action_node?: string | null;
  mitre_id?: string | null;
  model_used: string;
  evidence?: EvidenceEvent[];
}

export interface EvidenceEvent {
  id: string; incident_id: string | null; mode: Mode; session: string;
  asset_id: string | null; observed_at: number; received_at: number;
  category: string; payload: Record<string, unknown>; record_url: string;
}
export interface InvestigationDetail {
  incident: Incident; session_id: string; updated_at: number; is_current?: boolean;
  workflow: { acknowledged?: boolean; severity?: string; state?: string };
  events: EvidenceEvent[]; retention: string;
  context_events?: EvidenceEvent[];
  layer_hypotheses?: { category: string; candidate_id: string; asset_id: string; result: string; explanation: string; scope: string; event_ids: string[] }[];
  related_incidents?: { id: string; reason: string }[];
  capture?: IncidentCapture;
}

export interface IncidentCapture {
  status: "captured" | "not_captured" | "integrity_error" | "not_available_at_selected_time";
  reason?: string;
  sha256?: string;
  record_url?: string;
  payload?: {
    captured_at: number; sample_time: number; scope: string; limits: string;
    model: { kind: string; runtime_id: string; model_id?: string; trained_at?: string; recorded_samples?: number; sample_s?: number; threshold: number };
    baseline: { kind: string; artifact_id: string; asset_ids: string[]; mean: number[]; sd: number[]; sigma: number };
    source: { mode: Mode; host?: string; port?: number; protocol?: string; file?: string; source_fingerprint?: string; attestation?: string };
    topology: Topology;
    readings: Omit<NodeState, "truth">[];
    pre_event_readings: unknown[];
    initial_assessment: Incident;
  };
}
