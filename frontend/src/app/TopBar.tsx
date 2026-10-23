import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "../components/ui/ModeToggle";
import { SourcePill } from "../components/ui/SourcePill";
import { StatusPill } from "../components/ui/StatusPill";
import { WorkspaceHeader } from "../components/ui/WorkspaceHeader";
import { getTopology, setMode as postMode } from "../lib/api";
import { pillKind } from "../lib/pill";
import type { Mode } from "../lib/types";
import { useLive } from "../store/live";
import { useUi } from "../store/ui";

const SOURCE_NAMES: Record<Mode, string> = {
  sim: "Local simulation",
  hai: "HAI dataset replay",
  live: "Modbus monitoring",
};

export function TopBar() {
  const conn = useLive((s) => s.conn);
  const latest = useLive((s) => s.latest);
  const status = useLive((s) => s.status);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = latest?.mode ?? status?.mode ?? "sim";
  const calibrating = mode === "live" && (status?.source?.calibration != null || status?.source?.state === "calibrating");
  const flagged = latest?.nodes.filter((n) => n.status !== "normal").length ?? 0;

  const change = async (next: Mode) => {
    if (changing || next === mode) return;
    if (next === "hai" && !status?.hai_available) {
      setError(
        status?.hai_reason ??
          "Backend memory exceeded: HAI mode requires ≥1GB RAM and is disabled on the 512MB cloud instance. Run AttackTrace locally on your machine for full replay."
      );
      return;
    }
    setChanging(true);
    setError(null);
    try {
      const result = await postMode(next);
      useLive.getState().setStatus(result);
      useUi.getState().selectAsset(null);
      useLive.getState().clear();
      useLive.getState().setTopology(await getTopology());
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Unable to change the source. Try again.";
      if (next === "hai" && (msg.includes("502") || msg.toLowerCase().includes("memory") || msg.toLowerCase().includes("gateway") || msg.toLowerCase().includes("exceeded"))) {
        setError(
          status?.hai_reason ??
            "Backend memory exceeded: HAI dataset replay requires ≥1GB RAM and is disabled on this 512MB hosted instance. Run locally on your machine for full replay."
        );
      } else {
        setError(msg);
      }
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="monitoring-header">
      <WorkspaceHeader current="/" />

      <div className="monitoring-compact-bar">
        {/* Left: Title + Data source selector */}
        <div className="monitoring-title-area">
          <div className="flex items-center gap-3">
            <h1 className="monitoring-title">Process monitoring</h1>

            {/* Desktop segmented selector near the title */}
            <div className="monitoring-segmented-selector hidden sm:flex items-center gap-1.5" aria-busy={changing}>
              <ModeToggle
                mode={mode}
                haiAvailable={status?.hai_available ?? false}
                haiReason={status?.hai_reason}
                liveAvailable={status?.live_available ?? false}
                liveReason={status?.live_reason}
                onChange={(next) => { void change(next); }}
              />
            </div>
          </div>

          {/* Narrow compact selector: "Data source: SIM" */}
          <div className="monitoring-compact-selector flex sm:hidden items-center gap-1.5" aria-busy={changing}>
            <label className="compact-source-label">
              <span className="text-xs font-medium text-muted">Data source:</span>
              <select
                aria-label="Data source"
                value={mode}
                disabled={changing}
                onChange={(e) => { void change(e.target.value as Mode); }}
                className="compact-source-select"
              >
                <option value="sim">SIM · Simulation</option>
                <option value="hai">
                  HAI · Dataset replay {!status?.hai_available ? "(memory limit · click for info)" : ""}
                </option>
                <option value="live" disabled={!status?.live_available}>
                  LIVE · Connected monitoring {!status?.live_available ? `(${status?.live_reason ?? "unavailable"})` : ""}
                </option>
              </select>
            </label>
          </div>

          {changing && (
            <span role="status" className="inline-flex items-center gap-1 text-xs text-accent font-medium">
              <Loader2 size={12} className="animate-spin" aria-hidden />
              <span>Switching…</span>
            </span>
          )}
        </div>

        {/* Right: Essential one-line context + Health status pill */}
        <div className="monitoring-meta-area">
          <p className="monitoring-stats text-xs text-muted">
            {latest ? (
              <>
                <span className="font-semibold text-text">{latest.nodes.length}</span> assets ·{" "}
                <span className={flagged > 0 ? "font-semibold text-suspect" : "font-semibold text-text"}>{flagged}</span> flagged
              </>
            ) : (
              "Connecting to telemetry…"
            )}
            <span className="hidden lg:inline text-border mx-1.5">·</span>
            <span className="hidden lg:inline font-mono text-[11px] uppercase tracking-wider text-muted/70">{SOURCE_NAMES[mode]}</span>
          </p>

          <div className="monitoring-status-area flex items-center gap-2">
            {mode === "live" && status?.source && <SourcePill source={status.source} />}
            {calibrating ? (
              <span role="status" className="inline-flex items-center gap-1 rounded-full bg-suspect/15 border border-suspect/30 px-2.5 py-0.5 text-xs font-semibold text-suspect">
                Baseline in progress
              </span>
            ) : (
              <StatusPill kind={pillKind(conn, latest)} />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-1.5 flex items-center justify-between rounded-md border border-origin/40 bg-origin/10 px-3 py-1.5 text-xs text-origin">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-2 font-medium underline hover:text-origin/80">Dismiss</button>
        </div>
      )}
    </div>
  );
}
