import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import type { Incident, InvestigationDetail } from "../../lib/types";

export function MobileIncidentCards({
  incidents,
  workflows,
  loading,
  error,
}: {
  incidents: Incident[];
  workflows: Record<string, InvestigationDetail["workflow"]>;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div className="mobile-incident-list space-y-2 p-1">
      {incidents.map((incident) => {
        const wf = workflows[incident.id];
        const isAcked = !!wf?.acknowledged;
        const isOpen = ["open", "localizing"].includes(incident.status);

        return (
          <a
            key={incident.id}
            href={`/investigations?incident=${encodeURIComponent(incident.id)}`}
            className="incident-list-card block rounded-xl border border-border/80 bg-surface/80 p-3.5 hover:border-accent/40 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-bold text-text flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isOpen ? "bg-origin animate-pulse" : incident.status === "contained" ? "bg-normal" : "bg-muted"
                  }`}
                />
                {incident.origin[0]?.id ?? "Unknown"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                  isOpen
                    ? "bg-origin/15 text-origin border border-origin/30"
                    : incident.status === "contained"
                    ? "bg-normal/15 text-normal border border-normal/30"
                    : "bg-surface text-muted border border-border"
                }`}
              >
                {incident.status}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-muted font-mono">
              <span className="flex items-center gap-1">
                <Clock size={11} className="opacity-70" />
                {new Date(incident.detected_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>#{incident.id.slice(0, 10)}</span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-muted">
                {isAcked ? (
                  <span className="text-normal font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Ack'd
                  </span>
                ) : (
                  <span>Pending Ack</span>
                )}
                {wf?.severity && <span className="font-mono uppercase text-text font-bold">· {wf.severity}</span>}
              </span>
              <span className="text-accent font-semibold inline-flex items-center gap-0.5">
                Investigate <ArrowUpRight size={12} />
              </span>
            </div>
          </a>
        );
      })}

      {!incidents.length && (
        <div role="status" className="p-4 text-center text-xs text-muted">
          {loading ? "Loading incident journal…" : error ? "Records unavailable." : "No incidents match filters."}
        </div>
      )}
    </div>
  );
}
