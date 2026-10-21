import { useEffect, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { selectView, useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { formatValue } from "../../lib/format";
import { getEvidence } from "../../lib/api";
import type { EvidenceEvent } from "../../lib/types";
import { EvidenceList } from "./EvidenceList";

export function AssetInspector() {
  const id = useUi((s) => s.selectedAsset);
  const select = useUi((s) => s.selectAsset);
  const view = useLive(selectView);
  const topology = useLive((s) => s.topology);
  const cursor = useLive((s) => s.cursor);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [error, setError] = useState(false);
  const mode = view?.mode;
  const incidentId = view?.incident?.id;
  useEffect(() => {
    setEvents([]); setError(false);
    if (!id) return;
    let alive = true;
    const refresh = () => getEvidence(id, incidentId).then((items) => { if (alive) { setEvents(items); setError(false); } }, () => { if (alive) setError(true); });
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [id, mode, incidentId]);
  if (!id) return null;
  const asset = topology?.nodes.find((n) => n.id === id);
  const reading = view?.nodes.find((n) => n.id === id);
  const candidate = view?.incident?.origin.find((n) => n.id === id);
  const neighbors = [...new Set(topology?.edges.filter((e) => e.src === id || e.dst === id).flatMap((e) => [e.src, e.dst]).filter((n) => n !== id))];
  return <aside aria-label="Asset inspector" className="asset-inspector border-l border-border bg-surface p-3">
    <div className="flex items-start justify-between gap-2"><div><h3 className="font-mono font-semibold">{id}</h3><p className="text-xs text-muted">{asset?.label ?? "Asset unavailable in this source"} · {asset?.type}</p></div><button aria-label="Close asset inspector" onClick={() => select(null)} className="rounded p-1 text-muted hover:text-text"><X size={16} /></button></div>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-muted">Reported reading</dt><dd className="mt-1 font-mono text-base">{reading ? formatValue(id, reading.value) : "Unavailable"}</dd></div><div><dt className="text-muted">Status / quality</dt><dd className="mt-1">{reading?.status ?? "Unknown"} / {reading?.quality ?? (mode === "sim" ? "Simulated" : "Not supplied")}</dd></div><div><dt className="text-muted">Simulator truth</dt><dd className="mt-1">{reading?.truth != null ? formatValue(id, reading.truth) : "Unavailable"}</dd></div><div><dt className="text-muted">Candidate confidence</dt><dd className="mt-1">{candidate ? `${(candidate.confidence * 100).toFixed(1)}% · inferred` : "Not ranked"}</dd></div></dl>
    <p className="mt-3 text-xs text-muted">{cursor === null ? "Latest received" : "Replay"} source time: {view ? new Date(view.t * 1000).toLocaleTimeString() : "Unavailable"}. Stored records below use receipt time and may include later observations.</p>
    <h4 className="mt-4 text-xs font-semibold">Connected assets</h4><div className="mt-2 flex flex-wrap gap-1">{neighbors.map((n) => <button key={n} onClick={() => select(n)} className="rounded border border-border px-2 py-1 font-mono text-xs hover:border-accent">{n}</button>)}</div>
    {incidentId && <a className="mt-4 inline-flex items-center gap-1 text-xs text-accent underline" href={`/investigations?incident=${encodeURIComponent(incidentId)}`}>Open investigation <ArrowUpRight size={13} /></a>}
    <h4 className="mt-4 border-t border-border pt-3 text-sm font-semibold">Recorded evidence</h4>{error ? <p role="alert" className="mt-2 text-xs text-suspect">Evidence unavailable. Check backend connection.</p> : <EvidenceList events={events.slice(0, 12)} />}
  </aside>;
}
