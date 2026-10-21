/** Visual ordering only: recorded onset seconds remain on the edge tooltip. */
export function pulsePhase(delay: number | null, maximum: number): number {
  if (delay === null || !Number.isFinite(delay) || maximum <= 0) return 0;
  return Math.min(.6, Math.max(0, delay / maximum) * .6);
}

export function processGroup(id: string): string {
  return /^(P\d)_/.exec(id)?.[1] ?? "Other";
}

export const PROCESS_LABELS: Record<string, string> = {
  P1: "P1 · Boiler", P2: "P2 · Turbine", P3: "P3 · Water treatment", P4: "P4 · HIL",
};
