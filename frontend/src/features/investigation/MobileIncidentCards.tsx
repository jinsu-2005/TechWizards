import { ArrowUpRight, Search } from "lucide-react";
import type { Incident, InvestigationDetail } from "../../lib/types";

export function MobileIncidentCards({ incidents, workflows, loading, error }: {
  incidents: Incident[];
  workflows: Record<string, InvestigationDetail["workflow"]>;
  loading: boolean;
  error: boolean;
}) {
  return <div className="mobile-incident-list">
    {incidents.map((incident) => <a key={incident.id} href={`/investigations?incident=${encodeURIComponent(incident.id)}`} className="incident-list-card">
      <div className="incident-list-heading"><span className="inline-flex items-center gap-2 text-accent"><Search size={15} aria-hidden />{incident.origin[0]?.id ?? "Unknown origin"}</span><ArrowUpRight size={17} aria-hidden /></div>
      <p className="mt-2 text-sm font-medium">{incident.ambiguous ? "Competing origin hypotheses" : "Origin hypothesis available"}</p>
      <time className="mt-1 block text-xs text-muted" dateTime={new Date(incident.detected_at * 1000).toISOString()}>{new Date(incident.detected_at * 1000).toLocaleString()}</time>
      <div className="incident-list-meta"><span>{workflows[incident.id]?.state ?? "New case"}</span><span>{workflows[incident.id]?.acknowledged ? "Acknowledged" : "Needs acknowledgment"}</span></div>
      <span className="mt-3 block text-xs font-medium text-accent">Open investigation</span>
    </a>)}
    {!incidents.length && <p role="status" className="p-4 text-sm text-muted">{loading ? "Loading incident journal…" : error ? "Incident records are unavailable." : "No incidents match these filters. Try another search or a controlled scenario."}</p>}
  </div>;
}
