import type { Incident } from "./types";

/** An incident that is still being worked: localizing or open (not closed, not contained). */
export const isActive = (inc: Incident | null | undefined): inc is Incident =>
  inc !== null && inc !== undefined && (inc.status === "localizing" || inc.status === "open");
