import { create } from "zustand";

export type CenterView = "twin" | "graph";

interface UiState {
  view: CenterView;
  /** Baseline vs AttackTrace side by side, replacing the twin/graph pane. */
  split: boolean;
  /** One-line notice (e.g. "Demo locked"); cleared by the toast after a few seconds. */
  notice: { text: string; id: number } | null;
  setView: (v: CenterView) => void;
  toggleSplit: () => void;
  notify: (text: string) => void;
  clearNotice: () => void;
}

let noticeId = 0;

export const useUi = create<UiState>((set) => ({
  view: "twin",
  split: false,
  notice: null,
  setView: (view) => set({ view }),
  toggleSplit: () => set((s) => ({ split: !s.split })),
  notify: (text) => set({ notice: { text, id: ++noticeId } }),
  clearNotice: () => set({ notice: null }),
}));

/** Shows `Demo locked` for an API 401/403; returns true when it did. */
export function noticeIfLocked(e: unknown): boolean {
  const locked = typeof e === "object" && e !== null && (e as { locked?: unknown }).locked === true;
  if (locked) useUi.getState().notify("Demo locked");
  return locked;
}
