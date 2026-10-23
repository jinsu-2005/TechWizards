import { useEffect, useState } from "react";
import {
  AlertTriangle, CheckCircle, Clock, Search, ArrowUpRight,
  Shield, Cpu, Activity, ChevronRight, Tag, Wifi, WifiOff, BarChart2,
  RefreshCw, CircleDot, ZapOff, Check, Copy, LayoutGrid, List,
  ShieldAlert
} from "lucide-react";
import { useLiveStream } from "../../app/useLiveStream";
import { useLiveSourcePoll } from "../../app/useLiveSourcePoll";
import { useFreshness } from "../../app/useFreshness";
import { useLive, selectView } from "../../store/live";
import { getIncidents, getWorkflows, getAssetRegisters, updateWorkflow } from "../../lib/api";
import { formatValue } from "../../lib/format";
import type { Incident, InvestigationDetail } from "../../lib/types";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { LocalLab } from "./LocalLab";
import { useAccess } from "../auth/access";
import { MobileIncidentCards } from "./MobileIncidentCards";
import { IsolateButton } from "../incident/IsolateButton";

const STATUS_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  open:       { label: "Open",       cls: "soc-badge-open",       dot: "soc-dot-open" },
  localizing: { label: "Localizing", cls: "soc-badge-localizing", dot: "soc-dot-localizing" },
  contained:  { label: "Contained",  cls: "soc-badge-contained",  dot: "soc-dot-contained" },
  closed:     { label: "Closed",     cls: "soc-badge-closed",     dot: "soc-dot-closed" },
};

const SEV_CFG: Record<string, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "soc-sev-critical" },
  high:     { label: "High",     cls: "soc-sev-high" },
  medium:   { label: "Medium",   cls: "soc-sev-medium" },
  low:      { label: "Low",      cls: "soc-sev-low" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: "soc-badge-closed", dot: "soc-dot-closed" };
  const isActive = status === "open" || status === "localizing";
  return (
    <span className={`soc-status-badge ${cfg.cls} ${isActive ? "soc-badge-pulse" : ""}`}>
      <span className={`soc-dot ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function SevBadge({ sev }: { sev?: string }) {
  if (!sev) return <span className="text-muted text-xs font-mono">—</span>;
  const cfg = SEV_CFG[sev] ?? { label: sev, cls: "" };
  return <span className={`soc-sev-badge ${cfg.cls}`}>{cfg.label}</span>;
}

function AssetTypeBadge({ type }: { type: string }) {
  const Icon = type === "sensor" ? Activity : type === "controller" ? Cpu : ZapOff;
  const cls  = type === "sensor" ? "soc-asset-sensor" : type === "controller" ? "soc-asset-ctrl" : "soc-asset-act";
  return (
    <span className={`soc-asset-type ${cls}`}>
      <Icon size={11} className="shrink-0" />
      <span>{type}</span>
    </span>
  );
}

export function SocPage({ page }: { page: "alerts" | "assets" | "lab" }) {
  const { canAdmin, canInvestigate } = useAccess();
  useLiveStream();
  useLiveSourcePoll();
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
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ackingId, setAckingId] = useState<string | null>(null);
  const [assetViewMode, setAssetViewMode] = useState<"table" | "cards">("table");

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [incidents, savedWorkflows, registerMap] = await Promise.all([
        getIncidents(),
        getWorkflows(),
        getAssetRegisters()
      ]);
      setItems(incidents);
      setError(false);
      setWorkflows(savedWorkflows);
      setRegisters(registerMap);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let alive = true;
    setItems([]);
    setWorkflows({});
    setRecordsLoading(true);

    const refresh = async () => {
      try {
        const [incidents, savedWorkflows, registerMap] = await Promise.all([
          getIncidents(),
          getWorkflows(),
          getAssetRegisters()
        ]);
        if (!alive) return;
        setItems(incidents);
        setError(false);
        setWorkflows(savedWorkflows);
        setRegisters(registerMap);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setRecordsLoading(false);
      }
    };

    void refresh();
    const timer = setInterval(() => void refresh(), 8000);
    return () => { alive = false; clearInterval(timer); };
  }, [mode]);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleToggleAck = async (incidentId: string, currentAck: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canInvestigate || ackingId) return;
    setAckingId(incidentId);
    try {
      const updated = await updateWorkflow(incidentId, { acknowledged: !currentAck });
      setWorkflows((prev) => ({ ...prev, [incidentId]: updated.workflow }));
    } catch {
      // ignore or show error
    } finally {
      setAckingId(null);
    }
  };

  const list = view?.incident ? [view.incident, ...items.filter((i) => i.id !== view.incident?.id)] : items;

  const shown = list.filter((i) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      i.id.toLowerCase().includes(q) ||
      i.origin.some((c) => c.id.toLowerCase().includes(q)) ||
      (i.explanation && i.explanation.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "unacknowledged") return !workflows[i.id]?.acknowledged;
    if (filter === "active") return ["open", "localizing"].includes(i.status) && workflows[i.id]?.state !== "resolved";
    if (["critical", "high", "medium", "low"].includes(filter)) return workflows[i.id]?.severity === filter;
    return true;
  });

  const assetRows = (topology?.nodes ?? []).filter((n) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q) || registers[n.id]?.address?.toString().includes(q);
    const matchesFilter = filter === "all" || n.type === filter;
    return matchesQuery && matchesFilter;
  });

  const openCount = list.filter((i) => ["open", "localizing"].includes(i.status)).length;
  const needsAck = list.filter((i) => !workflows[i.id]?.acknowledged).length;
  const critCount = list.filter((i) => workflows[i.id]?.severity === "critical").length;
  const highCount = list.filter((i) => workflows[i.id]?.severity === "high").length;
  const flaggedAssets = view?.nodes.filter((n) => n.status !== "normal").length ?? 0;
  const modeTag = mode.toUpperCase();

  return (
    <main id="main-workspace" tabIndex={-1} className="content-page bg-bg">
      <div className="page-container flex flex-col gap-3 sm:gap-3.5">
        <WorkspaceHeader current={`/${page}`} />

        {/* Hero Banner */}
        <div className="soc-hero">
          <div className="soc-hero-left">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="soc-mode-chip">{modeTag}</span>
              <span className={`soc-conn-chip ${stale ? "soc-conn-stale" : "soc-conn-live"}`}>
                {stale ? <WifiOff size={11} /> : <Wifi size={11} />}
                {stale ? "Signal stale" : "Telemetry live"}
              </span>
              <span className="text-xs font-mono text-muted">
                {page === "alerts" ? `${list.length} incidents recorded` : `${topology?.nodes.length ?? 0} mapped assets`}
              </span>
            </div>
            <h1 className="soc-hero-title">
              {page === "alerts" ? "Security Alerts & Triage" : page === "assets" ? "Asset Inventory & Modbus Registers" : "Local Attack Lab"}
            </h1>
            <p className="soc-hero-sub">
              {page === "alerts"
                ? "High-density incident triage queue, causal hypotheses verification, and fast containment triggers."
                : page === "assets"
                ? "Physical process tags, PLC controllers, field actuators, and Modbus RTU/TCP register mappings."
                : "Controlled fault injection, packet proxying & controller integrity testing"}
            </p>
          </div>
          <div className="soc-hero-actions">
            <a href={page === "lab" ? "/sources" : "/investigations"} className="soc-action-link">
              {page === "lab" ? "Data sources" : "Investigations console"}
              <ArrowUpRight size={14} />
            </a>
            <button
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              aria-label="Refresh records"
              className="soc-refresh-btn"
              title="Refresh records"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stat Bar */}
        {page === "alerts" && (
          <div className="soc-stat-bar">
            {[
              { label: "Total incidents",   value: recordsLoading ? "…" : list.length,   icon: Shield,        accent: false },
              { label: "Active incidents",  value: recordsLoading ? "…" : openCount,      icon: AlertTriangle, accent: openCount > 0 },
              { label: "Needs review",      value: recordsLoading ? "…" : needsAck,       icon: Clock,         accent: needsAck > 0 },
              { label: "Critical / High",   value: recordsLoading ? "…" : `${critCount} / ${highCount}`, icon: ShieldAlert, accent: critCount > 0 || highCount > 0 },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className={`soc-stat-card${accent ? " soc-stat-accent" : ""}`}>
                <div className="soc-stat-icon"><Icon size={16} /></div>
                <div>
                  <p className="soc-stat-label">{label}</p>
                  <p className="soc-stat-value">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {page === "assets" && (
          <div className="soc-stat-bar">
            {[
              { label: "Total assets",     value: topology?.nodes.length ?? 0,                                            icon: Tag,           accent: false },
              { label: "Flagged readings", value: flaggedAssets,                                                           icon: AlertTriangle,  accent: flaggedAssets > 0 },
              { label: "Quality warnings", value: health?.filter((n) => n.quality !== "good").length ?? "0",               icon: Activity,      accent: false },
              { label: "Modbus mapped",    value: Object.keys(registers).length || (topology?.nodes.length ?? 0),         icon: BarChart2,      accent: false },
            ].map(({ label, value, icon: Icon, accent }) => (
              <div key={label} className={`soc-stat-card${accent ? " soc-stat-accent" : ""}`}>
                <div className="soc-stat-icon"><Icon size={16} /></div>
                <div>
                  <p className="soc-stat-label">{label}</p>
                  <p className="soc-stat-value">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div role="alert" className="soc-error-bar">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Could not refresh live records. Telemetry may be cached or offline.</span>
          </div>
        )}

        {/* Lab Route */}
        {page === "lab" ? (
          canAdmin ? (
            <LocalLab />
          ) : (
            <div className="soc-access-denied">
              <Shield size={28} className="text-muted" />
              <h3 className="text-base font-semibold text-text">Administrator Access Required</h3>
              <p className="text-xs text-muted max-w-md text-center">
                Local attack simulation and proxy control require admin privileges. Current session is read-only.
              </p>
            </div>
          )
        ) : page === "assets" ? (
          /* ══════════════════════════════════════════════════════════════════
             ASSET INVENTORY VIEW
             ══════════════════════════════════════════════════════════════════ */
          <section className="soc-panel">
            {/* Toolbar */}
            <div className="soc-toolbar">
              <div className="soc-search-wrap">
                <Search size={14} className="soc-search-icon" />
                <input
                  aria-label="Search assets"
                  className="soc-search-input"
                  placeholder="Search tag (LIT101), description, or register..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted hover:text-text text-xs pr-1">
                    Clear
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="soc-pill-filter-group">
                {[
                  { id: "all", label: "All Roles", count: topology?.nodes.length ?? 0 },
                  { id: "sensor", label: "Sensors", count: topology?.nodes.filter((n) => n.type === "sensor").length ?? 0 },
                  { id: "controller", label: "Controllers", count: topology?.nodes.filter((n) => n.type === "controller").length ?? 0 },
                  { id: "actuator", label: "Actuators", count: topology?.nodes.filter((n) => n.type === "actuator").length ?? 0 },
                ].map(({ id, label, count }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`soc-filter-pill ${filter === id ? "active" : ""}`}
                  >
                    <span>{label}</span>
                    <span className="soc-pill-count">{count}</span>
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="hidden sm:inline-flex rounded-lg border border-border p-0.5 bg-surface shrink-0">
                <button
                  type="button"
                  onClick={() => setAssetViewMode("table")}
                  className={`soc-view-toggle-btn ${assetViewMode === "table" ? "active" : ""}`}
                  title="Dense Table View"
                >
                  <List size={14} />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssetViewMode("cards")}
                  className={`soc-view-toggle-btn ${assetViewMode === "cards" ? "active" : ""}`}
                  title="Asset Cards View"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
              </div>

              <span className="soc-count-chip ml-auto">
                {assetRows.length} of {topology?.nodes.length ?? 0}
              </span>
            </div>

            {/* Cards View (Grid) */}
            {assetViewMode === "cards" ? (
              <div className="soc-cards-grid p-4">
                {assetRows.map((asset) => {
                  const n = view?.nodes.find((nd) => nd.id === asset.id);
                  const reg = registers[asset.id];
                  const q = health?.find((h) => h.node_id === asset.id);
                  const isFlagged = n?.status && n.status !== "normal";

                  return (
                    <article key={asset.id} className={`soc-asset-card ${isFlagged ? "flagged" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-base font-bold text-text">{asset.id}</span>
                            <AssetTypeBadge type={asset.type} />
                          </div>
                          <p className="text-xs text-muted mt-0.5">{asset.label}</p>
                        </div>
                        <span className={`soc-telemetry-badge ${isFlagged ? "suspect" : "normal"}`}>
                          <CircleDot size={9} />
                          {n?.status ?? "online"}
                        </span>
                      </div>

                      {/* Reading Stat Box */}
                      <div className="soc-asset-reading-box mt-3">
                        <span className="text-[11px] text-muted font-medium">Live Telemetry</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="font-mono text-lg font-bold text-accent">
                            {n ? formatValue(n.id, n.value) : "—"}
                          </span>
                          <span className="text-xs font-mono text-muted">
                            [{asset.lo} .. {asset.hi} {asset.unit}]
                          </span>
                        </div>
                        {n && asset.hi > asset.lo && (
                          <div
                            className="mt-2 h-1.5 w-full rounded-full bg-border/60 overflow-hidden"
                            title={`Range level: ${Math.round(Math.max(0, Math.min(100, ((n.value - asset.lo) / (asset.hi - asset.lo)) * 100)))}%`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFlagged ? "bg-origin shadow-[0_0_8px_var(--origin)]" : "bg-gradient-to-r from-accent to-normal"
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, ((n.value - asset.lo) / (asset.hi - asset.lo)) * 100))}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Modbus Register Box */}
                      <div className="soc-asset-modbus-box mt-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-muted">Register</span>
                          <span className="text-text font-semibold">
                            {reg ? `${reg.table} #${reg.address}` : mode === "hai" ? "HAI Replay" : "HR 40001"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono mt-1">
                          <span className="text-muted">Encoding</span>
                          <span className="text-muted">{reg?.encoding ?? "FLOAT32_BE"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono mt-1">
                          <span className="text-muted">Quality</span>
                          <span className={q && q.quality !== "good" ? "text-suspect" : "text-normal"}>
                            {q ? `${q.quality} · ${q.age_ms ? `${Math.round(q.age_ms)}ms` : "live"}` : "good · verified"}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Link */}
                      <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                        <a
                          href={`/?asset=${encodeURIComponent(asset.id)}`}
                          className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                        >
                          Inspect Twin <ChevronRight size={12} />
                        </a>
                        <span className="text-[11px] text-muted">PLC Zone 1</span>
                      </div>
                    </article>
                  );
                })}
                {!assetRows.length && (
                  <div className="col-span-full soc-empty-state">
                    <Tag size={24} className="text-muted" />
                    <p className="text-sm text-muted">No assets found matching current criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Dense Table View */
              <div className="soc-table-wrap">
                <table className="soc-table">
                  <thead>
                    <tr>
                      <th>Asset / Tag</th>
                      <th>Role</th>
                      <th>Live Reading</th>
                      <th>State</th>
                      <th>Modbus Register</th>
                      <th>Encoding</th>
                      <th>Quality &amp; Latency</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetRows.map((asset) => {
                      const n = view?.nodes.find((nd) => nd.id === asset.id);
                      const q = health?.find((h) => h.node_id === asset.id);
                      const reg = registers[asset.id];
                      const flagged = n?.status && n.status !== "normal";

                      return (
                        <tr key={asset.id} className={flagged ? "soc-row-flagged" : ""}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div>
                                <a
                                  className="font-mono text-sm font-bold text-accent hover:underline"
                                  href={`/?asset=${encodeURIComponent(asset.id)}`}
                                >
                                  {asset.id}
                                </a>
                                <p className="text-xs text-muted">{asset.label}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <AssetTypeBadge type={asset.type} />
                          </td>
                          <td className="font-mono text-sm font-semibold text-text">
                            <div className="flex items-center gap-2.5">
                              <span>{n ? formatValue(n.id, n.value) : <span className="text-muted">—</span>}</span>
                              {n && asset.hi > asset.lo && (
                                <div
                                  className="hidden sm:block w-16 h-1.5 rounded-full bg-border/60 overflow-hidden"
                                  title={`${Math.round(Math.max(0, Math.min(100, ((n.value - asset.lo) / (asset.hi - asset.lo)) * 100)))}%`}
                                >
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      flagged ? "bg-origin" : "bg-accent"
                                    }`}
                                    style={{
                                      width: `${Math.max(0, Math.min(100, ((n.value - asset.lo) / (asset.hi - asset.lo)) * 100))}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {n?.status ? (
                              <span className={`soc-reading-status ${n.status !== "normal" ? "text-suspect" : "text-normal"}`}>
                                <CircleDot size={10} />
                                {n.status}
                              </span>
                            ) : (
                              <span className="text-muted text-xs font-mono">online</span>
                            )}
                          </td>
                          <td className="font-mono text-xs text-text">
                            {reg ? (
                              <span>
                                <span className="text-accent">{reg.table}</span> · #{reg.address}
                              </span>
                            ) : mode === "hai" ? (
                              <span className="text-muted">HAI Replay</span>
                            ) : (
                              <span className="text-muted">HR 40001</span>
                            )}
                          </td>
                          <td className="font-mono text-xs text-muted">
                            {reg?.encoding ?? "FLOAT32_BE"}
                          </td>
                          <td className="text-xs text-muted font-mono">
                            {q ? (
                              <span className={q.quality !== "good" ? "text-suspect" : "text-normal"}>
                                {q.quality} ({q.age_ms === null ? "0" : Math.round(q.age_ms)}ms)
                              </span>
                            ) : (
                              <span className="text-normal">good (live)</span>
                            )}
                          </td>
                          <td>
                            <a
                              href={`/?asset=${encodeURIComponent(asset.id)}`}
                              className="soc-inspect-link"
                              title="Inspect asset in digital twin"
                            >
                              <span>Inspect</span>
                              <ChevronRight size={12} />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!assetRows.length && (
                  <div className="soc-empty-state">
                    <Tag size={20} className="text-muted" />
                    <p>{topology ? "No assets match search." : "Connecting to telemetry topology…"}</p>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
             ALERTS & INCIDENT TRIAGE VIEW
             ══════════════════════════════════════════════════════════════════ */
          <section className="soc-panel">
            {/* Toolbar */}
            <div className="soc-toolbar">
              <div className="soc-search-wrap">
                <Search size={14} className="soc-search-icon" />
                <input
                  aria-label="Search incidents"
                  className="soc-search-input"
                  placeholder="Search incident ID, origin asset, hypothesis..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted hover:text-text text-xs pr-1">
                    Clear
                  </button>
                )}
              </div>

              {/* Severity & Triage Filter Pills */}
              <div className="soc-pill-filter-group">
                {[
                  { id: "all", label: "All", count: list.length },
                  { id: "active", label: "Active", count: openCount },
                  { id: "unacknowledged", label: "Needs Ack", count: needsAck },
                  { id: "critical", label: "Critical", count: critCount },
                  { id: "high", label: "High", count: highCount },
                ].map(({ id, label, count }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`soc-filter-pill ${filter === id ? "active" : ""}`}
                  >
                    <span>{label}</span>
                    <span className="soc-pill-count">{count}</span>
                  </button>
                ))}
              </div>

              <span className="soc-count-chip ml-auto">
                {shown.length} of {list.length}
              </span>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
              <MobileIncidentCards
                incidents={shown}
                workflows={workflows}
                loading={recordsLoading}
                error={error}
              />
            </div>

            {/* Desktop High-Density Table */}
            <div className="hidden md:block soc-table-wrap">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Detected</th>
                    <th>Primary Origin</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Analyst Triage</th>
                    <th>Quick Containment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((i) => {
                    const wf = workflows[i.id];
                    const active = ["open", "localizing"].includes(i.status);
                    const isAcked = !!wf?.acknowledged;
                    const originNode = i.origin[0]?.id ?? "Unknown";

                    return (
                      <tr key={i.id} className={active ? "soc-row-active" : ""}>
                        {/* ID Column */}
                        <td>
                          <div className="flex items-center gap-1.5">
                            <a
                              className="font-mono text-[13px] font-semibold text-accent hover:underline"
                              href={`/investigations?incident=${encodeURIComponent(i.id)}`}
                              title={i.id}
                            >
                              {i.id.slice(0, 16)}…
                            </a>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(i.id, e)}
                              className="text-muted hover:text-text p-0.5 rounded transition-colors"
                              title="Copy full incident ID"
                            >
                              {copiedId === i.id ? <Check size={12} className="text-normal" /> : <Copy size={12} />}
                            </button>
                            {i.ambiguous && (
                              <span className="soc-ambiguous-pill" title="Top candidates tied in ranking">
                                tied
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="text-xs text-muted whitespace-nowrap font-mono">
                          {new Date(i.detected_at * 1000).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* Origin Asset */}
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-semibold text-text">{originNode}</span>
                            {i.origin.length > 1 && (
                              <span className="text-[10px] text-muted font-mono">
                                +{i.origin.length - 1} tied
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={i.status} />
                        </td>

                        {/* Severity */}
                        <td>
                          <SevBadge sev={wf?.severity} />
                        </td>

                        {/* Analyst Ack Triage Action */}
                        <td>
                          <button
                            type="button"
                            disabled={!canInvestigate || ackingId === i.id}
                            onClick={(e) => handleToggleAck(i.id, isAcked, e)}
                            className={`soc-ack-button ${isAcked ? "acked" : "pending"}`}
                            title={isAcked ? "Incident acknowledged. Click to revert" : "Click to mark acknowledged"}
                          >
                            {ackingId === i.id ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : isAcked ? (
                              <CheckCircle size={12} className="text-normal" />
                            ) : (
                              <CircleDot size={12} className="text-muted" />
                            )}
                            <span>{isAcked ? "Ack'd" : "Pending"}</span>
                          </button>
                        </td>

                        {/* Quick Containment Trigger */}
                        <td>
                          {active ? (
                            <div className="soc-quick-isolate-cell">
                              <IsolateButton incident={i} />
                            </div>
                          ) : (
                            <span className="text-xs text-muted font-mono">
                              {i.status === "contained" ? "Contained" : "Closed"}
                            </span>
                          )}
                        </td>

                        {/* Action Link */}
                        <td>
                          <a
                            href={`/investigations?incident=${encodeURIComponent(i.id)}`}
                            className="soc-investigate-btn"
                          >
                            <span>Investigate</span>
                            <ChevronRight size={13} />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!shown.length && (
                <div className="soc-empty-state">
                  <Shield size={24} className="text-muted" />
                  <p className="font-medium text-sm text-text mt-1">
                    {recordsLoading ? "Loading incident journal…" : error ? "Records unavailable." : "No incidents match filters."}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Trigger an attack in Local Lab or Attack Console to generate live detections.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border/70 flex items-center justify-between text-xs text-muted flex-wrap gap-2">
              <span className="font-mono text-[11px] text-muted">Physics-informed Bayesian scoring · Live telemetry</span>
              <a href="/investigations" className="text-accent hover:underline inline-flex items-center gap-1 font-medium">
                Full investigation journal <ArrowUpRight size={12} />
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
