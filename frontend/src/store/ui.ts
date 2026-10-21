import { create } from "zustand";

export type CenterView = "twin" | "graph";

interface UiState {
  view: CenterView;
  selectedAsset: string | null;
  selectAsset: (id: string | null) => void;
  /** One-line notice (e.g. "Demo locked"); cleared by the toast after a few seconds. */
  notice: { text: string; id: number } | null;
  /** Audio alarm toggle. */
  soundEnabled: boolean;
  /** AI Pilot slide-out drawer state. */
  copilotOpen: boolean;
  setView: (v: CenterView) => void;
  notify: (text: string) => void;
  clearNotice: () => void;
  toggleSound: () => void;
  setCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
}

let noticeId = 0;

export const useUi = create<UiState>((set) => ({
  view: "twin",
  selectedAsset: null,
  selectAsset: (selectedAsset) => set({ selectedAsset }),
  notice: null,
  soundEnabled: true,
  copilotOpen: false,
  setView: (view) => set({ view }),
  notify: (text) => set({ notice: { text, id: ++noticeId } }),
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
