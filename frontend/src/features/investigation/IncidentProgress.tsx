import { useEffect, useState } from "react";
import type { Incident } from "../../lib/types";

interface ResponseEvent { seq: number; category: string; observed_at: number; received_at: number }
export function IncidentProgress({ incident, mode, asOf }: { incident: Incident; mode: string; asOf?: number }) {
  const [events, setEvents] = useState<ResponseEvent[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true; setEvents([]); setError(false);
    const refresh = async () => {
      try {
        const response = await fetch(`/api/investigations/${encodeURIComponent(incident.id)}/progress`);
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json() as ResponseEvent[];
        if (alive) { setEvents(data); setError(false); }
      } catch { if (alive) setError(true); }
    };
    void refresh(); const timer = setInterval(() => void refresh(), 3000);
    return () => { alive = false; clearInterval(timer); };
  }, [incident.id, mode]);
  const visible = events.filter((e) => asOf === undefined || e.observed_at <= asOf);
  const requested = visible.find((e) => e.category === "response_requested");
  const outcome = visible.find((e) => e.seq > (requested?.seq ?? Infinity) && ["response_accepted", "response_rejected"].includes(e.category));
  const pill = "rounded border border-border px-2 py-1";
  return <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs" aria-label="Incident progression"><strong>Incident progression</strong><span className="rounded bg-suspect/10 px-2 py-1 text-suspect">Detected</span>{incident.origin.length > 0 && <span className="rounded bg-accent/10 px-2 py-1 text-accent">{incident.ambiguous ? "Competing hypotheses" : "Origin ranked"}</span>}{requested && <span className={pill}>Response requested</span>}{outcome && <span className={`${pill} ${outcome.category === "response_rejected" ? "text-suspect" : "text-accent"}`}>{outcome.category === "response_accepted" ? "Request accepted" : "Request rejected"}</span>}{incident.status === "contained" && <span className="rounded bg-normal/10 px-2 py-1 text-normal">Simulation containment verified</span>}{incident.status === "closed" && <span className={pill}>Detector incident closed</span>}{error && <span className="text-muted">Response history unavailable</span>}<a href={`/investigations?incident=${encodeURIComponent(incident.id)}`} className="ml-auto text-accent underline">Evidence & response history</a></div>;
}
