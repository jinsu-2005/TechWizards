import { Database, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../../components/ui/Panel";
import { controlHaiReplay, getHaiReplay, postReset, type HaiReplay } from "../../lib/api";
import { useLive } from "../../store/live";
import { noticeIfLocked } from "../../store/ui";
import { NodeScores } from "./NodeScores";

const offset = (seconds: number) => {
  const n = Math.floor(seconds);
  return `${Math.floor(n / 3600)}h ${Math.floor(n % 3600 / 60)}m ${n % 60}s`;
};

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
        if (mounted.current && ticket === serial.current) { setInfo(next); setError(null); }
      } catch (e) { if (mounted.current && ticket === serial.current) setError(e instanceof Error ? e.message : "Replay unavailable"); }
    };
    void refresh();
    const timer = setInterval(() => { if (!busyRef.current) void refresh(); }, 2000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, []);
  const change = async (body?: { speed?: number; paused?: boolean }) => {
    ++serial.current;
    busyRef.current = true;
    setBusy(true);
    try {
      if (!body) { await postReset(); useLive.getState().clear(); }
      const next = body ? await controlHaiReplay(body) : await getHaiReplay();
      if (mounted.current) { setInfo(next); setError(null); }
    } catch (e) {
      noticeIfLocked(e);
      if (mounted.current) setError(e instanceof Error ? e.message : "Playback update failed");
    } finally { busyRef.current = false; if (mounted.current) setBusy(false); }
  };
  const disabled = busy || historical || !info;
  return <Panel title="Replay" icon={Database}>
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3 [&>*]:shrink-0">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">Recorded dataset</span>
        <h3 className="mt-1 text-base font-semibold">{info?.dataset ?? "HAI replay"}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">Recorded industrial telemetry · {info?.file ?? "Loading"}. Read-only playback.</p>
      </div>
      {error && <p role="alert" className="rounded border border-suspect/40 p-2 text-xs text-suspect">{error}</p>}
      {!info && !error && <p role="status" className="text-xs text-muted">Loading recording details…</p>}
      {info && <>
        <div>
          <div className="mb-2 flex justify-between text-xs"><span className="text-muted">{info.paused ? "Source paused" : "Replaying"}</span><span className="font-mono">{(100 * info.position / Math.max(1, info.total)).toFixed(1)}%</span></div>
          <progress aria-label="Recording progress" className="hai-progress h-1.5 w-full" value={info.position} max={Math.max(1, info.total)} />
          <p className="mt-1 text-[11px] text-muted">Offset {offset(info.position / info.sample_hz)} / {offset(info.total / info.sample_hz)}</p>
          <p className="mt-1 text-[11px] text-muted">Loops from {offset(info.start / info.sample_hz)} after the recording ends.</p>
        </div>
        <div className="flex gap-2"><button aria-label={info.paused ? "Resume source" : "Pause source"} disabled={disabled} onClick={() => void change({ paused: !info.paused })} className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface text-xs disabled:opacity-50">{info.paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}{info.paused ? "Resume" : "Pause"}</button><select aria-label="HAI playback speed" disabled={disabled} value={info.speed} onChange={(e) => void change({ speed: Number(e.target.value) })} className="h-9 rounded-md border border-border bg-bg px-2 text-xs disabled:opacity-50">{[1, 2, 5, 10, 20].map((n) => <option key={n} value={n}>{n}× replay</option>)}</select></div>
        <button disabled={disabled} onClick={() => void change()} className="flex h-9 items-center justify-center gap-2 rounded-md border border-border text-xs text-muted disabled:opacity-50"><RotateCcw size={13} aria-hidden />Restart recording</button>
        {historical && <p className="text-xs text-suspect">Return to the latest sample to control the source. The details above describe the current source.</p>}
        <details className="rounded-lg border border-border p-2.5 text-xs"><summary className="cursor-pointer text-muted">Recording details · {info.file} · {info.features} tags</summary><div className="pt-3">        <dl className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs"><dt className="text-muted">Recording</dt><dd className="text-right font-mono">{info.file}</dd><dt className="text-muted">Usable tags</dt><dd className="text-right font-mono">{info.features}</dd><dt className="text-muted">Detector</dt><dd className="text-right font-mono uppercase">{info.model}</dd><dt className="text-muted">Sample rate</dt><dd className="text-right font-mono">{info.sample_hz} Hz</dd></dl>
</div></details>
        <div className="flex flex-wrap gap-1">{info.processes.map((p) => <span key={p} className="rounded border border-border px-2 py-1 font-mono text-[10px] text-muted">{p}</span>)}</div>
      </>}
      <p className="text-[11px] leading-relaxed text-muted">Graph links are learned associations. Ranked origins and propagation are model estimates, not verified firmware or network attribution.</p>
      <a className="text-xs text-accent underline underline-offset-2" href="https://github.com/icsdataset/hai" target="_blank" rel="noreferrer">Dataset source and documentation ↗</a>
      <details className="border-t border-border pt-3"><summary className="cursor-pointer text-xs text-muted">All tag scores</summary><div className="mt-2"><NodeScores /></div></details>
    </div>
  </Panel>;
}
