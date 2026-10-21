import { useAccess } from "../auth/access";
import { useEffect, useState } from "react";
import { getInvestigation, updateWorkflow } from "../../lib/api";
import type { InvestigationDetail } from "../../lib/types";
import { EvidenceList } from "./EvidenceList";
import { IncidentEvidencePanel } from "./IncidentEvidencePanel";

export function WorkflowPanel({ incidentId, mode }: { incidentId: string; mode: string }) {
  const { canInvestigate, privateMode, email } = useAccess();
  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [category, setCategory] = useState("all");
  const [asset, setAsset] = useState("all");
  useEffect(() => {
    let alive = true;
    setDetail(null); setNote(""); setError(null); setLoadError(null); setSaved(""); setAsset("all"); setCategory("all");
    const refresh = () => getInvestigation(incidentId).then((d) => { if (alive) { setDetail(d); setLoadError(null); } }, () => { if (alive) setLoadError("Unable to refresh the investigation journal. Showing the last received evidence, if available."); });
    void refresh(); const timer = setInterval(() => void refresh(), 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [incidentId, mode]);
  const change = async (value: Record<string, unknown>) => {
    setBusy(true); setError(null); setSaved("");
    try {
      setDetail(await updateWorkflow(incidentId, value));
      if (value.note) setNote("");
      setSaved(value.note ? "Investigation note saved." : "Case workflow saved.");
    }
    catch (e) { setError(e instanceof TypeError ? "Unable to save. Check the connection and try again. Your draft has been kept." : e instanceof Error ? e.message : "Could not save decision. Your draft has been kept."); }
    finally { setBusy(false); }
  };
  const field = "rounded border border-border bg-bg px-2 py-2 text-sm";
  const events = detail?.events ?? [];
  return <section className="rounded-xl border border-border bg-surface p-4">
    <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Analyst workflow & evidence</h2><a className="text-xs text-accent underline" href={`/api/investigations/${encodeURIComponent(incidentId)}/export`} target="_blank" rel="noreferrer">Export evidence JSON ↗</a></div><p className="mt-1 text-xs text-muted">Analyst decisions are separate from detector state. Identity: {privateMode ? email : "local analyst, not authenticated"}.</p>
    {loadError && <p role="alert" className="mt-2 text-sm text-suspect">{loadError}</p>}
    {!detail ? <p className="mt-3 text-sm text-muted">Loading saved evidence…</p> : <>
      <IncidentEvidencePanel detail={detail} />
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <button disabled={busy || !canInvestigate} onClick={() => void change({ acknowledged: !detail.workflow.acknowledged })} className={field}>{detail.workflow.acknowledged ? "Acknowledged ✓" : "Acknowledge incident"}</button>
        <label className="flex flex-col gap-1 text-xs text-muted">Analyst severity<select disabled={busy || !canInvestigate} aria-label="Analyst severity" className={field} value={detail.workflow.severity ?? ""} onChange={(e) => void change({ severity: e.target.value })}><option value="" disabled>Unassigned</option>{["low", "medium", "high", "critical"].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="flex flex-col gap-1 text-xs text-muted">Case state<select disabled={busy || !canInvestigate} aria-label="Case state" className={field} value={detail.workflow.state ?? "new"} onChange={(e) => void change({ state: e.target.value })}>{["new", "investigating", "resolved"].map((s) => <option key={s}>{s}</option>)}</select></label>
      </div>
      <form className="mt-4 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (canInvestigate && note.trim()) void change({ note: note.trim() }); }}><label htmlFor="case-note" className="text-sm">Add investigation note</label><textarea id="case-note" className={field} rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Evidence reviewed, alternatives, decision and next check…" /><button disabled={busy || !canInvestigate || !note.trim()} className="self-start rounded bg-accent px-3 py-2 text-sm text-on-accent disabled:opacity-40">{busy ? "Saving…" : "Save note"}</button></form>
      {error && <p role="alert" className="mt-2 text-sm text-suspect">{error}</p>}
      <p role="status" className="mt-2 text-sm text-normal">{saved}</p>
      <p className="mt-3 text-xs text-muted">{detail.retention}. Archived detector states describe their last recorded state and do not imply monitoring continued after shutdown.</p>
      {!!detail.related_incidents?.length && <div className="mt-3 rounded border border-border p-3 text-xs"><h3 className="font-semibold">Related incidents · heuristic matches</h3>{detail.related_incidents.map((i) => <p className="mt-2" key={i.id}><a className="text-accent underline" href={`/investigations?incident=${encodeURIComponent(i.id)}`}>{i.id.slice(0, 16)}…</a> · {i.reason}</p>)}</div>}
      <h3 className="mt-5 border-t border-border pt-4 text-sm font-semibold">Corroborating layer hypotheses</h3><p className="mt-1 text-xs text-muted">These use separate protocol/configuration evidence and do not alter process-model confidence. Source context includes records near this incident in the same session; timing does not establish causation.</p>
      {detail.layer_hypotheses?.length ? <div className="mt-3 grid gap-2">{detail.layer_hypotheses.map((h) => <div key={h.candidate_id} className="rounded border border-border bg-bg p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong className="font-mono">{h.candidate_id}</strong><span className={h.result === "supported" ? "text-suspect" : "text-muted"}>{h.result.replaceAll("_", " ")}</span></div><p className="mt-1">{h.explanation}</p><p className="mt-1 text-xs text-muted">{h.scope}</p>{h.event_ids.map((id) => <a key={id} href={`/api/evidence/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-accent underline">Supporting record ↗</a>)}</div>)}</div> : <p className="mt-2 text-sm text-muted">No paired channel or integrity records in this incident/session window. These origin categories remain unresolved.</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4"><h3 className="mr-auto text-sm font-semibold">Evidence chronology · newest first</h3><select aria-label="Evidence category" className={field} value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{[...new Set(events.map((e) => e.category))].map((c) => <option key={c} value={c}>{c.replaceAll("_", " ")}</option>)}</select><select aria-label="Evidence asset" className={field} value={asset} onChange={(e) => setAsset(e.target.value)}><option value="all">All assets</option>{[...new Set(events.flatMap((e) => e.asset_id ? [e.asset_id] : []))].map((a) => <option key={a}>{a}</option>)}</select></div>
      <div role="region" aria-label="Recorded evidence chronology" tabIndex={0} className="mt-2 max-h-[440px] overflow-auto"><EvidenceList events={events.filter((e) => (category === "all" || e.category === category) && (asset === "all" || e.asset_id === asset))} /></div>
    </>}
  </section>;
}
