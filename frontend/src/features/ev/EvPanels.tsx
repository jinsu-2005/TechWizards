import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Bot, Cpu, Download, Send, ShieldCheck, TriangleAlert } from "lucide-react";
import { navigate } from "../../lib/navigation";
import { attackLabels, componentStatus, formatReading, getReading, presets, validTargets, type AttackConfig, type AttackKind, type Frame, type Snapshot } from "./model";
import { useEv } from "./store";

export function EvCard({ title, detail, children, className = "" }: { title: string; detail?: string; children: ReactNode; className?: string }) {
  return <section className={`ev-card ${className}`}><div className="ev-card-heading"><h2>{title}</h2>{detail && <span>{detail}</span>}</div>{children}</section>;
}

export function EvInspector({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const selected = useEv((s) => s.selected);
  const component = snapshot.components.find((c) => c.id === selected);
  const reading = getReading(frame, selected);
  if (!component || !reading) return null;
  return <EvCard title="Component inspector" detail={selected}>
    <div className="ev-inspector-icon"><Cpu size={26} aria-hidden /></div>
    <span className="ev-eyebrow">{component.kind} / {component.system}</span>
    <h3 className="ev-component-title">{component.name}</h3>
    <p>{componentStatus(frame, selected)} · sampled at T+{frame.time_s.toFixed(1)}s</p>
    <dl className="ev-details">
      <div><dt>Measured</dt><dd>{formatReading(reading)}</dd></div>
      <div><dt>Model reference</dt><dd>{reading.expected.toFixed(1)} {reading.unit}</dd></div>
      <div><dt>Normalized residual</dt><dd>{reading.residual.toFixed(2)} / 1.00 threshold</dd></div>
      <div><dt>Reference tolerance</dt><dd>{component.tolerance} {component.unit}</dd></div>
      <div><dt>Source</dt><dd>Backend EV simulator</dd></div>
    </dl>
    <p className="ev-small">The reference is a clean model prediction. An anomaly does not establish malicious intent.</p>
    <button className="ev-text-button" onClick={() => navigate("/ev?view=pilot")}>Investigate with EV AI Pilot <ArrowRight size={15} aria-hidden /></button>
  </EvCard>;
}

export function EvLocalization({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const select = useEv((s) => s.select);
  const control = useEv((s) => s.control);
  const busy = useEv((s) => s.busy);
  const candidates = frame.analysis.candidates;
  const recovered = snapshot.incident?.status === "recovered";
  const archived = snapshot.incident?.analysis;
  return <EvCard title="Origin investigation" detail={candidates.length ? frame.analysis.ambiguous ? "Competing hypotheses" : "Ranked hypotheses" : recovered ? "Recovery verified" : "Monitoring"}>
    <div className="ev-detector-note"><ShieldCheck size={18} aria-hidden /><p>Measured residuals + onset + topology. Two consecutive samples above threshold trigger detection. The detector has no injection target input.</p></div>
    {candidates.length === 0 ? <div className="ev-empty"><h3>{recovered ? "Signals recovered" : "No persistent anomaly"}</h3><p>{recovered ? "All signals remained below threshold for 3 seconds. The last incident’s evidence is retained below." : "Start a scenario in the attack lab. Detection follows the observed signals, rather than the preset label."}</p></div> : <>
      <div className="ev-ranking" role="group" aria-label="Ranked EV origins">{candidates.map((c, i) => <button key={c.id} onClick={() => select(c.id)} aria-label={`Inspect candidate ${c.id}`}><span className="ev-rank">{i + 1}</span><span><strong>{c.id}</strong><small>Onset T+{c.onset_s.toFixed(1)}s · residual {c.residual.toFixed(2)}</small></span><span className="ev-rank-score">{c.score.toFixed(3)}<small>{(c.share * 100).toFixed(1)}% score share</small></span><span className="ev-score-breakdown">Deviation {c.deviation.toFixed(2)} · onset {c.onset.toFixed(2)} · topology {c.topology.toFixed(2)}</span></button>)}</div>
      <div className="ev-path"><span>Inferred propagation</span><p>{frame.analysis.path.length ? frame.analysis.path.map((p) => `${p.source} → ${p.target} (T+${p.onset_s.toFixed(1)}s)`).join(" · ") : "No onset-compatible downstream path yet."}</p></div>
    </>}
    <p className="ev-small">Score = 0.55 × deviation + 0.30 × onset + 0.15 × topology. Shares are uncalibrated ranking weights, not compromise probabilities.</p>
    {snapshot.incident && <details className="ev-evidence-details"><summary>{snapshot.incident.id} · {snapshot.incident.status} · first detected T+{snapshot.incident.detected_s.toFixed(1)}s</summary><p>Retained ranking: {archived?.candidates.map((c) => `${c.id} (${c.score.toFixed(3)})`).join(", ")}. {snapshot.incident.recovered_s !== null && `Recovered at T+${snapshot.incident.recovered_s.toFixed(1)}s.`}</p><button className="ev-button" disabled={busy} onClick={() => { void control("reveal"); }}>Reveal injection truth for evaluation</button></details>}
    {snapshot.truth && <div className="ev-truth"><strong>Evaluation only: injected {snapshot.truth.kind} on {snapshot.truth.target}</strong><p>Started T+{snapshot.truth.started_s.toFixed(1)}s. Detection delay: {snapshot.incident ? (snapshot.incident.detected_s - snapshot.truth.started_s).toFixed(1) : "—"}s. Retained top candidate: {archived?.candidates[0]?.id ?? "none"}. Match: {archived?.candidates[0]?.id === snapshot.truth.target ? "yes" : "no"}.</p><small>This separately revealed target never enters detector scoring or AI context.</small></div>}
  </EvCard>;
}

export function EvAttackLab({ snapshot }: { snapshot: Snapshot }) {
  const [config, setConfig] = useState<AttackConfig>(presets[0]?.config ?? { kind: "bias", target: "TEMP", magnitude: 22, duration: 25 });
  const launch = useEv((s) => s.launch); const control = useEv((s) => s.control); const busy = useEv((s) => s.busy); const replay = useEv((s) => s.replayTime);
  const changeKind = (kind: AttackKind) => setConfig((c) => ({ ...c, kind, target: validTargets(kind, snapshot.components)[0]?.id ?? "TEMP" }));
  const disabled = busy || !snapshot.running || snapshot.attack_active || replay !== null || (!!snapshot.incident && snapshot.incident.status !== "recovered");
  const submit = (e: FormEvent) => { e.preventDefault(); void launch(config); };
  const unit = snapshot.components.find((c) => c.id === config.target)?.unit ?? "";
  return <EvCard title="Attack & fault lab" detail="EV sandbox only">
    <p>Configure an injection, then compare the independently ranked origin with the hidden test target.</p>
    <div className="ev-presets">{presets.map((p) => <button key={p.label} aria-pressed={config.kind === p.config.kind && config.target === p.config.target} onClick={() => setConfig(p.config)}><TriangleAlert size={16} aria-hidden /><span><strong>{p.label}</strong><small>{p.detail}</small></span></button>)}</div>
    <form onSubmit={submit} className="ev-attack-form">
      <label>Injection type<select value={config.kind} onChange={(e) => changeKind(e.target.value as AttackKind)}>{Object.entries(attackLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Target component<select value={config.target} onChange={(e) => setConfig((c) => ({ ...c, target: e.target.value }))}>{validTargets(config.kind, snapshot.components).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}</select></label>
      <label>Magnitude ({unit})<input type="number" min="-500" max="500" step="0.1" required value={config.magnitude} disabled={["freeze", "replay", "failure"].includes(config.kind)} onChange={(e) => setConfig((c) => ({ ...c, magnitude: Number(e.target.value) }))} /></label>
      <label>Duration (seconds)<input type="number" min="2" max="120" step="1" required value={config.duration} onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) }))} /></label>
      <p className="ev-small ev-form-wide">{["freeze", "replay"].includes(config.kind) ? "After launch, change cruise demand to expose frozen or replayed readings. A constant plausible signal may remain undetected." : config.kind === "failure" ? "Physical failure and command tampering can have indistinguishable telemetry. Attribution requires additional evidence." : "Signed magnitude offsets the selected measured signal or actuator feedback in the sandbox."}</p>
      <div className="ev-form-actions"><button className="ev-button ev-primary" disabled={disabled} type="submit">{busy ? "Applying…" : "Launch injection"}</button><button type="button" className="ev-button" disabled={busy || !snapshot.attack_active} onClick={() => { void control("stop"); }}>Stop injection</button></div>
    </form>
    <div className="ev-callout"><ShieldCheck size={18} aria-hidden /><p>{snapshot.attack_active ? `Injection active · ${snapshot.attack_remaining_s.toFixed(1)}s remaining. Detection is based on observed telemetry.` : snapshot.incident && snapshot.incident.status !== "recovered" ? "Waiting for residual recovery. Reset the EV sandbox to begin a fresh run immediately." : "Ready for one injection at a time. No physical vehicle or water plant command is sent."}</p></div>
  </EvCard>;
}

export function EvPilotPanel({ frame }: { frame: Frame }) {
  const ev = useEv(); const [input, setInput] = useState("");
  const ask = (q: string) => { if (q.trim()) { void ev.ask(q); setInput(""); } };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };
  const lastQuestion = [...ev.messages].reverse().find((m) => m.role === "user")?.text;
  return <EvCard title="EV AI Pilot" detail="Separate EV backend & evidence tools" className="ev-pilot">
    <div className="ev-pilot-welcome"><Bot size={34} aria-hidden /><h3>From a signal to a supported explanation.</h3><p>Ask about EV components, compare ranked origins and review the evidence behind a propagation hypothesis. The server supplies EV-only tools to the configured model.</p></div>
    <div className="ev-pilot-context"><span>Selected: {ev.selected}</span><span>{ev.replayTime === null ? "Current" : "Historical"} snapshot: T+{frame.time_s.toFixed(1)}s</span><span>Source: backend EV simulator</span></div>
    <div className="ev-prompts">{["Summarize vehicle health", "Compare the origin candidates and their evidence", "Inspect the selected component", "Explain detection limitations and the next checks"].map((q) => <button key={q} disabled={ev.pilotBusy || !ev.connected} onClick={() => ask(q)}>{q}<ArrowRight size={14} aria-hidden /></button>)}</div>
    <div className="ev-messages" role="log" aria-label="EV pilot conversation" aria-live="polite">{ev.messages.map((m, i) => <div key={i} className={`ev-message${m.role === "user" ? " is-user" : ""}`}><strong>{m.role === "user" ? "You" : "EV AI Pilot"}</strong>{m.model && <div className={`ev-model-label${m.fallback ? " is-fallback" : ""}`}>{m.fallback ? "Model unavailable · evidence summary" : `Model: ${m.model}`} · T+{m.time_s?.toFixed(1)}s{m.reason && <span>{m.reason}</span>}</div>}<p className="ev-answer-text">{m.text}</p>{m.tools && <details className="ev-evidence-details"><summary>Evidence tools used</summary><ul>{m.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul></details>}</div>)}</div>
    {ev.pilotBusy && <p role="status" className="ev-thinking">Reading EV telemetry, component state and incident evidence…</p>}
    {ev.pilotError && <div role="alert" className="ev-error"><p>{ev.pilotError}</p><button className="ev-button" disabled={!lastQuestion || ev.pilotBusy} onClick={() => { if (lastQuestion) void ev.ask(lastQuestion); }}>Retry last question</button></div>}
    <form className="ev-pilot-form" onSubmit={submit}><label className="sr-only" htmlFor="ev-question">Ask EV AI Pilot</label><input id="ev-question" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this EV investigation…" maxLength={2000} /><button className="ev-button ev-primary" disabled={!input.trim() || ev.pilotBusy || !ev.connected} type="submit"><Send size={16} aria-hidden /><span>Send</span></button></form>
    <div className="ev-pilot-bottom"><p className="ev-small">The model explains observed evidence. It does not execute commands. Provider failures show an explicit local evidence summary.</p><button className="ev-text-button" disabled={ev.pilotBusy} onClick={ev.clearChat}>Clear conversation</button></div>
  </EvCard>;
}

export function EvEvidence({ snapshot, frame }: { snapshot: Snapshot; frame: Frame }) {
  const replay = useEv((s) => s.replay);
  const exportEvidence = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ source: "EV simulator", frame, incident: snapshot.incident, events: snapshot.events.filter((e) => e.time_s <= frame.time_s), detector: snapshot.detector }, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `ev-evidence-${frame.time_s}s.json`; a.click(); URL.revokeObjectURL(url);
  };
  return <EvCard title="Evidence timeline" detail={`${snapshot.events.length} retained events`}>
    <ol className="ev-event-log">{snapshot.events.filter((e) => e.time_s <= frame.time_s).map((event) => <li key={event.id}><button onClick={() => replay(event.time_s)} title="Inspect retained snapshot at this event"><span>{event.id}</span><strong>T+{event.time_s.toFixed(1)}s</strong></button><span><strong>{event.category}</strong> · {event.text}{event.asset_id && ` [${event.asset_id}]`}</span></li>)}</ol>
    <button className="ev-text-button" onClick={exportEvidence}><Download size={15} aria-hidden />Export evidence JSON</button>
  </EvCard>;
}
