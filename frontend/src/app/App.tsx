import { useFreshness } from "./useFreshness";
import { useState } from "react";
import { Radar, Waypoints, WifiOff } from "lucide-react";
import { CalibratingState } from "../components/ui/CalibratingState";
import { EmptyState } from "../components/ui/EmptyState";
import { IncidentToast } from "../components/ui/IncidentToast";
import { NoticeToast } from "../components/ui/NoticeToast";
import { Panel } from "../components/ui/Panel";
import { AttackConsole } from "../features/console/AttackConsole";
import { ProcessWorkspace } from "../features/investigation/ProcessWorkspace";
import { IncidentPanel } from "../features/incident/IncidentPanel";
import { Timeline } from "../features/timeline/Timeline";
import { useLive } from "../store/live";
import { useUi, type CenterView } from "../store/ui";
import { CopilotDrawer } from "../features/copilot/CopilotDrawer";
import { TopBar } from "./TopBar";
import { useLiveSourcePoll } from "./useLiveSourcePoll";
import { useLiveStream } from "./useLiveStream";

function ViewToggle() {
  const view = useUi((s) => s.view);
  const setView = useUi((s) => s.setView);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const opts: { id: CenterView; label: string; icon: typeof Radar }[] = [
    { id: "twin", label: "Digital Twin", icon: Radar },
    { id: "graph", label: "Process Graph", icon: Waypoints },
  ];
  return (
    <div role="group" aria-label="View" className="inline-flex rounded border border-border p-px">
      {opts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={(hai ? "graph" : view) === id}
          disabled={hai && id === "twin"}
          title={hai && id === "twin" ? "HAI recordings use the Process Graph; no physical twin is configured for this dataset" : undefined}
          onClick={() => setView(id)}
          className={`flex h-7 items-center gap-1 rounded-sm px-2 text-xs transition-colors duration-150 ${
            (hai ? "graph" : view) === id ? "bg-accent text-on-accent" : "text-muted hover:text-text"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <Icon size={12} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

function Center({ live }: { live: boolean }) {
  const chosen = useUi((s) => s.view);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const view = hai ? "graph" : chosen; // a dataset replay has no twin
  // LIVE while recording a clean baseline and training: nothing to draw yet, just the progress.
  const calibrating = useLive(
    (s) => s.latest?.mode === "live" && (s.status?.source?.calibration != null || s.status?.source?.state === "calibrating"),
  );
  const progress = useLive((s) => s.status?.source?.progress ?? null);
  const source = useLive((s) => s.status?.source);
  const body = !live ? (
    <EmptyState icon={WifiOff} text="No signal" />
  ) : calibrating ? (
    <CalibratingState progress={progress} source={source} />
  ) : (
    <ProcessWorkspace graph={view === "graph"} />
  );
  return (
    <Panel
      title={view === "twin" ? "Digital twin" : "Process graph"}
      className="center-panel"
      icon={view === "twin" ? Radar : Waypoints}
      actions={calibrating ? undefined : <ViewToggle />}
    >
      {body}
    </Panel>
  );
}

export function App() {
  const [mobilePanel, setMobilePanel] = useState("process");
  useLiveStream();
  useLiveSourcePoll();
  const hasLatest = useLive((s) => s.latest !== null);
  const conn = useLive((s) => s.conn);
  const live = (conn === "live" || hasLatest) && hasLatest;
  const { stale, ageSeconds, replaying } = useFreshness();

  return (
    <div className="dashboard-shell">
      <TopBar />
      {stale && !replaying && <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-suspect/40 bg-suspect/10 px-3 py-2 text-sm text-suspect"><WifiOff size={16} aria-hidden /><span>Connection interrupted. Showing last received readings ({ageSeconds}s ago).</span></div>}
      {replaying && <div role="status" className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">Historical replay · readings are from the selected point in time.</div>}
      <IncidentToast />
      <NoticeToast />
      <CopilotDrawer />
      <div role="group" aria-label="Monitoring panels" className="monitoring-panel-switch">{([["process", "Process"], ["scenario", "Test scenario"], ["incident", "Incident"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={mobilePanel === value} onClick={() => setMobilePanel(value)}>{label}</button>)}</div>
      <main id="main-workspace" tabIndex={-1} data-mobile-panel={mobilePanel} className={`dashboard-main ${stale && !replaying ? "stale-telemetry" : ""}`}>
        <AttackConsole />
        <Center live={live} />
        <IncidentPanel />
        <div className="timeline-panel min-h-0">
          <Timeline />
        </div>
      </main>
    </div>
  );
}
