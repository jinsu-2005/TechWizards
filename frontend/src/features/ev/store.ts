import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { csrfHeaders } from "../../lib/csrf";
import type { AttackConfig, Message, PilotResult, Snapshot } from "./model";

let sessionId = "";
function session(): string {
  if (sessionId) return sessionId;
  try { sessionId = sessionStorage.getItem("attacktrace.ev.session") ?? ""; } catch { /* memory fallback */ }
  if (!sessionId) { sessionId = crypto.randomUUID(); try { sessionStorage.setItem("attacktrace.ev.session", sessionId); } catch { /* memory fallback */ } }
  return sessionId;
}
export const evSessionId = session;
async function request<T>(path: string, body?: unknown, timeout = 10000): Promise<T> {
  const key = (import.meta.env.VITE_API_KEY as string | undefined) || "change-me-demo-key";
  const response = await fetch(`/api/ev/${path}`, { method: body === undefined ? "GET" : "POST", signal: AbortSignal.timeout(timeout),
    headers: { "X-EV-Session": session(), "content-type": "application/json", ...csrfHeaders(), "x-api-key": key }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) { const error = await response.json().catch(() => ({})) as { detail?: unknown }; throw new Error(typeof error.detail === "string" ? error.detail : `EV request failed (${response.status})`); }
  return response.json() as Promise<T>;
}
interface EvStore {
  snapshot: Snapshot | null; selected: string; replayTime: number | null; error: string | null; busy: boolean; connected: boolean; lastReceived: number;
  messages: Message[]; pilotBusy: boolean; pilotError: string | null; twinMode: "3d" | "2d"; setTwinMode: (mode: "3d" | "2d") => void;
  /** What the pilot is saying right now (live call or spoken alert); shown as on-stage subtitles. */
  caption: { text: string; live: boolean } | null; showCaption: (text: string, holdMs: number, live?: boolean) => void;
  select: (id: string) => void; replay: (time: number | null) => void; poll: () => Promise<void>;
  control: (action: string, speed?: number) => Promise<void>; launch: (config: AttackConfig) => Promise<void>;
  ask: (question: string) => Promise<void>; clearChat: () => void; addMessages: (items: Message[]) => void;
}
let polling = false;
let captionTimer = 0;
let revision = 0;
const messageOf = (error: unknown) => error instanceof Error ? error.message : "EV backend unavailable";
export const useEv = create<EvStore>()(persist((set, get) => ({
  snapshot: null, selected: "BMS", replayTime: null, error: null, busy: false, connected: false, lastReceived: 0,
  messages: [], pilotBusy: false, pilotError: null, twinMode: "3d", setTwinMode: (twinMode) => set({ twinMode }),
  caption: null,
  showCaption: (text, holdMs, live = false) => {
    window.clearTimeout(captionTimer);
    set({ caption: { text, live } });
    captionTimer = window.setTimeout(() => set({ caption: null }), holdMs);
  },
  select: (selected) => set({ selected }), replay: (replayTime) => set({ replayTime }),
  poll: async () => {
    if (polling || get().busy) return;
    polling = true; const version = revision;
    try { const snapshot = await request<Snapshot>("state"); if (version === revision) set({ snapshot, connected: true, lastReceived: Date.now(), error: null }); }
    catch (error) { if (version === revision) set({ connected: false, error: messageOf(error) }); }
    finally { polling = false; }
  },
  control: async (action, speed) => {
    if (get().busy) return;
    revision++; set({ busy: true, error: null });
    try { const snapshot = await request<Snapshot>("control", { action, ...(speed === undefined ? {} : { speed }) }); set({ snapshot, connected: true, lastReceived: Date.now(), ...(action === "reset" ? { replayTime: null } : {}) }); }
    catch (error) { set({ error: messageOf(error) }); }
    finally { set({ busy: false }); }
  },
  launch: async (config) => {
    if (get().busy) return;
    revision++; set({ busy: true, error: null });
    try { const snapshot = await request<Snapshot>("attack", config); set({ snapshot, replayTime: null, connected: true, lastReceived: Date.now() }); }
    catch (error) { set({ error: messageOf(error) }); }
    finally { set({ busy: false }); }
  },
  ask: async (question) => {
    const state = get(); if (!question.trim() || state.pilotBusy || !state.snapshot) return;
    const history = state.messages.slice(-10).map(({ role, text }) => ({ role, text: text.slice(0, 4000) }));
    set({ messages: [...state.messages, { role: "user" as const, text: question.trim() }].slice(-40), pilotBusy: true, pilotError: null });
    try { const result = await request<PilotResult>("pilot/chat", { message: question.trim(), selected: state.selected, as_of: state.replayTime, history }, 32000);
      set((s) => ({ messages: [...s.messages, { role: "assistant" as const, text: result.reply, model: result.model, fallback: result.fallback, reason: result.reason, time_s: result.time_s, tools: Object.keys(result.tools).filter((k) => k.startsWith("get_") || k.startsWith("inspect_")) }].slice(-40) }));
    } catch (error) { set({ pilotError: messageOf(error) }); }
    finally { set({ pilotBusy: false }); }
  },
  clearChat: () => set({ messages: [], pilotError: null }),
  addMessages: (items) => set((s) => ({ messages: [...s.messages, ...items].slice(-40) })),
}), { name: "attacktrace.ev.workspace.v2", storage: createJSONStorage(() => sessionStorage), partialize: (s) => ({ messages: s.messages, selected: s.selected, twinMode: s.twinMode }) }));
