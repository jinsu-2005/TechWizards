import { Eye, Radio } from "lucide-react";
import type { Frame, Snapshot } from "./model";
import { useEv } from "./store";

export function EvDock({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const ev = useEv();
  const candidates = frame.analysis.candidates.slice(0, 3);
  const path = frame.analysis.path;
  const idx = snapshot.history.findIndex((h) => h.time_s === ev.replayTime);
  const retained = ev.replayTime === null || idx >= 0;
  const truth = snapshot.truth;
  const nameOf = (id: string) => snapshot.components.find((c) => c.id === id)?.name ?? id;
  return <div className="evs-dock">
    <section className="evs-suspects" aria-label="Origin ranking">
      {candidates.length === 0
        ? <p className="evs-calm"><i /> {snapshot.incident?.status === "recovered" ? "Recovered. All signals within reference." : "All signals within reference."}</p>
        : <>
          <div className="evs-rank">{candidates.map((c, i) => <button key={c.id} aria-label={`Inspect candidate ${c.id}`} title={`Deviation ${c.deviation.toFixed(2)} · onset ${c.onset.toFixed(2)} · topology ${c.topology.toFixed(2)}`} onClick={() => ev.select(c.id)}>
            <b>{i + 1}</b><span><strong>{nameOf(c.id)}</strong><i style={{ width: `${Math.max(6, c.share * 100)}%` }} /></span><em>{Math.round(c.share * 100)}%</em>
          </button>)}</div>
          <p className="evs-path">{frame.analysis.ambiguous ? "Competing hypotheses" : path.length ? path.map((p) => p.source).concat(path[path.length - 1]?.target ?? []).join(" → ") : "Tracing propagation…"}</p>
        </>}
      {snapshot.incident && !truth && <button className="evs-reveal" onClick={() => { void ev.control("reveal"); }} disabled={ev.busy}><Eye size={14} aria-hidden /> Reveal injected target</button>}
      {truth && <p className="evs-truth">Injected {truth.kind} on <b>{truth.target}</b>{snapshot.incident ? ` · found in ${(snapshot.incident.detected_s - truth.started_s).toFixed(1)}s` : ""} · {snapshot.incident?.analysis.candidates[0]?.id === truth.target ? "match" : "no match"}</p>}
    </section>
    <section className="evs-replay">
      <Radio size={14} aria-hidden />
      <input aria-label="Evidence replay sample" type="range" min="0" max={Math.max(0, snapshot.history.length - 1)} value={ev.replayTime === null ? snapshot.history.length - 1 : Math.max(0, idx)} onChange={(e) => { const h = snapshot.history[Number(e.target.value)]; if (h) ev.replay(h.time_s); }} />
      {ev.replayTime === null
        ? <span className="evs-live">LIVE</span>
        : <button className="evs-back" onClick={() => ev.replay(null)}>Return to live</button>}
    </section>
    {ev.replayTime !== null && <p className="evs-replay-note" role="status">{retained ? `Historical snapshot · T+${ev.replayTime.toFixed(1)}s` : "Snapshot expired. Return to live."}</p>}
  </div>;
}
