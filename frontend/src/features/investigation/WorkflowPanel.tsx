import { useEffect, useState } from "react";
import {
  Activity, Database, ShieldAlert, Clock, AlertTriangle,
  ShieldCheck, Layers, GitBranch, ExternalLink, UserCheck, Check, Sparkles, AlertCircle
} from "lucide-react";
import { useAccess } from "../auth/access";
import { getInvestigation, updateWorkflow } from "../../lib/api";
import type { Incident, InvestigationDetail } from "../../lib/types";
import { EvidenceList } from "./EvidenceList";
import { IncidentEvidencePanel } from "./IncidentEvidencePanel";

interface WorkflowPanelProps {
  incidentId: string;
  mode: string;
  incident: Incident;
}

export function WorkflowPanel({ incidentId, mode, incident }: WorkflowPanelProps) {
  const { canInvestigate, privateMode, email } = useAccess();
  const [detail, setDetail] = useState<InvestigationDetail | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [category, setCategory] = useState("all");
  const [asset, setAsset] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "telemetry" | "workflow" | "events">("overview");

  useEffect(() => {
    let alive = true;
    setDetail(null);
    setNote("");
    setError(null);
    setLoadError(null);
    setSaved("");
    setAsset("all");
    setCategory("all");

    const refresh = () =>
      getInvestigation(incidentId).then(
        (d) => {
          if (alive) {
            setDetail(d);
            setLoadError(null);
          }
        },
        () => {
          if (alive)
            setLoadError("Unable to refresh the investigation journal. Showing the last received evidence, if available.");
        }
      );

    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [incidentId, mode]);

  const change = async (value: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    setSaved("");
    try {
      setDetail(await updateWorkflow(incidentId, value));
      if (value.note) setNote("");
      setSaved(value.note ? "Investigation note saved." : "Case workflow saved.");
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Unable to save. Check the connection and try again. Your draft has been kept."
          : e instanceof Error
          ? e.message
          : "Could not save decision. Your draft has been kept."
      );
    } finally {
      setBusy(false);
    }
  };

  const events = detail?.events ?? [];
  const filteredEvents = events.filter(
    (e) => (category === "all" || e.category === category) && (asset === "all" || e.asset_id === asset)
  );

  const categories = [...new Set(events.map((e) => e.category))];
  const assets = [...new Set(events.flatMap((e) => (e.asset_id ? [e.asset_id] : [])))];

  interface TabItem {
    id: "overview" | "telemetry" | "workflow" | "events";
    label: string;
    icon: typeof Activity;
    count?: number;
    badge?: string;
  }

  const tabs: TabItem[] = [
    { id: "overview", label: "Hypotheses & Flow", icon: Activity, count: incident.origin.length },
    { id: "telemetry", label: "Preserved Telemetry", icon: Database, badge: detail?.capture?.status === "captured" ? "Verified" : undefined },
    { id: "workflow", label: "Analyst Triage & Notes", icon: ShieldAlert },
    { id: "events", label: "Evidence Stream", icon: Clock, count: events.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Investigation Section Navigation Tabs ── */}
      <div className="rounded-xl border border-border bg-surface/90 shadow-sm p-1.5 backdrop-blur-md sticky top-3 z-20">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inv-tab-btn flex-1 min-w-fit rounded-lg ${isActive ? "active" : ""}`}
              >
                <Icon size={14} className={isActive ? "text-accent" : "text-muted"} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-mono ${
                    isActive ? "bg-accent/20 text-accent font-semibold" : "bg-bg text-muted"
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono text-normal bg-normal/15 border border-normal/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loadError && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-suspect/40 bg-suspect/10 p-3 text-xs text-suspect">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: HYPOTHESES & FLOW (Overview)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Origin Hypotheses Matrix */}
          <section className="rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-base text-text flex items-center gap-2">
                  <Activity size={16} className="text-accent" />
                  Compare origin hypotheses
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Topological Bayesian ranking across deviation, onset timing, and causal propagation.
                </p>
              </div>
              {incident.ambiguous && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-suspect/15 border border-suspect/30 px-3 py-1 text-xs font-semibold text-suspect">
                  <AlertCircle size={12} />
                  Ambiguous ranking · Top candidates tied
                </span>
              )}
            </div>

            {/* Mobile View */}
            <div className="mobile-hypotheses mt-4">
              {incident.origin.map((candidate, rank) => (
                <article key={candidate.id} className="rounded-xl border border-border/80 bg-bg/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-bold text-sm text-text">
                      <span className="inline-block w-5 text-accent font-semibold">#{rank + 1}</span> {candidate.id}
                    </span>
                    <strong className="font-mono text-accent text-sm">{(candidate.confidence * 100).toFixed(1)}%</strong>
                  </div>
                  <p className="mt-1 text-xs text-muted capitalize">{candidate.type} · inferred candidate</p>
                  <dl className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    {(["deviation", "onset", "causal"] as const).map((key) => (
                      <div key={key} className="bg-surface p-2 rounded border border-border/60">
                        <dt className="text-muted text-[10.5px] uppercase">{key === "causal" ? "Topology" : key === "deviation" ? "Deviation" : "Onset"}</dt>
                        <dd className="font-mono font-medium text-text mt-0.5">{candidate.breakdown?.[key].toFixed(3) ?? "Not recorded"}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>

            {/* Desktop Modern Table */}
            <div className="mt-3 hidden overflow-x-auto md:block rounded-lg border border-border/80">
              <table className="inv-data-table">
                <thead>
                  <tr>
                    {["Rank & Candidate", "Type", "Confidence Score", "Deviation (0.6)", "Onset (0.2)", "Topology (0.2)"].map((name) => (
                      <th key={name}>{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incident.origin.map((candidate, idx) => {
                    const isTop = idx === 0;
                    return (
                      <tr key={candidate.id} className={isTop ? "bg-accent/[0.04]" : ""}>
                        <th className="font-mono font-semibold text-text">
                          <span className="inline-flex items-center gap-2">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                              isTop ? "bg-accent text-on-accent shadow-sm" : "bg-bg text-muted border border-border"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="text-sm">{candidate.id}</span>
                          </span>
                        </th>
                        <td>
                          <span className="rounded bg-bg border border-border/80 px-2 py-0.5 font-mono text-xs text-muted capitalize">
                            {candidate.type}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="h-1.5 w-24 rounded-full bg-border overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-normal rounded-full"
                                style={{ width: `${Math.round(candidate.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs font-bold text-accent">
                              {(candidate.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        {(["deviation", "onset", "causal"] as const).map((key) => {
                          const val = candidate.breakdown?.[key];
                          return (
                            <td key={key} className="font-mono text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-bg/80 border border-border/50">
                                {val !== undefined ? val.toFixed(3) : "Not recorded"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Inferred Process-Effect Timeline */}
          <section className="rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-base text-text flex items-center gap-2">
                  <GitBranch size={16} className="text-accent" />
                  Inferred process-effect timeline
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Relative millisecond offsets from first onset through process downstream.
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-2 scrollbar-none">
              <ol className="flex items-center gap-2 min-w-max">
                {incident.path.map((step, index) => {
                  const isFirst = index === 0;
                  return (
                    <li key={step.id} className="inv-timeline-step flex items-center gap-2">
                      {index > 0 && (
                        <div className="flex items-center text-muted/50 px-0.5">
                          <span className="h-px w-3 bg-border" />
                          <span className="text-[10px] font-mono text-accent">▶</span>
                        </div>
                      )}
                      <div className={`flex flex-col gap-1 rounded-xl border p-3 min-w-[120px] transition-all ${
                        isFirst
                          ? "border-origin/60 bg-origin/10 shadow-[0_0_12px_rgba(248,81,73,0.15)]"
                          : "border-border/80 bg-bg/80 hover:border-accent/40"
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-muted uppercase font-semibold">
                            {isFirst ? "Origin" : `Step ${index + 1}`}
                          </span>
                          <span className={`font-mono text-xs font-bold ${isFirst ? "text-origin" : "text-accent"}`}>
                            +{step.t.toFixed(1)}s
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-text mt-0.5">
                          {step.id}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* Corroborating Layer Hypotheses */}
          <section className="rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-text flex items-center gap-2">
              <Layers size={15} className="text-accent" />
              Corroborating layer hypotheses
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              Independent protocol telemetry and controller integrity records correlated to this incident window.
            </p>
            {detail?.layer_hypotheses?.length ? (
              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                {detail.layer_hypotheses.map((h) => (
                  <div key={h.candidate_id} className="rounded-xl border border-border/80 bg-bg/70 p-3.5 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <strong className="font-mono text-sm text-text">{h.candidate_id}</strong>
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize border ${
                          h.result === "supported"
                            ? "bg-normal/15 text-normal border-normal/30"
                            : "bg-surface text-muted border-border"
                        }`}>
                          {h.result.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="text-text leading-relaxed">{h.explanation}</p>
                      <p className="mt-1.5 text-[11px] text-muted font-mono">{h.scope}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap gap-2">
                      {h.event_ids.map((id) => (
                        <a
                          key={id}
                          href={`/api/evidence/${encodeURIComponent(id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-accent font-medium hover:underline"
                        >
                          <span>Supporting record #{id.slice(0, 10)}…</span>
                          <ExternalLink size={10} aria-hidden />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 p-3.5 rounded-xl border border-border/60 bg-bg/40 text-xs text-muted">
                No paired channel or integrity records in this incident/session window. These origin categories remain unresolved.
              </div>
            )}
          </section>

          {/* Security Caveat Notice */}
          <section className="rounded-xl border border-border/70 bg-bg/60 p-4 shadow-sm flex items-start gap-3">
            <ShieldCheck size={18} className="text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-xs text-text uppercase tracking-wider">Root-Cause Verification Notice</h4>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Abnormal telemetry may indicate cyber tampering, physical fault, or protocol injection. Correlate with Modbus proxy logs and controller baseline checks before applying permanent remediations.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: PRESERVED TELEMETRY & BASELINE (Telemetry)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "telemetry" && (
        <div className="animate-in fade-in duration-200">
          {!detail ? (
            <div className="p-8 text-center text-muted rounded-xl border border-border bg-surface">
              Loading saved telemetry capture…
            </div>
          ) : (
            <IncidentEvidencePanel detail={detail} />
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: ANALYST TRIAGE & CASE NOTES (Workflow)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "workflow" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <section className="rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-base text-text flex items-center gap-2">
                  <UserCheck size={16} className="text-accent" />
                  Analyst triage & workflow
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Analyst decisions are separate from detector state. Identity: {privateMode ? email : "local analyst, not authenticated"}.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-1 text-xs text-accent font-medium hover:underline bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20"
                href={`/api/investigations/${encodeURIComponent(incidentId)}/export`}
                target="_blank"
                rel="noreferrer"
              >
                <span>Export evidence JSON</span>
                <ExternalLink size={11} aria-hidden />
              </a>
            </div>

            {!detail ? (
              <p className="mt-3 text-sm text-muted">Loading workflow status…</p>
            ) : (
              <>
                {/* Triage Decision Bar */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3 p-4 rounded-xl border border-border/80 bg-bg/60">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted font-medium">Incident Acknowledgment</span>
                    <button
                      disabled={busy || !canInvestigate}
                      onClick={() => void change({ acknowledged: !detail.workflow.acknowledged })}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all shadow-sm ${
                        detail.workflow.acknowledged
                          ? "border-normal/40 bg-normal/15 text-normal hover:bg-normal/20"
                          : "border-border bg-surface text-text hover:border-accent/40"
                      }`}
                    >
                      {detail.workflow.acknowledged ? (
                        <>
                          <Check size={14} className="text-normal" />
                          <span>Acknowledged ✓</span>
                        </>
                      ) : (
                        <span>Acknowledge incident</span>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted font-medium" htmlFor="analyst-severity">
                      Analyst severity
                    </label>
                    <select
                      id="analyst-severity"
                      disabled={busy || !canInvestigate}
                      aria-label="Analyst severity"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text focus:border-accent focus:outline-none"
                      value={detail.workflow.severity ?? ""}
                      onChange={(e) => void change({ severity: e.target.value })}
                    >
                      <option value="" disabled>Unassigned</option>
                      {["low", "medium", "high", "critical"].map((s) => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-muted font-medium" htmlFor="case-state">
                      Case state
                    </label>
                    <select
                      id="case-state"
                      disabled={busy || !canInvestigate}
                      aria-label="Case state"
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text focus:border-accent focus:outline-none"
                      value={detail.workflow.state ?? "new"}
                      onChange={(e) => void change({ state: e.target.value })}
                    >
                      {["new", "investigating", "resolved"].map((s) => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Case Note Form */}
                <form
                  className="mt-5 flex flex-col gap-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canInvestigate && note.trim()) void change({ note: note.trim() });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <label htmlFor="case-note" className="text-xs font-semibold text-text">
                      Add investigation note
                    </label>
                    <span className="text-[11px] text-muted">{note.length} / 2000 chars</span>
                  </div>
                  <textarea
                    id="case-note"
                    className="w-full rounded-xl border border-border bg-bg/90 p-3 text-xs text-text placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all resize-y min-h-[75px]"
                    rows={3}
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Evidence reviewed, alternative hypotheses tested, decisions taken, and next required checks…"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      disabled={busy || !canInvestigate || !note.trim()}
                      className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-on-accent disabled:opacity-40 hover:bg-accent/90 active:scale-95 transition-all shadow-sm"
                    >
                      {busy ? "Saving note…" : "Save note"}
                    </button>
                    {saved && <p role="status" className="text-xs text-normal font-medium">{saved}</p>}
                    {error && <p role="alert" className="text-xs text-suspect font-medium">{error}</p>}
                  </div>
                </form>

                {/* Retention notice */}
                <p className="mt-4 font-mono text-[11px] text-muted">
                  {detail.retention} · Local SOC audit journal
                </p>

                {/* Related Incidents */}
                {!!detail.related_incidents?.length && (
                  <div className="mt-5 rounded-xl border border-border/80 bg-bg/60 p-4">
                    <h4 className="font-semibold text-xs text-text flex items-center gap-1.5 mb-2">
                      <Sparkles size={13} className="text-accent" />
                      Related incidents · heuristic matches
                    </h4>
                    <div className="space-y-1.5">
                      {detail.related_incidents.map((i) => (
                        <div key={i.id} className="flex items-center justify-between text-xs p-2 rounded bg-surface border border-border/60">
                          <a className="text-accent font-mono font-medium hover:underline" href={`/investigations?incident=${encodeURIComponent(i.id)}`}>
                            Case {i.id.slice(0, 16)}…
                          </a>
                          <span className="text-muted text-[11.5px]">{i.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 4: EVIDENCE STREAM (Events)
          ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "events" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <section className="rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-base text-text flex items-center gap-2">
                  <Clock size={16} className="text-accent" />
                  Evidence chronology · newest first
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  Raw and inferred evidence emitted during this incident window.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Evidence category"
                  className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-xs text-text focus:border-accent focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories ({events.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.replaceAll("_", " ")}</option>
                  ))}
                </select>

                <select
                  aria-label="Evidence asset"
                  className="rounded-lg border border-border bg-bg px-2.5 py-1.5 text-xs text-text focus:border-accent focus:outline-none font-mono"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                >
                  <option value="all">All assets</option>
                  {assets.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div
              role="region"
              aria-label="Recorded evidence chronology"
              tabIndex={0}
              className="max-h-[550px] overflow-auto pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <EvidenceList events={filteredEvents} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
