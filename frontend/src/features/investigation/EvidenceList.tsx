import { Clock, ExternalLink, Activity, ShieldAlert, Cpu } from "lucide-react";
import type { EvidenceEvent } from "../../lib/types";

function formatCategory(category: string): { label: string; color: string; icon: typeof Activity } {
  const norm = category.toLowerCase();
  if (norm.includes("incident") || norm.includes("state")) {
    return { label: category.replaceAll("_", " "), color: "text-suspect bg-suspect/10 border-suspect/20", icon: ShieldAlert };
  }
  if (norm.includes("process") || norm.includes("observation")) {
    return { label: category.replaceAll("_", " "), color: "text-accent bg-accent/10 border-accent/20", icon: Activity };
  }
  return { label: category.replaceAll("_", " "), color: "text-muted bg-surface border-border", icon: Cpu };
}

export function EvidenceList({ events }: { events: EvidenceEvent[] }) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted rounded-xl border border-dashed border-border/80 bg-bg/50">
        <Activity size={24} className="mb-2 opacity-40 text-accent" />
        <p className="text-sm font-medium">No recorded evidence matches this filter</p>
        <p className="text-xs text-muted/80 mt-1">Unavailable evidence does not establish an origin.</p>
      </div>
    );
  }

  return (
    <ol className="space-y-2.5">
      {events.slice(0, 100).map((event) => {
        const { label, color, icon: Icon } = formatCategory(event.category);
        const entries = Object.entries(event.payload).filter(
          ([key]) => !["origin", "classification", "clock", "unit_source"].includes(key)
        );

        return (
          <li
            key={event.id}
            id={event.id}
            className="group relative rounded-xl border border-border/80 bg-surface/60 hover:bg-surface hover:border-accent/30 p-3 text-xs transition-all shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold capitalize ${color}`}>
                  <Icon size={11} aria-hidden />
                  {label}
                </span>
                {event.asset_id && (
                  <span className="font-mono font-bold text-text bg-bg border border-border px-1.5 py-0.5 rounded text-[11px]">
                    {event.asset_id}
                  </span>
                )}
                <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[10.5px] text-muted">
                  {event.payload.classification === "inference" ? "Inferred" : "Recorded"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted text-[11px] font-mono">
                <Clock size={11} className="opacity-70" />
                <time>{new Date(event.received_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
              </div>
            </div>

            {entries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 my-2">
                {entries.map(([key, value]) => {
                  const valStr = typeof value === "number" ? value.toFixed(3) : typeof value === "object" ? JSON.stringify(value) : String(value);
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 rounded bg-bg/90 border border-border/70 px-2 py-1 text-[11px] font-mono"
                    >
                      <span className="text-muted text-[10.5px] capitalize">{key.replaceAll("_", " ")}:</span>
                      <strong className="text-text font-medium">{valStr}</strong>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
              <span className="font-mono text-muted/60 text-[10.5px]">ID: {event.id.slice(0, 18)}…</span>
              <a
                className="inline-flex items-center gap-1 text-accent hover:underline font-medium hover:text-accent/80 transition-colors"
                href={event.record_url}
                target="_blank"
                rel="noreferrer"
              >
                <span>Full Record</span>
                <ExternalLink size={10} aria-hidden />
              </a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
