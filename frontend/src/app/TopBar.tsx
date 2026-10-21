import { Columns2, Database } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "../components/ui/ModeToggle";
import { SourcePill } from "../components/ui/SourcePill";
import { StatusPill } from "../components/ui/StatusPill";
import { WorkspaceHeader } from "../components/ui/WorkspaceHeader";
import { getTopology, setMode as postMode } from "../lib/api";
import { pillKind } from "../lib/pill";
import type { Mode } from "../lib/types";
import { useLive } from "../store/live";
import { useUi } from "../store/ui";

const SOURCE_NAMES = { sim: "Local simulation", hai: "HAI dataset replay", live: "Modbus monitoring" };
export function TopBar() {
  const conn = useLive((s) => s.conn);
  const latest = useLive((s) => s.latest);
  const status = useLive((s) => s.status);
  const split = useUi((s) => s.split);
  const toggleSplit = useUi((s) => s.toggleSplit);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = latest?.mode ?? status?.mode ?? "sim";
  const calibrating = mode === "live" && (status?.source?.calibration != null || status?.source?.state === "calibrating");
  const flagged = latest?.nodes.filter((n) => n.status !== "normal").length ?? 0;
  const change = async (next: Mode) => {
    if (changing) return;
    setChanging(true); setError(null);
    try {
      const result = await postMode(next);
      useLive.getState().setStatus(result); useUi.getState().selectAsset(null);
      useLive.getState().clear(); useLive.getState().setTopology(await getTopology());
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to change the source. Try again."); }
    finally { setChanging(false); }
  };
  return <div className="monitoring-header"><WorkspaceHeader current="/" />
    <div className="monitoring-heading"><div><h1>Process monitoring</h1><p>{latest ? `${latest.nodes.length} assets · ${flagged} flagged readings` : "Connecting to the process"} · {SOURCE_NAMES[mode]}</p></div>{calibrating ? <span role="status" className="text-sm text-muted">Baseline in progress</span> : <StatusPill kind={pillKind(conn, latest)} />}</div>
    <div className="source-toolbar"><div className="source-selector" aria-busy={changing}><span className="source-label">Data source</span><ModeToggle mode={mode} haiAvailable={status?.hai_available ?? false} liveAvailable={status?.live_available ?? false} liveReason={status?.live_reason} onChange={(next) => { void change(next); }} />{changing && <span role="status" className="text-xs text-muted">Switching…</span>}</div>
      <div className="source-actions">{mode === "live" && status?.source && <SourcePill source={status.source} />}<a href="/sources" className="toolbar-action"><Database size={14} aria-hidden />Source details</a><button type="button" aria-pressed={split} aria-label="Split view" title="Compare baseline with AttackTrace" onClick={toggleSplit} className="toolbar-action"><Columns2 size={14} aria-hidden />Compare baseline</button><span className="detector-label">Model <strong>{status?.detector_active?.toUpperCase() ?? "Pending"}</strong></span></div>
    </div>{error && <p role="alert" className="rounded-md border border-origin/40 bg-origin/10 p-3 text-sm text-origin">{error}</p>}
  </div>;
}
