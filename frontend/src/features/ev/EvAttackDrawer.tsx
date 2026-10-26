import { useState } from "react";
import { Crosshair, Play, Square, X } from "lucide-react";
import { navigate } from "../../lib/navigation";
import { attackLabels, presets, validTargets, type AttackConfig, type AttackKind, type Snapshot } from "./model";
import { useEv } from "./store";

export function EvAttackDrawer({ snapshot }: { snapshot: Snapshot }) {
  const [config, setConfig] = useState<AttackConfig>(presets[0]?.config ?? { kind: "bias", target: "TEMP", magnitude: 22, duration: 25 });
  const [cruise, setCruise] = useState(snapshot.speed);
  const launch = useEv((s) => s.launch); const control = useEv((s) => s.control);
  const busy = useEv((s) => s.busy); const replay = useEv((s) => s.replayTime);
  const unit = snapshot.components.find((c) => c.id === config.target)?.unit ?? "";
  const blocked = busy || !snapshot.running || snapshot.attack_active || replay !== null || (!!snapshot.incident && snapshot.incident.status !== "recovered");
  const fixedMagnitude = ["freeze", "replay", "failure"].includes(config.kind);
  const changeKind = (kind: AttackKind) => setConfig((c) => ({ ...c, kind, target: validTargets(kind, snapshot.components)[0]?.id ?? "TEMP" }));
  const fire = async () => { await launch(config); if (!useEv.getState().error) navigate("/ev"); };
  const note = snapshot.attack_active ? `Injecting · ${snapshot.attack_remaining_s.toFixed(0)}s left`
    : snapshot.incident && snapshot.incident.status !== "recovered" ? "Incident open. Reset to run another."
    : replay !== null ? "Return to live to launch."
    : !snapshot.running ? "Resume the simulator first." : "Ready. Sandbox only.";
  return <aside className="evs-drawer evs-drawer-left" aria-label="Attack lab">
    <header><h2><Crosshair size={16} aria-hidden /> Attack lab</h2><button className="evs-x" aria-label="Close" onClick={() => navigate("/ev")}><X size={16} aria-hidden /></button></header>
    <div className="evs-scenarios">{presets.map((p) => <button key={p.label} title={p.detail} aria-pressed={config.kind === p.config.kind && config.target === p.config.target} onClick={() => setConfig(p.config)}><strong>{p.label}</strong><code>{p.config.target}</code></button>)}</div>
    <div className="evs-fields">
      <label>Magnitude<span><input type="number" min="-500" max="500" step="0.1" value={config.magnitude} disabled={fixedMagnitude} onChange={(e) => setConfig((c) => ({ ...c, magnitude: Number(e.target.value) }))} /><small>{unit}</small></span></label>
      <label>Duration<span><input type="number" min="2" max="120" step="1" value={config.duration} onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) }))} /><small>s</small></span></label>
    </div>
    <details className="evs-custom"><summary>More options</summary>
    <label className="evs-cruise">Cruise <strong>{cruise} km/h</strong>
      <input type="range" min="0" max="120" step="1" value={cruise} disabled={busy || replay !== null} onChange={(e) => setCruise(Number(e.target.value))} onPointerUp={() => { void control("speed", cruise); }} onKeyUp={() => { void control("speed", cruise); }} />
    </label>
      <label>Type<select value={config.kind} onChange={(e) => changeKind(e.target.value as AttackKind)}>{Object.entries(attackLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label>Target<select value={config.target} onChange={(e) => setConfig((c) => ({ ...c, target: e.target.value }))}>{validTargets(config.kind, snapshot.components).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    </details>
    <footer>
      <p>{note}</p>
      {snapshot.attack_active
        ? <button className="evs-cta is-stop" disabled={busy} onClick={() => { void control("stop"); }}><Square size={14} aria-hidden /> Stop injection</button>
        : <button className="evs-cta" disabled={blocked} onClick={() => { void fire(); }}><Play size={14} aria-hidden /> Launch injection</button>}
    </footer>
  </aside>;
}
