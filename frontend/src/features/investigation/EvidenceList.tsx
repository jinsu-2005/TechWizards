import type { EvidenceEvent } from "../../lib/types";

export function EvidenceList({ events }: { events: EvidenceEvent[] }) {
  if (!events.length) return <p className="text-sm text-muted">No recorded evidence for this selection yet. Unavailable evidence does not establish an origin.</p>;
  return <ol className="divide-y divide-border">{events.slice(0, 100).map((event) => <li key={event.id} className="py-3 text-sm" id={event.id}>
    <div className="flex flex-wrap justify-between gap-2"><strong className="font-medium">{event.category.replaceAll("_", " ")}{event.asset_id ? ` · ${event.asset_id}` : ""}</strong><time className="text-xs text-muted">{new Date(event.received_at * 1000).toLocaleString()}</time></div>
    <p className="mt-1 break-words text-xs text-muted">{Object.entries(event.payload).filter(([key]) => !["origin", "classification", "clock", "unit_source"].includes(key)).map(([key, value]) => `${key.replaceAll("_", " ")}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`).join(" · ")}</p>
    <a className="mt-1 inline-block text-xs text-accent underline" href={event.record_url} target="_blank" rel="noreferrer">{event.payload.classification === "inference" ? "Inferred" : "Recorded"} · {event.id.slice(0, 15)} ↗</a>
  </li>)}</ol>;
}
