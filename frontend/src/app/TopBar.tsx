import { ChartColumn, Columns2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModeToggle } from "../components/ui/ModeToggle";
import { SourcePill } from "../components/ui/SourcePill";
import { StatusPill } from "../components/ui/StatusPill";
import { getTopology, setMode as postMode } from "../lib/api";
import { latencyMs, pillKind } from "../lib/pill";
import type { Mode } from "../lib/types";
import { useLive } from "../store/live";
import { useUi } from "../store/ui";

function useClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour12: false });
}

export function TopBar() {
  const conn = useLive((s) => s.conn);
  const latest = useLive((s) => s.latest);
  const status = useLive((s) => s.status);
  const setStatus = useLive((s) => s.setStatus);
  const setTopology = useLive((s) => s.setTopology);
  const clear = useLive((s) => s.clear);
  const split = useUi((s) => s.split);
  const toggleSplit = useUi((s) => s.toggleSplit);
  const clock = useClock();
  const live = conn === "live" && latest !== null;
  const latency = live ? latencyMs(latest.t, Date.now()) : null;

  const change = (m: Mode) => {
    postMode(m)
      .then(async (s) => {
        setStatus(s);
        clear(); // the old mode's history does not belong on the new timeline
        setTopology(await getTopology());
      })
      .catch(() => undefined);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-2">
      <h1 className="text-sm font-semibold tracking-tight">AttackTrace</h1>
      <ModeToggle
        mode={latest?.mode ?? status?.mode ?? "sim"}
        haiAvailable={status?.hai_available ?? false}
        liveAvailable={status?.live_available ?? false}
        liveReason={status?.live_reason}
        onChange={change}
      />
      <StatusPill kind={pillKind(conn, latest)} />
      {latest?.mode === "live" && status?.source && <SourcePill source={status.source} />}
      <button
        type="button"
        aria-pressed={split}
        aria-label="Split view"
        onClick={toggleSplit}
        title="Baseline vs AttackTrace"
        className={`flex h-6 items-center gap-1 rounded border px-2 text-xs transition-colors duration-150 ${
          split ? "border-accent text-accent" : "border-border text-muted hover:text-text"
        }`}
      >
        <Columns2 size={14} aria-hidden />
        Split
      </button>
      <a
        href="/metrics"
        className="flex h-6 items-center gap-1 rounded border border-border px-2 text-xs text-muted transition-colors duration-150 hover:text-text"
      >
        <ChartColumn size={14} aria-hidden />
        Metrics
      </a>
      <div className="ml-auto flex items-center gap-3 font-mono text-xs text-muted">
        <span title="Detector">{status?.detector_active ?? "–"}</span>
        <span title="Latency" className="w-14 text-right">
          {latency === null ? "–" : `${latency} ms`}
        </span>
        <time className="text-text">{clock}</time>
      </div>
    </header>
  );
}
