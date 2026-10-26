import { Database, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { controlHaiReplay, getHaiReplay, postReset, type HaiReplay } from "../../lib/api";
import { useLive } from "../../store/live";
import { noticeIfLocked } from "../../store/ui";
import { NodeScores } from "./NodeScores";

const offset = (seconds: number) => {
  const n = Math.floor(seconds);
  return `${Math.floor(n / 3600)}h ${Math.floor((n % 3600) / 60)}m ${n % 60}s`;
};

/**
 * Replay transport for a recorded dataset.
 *
 * Only the controls an operator uses while watching stay on screen; the dataset's provenance,
 * tag inventory and model caveats sit behind disclosures, so the process graph beside this
 * panel gets the width. Nothing was removed, only folded.
 */
export function HaiReplayPanel() {
  const [info, setInfo] = useState<HaiReplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const serial = useRef(0);
  const mounted = useRef(true);
  const historical = useLive((s) => s.cursor !== null);

  useEffect(() => {
    mounted.current = true;
    const refresh = async () => {
      const ticket = ++serial.current;
      try {
        const next = await getHaiReplay();
        if (mounted.current && ticket === serial.current) {
          setInfo(next);
          setError(null);
        }
      } catch (e) {
        if (mounted.current && ticket === serial.current) {
          setError(e instanceof Error ? e.message : "Replay unavailable");
        }
      }
    };
    void refresh();
    const timer = setInterval(() => {
      if (!busyRef.current) void refresh();
    }, 2000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, []);

  const change = async (body?: { speed?: number; paused?: boolean }) => {
    ++serial.current;
    busyRef.current = true;
    setBusy(true);
    try {
      if (!body) {
        await postReset();
        useLive.getState().clear();
      }
      const next = body ? await controlHaiReplay(body) : await getHaiReplay();
      if (mounted.current) {
        setInfo(next);
        setError(null);
      }
    } catch (e) {
      noticeIfLocked(e);
      if (mounted.current) setError(e instanceof Error ? e.message : "Playback update failed");
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const disabled = busy || historical || !info;
  const percent = info ? (100 * info.position) / Math.max(1, info.total) : 0;

  return (
    <Panel title="Replay" icon={Database}>
      <div className="hai-replay flex h-full flex-col gap-2.5 overflow-y-auto p-3 [&>*]:shrink-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-sm font-semibold" title={info?.file}>
            {info?.dataset ?? "HAI replay"}
          </h3>
          <span className="shrink-0 font-mono text-xs text-muted">{percent.toFixed(1)}%</span>
        </div>

        {error && (
          <p role="alert" className="rounded border border-suspect/40 p-2 text-xs text-suspect">
            {error}
          </p>
        )}
        {!info && !error && (
          <p role="status" className="text-xs text-muted">
            Loading recording details…
          </p>
        )}

        {info && (
          <>
            <progress
              aria-label="Recording progress"
              className="hai-progress h-1.5 w-full"
              value={info.position}
              max={Math.max(1, info.total)}
            />
            <p className="font-mono text-[11px] text-muted">
              {offset(info.position / info.sample_hz)} / {offset(info.total / info.sample_hz)}
              <span className="ml-1 font-sans">
                · {info.paused ? "paused" : `${info.speed}x`}
              </span>
            </p>

            <div className="flex gap-2">
              <button
                aria-label={info.paused ? "Resume source" : "Pause source"}
                disabled={disabled}
                onClick={() => void change({ paused: !info.paused })}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface text-xs disabled:opacity-50"
              >
                {info.paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
                {info.paused ? "Resume" : "Pause"}
              </button>
              <select
                aria-label="HAI playback speed"
                disabled={disabled}
                value={info.speed}
                onChange={(e) => void change({ speed: Number(e.target.value) })}
                className="h-9 rounded-md border border-border bg-bg px-2 text-xs disabled:opacity-50"
              >
                {[1, 2, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}× replay
                  </option>
                ))}
              </select>
              <button
                aria-label="Restart recording"
                title="Restart recording"
                disabled={disabled}
                onClick={() => void change()}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted disabled:opacity-50"
              >
                <RotateCcw size={13} aria-hidden />
              </button>
            </div>

            {historical && (
              <p className="text-xs text-suspect">
                Return to the latest sample to control the source.
              </p>
            )}

            <details className="hai-fold">
              <summary>
                Dataset · {info.features} tags · {info.processes.length} processes
              </summary>
              <div className="hai-fold-body">
                <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  <dt className="text-muted">Recording</dt>
                  <dd className="truncate text-right font-mono">{info.file}</dd>
                  <dt className="text-muted">Usable tags</dt>
                  <dd className="text-right font-mono">{info.features}</dd>
                  <dt className="text-muted">Detector</dt>
                  <dd className="text-right font-mono uppercase">{info.model}</dd>
                  <dt className="text-muted">Sample rate</dt>
                  <dd className="text-right font-mono">{info.sample_hz} Hz</dd>
                </dl>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Loops from {offset(info.start / info.sample_hz)} after the recording ends.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {info.processes.map((p) => (
                    <span
                      key={p}
                      className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  Graph links are learned associations. Ranked origins and propagation are model
                  estimates, not verified firmware or network attribution. Playback is read-only.
                </p>
                <a
                  className="mt-2 inline-block text-xs text-accent underline underline-offset-2"
                  href="https://github.com/icsdataset/hai"
                  target="_blank"
                  rel="noreferrer"
                >
                  Dataset source ↗
                </a>
              </div>
            </details>

            <details className="hai-fold">
              <summary>All tag scores</summary>
              <div className="hai-fold-body">
                <NodeScores />
              </div>
            </details>
          </>
        )}
      </div>
    </Panel>
  );
}
