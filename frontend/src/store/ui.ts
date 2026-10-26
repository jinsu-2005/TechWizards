import { create } from "zustand";
import type { Incident, Scenario } from "../lib/types";

export type CenterView = "twin" | "graph";

interface UiState {
  view: CenterView;
  selectedAsset: string | null;
  selectedIncident: Incident | null;
  scenarioContext: { scenario: Scenario; target: string } | null;
  setScenarioContext: (scenario: Scenario, target: string) => void;
  selectAsset: (id: string | null) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  /** One-line notice (e.g. "Demo locked"); cleared by the toast after a few seconds. */
  notice: { text: string; id: number; tone: "warning" | "success" } | null;
  /** Audio alarm toggle. */
  soundEnabled: boolean;
  /** AI Pilot slide-out drawer state. */
  copilotOpen: boolean;
  /** Speak each attack-briefing phase aloud through the Gemini voice. */
  narrateAttacks: boolean;
  toggleNarrateAttacks: () => void;
  /** Whether the digital twin toolbar is condensed/hidden. */
  twinToolbarCollapsed: boolean;
  setTwinToolbarCollapsed: (collapsed: boolean) => void;
  toggleTwinToolbar: () => void;
  setView: (v: CenterView) => void;
  notify: (text: string, tone?: "warning" | "success") => void;
  clearNotice: () => void;
  toggleSound: () => void;
  setCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
}

let noticeId = 0;

function readFlag(key: string, fallback: boolean): boolean {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : saved === "true";
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // storage unavailable; the choice simply does not persist
  }
}

export const useUi = create<UiState>((set) => ({
  view: "twin",
  selectedAsset: null,
  selectedIncident: null,
  scenarioContext: null,
  setScenarioContext: (scenario, target) => set({ scenarioContext: { scenario, target } }),
  selectAsset: (selectedAsset) => set({ selectedAsset }),
  setSelectedIncident: (selectedIncident) => set({ selectedIncident }),
  notice: null,
  soundEnabled: true,
  copilotOpen: false,
  narrateAttacks: readFlag("attacktrace.narrateAttacks", true),
  toggleNarrateAttacks: () =>
    set((s) => {
      const narrateAttacks = !s.narrateAttacks;
      writeFlag("attacktrace.narrateAttacks", narrateAttacks);
      return { narrateAttacks };
    }),
  twinToolbarCollapsed: false,
  setTwinToolbarCollapsed: (twinToolbarCollapsed) => set({ twinToolbarCollapsed }),
  toggleTwinToolbar: () => set((s) => ({ twinToolbarCollapsed: !s.twinToolbarCollapsed })),
  setView: (view) => set({ view }),
  notify: (text, tone = "warning") => set({ notice: { text, id: ++noticeId, tone } }),
  clearNotice: () => set({ notice: null }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setCopilotOpen: (copilotOpen) => set({ copilotOpen }),
  toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
}));

/** Shows `Demo locked` for an API 401/403; returns true when it did. */
export function noticeIfLocked(e: unknown): boolean {
  const locked = typeof e === "object" && e !== null && (e as { locked?: unknown }).locked === true;
  if (locked) useUi.getState().notify("Demo locked");
  return locked;
}
