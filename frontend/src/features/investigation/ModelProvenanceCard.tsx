import { useEffect, useState } from "react";
import type { LiveModelInfo } from "../../lib/types";

export function ModelProvenanceCard() {
  const [info, setInfo] = useState<LiveModelInfo | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/live/model");
        if (!response.ok) throw new Error("Unavailable");
        const next = await response.json() as LiveModelInfo;
        if (active) { setInfo(next); setError(false); }
      } catch { if (active) setError(true); }
    };
    void refresh(); const timer = setInterval(() => void refresh(), 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return <section className="min-w-0 rounded-xl border border-border bg-surface p-4" aria-label="LIVE baseline and model">
    <h2 className="font-semibold">LIVE baseline &amp; model</h2>
    {error && <p role="status" className="mt-2 text-sm text-muted">Current model information is unavailable. Previously received details may be stale.</p>}
    {!info ? !error && <p className="mt-2 text-sm text-muted">Loading baseline information…</p> : <>
      <div className="my-3 grid gap-3 text-sm sm:grid-cols-3">
        <div><p className="text-xs text-muted">Model</p><p>{info.model_loaded ? info.active_model?.toUpperCase() : "Calibration pending"}</p></div>
        <div><p className="text-xs text-muted">Baseline</p><p>{info.recorded_samples && info.sample_s ? `${info.recorded_samples} samples · ${info.recorded_samples * info.sample_s / 60} min` : info.calibration ? `${info.calibration.collected_samples} / ${info.calibration.target_samples} samples` : "Not recorded"}</p></div>
        <div><p className="text-xs text-muted">Trained</p><p>{info.trained_at ? new Date(info.trained_at).toLocaleString() : "Not trained"}</p></div>
      </div>
      {info.calibration?.notice && <p className="mb-3 text-sm text-accent">{info.calibration.notice}</p>}
      {info.validation_mse != null && <p className="mb-3 text-xs text-muted">Chronological validation: {info.validation_samples} samples · forecast MSE {info.validation_mse.toFixed(4)}. This training diagnostic is not attack-detection accuracy.</p>}
      <details className="text-xs text-muted"><summary className="cursor-pointer">Source and model references</summary><dl className="mt-3 space-y-2"><dt>Source configuration fingerprint</dt><dd className="break-all font-mono text-text">{info.source_fingerprint}</dd><dt>Model artifact ID</dt><dd className="break-all font-mono text-text">{info.model_id ?? "Not available"}</dd></dl></details>
      <p className="mt-3 text-xs leading-relaxed text-muted">{info.fingerprint_scope}. Current model context does not establish which model produced a historical incident.</p>
    </>}
  </section>;
}
