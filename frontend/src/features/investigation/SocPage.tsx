import { useEffect, useState } from "react";
import { useLiveStream } from "../../app/useLiveStream";
import { useLiveSourcePoll } from "../../app/useLiveSourcePoll";
import { useFreshness } from "../../app/useFreshness";
import { useLive, selectView } from "../../store/live";
import { getIncidents, getWorkflows, getAssetRegisters } from "../../lib/api";
import { formatValue } from "../../lib/format";
import type { Incident, InvestigationDetail } from "../../lib/types";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { LocalLab } from "./LocalLab";
import { useAccess } from "../auth/access";
import { MobileIncidentCards } from "./MobileIncidentCards";

export function SocPage({ page }: { page: "alerts" | "assets" | "lab" }) {
  const { canAdmin } = useAccess();
  useLiveStream(); useLiveSourcePoll();
  const view = useLive(selectView);
  const status = useLive((s) => s.status);
  const topology = useLive((s) => s.topology);
  const health = useLive((s) => s.liveHealth);
  const { stale } = useFreshness();
  const mode = status?.mode ?? view?.mode ?? "sim";
  const [items, setItems] = useState<Incident[]>([]);
  const [workflows, setWorkflows] = useState<Record<string, InvestigationDetail["workflow"]>>({});
  const [registers, setRegisters] = useState<Awaited<ReturnType<typeof getAssetRegisters>>>({});
  const [error, setError] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    let alive = true; setItems([]); setWorkflows({}); setRecordsLoading(true);
    const refresh = async () => {
      try {
        const [incidents, savedWorkflows, registerMap] = await Promise.all([getIncidents(), getWorkflows(), getAssetRegisters()]);
        if (!alive) return;
        setItems(incidents); setError(false);
        setWorkflows(savedWorkflows); setRegisters(registerMap);
      } catch { if (alive) setError(true); }
      finally { if (alive) setRecordsLoading(false); }
    };
    void refresh(); const timer = setInterval(() => void refresh(), 10000);
    return () => { alive = false; clearInterval(timer); };
  }, [mode]);
  const list = view?.incident ? [view.incident, ...items.filter((i) => i.id !== view.incident?.id)] : items;
  const shown = list.filter((i) => `${i.id} ${i.origin.map((c) => c.id).join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "unacknowledged" ? !workflows[i.id]?.acknowledged : filter === "active" ? ["open", "localizing"].includes(i.status) && workflows[i.id]?.state !== "resolved" : workflows[i.id]?.severity === filter)));
  const assetRows = (topology?.nodes ?? []).filter((n) => `${n.id} ${n.label}`.toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || n.type === filter));
  const card = "min-w-0 rounded-xl border border-border bg-surface p-4";
  return <main id="main-workspace" tabIndex={-1} className="content-page bg-bg"><div className="page-container flex flex-col gap-3 sm:gap-3.5">
    <WorkspaceHeader current={`/${page}`} />
    <div className="page-heading">
      <div className="page-heading-main">
        <h1>{page === "alerts" ? "Security overview & alerts" : page === "assets" ? "Assets & source health" : "Local attribution lab"}</h1>
        <span className="hidden sm:inline text-border">·</span>
        <p className="page-heading-context">
          <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded border border-border bg-surface text-text font-semibold">{mode.toUpperCase()}</span>
          <span>{stale ? "Readings stale or disconnected" : "Receiving telemetry"}</span>
          {page === "lab" && <span>· Controlled emulator experiments</span>}
        </p>
      </div>
      <div className="page-heading-actions">
        <a href={page === "lab" ? "/sources" : "/"} className="page-heading-action">
          <span>{page === "lab" ? "Review source coverage" : "Open process monitoring"}</span>
          <span aria-hidden>→</span>
        </a>
      </div>
    </div>
    {page === "lab" ? canAdmin ? <LocalLab /> : <p className={card}>Local experiments require administrator access. Monitoring and evidence remain available from the workspace navigation.</p> : page === "assets" ? <>
      <div className="soc-summary grid grid-cols-3 gap-2 sm:gap-3">{[["Assets", topology?.nodes.length ?? 0], ["Flagged readings", view?.nodes.filter((n) => n.status !== "normal").length ?? 0], ["Quality issues", health?.filter((n) => n.quality !== "good").length ?? "Not supplied"]].map(([label, value]) => <section key={label} className={card}><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></section>)}</div>
      <section className={card}><div className="collection-toolbar"><input aria-label="Search assets" className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm" placeholder="Search tag or asset name…" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filter asset role" className="rounded-md border border-border bg-bg px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>{["all", "sensor", "controller", "actuator"].map((role) => <option key={role} value={role}>{role === "all" ? "All roles" : role}</option>)}</select><span className="text-xs text-muted">{assetRows.length} / {topology?.nodes.length ?? 0} assets</span></div><p className="mb-3 text-xs text-muted">Select an asset to inspect its readings and evidence.</p><div className="mobile-asset-list">{assetRows.map((asset) => { const reading = view?.nodes.find((n) => n.id === asset.id); return <a key={asset.id} href={`/?asset=${encodeURIComponent(asset.id)}`} className="incident-list-card"><div className="incident-list-heading"><strong className="font-mono text-accent">{asset.id}</strong><span className="font-mono">{reading ? formatValue(reading.id, reading.value) : "Unavailable"}</span></div><p className="mt-2 text-sm">{asset.label}</p><p className="mt-1 text-xs text-muted">{asset.type} · {reading?.status ?? "Unknown state"}</p><span className="mt-3 block text-xs font-medium text-accent">Inspect readings and evidence</span></a>; })}{!assetRows.length && <p className="p-4 text-sm text-muted">No assets match these filters.</p>}</div><div tabIndex={0} role="region" aria-label="Asset table" className="hidden max-h-[680px] overflow-auto rounded-lg border border-border md:block"><table className="w-full text-left text-sm"><thead className="sticky top-0 z-10 border-b border-border bg-surface text-muted"><tr>{["Asset", "Role", "Reported", "Status", "Quality / age", "Modbus map", "Coverage"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{assetRows.map((asset) => { const n = view?.nodes.find((n) => n.id === asset.id); const q = health?.find((h) => h.node_id === asset.id); return <tr key={asset.id} className="border-b border-border"><th className="p-3"><a className="font-mono text-accent underline" href={`/?asset=${encodeURIComponent(asset.id)}`}>{asset.id}</a><p className="mt-1 font-normal text-xs text-muted">{asset.label}</p></th><td className="p-3">{asset.type}</td><td className="p-3 font-mono">{n ? formatValue(n.id, n.value) : "Unavailable"}</td><td className="p-3">{n?.status ?? "Unknown"}</td><td className="p-3">{q ? `${q.quality} · ${q.age_ms === null ? "unknown age" : `${Math.round(q.age_ms)}ms`}` : mode === "sim" ? "Generated locally" : "Not supplied"}</td><td className="p-3 text-xs text-muted">{registers[asset.id] ? `${registers[asset.id]?.table} ${registers[asset.id]?.address} · ${registers[asset.id]?.encoding}` : mode === "hai" ? "Not applicable to replay" : "Not mapped"}</td><td className="p-3 text-xs text-muted">{mode === "hai" ? "Recorded telemetry; channel and firmware evidence unavailable" : `Process telemetry${mode === "sim" ? " + simulator truth" : ""}; local lab evidence where linked`}</td></tr>; })}</tbody></table>{!assetRows.length && <p className="p-6 text-sm text-muted">{topology ? "No assets match these filters." : "Waiting for source topology…"}</p>}</div></section>
    </> : <>
      <div className="soc-summary grid grid-cols-3 gap-2 sm:gap-3">{[["Recorded incidents", recordsLoading ? "…" : list.length], ["Current incident", view?.incident?.status ?? "None"], ["Needs review", recordsLoading ? "…" : list.filter((i) => !workflows[i.id]?.acknowledged).length]].map(([label, value]) => <section key={label} className={card}><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></section>)}</div>
      {error && <p role="alert" className="text-sm text-suspect">Could not refresh incidents. Displayed records may be stale.</p>}
      <section className={card}><div className="collection-toolbar"><input aria-label="Search incidents" className="min-w-0 flex-1 rounded border border-border bg-bg p-2 text-sm" placeholder="Search incident or candidate asset…" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filter incidents" className="rounded border border-border bg-bg p-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>{["all", "active", "unacknowledged", "critical", "high", "medium", "low"].map((f) => <option key={f}>{f}</option>)}</select></div>
      <MobileIncidentCards incidents={shown} workflows={workflows} loading={recordsLoading} error={error} /><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr>{["Incident", "Recorded detection", "Origin hypothesis", "Detector / case", "Analyst severity", "Acknowledgment"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{shown.map((i) => <tr key={i.id} className="border-b border-border"><th className="p-3"><a className="text-accent underline" href={`/investigations?incident=${encodeURIComponent(i.id)}`}>{i.id.slice(0, 16)}…</a></th><td className="p-3">{new Date(i.detected_at * 1000).toLocaleString()}</td><td className="p-3">{i.origin[0]?.id ?? "Unknown"}{i.ambiguous ? " · ambiguous" : ""}</td><td className="p-3">{i.status} / {workflows[i.id]?.state ?? "new"}</td><td className="p-3">{workflows[i.id]?.severity ?? "Unassigned"}</td><td className="p-3">{workflows[i.id]?.acknowledged ? "Acknowledged" : "Pending"}</td></tr>)}</tbody></table>{!shown.length && <p className="p-6 text-sm text-muted">{recordsLoading ? "Loading incident journal…" : error ? "Incident records are unavailable." : "No incidents match. Use a controlled SIM scenario to generate evidence."}</p>}</div><p className="mt-3 text-xs text-muted">Stored detector states are historical observations. Only the current incident is actively evaluated; severity is assigned by the analyst.</p></section>
    </>}
  </div></main>;
}
