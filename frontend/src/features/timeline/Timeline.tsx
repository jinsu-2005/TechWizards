import { Crosshair, History, ShieldAlert } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Panel } from "../../components/ui/Panel";
import { indexToX, markers, nodeSeries, timelineRows, xToIndex } from "../../lib/replay";
import { RING_CAPACITY, useLive } from "../../store/live";
import { ReplayControls } from "./ReplayControls";
import { Sparkline } from "./Sparkline";

const LABEL_W = 148;
const ROW_H = 22;
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
const pctX = (i: number, len: number): number => indexToX(i, len, RING_CAPACITY, 100);

export function Timeline() {
  usePlayback();
  const buffer = useLive((s) => s.buffer);
  const cursor = useLive((s) => s.cursor);
  const len = buffer.length;
  const at = cursor ?? len - 1;
  const ids = useLive((s) => s.latest?.nodes.map((n) => n.id).join(",") ?? "");
  const rows = useMemo(() => timelineRows(ids ? ids.split(",") : []), [ids]);
  const series = useMemo(() => rows.map((id) => ({ id, ...nodeSeries(buffer, id) })), [rows, buffer]);
  const marks = useMemo(() => markers(buffer), [buffer]);

  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === "pointermove" && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    useLive.getState().scrubTo(xToIndex(e.clientX - rect.left, len, RING_CAPACITY, rect.width));
  };

  return (
    <Panel title="Timeline" icon={History} className="h-full">
      <div className="flex h-full">
        <ReplayControls />
        <div className="flex min-w-0 flex-1 flex-col justify-center pr-2">
          <div className="relative" style={{ height: TRACK_H, marginLeft: LABEL_W }} aria-hidden>
            {marks.map((m) => {
              const Icon = m.kind === "detected" ? ShieldAlert : Crosshair;
              return (
                <span
                  key={`${m.kind}-${m.index}`}
                  title={m.label}
                  className={`absolute top-0 -translate-x-1/2 ${
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
