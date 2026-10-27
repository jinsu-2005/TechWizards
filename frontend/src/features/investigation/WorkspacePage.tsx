import { useEffect, useState } from "react";
import {
  Database, Search, RefreshCw, ShieldAlert,
  FileDown, Sparkles, Copy, Check, X,
  Activity, ShieldCheck, Clock
} from "lucide-react";
import { useLiveStream } from "../../app/useLiveStream";
import { useLiveSourcePoll } from "../../app/useLiveSourcePoll";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { getStatus, reportUrl } from "../../lib/api";
import { navigate } from "../../lib/navigation";
import type { Incident } from "../../lib/types";
import { WorkflowPanel } from "./WorkflowPanel";
import { ModelProvenanceCard } from "./ModelProvenanceCard";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "contained" | "closed">("all");
  const [copiedId, setCopiedId] = useState(false);

  const mode = status?.mode ?? latest?.mode;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const refresh = async () => {
      try {
        const next = await getStatus();
        const response = await fetch("/api/incidents");
        if (!response.ok) throw new Error("Unable to load incidents");
        const items = await response.json() as Incident[];
        if (alive) {
          useLive.getState().setStatus(next);
          setIncidents(items);
          setError(null);
          setLoading(false);
        }
      } catch {
        if (alive) {
          setError("Cannot refresh source and incident information. Check the local backend connection.");
          setLoading(false);
        }
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [revision, mode]);

  const listed = latest?.incident ? [latest.incident, ...incidents.filter((i) => i.id !== latest.incident?.id)] : incidents;
  const firstCase = listed[0]?.id;

  useEffect(() => {
    if (!selected && firstCase) setSelected(firstCase);
  }, [firstCase, selected]);

  const incident = listed.find((i) => i.id === selected) ?? (selected === null ? listed[0] : undefined);
  const heading = page === "sources" ? "Data sources & coverage" : "Incident investigations";

  useEffect(() => {
    useUi.getState().setSelectedIncident(page === "investigations" ? (incident ?? null) : null);
    return () => useUi.getState().setSelectedIncident(null);
  }, [incident, page]);

  const handleCopyId = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filter listed incidents for the sidebar
  const filteredIncidents = listed.filter((item) => {
    const originName = item.origin[0]?.id ?? "Unknown";
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      originName.toLowerCase().includes(search.toLowerCase()) ||
      item.explanation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main id="main-workspace" tabIndex={-1} className="content-page bg-bg">
      <div className="page-container flex flex-col gap-3 sm:gap-3.5">
        <WorkspaceHeader current={`/${page}`} />

        <div className="page-heading">
          <div className="page-heading-main">
            <h1>{heading}</h1>
            <span className="hidden sm:inline text-border">·</span>
            <p className="page-heading-context">
              <span className="font-mono text-xs uppercase px-1.5 py-0.5 rounded border border-border bg-surface text-text font-semibold">
                {mode?.toUpperCase() ?? "Unknown"}
              </span>
              <span>
                {page === "sources"
                  ? "Where the telemetry comes from"
                  : "Evidence, timeline and propagation for each incident"}
              </span>
            </p>
          </div>
          <div className="page-heading-actions">
            <button
              aria-label="Refresh workspace"
              className="page-heading-action"
              onClick={() => setRevision((v) => v + 1)}
            >
              <RefreshCw size={14} aria-hidden />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-suspect/50 bg-suspect/10 p-3.5 text-xs text-suspect flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error} Previously received information may be stale.</span>
          </div>
        )}

        {page === "sources" ? (
          <>
            {/* ── 1. Telemetry Sources Comparative Grid ── */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "sim",
                  title: "SIM · Simulation",
                  badge: "Built in",
                  active: mode === "sim",
                  desc: "Physics simulation of the three-stage water plant for controlled attack tests.",
                  specs: [
                    { label: "Plant", val: "3 stages · 9 tags" },
                    { label: "Attacks", val: "5 scenarios" },
                  ],
                },
                {
                  id: "hai",
                  title: "HAI · Testbed Replay",
                  badge: status?.hai_available ? "Dataset Available" : "Dataset Missing",
                  active: mode === "hai",
                  desc: "Replay of recorded data from the HAI industrial control testbed.",
                  specs: [
                    { label: "Attacks", val: "28 recorded" },
                    { label: "Mode", val: "Offline replay" },
                  ],
                },
                {
                  id: "live",
                  title: "LIVE · Connected Modbus",
                  badge: status?.live_available ? "Online" : "Offline",
                  active: mode === "live",
                  desc: "Reads registers from the Modbus plant emulator in real time.",
                  specs: [
                    { label: "Protocol", val: "Modbus TCP" },
                    { label: "Access", val: "Read-only" },
                  ],
                },
              ].map((s) => (
                <section
                  key={s.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                    s.active
                      ? "border-accent/60 bg-surface shadow-md shadow-accent/5 ring-1 ring-accent/30"
                      : "border-border/80 bg-surface/80 hover:border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                          s.active ? "border-accent/40 bg-accent/15 text-accent" : "border-border bg-bg text-muted"
                        }`}>
                          <Database size={16} />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-text leading-tight">{s.title}</h2>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] font-medium border ${
                        s.active
                          ? "border-accent/40 bg-accent/15 text-accent"
                          : "border-border bg-bg text-muted"
                      }`}>
                        {s.badge}
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed min-h-[32px]">{s.desc}</p>

                    <div className="mt-3.5 space-y-1.5 border-t border-border/60 pt-3">
                      {s.specs.map((sp) => (
                        <div key={sp.label} className="flex items-center justify-between text-xs">
                          <span className="text-muted">{sp.label}</span>
                          <span className="font-mono font-medium text-text">{sp.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted">Status</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      s.active ? "text-accent" : "text-muted"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.active ? "bg-accent animate-pulse" : "bg-muted/50"}`} />
                      {s.active ? "Active" : "Standby"}
                    </span>
                  </div>
                </section>
              ))}
            </div>

            {/* ── 2. LIVE Baseline Reference Drawer ── */}
            <details className="min-w-0 rounded-xl border border-border bg-surface p-3.5 shadow-sm" open={mode === "live" ? true : undefined}>
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between hover:text-text">
                <span className="flex items-center gap-2">
                  <Activity size={14} className="text-accent" />
                  Model details
                </span>
                
              </summary>
              <div className="mt-3">
                <ModelProvenanceCard />
              </div>
            </details>

            {/* ── 3. Visual Modbus Pipeline Flow ── */}
            <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-accent" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text">Data pipeline</h2>
                </div>
                
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-bg/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-accent">01 · FIELD LAYER</span>
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted border border-border">Registers</span>
                  </div>
                  <h3 className="text-xs font-bold text-text">PLC Holding &amp; Coils</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Sensor, valve and pump values exposed as Modbus registers.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-bg/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-accent">02 · INGESTION</span>
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted border border-border">Async TCP</span>
                  </div>
                  <h3 className="text-xs font-bold text-text">Connector &amp; Quality</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Read-only polling with stale and frozen-value checks.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-bg/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-accent">03 · DETECTION</span>
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted border border-border">GDN</span>
                  </div>
                  <h3 className="text-xs font-bold text-text">Detection &amp; origin</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Forecast errors flag anomalies; origins ranked by deviation, onset and process flow.
                  </p>
                </div>
              </div>
            </section>

          </>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
             INVESTIGATIONS WORKSPACE LAYOUT
             ══════════════════════════════════════════════════════════════════ */
          <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            {/* ── Modern Sidebar (Incident Journal) ── */}
            <aside className="rounded-xl border border-border bg-surface/90 p-3.5 shadow-sm backdrop-blur-sm lg:sticky lg:top-3">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/25 text-accent shadow-sm">
                    <ShieldAlert size={14} />
                  </div>
                  <h2 className="font-semibold text-xs tracking-wide uppercase text-text">Incident Journal</h2>
                </div>
                <span className="rounded-full bg-bg border border-border px-2 py-0.5 font-mono text-[10.5px] text-muted font-medium">
                  {listed.length} cases
                </span>
              </div>

              {listed.length ? (
                <>
                  {/* Mobile Dropdown */}
                  <div className="mt-3 lg:hidden">
                    <label htmlFor="mobile-incident-select" className="block text-xs text-muted mb-1 font-medium">
                      Select Case
                    </label>
                    <select
                      id="mobile-incident-select"
                      aria-label="Choose incident"
                      value={incident?.id ?? ""}
                      onChange={(e) => navigate(`/investigations?incident=${encodeURIComponent(e.target.value)}`)}
                      className="w-full rounded-lg border border-border bg-bg p-2 text-xs text-text focus:border-accent focus:outline-none"
                    >
                      {!incident && <option value="" disabled>Select a case</option>}
                      {listed.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.origin[0]?.id ?? "Unknown"} · {item.status.toUpperCase()} · #{item.id.slice(-6)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Desktop Interactive Search & Filters */}
                  <div className="hidden lg:flex flex-col gap-2 mt-3">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-2.5 text-muted pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search cases or origins…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg/90 pl-8 pr-7 py-1.5 text-xs text-text placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          aria-label="Clear search"
                          className="absolute right-2 top-2 text-muted hover:text-text"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1 p-0.5 rounded-lg bg-bg/70 border border-border/60">
                      {(["all", "open", "contained", "closed"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setStatusFilter(filter)}
                          className={`flex-1 rounded-md py-1 text-[10.5px] font-medium capitalize transition-all ${
                            statusFilter === filter
                              ? "bg-surface text-accent font-semibold shadow-sm border border-border/80"
                              : "text-muted hover:text-text"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Incident Card List */}
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto space-y-1.5 pr-1 mt-1 scrollbar-none">
                      {filteredIncidents.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted">
                          No matching incidents found.
                        </div>
                      ) : (
                        filteredIncidents.map((item) => {
                          const isSelected = incident?.id === item.id;
                          const topCandidate = item.origin[0];
                          const isOpen = item.status === "open";
                          const isContained = item.status === "contained";

                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => navigate(`/investigations?incident=${encodeURIComponent(item.id)}`)}
                              className={`group relative flex w-full flex-col gap-1 rounded-xl border p-2.5 text-left transition-all ${
                                isSelected
                                  ? "border-accent/80 bg-accent/[0.09] shadow-sm shadow-accent/10"
                                  : "border-border/60 bg-surface/40 hover:border-accent/30 hover:bg-surface/80"
                              }`}
                            >
                              {/* Left active glowing indicator */}
                              {isSelected && (
                                <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-accent shadow-[0_0_8px_var(--accent)]" />
                              )}

                              <div className="flex items-center justify-between gap-1.5 pl-1.5">
                                <span className="font-mono text-xs font-bold text-text group-hover:text-accent transition-colors flex items-center gap-1.5">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isOpen ? "bg-origin animate-pulse" : isContained ? "bg-normal" : "bg-muted"
                                    }`}
                                  />
                                  {topCandidate?.id ?? "Unknown"}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.2 font-mono text-[9.5px] font-semibold uppercase tracking-wider ${
                                    isOpen
                                      ? "bg-origin/15 text-origin border border-origin/30"
                                      : isContained
                                      ? "bg-normal/15 text-normal border border-normal/30"
                                      : "bg-surface text-muted border border-border"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pl-1.5 text-[10.5px] text-muted font-mono">
                                <span>Case #{item.id.slice(-6)}</span>
                                <span className="opacity-80">
                                  {new Date(item.detected_at * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>

                              {topCandidate?.confidence !== undefined && (
                                <div className="mt-0.5 pl-1.5 flex items-center gap-2">
                                  <div className="h-1 flex-1 rounded-full bg-border/80 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-accent to-normal rounded-full"
                                      style={{ width: `${Math.round(topCandidate.confidence * 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[9.5px] text-accent font-semibold">
                                    {(topCandidate.confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              ) : (
                  <p className="mt-3 text-xs text-muted leading-relaxed">
                    {loading
                      ? "Loading incident journal…"
                      : error
                      ? "Incident records are unavailable."
                      : "No incidents in this source. Launch a simulation attack from the dashboard, then return here."}
                  </p>
                )}
              </aside>

              {/* ── Main Investigation Body ── */}
              {loading && !incident ? (
                <div role="status" className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
                  Loading investigation journal…
                </div>
              ) : incident ? (
                <div className="flex min-w-0 flex-col gap-4">
                  {/* ── Hero Incident Command Banner ── */}
                  <section className="inv-hero-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Origin info & diagnosis */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent font-mono text-sm font-bold shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                            {incident.origin[0]?.id ?? "Unknown origin"}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                            incident.status === "open"
                              ? "bg-origin/15 text-origin border-origin/30"
                              : incident.status === "contained"
                              ? "bg-normal/15 text-normal border-normal/30"
                              : "bg-surface text-muted border-border"
                          }`}>
                            {incident.status}
                          </span>
                          {incident.ambiguous ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-suspect/15 border border-suspect/30 text-xs font-semibold text-suspect">
                              <ShieldAlert size={11} /> Ambiguous origin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                              <ShieldCheck size={11} /> Origin ranked
                            </span>
                          )}
                          {incident.mitre && (
                            <span className="font-mono text-[11px] text-muted bg-bg border border-border px-2 py-0.5 rounded">
                              {incident.mitre}
                            </span>
                          )}
                        </div>

                        {/* Title and Narrative */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted font-mono flex-wrap">
                          <span>Case ID:</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(incident.id)}
                            title="Click to copy full Case ID"
                            className="inline-flex items-center gap-1 bg-bg/80 border border-border/80 px-2 py-0.5 rounded text-[11px] hover:border-accent hover:text-text transition-colors"
                          >
                            <span>{incident.id.slice(0, 18)}…</span>
                            {copiedId ? <Check size={11} className="text-normal" /> : <Copy size={11} className="opacity-60" />}
                          </button>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="opacity-70" />
                            {new Date(incident.detected_at * 1000).toLocaleString()}
                          </span>
                        </div>

                        {/* Diagnosis callout */}
                        <p className="mt-3 text-xs sm:text-sm text-text/90 leading-relaxed rounded-xl border border-border/60 bg-bg/50 p-3">
                          {incident.explanation}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <a
                          href={reportUrl(incident.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text hover:border-accent hover:text-accent transition-all shadow-sm active:scale-95"
                        >
                          <FileDown size={13} className="text-accent" />
                          <span>Export Report</span>
                        </a>

                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-on-accent hover:bg-accent/90 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-accent/20"
                          onClick={() => useUi.getState().setCopilotOpen(true)}
                        >
                          <Sparkles size={13} />
                          <span>Ask AI Pilot</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Metric Tiles */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-border/50 pt-3.5">
                      <div className="rounded-lg bg-bg/60 border border-border/50 p-2.5">
                        <span className="text-[10.5px] text-muted font-medium block">Leading Candidate</span>
                        <strong className="font-mono text-sm text-text font-bold block mt-0.5">
                          {incident.origin[0]?.id ?? "Unknown"}
                        </strong>
                        <span className="text-[10px] text-muted capitalize block">
                          {incident.origin[0]?.type ?? "Component"}
                        </span>
                      </div>

                      <div className="rounded-lg bg-bg/60 border border-border/50 p-2.5">
                        <span className="text-[10.5px] text-muted font-medium block">Candidate Confidence</span>
                        <strong className="font-mono text-sm text-accent font-bold block mt-0.5">
                          {incident.origin[0]?.confidence !== undefined
                            ? `${(incident.origin[0].confidence * 100).toFixed(1)}%`
                            : "N/A"}
                        </strong>
                        <span className="text-[10px] text-muted block">
                          {incident.ambiguous ? "Tied candidate" : "Separated candidate"}
                        </span>
                      </div>

                      <div className="rounded-lg bg-bg/60 border border-border/50 p-2.5">
                        <span className="text-[10.5px] text-muted font-medium block">Propagation Scope</span>
                        <strong className="font-mono text-sm text-text font-bold block mt-0.5">
                          {incident.path.length} Nodes
                        </strong>
                        <span className="text-[10px] text-muted block">
                          Max offset: +{incident.path[incident.path.length - 1]?.t.toFixed(1) ?? "0"}s
                        </span>
                      </div>

                      <div className="rounded-lg bg-bg/60 border border-border/50 p-2.5">
                        <span className="text-[10.5px] text-muted font-medium block">Mitigation Status</span>
                        <strong className={`font-mono text-sm font-bold block mt-0.5 ${
                          incident.status === "contained" ? "text-normal" : "text-text"
                        }`}>
                          {incident.status === "contained" ? "Self-Healed" : incident.status.toUpperCase()}
                        </strong>
                        <span className="text-[10px] text-muted block">
                          {incident.status === "contained" ? "Virtual sensor active" : "Investigation active"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* ── Main Tabbed Workflow & Evidence Panel ── */}
                  <WorkflowPanel
                    key={`${mode}:${incident.id}`}
                    incidentId={incident.id}
                    mode={mode ?? "unknown"}
                    incident={incident}
                  />
                </div>
              ) : selected ? (
                <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
                  The selected incident is no longer available in this source. Choose another incident from the journal.
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface p-8 text-center">
                  <Activity size={24} className="mx-auto mb-2 text-accent opacity-50" />
                  <h3 className="text-base font-semibold text-text">Start with a controlled scenario</h3>
                  <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                    Use SIM or LIVE mode from the Monitoring dashboard to trigger attack scenarios. This workspace records forensic telemetry and ranks candidates with causal proof.
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </main>
  );
}
