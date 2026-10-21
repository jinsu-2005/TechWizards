import { Crosshair, History, ShieldAlert } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Panel } from "../../components/ui/Panel";
import { indexToX, markers, nodeSeries, timelineAxis, timelineRows, xToIndex } from "../../lib/replay";
import { useLive } from "../../store/live";
import { ReplayControls } from "./ReplayControls";
import { Sparkline } from "./Sparkline";

const LABEL_W = 148;
const ROW_H = 26;
const TRACK_H = 14;

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
  const physical = useLive((s) => s.latest?.nodes.some((n) => n.truth !== null) ?? false);
  const buffer = useLive((s) => s.buffer);
  const cursor = useLive((s) => s.cursor);
  const len = buffer.length;
  const at = cursor ?? len - 1;
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
    <Panel title="Timeline" icon={History} className="h-full" actions={<div className="flex items-center gap-3 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-accent" />Reported</span>{physical && <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-muted" />Physical</span>}</div>}>
      <div className="flex h-full">
        <ReplayControls />
        <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
          <div className="relative text-[11px] font-mono text-muted select-none" style={{ height: TRACK_H, marginLeft: LABEL_W }} aria-hidden>
            {axis.map((tick) => <span key={tick.position} className={tick.label === "Latest" ? "font-semibold text-text" : "hidden sm:inline first:inline"} style={{ position: "absolute", left: `${tick.position}%`, transform: tick.position === 0 ? undefined : tick.position === 100 ? "translateX(-100%)" : "translateX(-50%)" }}>{tick.label}</span>)}
            {marks.map((m) => {
              const Icon = m.kind === "detected" ? ShieldAlert : Crosshair;
              return (
                <span
                  key={`${m.kind}-${m.index}`}
                  title={m.label}
                  className={`absolute top-0 -translate-x-1/2 z-10 ${
                    m.kind === "detected" ? "text-origin" : "text-accent"
                  }`}
                  style={{ left: `${pctX(m.index, len)}%` }}
                >
                  <Icon size={12} />
                </span>
              );
            })}
          </div>
          <div className="relative">
            {series.map((s) => (
              <Sparkline
                key={s.id}
                id={s.id}
                reported={s.reported}
                truth={s.truth}
                at={at}
                height={ROW_H}
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
                className="absolute top-0 h-full cursor-ew-resize touch-none"
                style={{ left: LABEL_W, right: 0 }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scrub(e);
                }}
                onPointerMove={scrub}
              >
                <div
                  className={`absolute top-0 h-full w-px ${cursor === null ? "bg-normal" : "bg-accent"}`}
                  style={{ left: `${pctX(at, len)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
