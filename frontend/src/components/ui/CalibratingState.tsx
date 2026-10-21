import { useState } from "react";
import { restartLiveCalibration } from "../../lib/api";
import type { SourceInfo } from "../../lib/types";
import { useLive } from "../../store/live";
import { ProgressRing } from "./ProgressRing";

/** LIVE is recording clean traffic and training its detector: progress ring + label, nothing
 *  else — there is no incident data worth drawing yet. */
export function CalibratingState({ progress, source }: { progress: number | null; source?: SourceInfo | null }) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const calibration = source?.calibration;
  const stage = calibration?.stage;
  const pct = progress === null ? null : Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const duration = (seconds: number): string => `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  const title = stage === "training" ? "Training LIVE detector" : stage === "blocked" ? "Calibration needs clean readings" : stage === "failed" ? "Calibration failed" : `Calibrating${pct !== null ? ` ${pct}%` : ""}`;
  const retry = async (): Promise<void> => {
    setRetrying(true); setError("");
    try {
      const updated = await restartLiveCalibration();
      const status = useLive.getState().status;
      if (status?.mode === "live") useLive.getState().setStatus({ ...status, source: updated });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not restart calibration"); }
    finally { setRetrying(false); }
  };
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto p-5 text-muted">
      <ProgressRing progress={stage === "training" ? null : progress} />
      <span role="status" className="text-center text-sm font-semibold text-text">
        {title}
      </span>
      {calibration && <div className="w-full max-w-md space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        {calibration.notice && <p role="status" className="text-accent">{calibration.notice}</p>}
        <p className="font-mono text-text">{calibration.collected_samples.toLocaleString()} / {calibration.target_samples.toLocaleString()} accepted samples</p>
        <div className="flex flex-wrap justify-between gap-2 text-xs"><span>Elapsed {duration(calibration.elapsed_s)}</span><span>Skipped {calibration.skipped_samples.toLocaleString()}</span></div>
        {stage === "collecting" && calibration.remaining_s != null && <p>About {duration(calibration.remaining_s)} of clean readings remaining, then model training. Collection continues if you switch to SIM or HAI.</p>}
        {stage === "training" && <p>Recording complete. Training and validating the detector on this computer. The recording percentage is not training progress.</p>}
        {stage === "blocked" && <><p>Collection is paused for these readings. Check the emulator, connection and any active test overrides; elapsed time alone cannot complete calibration.</p><ul className="max-h-28 overflow-y-auto font-mono text-xs text-text">{calibration.blockers.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {stage === "failed" && <><p role="alert" className="break-words text-text">{source?.reason ?? "The detector could not be trained."}</p><p>The recording has been preserved for diagnosis. Restart begins a new clean recording.</p><button className="min-h-10 rounded border border-border px-3 text-text disabled:opacity-50" disabled={retrying} onClick={() => void retry()}>{retrying ? "Restarting…" : "Restart calibration"}</button></>}
        <p className="border-t border-border pt-3 text-xs">Detection is unavailable until calibration finishes. Use normal emulator operation for the baseline; data quality checks cannot prove that traffic is attack-free.</p>
        {error && <p role="alert" className="text-flag">{error}</p>}
      </div>}
    </div>
  );
}
