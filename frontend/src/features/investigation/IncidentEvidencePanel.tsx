import type { InvestigationDetail } from "../../lib/types";

export function IncidentEvidencePanel({ detail }: { detail: InvestigationDetail }) {
  const capture = detail.capture;
  const saved = capture?.status === "captured" ? capture.payload : undefined;
  const affected = [...new Set([
    ...detail.incident.origin.map((n) => n.id), ...detail.incident.path.map((n) => n.id),
    ...(saved?.readings.filter((n) => n.status !== "normal").map((n) => n.id) ?? []),
  ])];
  const transitions = detail.events.filter((e) => e.category !== "process_observation")
    .slice(0, 12).sort((a, b) => a.received_at - b.received_at);
  return <div className="mt-4 min-w-0 space-y-4 border-t border-border pt-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-semibold">Evidence preserved at detection</h3>
      <span className={saved ? "text-xs text-normal" : "text-xs text-suspect"}>
        {saved ? "Saved · digest verified" : capture?.status === "integrity_error" ? "Integrity check failed" : "Not captured"}
      </span>
    </div>
    {!saved ? <p className="text-sm text-muted">{capture?.reason ?? "This older incident has no saved model and baseline capture."} Current source settings cannot identify the model used for this case.</p> : <>
      <p className="text-xs text-muted">{new Date(saved.captured_at * 1000).toLocaleString()} · {saved.scope}. This capture stays fixed as rankings and case notes evolve.</p>
      <dl className="grid gap-3 rounded-lg border border-border bg-bg p-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div><dt className="text-xs text-muted">Loaded model</dt><dd className="mt-1 font-mono uppercase">{saved.model.kind ?? "Unknown"}</dd></div>
        <div><dt className="text-xs text-muted">Training baseline</dt><dd className="mt-1">{saved.model.recorded_samples ? `${saved.model.recorded_samples.toLocaleString()} samples` : "Sample count not recorded"}</dd></div>
        <div><dt className="text-xs text-muted">Source at detection</dt><dd className="mt-1 break-all">{saved.source.mode.toUpperCase()}{saved.source.host ? ` · ${saved.source.host}:${saved.source.port}` : saved.source.file ? ` · ${saved.source.file}` : " · Local simulator"}</dd></div>
        <div><dt className="text-xs text-muted">Prior observations</dt><dd className="mt-1">{saved.pre_event_readings.length.toLocaleString()} saved readings</dd></div>
      </dl>
      <details className="rounded-lg border border-border p-3 text-xs"><summary className="cursor-pointer font-medium">Model, baseline and capture references</summary><dl className="mt-3 space-y-2 break-all">
        <div><dt className="text-muted">Loaded runtime identity · SHA-256</dt><dd className="font-mono">{saved.model.runtime_id}</dd></div>
        <div><dt className="text-muted">Model artifact</dt><dd className="font-mono">{saved.model.model_id ?? "Not recorded; loaded runtime identity retained"}</dd></div>
        <div><dt className="text-muted">Baseline object identity · joblib SHA-1</dt><dd className="font-mono">{saved.baseline.artifact_id}</dd></div>
        <div><dt className="text-muted">Capture checksum · SHA-256</dt><dd className="font-mono">{capture?.sha256}</dd></div>
      </dl><p className="mt-3 text-muted">Checksum verification detects payload changes; it is not a signature or physical-device attestation.</p>
        <a className="mt-2 inline-block text-accent underline" href={capture?.record_url} target="_blank" rel="noreferrer">Open saved capture JSON ↗</a>
      </details>
      <div><h4 className="text-sm font-semibold">First-observed readings against baseline</h4><p className="mt-1 text-xs text-muted">Reported measurements and clean mean ±3σ. These bands are comparison diagnostics, not the forecast detector's alert threshold.</p>
        <div tabIndex={0} role="region" aria-label="Saved incident readings, scroll horizontally" className="mt-2 max-h-72 overflow-auto rounded border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
          <table className="w-full min-w-[540px] text-left text-xs"><caption className="sr-only">Readings recorded at first incident emission</caption><thead className="sticky top-0 bg-surface text-muted"><tr>{["Asset", "Reading", "Clean band", "Score", "Quality"].map((s) => <th key={s} scope="col" className="p-2">{s}</th>)}</tr></thead><tbody>{saved.readings.map((n) => {
            const i = saved.baseline.asset_ids.indexOf(n.id);
            const mu = saved.baseline.mean[i], sd = saved.baseline.sd[i];
            const unit = saved.topology.nodes.find((t) => t.id === n.id)?.unit ?? "";
            return <tr className="border-t border-border" key={n.id}><th scope="row" className="p-2 font-mono">{n.id}</th><td className="p-2 font-mono">{n.value.toFixed(2)} {unit}</td><td className="p-2 font-mono text-muted">{mu === undefined || sd === undefined ? "Not recorded" : `${(mu - 3 * sd).toFixed(2)} – ${(mu + 3 * sd).toFixed(2)}`}</td><td className="p-2 font-mono">{n.score.toFixed(2)}</td><td className="p-2">{n.quality ?? "Not recorded"}</td></tr>;
          })}</tbody></table>
        </div><p className="mt-2 text-xs text-muted">{saved.limits}</p>
      </div>
    </>}
    <div><h3 className="text-sm font-semibold">Assets in the investigation</h3><p className="mt-1 text-xs text-muted">Union of ranked candidates, inferred path and abnormal captured readings; membership does not confirm compromise.</p><ul className="mt-2 flex flex-wrap gap-2">{affected.map((id) => <li className="rounded border border-border bg-bg px-2 py-1 font-mono text-xs" key={id}>{id}</li>)}</ul></div>
    <div><h3 className="text-sm font-semibold">Case timeline · recorded transitions</h3><ol className="mt-2 space-y-2 border-l border-border pl-3">{transitions.map((e) => <li key={e.id} className="text-xs"><time className="text-muted">{new Date(e.received_at * 1000).toLocaleString()}</time><a className="ml-2 text-accent underline" href={e.record_url} target="_blank" rel="noreferrer">{e.category.replaceAll("_", " ")} ↗</a>{typeof e.payload.status === "string" && <span className="ml-2">{e.payload.status}</span>}</li>)}</ol></div>
  </div>;
}
