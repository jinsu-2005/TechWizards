import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { Maximize, Minimize } from "lucide-react";
import { useUi } from "../../store/ui";
import { selectView, useLive } from "../../store/live";
import { TwinView } from "../twin/TwinView";
import { AssetInspector } from "./AssetInspector";
import { IncidentProgress } from "./IncidentProgress";
import { useModalFocus } from "../../lib/useModalFocus";

const GraphView = lazy(() => import("../graph/GraphView").then((m) => ({ default: m.GraphView })));

export function ProcessWorkspace({ graph }: { graph: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("asset");
    if (id) useUi.getState().selectAsset(id);
  }, []);
  useModalFocus(expanded, container, () => setExpanded(false), '[aria-label="Exit expanded view"]');
  const selected = useUi((s) => s.selectedAsset);
  const select = useUi((s) => s.selectAsset);
  const topology = useLive((s) => s.topology);
  const view = useLive(selectView);
  const replay = useLive((s) => s.cursor !== null);
  const incident = view?.incident;
  return <div ref={container} tabIndex={expanded ? -1 : undefined} role={expanded ? "dialog" : undefined} aria-modal={expanded ? true : undefined} aria-label="Process investigation workspace" className={`process-workspace flex h-full min-h-0 flex-col bg-bg ${expanded ? "workspace-expanded" : ""}`}>
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs">
      <span className="mr-auto text-muted">{replay ? "Historical replay" : "Latest received"} · {view?.mode.toUpperCase()} · {view ? new Date(view.t * 1000).toLocaleTimeString() : "Waiting for data"}</span>
      <select aria-label="Inspect asset" className="max-w-[180px] rounded border border-border bg-surface p-1 text-text" value={selected ?? ""} onChange={(e) => select(e.target.value || null)}><option value="">Inspect an asset…</option>{topology?.nodes.map((n) => <option key={n.id} value={n.id}>{n.id} · {n.type}</option>)}</select>
      <button aria-label={expanded ? "Exit expanded view" : "Expand process workspace"} onClick={() => setExpanded(!expanded)} className="rounded border border-border p-1.5">{expanded ? <Minimize size={14} /> : <Maximize size={14} />}</button>
    </div>
    {incident && <IncidentProgress incident={incident} mode={view?.mode ?? "unknown"} asOf={replay ? view?.t : undefined} />}
    <div className={`process-canvas min-h-0 flex-1 ${selected ? "has-inspector" : ""}`}><div className="process-primary min-h-0 min-w-0">{graph ? <Suspense fallback={<p className="p-4 text-sm text-muted">Loading process graph…</p>}><GraphView key={view?.mode} /></Suspense> : <TwinView />}</div><AssetInspector /></div>
    {expanded && <button className="border-t border-border p-2 text-xs text-muted" onClick={() => setExpanded(false)}>Close expanded view</button>}
  </div>;
}
