import { Columns2, Radar, Waypoints, WifiOff } from "lucide-react";
import { CalibratingState } from "../components/ui/CalibratingState";
import { EmptyState } from "../components/ui/EmptyState";
import { IncidentToast } from "../components/ui/IncidentToast";
import { NoticeToast } from "../components/ui/NoticeToast";
import { Panel } from "../components/ui/Panel";
import { AttackConsole } from "../features/console/AttackConsole";
import { GraphView } from "../features/graph/GraphView";
import { IncidentPanel } from "../features/incident/IncidentPanel";
import { SplitView } from "../features/split/SplitView";
import { Timeline } from "../features/timeline/Timeline";
import { TwinView } from "../features/twin/TwinView";
import { useLive } from "../store/live";
import { useUi, type CenterView } from "../store/ui";
import { TopBar } from "./TopBar";
import { useLiveSourcePoll } from "./useLiveSourcePoll";
import { useLiveStream } from "./useLiveStream";

function ViewToggle() {
  const view = useUi((s) => s.view);
  const setView = useUi((s) => s.setView);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const opts: { id: CenterView; label: string; icon: typeof Radar }[] = [
    { id: "twin", label: "Twin", icon: Radar },
    { id: "graph", label: "Graph", icon: Waypoints },
  ];
  return (
    <div role="group" aria-label="View" className="inline-flex rounded border border-border p-px">
      {opts.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={(hai ? "graph" : view) === id}
          disabled={hai && id === "twin"}
          title={hai && id === "twin" ? "Twin is SIM only" : undefined}
          onClick={() => setView(id)}
          className={`flex h-5 items-center gap-1 rounded-sm px-2 text-xs transition-colors duration-150 ${
            (hai ? "graph" : view) === id ? "bg-accent text-bg" : "text-muted hover:text-text"
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
  const split = useUi((s) => s.split);
  // LIVE while recording a clean baseline and training: nothing to draw yet, just the progress.
  const calibrating = useLive(
    (s) => s.latest?.mode === "live" && s.status?.source?.state === "calibrating",
  );
  const progress = useLive((s) => s.status?.source?.progress ?? null);
  const body = !live ? (
    <EmptyState icon={WifiOff} text="No signal" />
  ) : calibrating ? (
    <CalibratingState progress={progress} />
  ) : view === "twin" ? (
    <TwinView />
  ) : (
    <GraphView />
  );
  if (split) {
    return (
      <Panel title="Split view" icon={Columns2} actions={calibrating ? undefined : <ViewToggle />}>
        <div className="flex h-full flex-col">
          {/* Phase 14 C4: 42/58 (was 52/48) -- the mini-twin below needs more of the height
              budget to clear 12px; see geometry.ts's VIEW.h trim for the other half of the fix. */}
          <div className="h-[42%] shrink-0 border-b border-border">
            {live && !calibrating ? <SplitView /> : <EmptyState icon={WifiOff} text="No signal" />}
          </div>
          <div className="min-h-0 flex-1">{body}</div>
        </div>
      </Panel>
    );
  }
  return (
    <Panel
      title={view === "twin" ? "Digital twin" : "Process graph"}
      icon={view === "twin" ? Radar : Waypoints}
      actions={calibrating ? undefined : <ViewToggle />}
    >
      {body}
    </Panel>
  );
}

export function App() {
  useLiveStream();
  useLiveSourcePoll();
  const hasLatest = useLive((s) => s.latest !== null);
  const conn = useLive((s) => s.conn);
  const live = (conn === "live" || hasLatest) && hasLatest;

  return (
    <div className="flex h-full min-w-[1280px] flex-col gap-1 p-1">
      <TopBar />
      <IncidentToast />
      <NoticeToast />
      <main className="grid min-h-0 flex-1 grid-cols-[272px_minmax(0,1fr)_320px] grid-rows-[minmax(0,1fr)_160px] gap-1">
        <AttackConsole />
        <Center live={live} />
        <IncidentPanel />
        <div className="col-span-3 min-h-0">
          <Timeline />
        </div>
      </main>
    </div>
  );
}
