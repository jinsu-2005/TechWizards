import { useAccess } from "../auth/access";
import { LoaderCircle, ShieldCheck, TriangleAlert, Unplug } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, postIsolate } from "../../lib/api";
import {
  IDLE,
  advance,
  begin,
  candidateFor,
  disabledReason,
  refused,
  type IsoState,
} from "../../lib/isolate";
import type { Incident } from "../../lib/types";
import { useLive } from "../../store/live";
import { noticeIfLocked } from "../../store/ui";

/** Isolate the best candidate not tried yet. Containment is read from the incident, never assumed:
 *  idle -> pending -> Contained (green, with time) or Not contained (amber, offers the next one). */
export function IsolateButton({ incident }: { incident: Incident }) {
  const { canAdmin } = useAccess();
  const hai = useLive((s) => s.latest?.mode === "hai");
  const live = useLive((s) => s.latest?.mode === "live");
  const replaying = useLive((s) => s.cursor !== null);
  const [iso, setIso] = useState<IsoState>(IDLE);

  // Messages arrive twice a second; each one is a chance for pending to resolve or time out.
  useEffect(() => {
    setIso((s) => advance(s, incident, Date.now()));
  }, [incident]);

  const tried = iso.incidentId === incident.id ? iso.tried : [];
  const next = candidateFor(incident, tried);
  const reason = !canAdmin ? "Administrator access is required" : disabledReason(incident, { hai, live, replaying });

  const click = async () => {
    if (!next) return;
    try {
      const r = await postIsolate({ incident_id: incident.id, node_id: next });
      setIso((s) =>
        r.accepted ? begin(s, incident, next, Date.now()) : refused(s, r.reason ?? "Refused"),
      );
    } catch (e) {
      if (!noticeIfLocked(e)) setIso((s) => refused(s, e instanceof ApiError ? e.message : "Failed"));
    }
  };

  if (iso.phase === "contained") {
    return (
      <div
        role="status"
        data-testid="isolate-state"
        className="flex items-center gap-2 text-xs text-normal"
      >
        <ShieldCheck size={14} aria-hidden />
        <span className="font-medium">Contained</span>
        <span className="font-mono text-muted">
          {iso.node}
          {iso.seconds !== null ? ` · ${iso.seconds.toFixed(0)} s` : ""}
        </span>
      </div>
    );
  }
  if (iso.phase === "pending") {
    return (
      <button
        type="button"
        disabled
        data-testid="isolate-state"
        className="flex h-8 items-center gap-1 rounded bg-accent px-3 text-xs font-medium text-on-accent opacity-70"
      >
        <LoaderCircle size={14} className="animate-spin" aria-hidden />
        Isolating {iso.node}
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {iso.phase === "failed" && (
        <div
          role="status"
          data-testid="isolate-state"
          className="flex items-center gap-1 text-xs text-affected"
        >
          <TriangleAlert size={14} aria-hidden />
          <span className="font-medium">Not contained</span>
          <span className="font-mono text-muted">{iso.node}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => void click()}
        disabled={reason !== null || next === null}
        title={reason ?? undefined}
        className="flex h-8.5 w-full items-center justify-center gap-1.5 rounded-md bg-origin text-xs font-semibold text-on-accent shadow-md shadow-origin/30 transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        <Unplug size={14} aria-hidden />
        {next ? `Isolate ${next}` : "No candidate"}
      </button>
      {iso.note && <span className="text-xs text-muted">{iso.note}</span>}
    </div>
  );
}
