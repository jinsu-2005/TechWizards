import { useEffect, useState } from "react";
import { Database, Search, RefreshCw, ExternalLink } from "lucide-react";
import { useLiveStream } from "../../app/useLiveStream";
import { useLiveSourcePoll } from "../../app/useLiveSourcePoll";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { CopilotDrawer } from "../copilot/CopilotDrawer";
import { useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { getStatus, reportUrl } from "../../lib/api";
import { navigate } from "../../lib/navigation";
import type { Incident } from "../../lib/types";
import { WorkflowPanel } from "./WorkflowPanel";
import { ModelProvenanceCard } from "./ModelProvenanceCard";

const card = "min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm";
const link = "rounded-md px-3 py-2 text-sm text-muted hover:bg-bg hover:text-text";

export function WorkspacePage({ page }: { page: "sources" | "investigations" }) {
  useLiveStream();
  useLiveSourcePoll();
  const status = useLive((s) => s.status);
  const latest = useLive((s) => s.latest);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<string | null>(() => new URLSearchParams(window.location.search).get("incident"));
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const mode = status?.mode ?? latest?.mode;
  useEffect(() => {
    let alive = true; setLoading(true);
    const refresh = async () => {
      try {
        const next = await getStatus();
        const response = await fetch("/api/incidents");
        if (!response.ok) throw new Error("Unable to load incidents");
        const items = await response.json() as Incident[];
        if (alive) { useLive.getState().setStatus(next); setIncidents(items); setError(null); setLoading(false); }
      } catch { if (alive) { setError("Cannot refresh source and incident information. Check the local backend connection."); setLoading(false); } }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [revision, mode]);
  const listed = latest?.incident ? [latest.incident, ...incidents.filter((i) => i.id !== latest.incident?.id)] : incidents;
  const firstCase = listed[0]?.id;
  useEffect(() => { if (!selected && firstCase) setSelected(firstCase); }, [firstCase, selected]);
  const incident = listed.find((i) => i.id === selected) ?? (selected === null ? listed[0] : undefined);
  const heading = page === "sources" ? "Data sources & coverage" : "Incident investigations";
  return (
    <main id="main-workspace" tabIndex={-1} className="content-page bg-bg">
      <div className="page-container flex flex-col gap-3 sm:gap-3.5">
        <WorkspaceHeader current={`/${page}`} />
        <div className="page-heading">
          <div className="page-heading-main">
            <h1>{heading}</h1>
            <span className="hidden sm:inline text-border">·</span>
            <p className="page-heading-context">
              <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded border border-border bg-surface text-text font-semibold">{mode?.toUpperCase() ?? "Unknown"}</span>
              <span>{page === "sources" ? "Know where readings come from and what they establish." : "Compare hypotheses with available evidence."}</span>
            </p>
          </div>
          <div className="page-heading-actions">
            <button aria-label="Refresh workspace" className="page-heading-action" onClick={() => setRevision((v) => v + 1)}>
              <RefreshCw size={14} aria-hidden />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        {error && <div role="alert" className="rounded-lg border border-suspect/50 bg-suspect/10 p-3 text-sm text-suspect">{error} Previously received information may be stale.</div>}
        {page === "sources" ? <>
          <div className="source-cards">
            {[
              { id: "sim", title: "SIM · Simulation", availability: "Built in", text: "A virtual water plant generates readings and controlled test attacks. Use it to develop and compare detection, localization and simulated recovery.", capability: "Launch and reset simulation attacks; request simulation isolation." },
              { id: "hai", title: "HAI · Dataset replay", availability: status ? status.hai_available ? "Dataset available" : "Dataset not installed" : "Availability unknown", text: "HAI means HIL-based Augmented ICS. These are recorded observations from an industrial testbed, played back through the detector. It is not an AI model or a live device connection.", capability: "Replay and evaluate recorded attacks. No new attacks or control actions." },
              { id: "live", title: "LIVE · Connected monitoring", availability: status ? status.live_available ? "Source available" : status.live_reason ?? "Source unavailable" : "Availability unknown", text: "The app polls a configured Modbus TCP source. For this project the target is a local plant emulator, not a physical facility.", capability: "Read current registers and monitor anomalies. AttackTrace containment remains read-only." },
            ].map((source) => <section key={source.id} className={card}>
              <Database size={20} className="mb-3 text-accent" /><h2 className="text-base font-semibold">{source.title}</h2>
              <p className="mt-2 text-xs font-medium text-accent">{source.availability}{mode === source.id ? " · Selected" : ""}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{source.text}</p>
              <p className="mt-4 border-t border-border pt-3 text-sm">{source.capability}</p>
            </section>)}
          </div>
          <details className="min-w-0 rounded-xl border border-border bg-surface p-4" open={mode === "live" ? true : undefined}><summary className="cursor-pointer text-sm font-semibold">LIVE baseline and model references</summary><div className="mt-3"><ModelProvenanceCard /></div></details>
          <section className={card}><h2 className="text-lg font-semibold">What is Modbus?</h2><p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">Modbus is a protocol for exchanging industrial readings and commands. Think of a device exposing a numbered table: registers hold measurements or values, and coils hold on/off states. Modbus TCP carries requests and replies over a TCP connection.</p>
            <ol className="mt-4 grid gap-4 md:grid-cols-3"><li><strong className="text-sm">1. Emulator exposes values</strong><p className="mt-1 text-sm text-muted">A software device holds tank, flow and pump values in its register map.</p></li><li><strong className="text-sm">2. Connector polls registers</strong><p className="mt-1 text-sm text-muted">AttackTrace reads the mapped addresses and records freshness and data quality.</p></li><li><strong className="text-sm">3. Detector compares behavior</strong><p className="mt-1 text-sm text-muted">The process model detects deviations and ranks possible origins.</p></li></ol>
          </section>
          <section className={card}><h2 className="text-lg font-semibold">Coverage and honest limits</h2><div tabIndex={0} role="region" aria-label="Source coverage table" className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr><th className="p-2">Evidence layer</th><th className="p-2">Current coverage</th><th className="p-2">What is still needed</th></tr></thead><tbody>{[["Process values", "SIM, replay or connected reads", "Independent validation outside the test environment"],["Data quality", "Freshness, missing/out-of-range readings", "Preserve and correlate possible malicious disruption"],["Communication origin", "Local proxy paired-reply evidence when enabled", "Independent endpoint provenance outside the controlled emulator"],["Controller integrity", "Emulated configuration hashes and approval/change records", "Real firmware measurements and hardware attestation remain unavailable"],["Propagation", "Inferred process-effect sequence", "Evidence provenance and directed-path validation"]].map(([layer, coverage, next]) => <tr key={layer} className="border-b border-border last:border-0"><th className="p-2 font-medium">{layer}</th><td className="p-2 text-muted">{coverage}</td><td className="p-2 text-muted">{next}</td></tr>)}</tbody></table></div></section>
          <p className="text-xs text-muted">HAI recordings are optional and require local dataset files and trained models. <a className="text-accent underline" href="https://github.com/icsdataset/hai" target="_blank" rel="noreferrer">Dataset reference <ExternalLink size={11} className="inline" /></a></p>
        </> : <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={card}>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Search size={16} />Incidents</h2>
            {listed.length ? <>
              <label className="flex min-w-0 flex-col gap-2 text-xs text-muted lg:hidden">Choose incident
                <select aria-label="Choose incident" value={incident?.id ?? ""} onChange={(e) => navigate(`/investigations?incident=${encodeURIComponent(e.target.value)}`)} className="w-full min-w-0 rounded border border-border bg-bg p-2 text-xs text-text">
                  {!incident && <option value="" disabled>Select a case</option>}
                  {listed.map((item) => <option key={item.id} value={item.id}>{item.origin[0]?.id ?? "Unknown"} · {new Date(item.detected_at * 1000).toLocaleTimeString()} · {item.status}</option>)}
                </select>
              </label>
              <div className="hidden max-h-[70vh] flex-col gap-2 overflow-y-auto lg:flex">{listed.map((item) => <button key={item.id} aria-pressed={incident?.id === item.id} onClick={() => navigate(`/investigations?incident=${encodeURIComponent(item.id)}`)} className={"rounded-lg border p-3 text-left text-sm " + (incident?.id === item.id ? "border-accent bg-accent/10" : "border-border")}><strong title={item.id} className="block truncate font-mono text-sm">{item.origin[0]?.id ?? "Unknown origin"}</strong><span className="mt-1 block truncate font-mono text-xs text-muted">Case {item.id.slice(-8)}</span><span className="mt-1 block text-xs text-muted">{item.status} · {item.origin[0]?.id ?? "Unknown origin"}</span></button>)}</div>
            </> : <p className="text-sm text-muted">{loading ? "Loading incident journal…" : error ? "Incident records are unavailable." : "No incidents in this source. Launch a simulation attack from the dashboard, then return here."}</p>}
          </aside>
          {loading && !incident ? <div role="status" className={card}>Loading investigations…</div> : incident ? <div className="flex min-w-0 flex-col gap-4">
            <section className={card}><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{incident.origin[0]?.id ?? "Unknown origin"} · Incident overview</h2><p className="mt-1 break-all font-mono text-xs text-muted">{incident.id}</p><p className="text-sm text-muted">{incident.status} · {incident.ambiguous ? "Competing origin hypotheses" : "Origin ranking available"}</p></div><div className="flex gap-2"><a href={reportUrl(incident.id)} className={link}>Export report</a><button className={link} onClick={() => useUi.getState().setCopilotOpen(true)}>Ask AI Pilot</button></div></div><p className="mt-3 text-sm">{incident.explanation}</p></section>
            <section className={card}><h2 className="font-semibold">Compare origin hypotheses</h2><p className="mt-1 text-xs text-muted">Confidence ranks candidates; it is not a verified probability of compromise. Contributions may differ from final ordering after tie rules.</p><div className="mobile-hypotheses mt-4">{incident.origin.map((candidate, rank) => <article key={candidate.id}><div className="flex items-center justify-between gap-3"><span className="font-mono font-semibold">{rank + 1}. {candidate.id}</span><strong className="font-mono text-accent">{(candidate.confidence * 100).toFixed(1)}%</strong></div><p className="mt-1 text-sm text-muted">{candidate.type} · inferred candidate</p><dl>{(["deviation", "onset", "causal"] as const).map((key) => <div key={key}><dt>{key === "causal" ? "Topology" : key === "deviation" ? "Deviation" : "Onset"}</dt><dd>{candidate.breakdown?.[key].toFixed(3) ?? "Not recorded"}</dd></div>)}</dl></article>)}</div><div className="mt-3 hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted"><tr>{["Candidate", "Type", "Confidence", "Deviation", "Onset", "Topology"].map((name) => <th key={name} className="p-2">{name}</th>)}</tr></thead><tbody>{incident.origin.map((candidate) => <tr key={candidate.id} className="border-b border-border last:border-0"><th className="p-2 font-mono font-medium">{candidate.id}</th><td className="p-2">{candidate.type}</td><td className="p-2 font-mono">{(candidate.confidence * 100).toFixed(1)}%</td>{(["deviation", "onset", "causal"] as const).map((key) => <td key={key} className="p-2 font-mono">{candidate.breakdown?.[key].toFixed(3) ?? "Not recorded"}</td>)}</tr>)}</tbody></table></div></section>
            <section className={card}><h2 className="font-semibold">Inferred process-effect timeline</h2><p className="mt-1 text-xs text-muted">Offsets are relative to the first anomalous onset, not proof of packet traversal.</p><ol className="mt-3 flex flex-wrap gap-2">{incident.path.map((step) => <li key={step.id} className="rounded-md border border-border bg-bg p-2 text-sm"><span className="font-mono">{step.id}</span><span className="ml-2 text-muted">+{step.t.toFixed(1)}s</span></li>)}</ol></section>
            <WorkflowPanel key={`${mode}:${incident.id}`} incidentId={incident.id} mode={mode ?? "unknown"} />
            <section className={card}><h2 className="font-semibold">What this evidence cannot establish</h2><p className="mt-2 text-sm leading-relaxed text-muted">An abnormal component reading alone cannot distinguish device compromise, message tampering, controller/firmware changes, and a benign fault. Review the linked local-lab records where available. Real firmware provenance remains unavailable. Verify alternative explanations before treating a ranked hypothesis as a confirmed origin.</p></section>
          </div> : selected ? <div className={card}>The selected incident is no longer available in this source. Choose another incident.</div> : <div className={card}><h2 className="font-semibold">Start with a controlled scenario</h2><p className="mt-2 text-sm text-muted">Use SIM to create evidence. This workspace will show ranked candidates and their recorded contributions without inventing missing network or firmware evidence.</p></div>}
        </div>}
      </div><CopilotDrawer selectedIncident={page === "investigations" ? incident : undefined} />
    </main>
  );
}
