import { useState } from "react";
import { ShieldCheck, AlertCircle, Database, Server, Cpu, History, FileCode, Search, ExternalLink } from "lucide-react";
import type { InvestigationDetail } from "../../lib/types";

export function IncidentEvidencePanel({ detail }: { detail: InvestigationDetail }) {
  const [filterText, setFilterText] = useState("");
  const capture = detail.capture;
  const saved = capture?.status === "captured" ? capture.payload : undefined;
  const affected = [...new Set([
    ...detail.incident.origin.map((n) => n.id),
    ...detail.incident.path.map((n) => n.id),
    ...(saved?.readings.filter((n) => n.status !== "normal").map((n) => n.id) ?? []),
  ])];
  const transitions = detail.events
    .filter((e) => e.category !== "process_observation")
    .slice(0, 12)
    .sort((a, b) => a.received_at - b.received_at);

  const filteredReadings = (saved?.readings ?? []).filter((r) =>
    r.id.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* ── Evidence Header Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-surface/70 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            saved ? "bg-normal/10 border-normal/30 text-normal" : "bg-suspect/10 border-suspect/30 text-suspect"
          }`}>
            {saved ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-text">Evidence preserved at detection</h3>
            <p className="text-xs text-muted">
              {saved
                ? `${new Date(saved.captured_at * 1000).toLocaleString()} · ${saved.scope}. This capture stays fixed as rankings and case notes evolve.`
                : "Historical capture state for this case"}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            saved
              ? "text-normal bg-normal/10 border-normal/25"
              : capture?.status === "integrity_error"
              ? "text-origin bg-origin/10 border-origin/25"
              : "text-suspect bg-suspect/10 border-suspect/25"
          }`}
        >
          {saved
            ? "Saved · digest verified"
            : capture?.status === "integrity_error"
            ? "Integrity check failed"
            : "Not captured"}
        </span>
      </div>

      {!saved ? (
        <div className="p-4 rounded-xl border border-suspect/30 bg-suspect/5 text-sm text-muted">
          <p className="text-text font-medium mb-1">Capture Unavailable</p>
          <p>{capture?.reason ?? "This older incident has no saved model and baseline capture."} Current source settings cannot identify the model used for this case.</p>
        </div>
      ) : (
        <>
          {/* ── 4 KPI Stats Grid ── */}
          <dl className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 shadow-sm">
              <dt className="flex items-center gap-1.5 text-xs text-muted mb-1 font-medium">
                <Cpu size={12} className="text-accent" />
                Loaded model
              </dt>
              <dd className="font-mono text-base font-bold text-text uppercase">
                {saved.model.kind ?? "Unknown"}
              </dd>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 shadow-sm">
              <dt className="flex items-center gap-1.5 text-xs text-muted mb-1 font-medium">
                <Database size={12} className="text-accent" />
                Training baseline
              </dt>
              <dd className="font-mono text-base font-bold text-text">
                {saved.model.recorded_samples ? `${saved.model.recorded_samples.toLocaleString()} samples` : "Sample count not recorded"}
              </dd>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 shadow-sm">
              <dt className="flex items-center gap-1.5 text-xs text-muted mb-1 font-medium">
                <Server size={12} className="text-accent" />
                Source at detection
              </dt>
              <dd className="font-mono text-xs font-semibold text-text break-all mt-1">
                {saved.source.mode.toUpperCase()}{saved.source.host ? ` · ${saved.source.host}:${saved.source.port}` : saved.source.file ? ` · ${saved.source.file}` : " · Local simulator"}
              </dd>
            </div>
            <div className="rounded-xl border border-border/80 bg-surface/60 p-3.5 shadow-sm">
              <dt className="flex items-center gap-1.5 text-xs text-muted mb-1 font-medium">
                <History size={12} className="text-accent" />
                Prior observations
              </dt>
              <dd className="font-mono text-base font-bold text-text">
                {saved.pre_event_readings.length.toLocaleString()} saved readings
              </dd>
            </div>
          </dl>

          {/* ── Model, baseline and capture references ── */}
          <details className="rounded-xl border border-border/80 bg-surface/40 p-3.5 text-xs group">
            <summary className="cursor-pointer font-semibold text-text flex items-center justify-between select-none">
              <span className="flex items-center gap-2">
                <FileCode size={13} className="text-accent" />
                Model, baseline and capture references
              </span>
              <span className="text-muted text-[11px] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <dl className="mt-3.5 space-y-2.5 break-all border-t border-border/50 pt-3">
              <div>
                <dt className="text-muted text-[11px]">Loaded runtime identity · SHA-256</dt>
                <dd className="font-mono text-text bg-bg/80 border border-border/60 p-1.5 rounded mt-0.5">{saved.model.runtime_id}</dd>
              </div>
              <div>
                <dt className="text-muted text-[11px]">Model artifact</dt>
                <dd className="font-mono text-text bg-bg/80 border border-border/60 p-1.5 rounded mt-0.5">{saved.model.model_id ?? "Not recorded; loaded runtime identity retained"}</dd>
              </div>
              <div>
                <dt className="text-muted text-[11px]">Baseline object identity · joblib SHA-1</dt>
                <dd className="font-mono text-text bg-bg/80 border border-border/60 p-1.5 rounded mt-0.5">{saved.baseline.artifact_id}</dd>
              </div>
              <div>
                <dt className="text-muted text-[11px]">Capture checksum · SHA-256</dt>
                <dd className="font-mono text-text bg-bg/80 border border-border/60 p-1.5 rounded mt-0.5">{capture?.sha256}</dd>
              </div>
            </dl>
            <p className="mt-2.5 text-muted/80 text-[11px]">
              Checksum verification detects payload changes; it is not a signature or physical-device attestation.
            </p>
            {capture?.record_url && (
              <a
                className="mt-2 inline-flex items-center gap-1 text-accent font-medium hover:underline text-[11.5px]"
                href={capture.record_url}
                target="_blank"
                rel="noreferrer"
              >
                <span>Open saved capture JSON</span>
                <ExternalLink size={11} aria-hidden />
              </a>
            )}
          </details>

          {/* ── First-Observed Readings Table ── */}
          <div className="rounded-xl border border-border/80 bg-surface/50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-semibold text-text">First-observed readings against baseline</h4>
                <p className="text-xs text-muted mt-0.5">Reported measurements and clean mean ±3σ. These bands are comparison diagnostics, not the forecast detector's alert threshold.</p>
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="rounded-lg border border-border bg-bg pl-7 pr-3 py-1 text-xs text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label="Saved incident readings, scroll horizontally"
              className="mt-2 max-h-80 overflow-auto rounded-lg border border-border/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <table className="inv-data-table min-w-[540px] text-left text-xs">
                <caption className="sr-only">Readings recorded at first incident emission</caption>
                <thead className="sticky top-0 bg-surface text-muted z-10">
                  <tr>
                    {["Asset", "Reading", "Clean band", "Score", "Quality"].map((s) => (
                      <th key={s} scope="col" className="p-2.5">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReadings.map((n) => {
                    const i = saved.baseline.asset_ids.indexOf(n.id);
                    const mu = saved.baseline.mean[i];
                    const sd = saved.baseline.sd[i];
                    const unit = saved.topology.nodes.find((t) => t.id === n.id)?.unit ?? "";
                    const isHigh = n.score > 3;

                    return (
                      <tr className="border-t border-border/50 hover:bg-accent/[0.03] transition-colors" key={n.id}>
                        <th scope="row" className="p-2.5 font-mono font-semibold text-text">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${isHigh ? "bg-origin" : "bg-normal"}`} />
                            {n.id}
                          </span>
                        </th>
                        <td className="p-2.5 font-mono text-text">
                          {n.value.toFixed(2)} {unit}
                        </td>
                        <td className="p-2.5 font-mono text-muted">
                          {mu === undefined || sd === undefined
                            ? "Not recorded"
                            : `${(mu - 3 * sd).toFixed(2)} – ${(mu + 3 * sd).toFixed(2)}`}
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            isHigh ? "bg-origin/15 text-origin border border-origin/30" : "text-muted"
                          }`}>
                            {n.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="rounded bg-bg border border-border/60 px-2 py-0.5 text-[11px] text-muted">
                            {n.quality ?? "Not recorded"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11.5px] text-muted">{saved.limits}</p>
          </div>
        </>
      )}

      {/* ── Assets in the Investigation ── */}
      <div className="rounded-xl border border-border/80 bg-surface/50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text">Assets in the investigation</h3>
        <p className="mt-0.5 text-xs text-muted">Union of ranked candidates, inferred path and abnormal captured readings; membership does not confirm compromise.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {affected.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-bg px-2.5 py-1 font-mono text-xs font-medium text-text hover:border-accent/40 transition-colors shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {id}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Case timeline · recorded transitions ── */}
      <div className="rounded-xl border border-border/80 bg-surface/50 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-text mb-1">Case timeline · recorded transitions</h3>
        <ol className="mt-3 space-y-2.5 border-l-2 border-accent/30 pl-4 ml-1">
          {transitions.map((e) => (
            <li key={e.id} className="relative text-xs">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent ring-4 ring-surface" />
              <div className="flex flex-wrap items-center gap-2">
                <time className="text-muted font-mono">{new Date(e.received_at * 1000).toLocaleString()}</time>
                <a
                  className="font-semibold text-accent hover:underline inline-flex items-center gap-0.5"
                  href={e.record_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{e.category.replaceAll("_", " ")}</span>
                  <ExternalLink size={10} aria-hidden />
                </a>
                {typeof e.payload.status === "string" && (
                  <span className="rounded-full bg-bg border border-border px-2 py-0.5 text-[10.5px] font-mono text-text">
                    {e.payload.status}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
