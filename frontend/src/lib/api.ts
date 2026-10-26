import { csrfHeaders } from "./csrf";
import type {
  AttackRequest,
  AttackResponse,
  CopilotChatRequest,
  CopilotChatResponse,
  IsolateRequest,
  IsolateResponse,
  Mode,
  Status,
  SourceInfo,
  TagHealth,
  Topology,
  EvidenceEvent,
  Incident,
  InvestigationDetail,
} from "./types";

/** Demo key for the write endpoints. It is bundled into the build, so it deters misuse of an
 *  exposed demo; it is not user authentication. Empty = the server leaves writes open. */
const KEY: string = (import.meta.env.VITE_API_KEY as string | undefined) || "change-me-demo-key";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
  /** 401 (missing/wrong key) or 403 (demo mode off). */
  get locked(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* keep the status code */
    }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

const post = <T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> =>
  json<T>(path, {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", ...csrfHeaders(), ...(KEY ? { "x-api-key": KEY } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const getStatus = (): Promise<Status> => json<Status>("/api/status");
/** Per-tag LIVE quality and age; 404 when LIVE is not configured. */
export const getLiveHealth = (): Promise<TagHealth[]> => json<TagHealth[]>("/api/live/health");
export const restartLiveCalibration = (): Promise<SourceInfo> => post<SourceInfo>("/api/live/calibration/restart");
export const getTopology = (): Promise<Topology> => json<Topology>("/api/topology");
export const setMode = (mode: Mode): Promise<Status> => post<Status>("/api/mode", { mode });
/** SIM-only demo pacing. The same samples arrive sooner; the plant and detector are untouched. */
export const setSimSpeed = (speed: number): Promise<Status> => post<Status>("/api/sim/speed", { speed });
export const postAttack = (req: AttackRequest): Promise<AttackResponse> =>
  post<AttackResponse>("/api/attack", req);
export const postReset = (): Promise<Status> => post<Status>("/api/reset");
export interface HaiReplay {
  dataset: string; file: string; position: number; start: number; total: number;
  sample_hz: number; speed: number; paused: boolean; features: number; processes: string[]; model: string;
}
export const getHaiReplay = (): Promise<HaiReplay> => json("/api/hai/replay");
export const controlHaiReplay = (body: { speed?: number; paused?: boolean }): Promise<HaiReplay> => post("/api/hai/replay", body);
export const postIsolate = (req: IsolateRequest): Promise<IsolateResponse> =>
  post<IsolateResponse>("/api/isolate", req);
export const reportUrl = (incidentId: string): string =>
  `/api/incidents/${encodeURIComponent(incidentId)}/report.pdf`;
export const postCopilotChat = (req: CopilotChatRequest, signal?: AbortSignal): Promise<CopilotChatResponse> =>
  post<CopilotChatResponse>("/api/copilot/chat", req, signal);
export const getCopilotSuggestions = (): Promise<string[]> =>
  json<string[]>("/api/copilot/suggestions");

export const getIncidents = (): Promise<Incident[]> => json("/api/incidents");
export const getAssetRegisters = (): Promise<Record<string, { table: string; address: number; encoding: string; unit: string }>> => json("/api/asset-registers");
export const getWorkflows = (): Promise<Record<string, InvestigationDetail["workflow"]>> => json("/api/incident-workflows");
export const getInvestigation = (id: string): Promise<InvestigationDetail> => json(`/api/investigations/${encodeURIComponent(id)}`);
export const getEvidence = (assetId?: string, incidentId?: string): Promise<EvidenceEvent[]> => {
  const query = new URLSearchParams();
  if (assetId) query.set("asset_id", assetId);
  if (incidentId) query.set("incident_id", incidentId);
  return json(`/api/evidence?${query}`);
};
export const updateWorkflow = (id: string, change: Record<string, unknown>): Promise<InvestigationDetail> => post(`/api/investigations/${encodeURIComponent(id)}/workflow`, change);

export const getLab = <T>(): Promise<T> => json("/api/lab");
export const configureLab = <T>(change: Record<string, unknown>): Promise<T> => post("/api/lab/proxy", change);
export const probeLab = <T>(): Promise<T> => post("/api/lab/probe");
export const changeIntegrity = <T>(change: Record<string, unknown>): Promise<T> => post("/api/lab/integrity", change);
