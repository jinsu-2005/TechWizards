import { Crosshair, History, ShieldAlert } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFreshness } from "../../app/useFreshness";
import { Panel } from "../../components/ui/Panel";
import { indexToX, markers, nodeSeries, timelineAxis, timelineRows, xToIndex } from "../../lib/replay";
import { useLive } from "../../store/live";
import { ReplayControls } from "./ReplayControls";
import { Sparkline } from "./Sparkline";

/** Drives playback while `playing`: one sample per emit period. */
function usePlayback(): void {
  const playing = useLive((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => useLive.getState().tick(), 500);
    return () => clearInterval(id);
  }, [playing]);
}

/** Position of a sample along the plot as a percentage of its width. */
const pctX = (i: number, len: number): number => indexToX(i, len, Math.max(2, len), 100);

export function Timeline() {
  usePlayback();
  const { stale } = useFreshness();
  const physical = useLive((s) => s.latest?.nodes.some((n) => n.truth !== null) ?? false);
  const buffer = useLive((s) => s.buffer);
  const cursor = useLive((s) => s.cursor);
  const len = buffer.length;
  const at = cursor ?? len - 1;
  const live = cursor === null;
  const view = buffer[at];
  const ids = useLive((s) => s.latest?.nodes.map((n) => n.id).join(",") ?? "");
  const rows = useMemo(() => timelineRows(ids ? ids.split(",") : []), [ids]);
  const series = useMemo(() => rows.map((id) => ({ id, ...nodeSeries(buffer, id) })), [rows, buffer]);
  const marks = useMemo(() => markers(buffer), [buffer]);
  const axis = useMemo(() => timelineAxis(buffer), [buffer]);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    useLive.getState().scrubTo(xToIndex(e.clientX - rect.left, len, Math.max(2, len), rect.width));
  };

  return (
    <Panel
      title="Timeline"
      icon={History}
      className="h-full"
      headerExtra={
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block h-3.5 w-px bg-border/60" aria-hidden />
          <ReplayControls />
        </div>
      }
      actions={
        <div className="timeline-legend">
          <span><i className="timeline-key-reported" />Reported</span>
          {physical && <span><i className="timeline-key-physical" />Physical</span>}
        </div>
      }
    >
      <div className="timeline-body">
        <div className="timeline-chart">
          <div className="timeline-axis" aria-hidden>
            {axis.filter((tick, index) => tick.label === "Latest" || axis.findIndex((item) => item.label === tick.label) === index).map((tick) => <span key={tick.position} className={tick.label === "Latest" ? "timeline-axis-latest" : "timeline-axis-offset"} style={{ left: `${tick.position}%`, transform: tick.position === 0 ? undefined : tick.position === 100 ? "translateX(-100%)" : "translateX(-50%)" }}>{tick.label}</span>)}
            {marks.map((m) => {
              const Icon = m.kind === "detected" ? ShieldAlert : Crosshair;
              return (
                <span
                  key={`${m.kind}-${m.index}`}
                  title={m.label}
                  className={`timeline-event ${m.kind === "detected" ? "timeline-event-detected" : ""}`}
                  style={{ left: `${pctX(m.index, len)}%` }}
                >
                  <Icon size={14} />
                </span>
              );
            })}
          </div>
          {marks.length > 0 && <ul className="sr-only" aria-label="Timeline events">
            {marks.map((mark) => <li key={`${mark.kind}-${mark.index}`}>{mark.label}</li>)}
          </ul>}
          <div className="timeline-rows">
            {series.map((s) => (
              <Sparkline
                key={s.id}
                id={s.id}
                reported={s.reported}
                truth={s.truth}
                at={at}
                live={live && !stale}
                physical={physical}
                status={view?.nodes.find((node) => node.id === s.id)?.status}
              />
            ))}
            {len > 0 && (
              <div
                role="slider"
                aria-label="Timeline position"
                aria-valuemin={0}
                aria-valuemax={Math.max(0, len - 1)}
                aria-valuenow={Math.max(0, at)}
                aria-valuetext={buffer[at] ? `Received ${new Date(buffer[at].t * 1000).toLocaleTimeString()}` : undefined}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); useLive.getState().scrubTo(at + (e.key === "ArrowLeft" ? -1 : 1)); }
                  if (e.key === "Home") { e.preventDefault(); useLive.getState().scrubTo(0); }
                  if (e.key === "End") { e.preventDefault(); useLive.getState().goLive(); }
                }}
                className="timeline-scrubber"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scrub(e);
                }}
                onPointerMove={scrub}
              >
                <div
                  className={`timeline-playhead ${live ? "timeline-playhead-live" : ""}`}
                  style={{ left: `${pctX(at, len)}%` }}
                ><span className="timeline-playhead-handle" /></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
