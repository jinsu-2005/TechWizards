import { useEffect, useState, lazy, Suspense } from "react";
import {
  Activity, AlertTriangle, CheckCircle2,
  Flame, Hash, Play, RotateCcw,
  Terminal, Zap, ZapOff
} from "lucide-react";
import {
  getLab, configureLab, probeLab, changeIntegrity,
  postAttack, postReset
} from "../../lib/api";
import type { Scenario } from "../../lib/types";
import { useLive, selectView } from "../../store/live";
import { useUi } from "../../store/ui";
import { TwinView } from "../twin/TwinView";
import { AssetInspector } from "./AssetInspector";

const GraphView = lazy(() => import("../graph/GraphView").then((m) => ({ default: m.GraphView })));

interface LabStatus {
  enabled: boolean;
  asset_id: string;
  offset: number;
  delay_ms: number;
  drop: boolean;
  routed: boolean;
  latest: {
    emulator_value: number;
    receiver_value: number | null;
    hypothesis: string;
    transaction_id: number;
    observed_at: number;
    asset_id: string;
  } | null;
  integrity: {
    available?: boolean;
    reason?: string;
    instance_id?: string;
    observed_hash?: string;
    factory_hash?: string;
    config?: Record<string, unknown>;
    error?: string;
  };
}

export function LocalLab() {
  const [status, setStatus] = useState<LabStatus | null>(null);
  const [proxyAsset, setProxyAsset] = useState("LIT101");
  const [proxyOffset, setProxyOffset] = useState(10);
  const [proxyDelay, setProxyDelay] = useState(0);
  const [proxyDrop, setProxyDrop] = useState(false);

  // Attack trigger card states
  const [activeAttack, setActiveAttack] = useState<string | null>(null);
  const [attackNote, setAttackNote] = useState<string | null>(null);
  const [attackError, setAttackError] = useState<string | null>(null);

  // Custom scenario controls
  const [setpointDelta, setSetpointDelta] = useState(25);
  const [sensorTarget, setSensorTarget] = useState("LIT101");
  const [sensorOffsetVal, setSensorOffsetVal] = useState(-25);
  const [actuatorTarget, setActuatorTarget] = useState("MV101");
  const [actuatorState, setActuatorState] = useState<0 | 1>(1);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Digital Twin state
  const [twinTab, setTwinTab] = useState<"twin" | "graph">("twin");
  const view = useLive(selectView);
  const selectedAsset = useUi((s) => s.selectedAsset);

  const clearLive = useLive((s) => s.clear);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      getLab<LabStatus>().then(
        (s) => { if (alive) setStatus(s); },
        () => { if (alive) setError("Cannot reach local lab proxy service."); }
      );
    void refresh();
    const timer = setInterval(() => void refresh(), 4000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const action = async (run: () => Promise<unknown>, label?: string) => {
    setBusy(true);
    setError(null);
    setAttackError(null);
    try {
      const response = await run();
      setResult(JSON.stringify(response, null, 2));
      setStatus(await getLab<LabStatus>());
      if (label) setAttackNote(`${label} executed successfully.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Experiment action failed";
      setError(msg);
      setAttackError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleInjectAttack = async (scenario: Scenario, target: string, magnitude: number, label: string) => {
    setBusy(true);
    setActiveAttack(label);
    setAttackNote(null);
    setAttackError(null);
    try {
      const resp = await postAttack({ scenario, target, magnitude });
      setAttackNote(`Injected "${label}" on ${target}. Detections will register in Alerts & Incident Panel.`);
      setResult(JSON.stringify(resp, null, 2));
    } catch (e) {
      setAttackError(e instanceof Error ? e.message : "Injection failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGlobalReset = async () => {
    setResetting(true);
    setError(null);
    setAttackError(null);
    try {
      await postReset();
      clearLive();
      setActiveAttack(null);
      setAttackNote("All attacks reset to baseline state. Saved investigation records are preserved.");
      setResult(JSON.stringify({ status: "reset", timestamp: Date.now() }, null, 2));
      setStatus(await getLab<LabStatus>());
    } catch (e) {
      setAttackError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const paired = status?.latest;
  const isHashTampered =
    status?.integrity.observed_hash &&
    status?.integrity.factory_hash &&
    status.integrity.observed_hash !== status.integrity.factory_hash;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top Simulation Status & Reset Bar ── */}
      <div className="lab-control-bar flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="lab-pulse-indicator" />
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text">Fault Injection &amp; Hardware Lab</h2>
            <span className="text-border hidden sm:inline">·</span>
            <span className="text-[11px] font-mono text-muted">Target: PLC1 / LIT101 / MV101</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeAttack && (
            <span className="soc-badge-open px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5">
              <Flame size={12} className="text-origin animate-pulse" />
              <span>Active: {activeAttack}</span>
            </span>
          )}
          <button
            type="button"
            disabled={busy || resetting}
            onClick={() => void handleGlobalReset()}
            className="soc-reset-button"
            title="Reset all running scenarios to normal baseline"
          >
            <RotateCcw size={13} className={resetting ? "animate-spin" : ""} />
            <span>{resetting ? "Restoring baseline…" : "Reset Scenarios"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {attackNote && (
        <div role="status" className="lab-success-toast">
          <CheckCircle2 size={15} className="text-normal shrink-0" />
          <span>{attackNote}</span>
          <button onClick={() => setAttackNote(null)} className="ml-auto text-muted hover:text-text text-xs">
            Dismiss
          </button>
        </div>
      )}

      {(error || attackError) && (
        <div role="alert" className="lab-error-toast">
          <AlertTriangle size={15} className="text-suspect shrink-0" />
          <span>{error || attackError}</span>
          <button onClick={() => { setError(null); setAttackError(null); }} className="ml-auto text-muted hover:text-text text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          WORKBENCH: BIG DIGITAL TWIN (LEFT) & ATTACK SCENARIOS (RIGHT)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN: BIG DIGITAL TWIN */}
        <section className="lg:col-span-7 xl:col-span-8 lab-panel-card !p-0 overflow-hidden flex flex-col border border-border/80 bg-surface/90 shadow-md rounded-xl h-full">
          {/* Digital Twin Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-surface/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="text-accent flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text">
                Digital Twin
              </h3>
            </div>

            <div className="flex items-center rounded-lg bg-bg/90 p-0.5 border border-border/70">
              <button
                type="button"
                onClick={() => setTwinTab("twin")}
                className={`px-3 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                  twinTab === "twin"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-muted hover:text-text hover:bg-surface/60"
                }`}
              >
                TWIN
              </button>
              <button
                type="button"
                onClick={() => setTwinTab("graph")}
                className={`px-3 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                  twinTab === "graph"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-muted hover:text-text hover:bg-surface/60"
                }`}
              >
                GRAPH
              </button>
            </div>
          </div>

          {/* Digital Twin Viewport */}
          <div className="relative w-full flex-1 min-h-[500px] lg:min-h-[580px] bg-bg/70 overflow-hidden flex flex-col">
            {!view ? (
              <div className="flex h-full min-h-[500px] items-center justify-center flex-col gap-2.5 text-muted">
                <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                <span className="text-xs font-mono tracking-wider">Synchronizing Digital Twin Stream…</span>
              </div>
            ) : (
              <div className={`process-canvas h-full min-h-0 flex-1 ${selectedAsset ? "has-inspector" : ""}`}>
                <div className="process-primary h-full min-h-0 min-w-0">
                  {twinTab === "graph" ? (
                    <Suspense fallback={<p className="p-4 text-sm text-muted">Loading process graph…</p>}>
                      <GraphView key={view.mode} />
                    </Suspense>
                  ) : (
                    <TwinView hideToolbar={true} hideHint={true} />
                  )}
                </div>
                <AssetInspector />
              </div>
            )}
          </div>

          {/* Digital Twin Footer */}
          <div className="px-4 py-2 border-t border-border/50 bg-surface/40 text-[10px] font-mono tracking-wider text-muted flex items-center justify-between shrink-0">
            <span>EQUIPMENT AND PROCESS FLOW • HOVER A TAG FOR DETAIL</span>
            <span className="text-[10px] text-muted/70 hidden sm:inline">REAL-TIME TWIN TELEMETRY</span>
          </div>
        </section>

        {/* RIGHT COLUMN: ATTACK SCENARIOS · ONE-CLICK INJECTION */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Zap size={13} className="text-accent" />
              <span>Attack Scenarios · One-Click Injection</span>
            </h3>
            <span className="text-[11px] text-muted font-mono">Modbus TCP / RTU</span>
          </div>

          <div className="flex flex-col gap-3">
            {/* CARD 1: Rogue Setpoint */}
            <article className="lab-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="lab-card-icon text-origin bg-origin/10 border-origin/20">
                    <Flame size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Rogue Setpoint</h4>
                    <p className="text-[11px] text-muted">Controller PLC1 Level Control</p>
                  </div>
                </div>
                <span className="soc-asset-type soc-asset-ctrl">PLC</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Manipulates internal control setpoint, forcing tank overflow or drainage.
              </p>

              {/* Presets */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  { label: "+10% Delta", val: 10 },
                  { label: "+25% Overflow", val: 25 },
                  { label: "-20% Drain", val: -20 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSetpointDelta(p.val)}
                    className={`lab-preset-btn ${setpointDelta === p.val ? "active" : ""}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Control & Trigger */}
              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted font-mono">Delta:</span>
                  <input
                    type="number"
                    min={-45}
                    max={45}
                    step={5}
                    value={setpointDelta}
                    onChange={(e) => setSetpointDelta(Number(e.target.value))}
                    className="lab-num-input"
                  />
                  <span className="text-xs text-muted font-mono">%</span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void handleInjectAttack("rogue_setpoint", "PLC1", setpointDelta, `Rogue Setpoint (${setpointDelta}%)`)
                  }
                  className="lab-inject-btn"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Inject</span>
                </button>
              </div>
            </article>

            {/* CARD 2: Sensor Drift / Offset */}
            <article className="lab-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="lab-card-icon text-accent bg-accent/10 border-accent/20">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Sensor Drift &amp; Offset</h4>
                    <p className="text-[11px] text-muted">Analog Transmitter</p>
                  </div>
                </div>
                <span className="soc-asset-type soc-asset-sensor">Sensor</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Injects static bias into sensor register, inducing controller overcompensation.
              </p>

              {/* Target & Presets */}
              <div className="mt-3 flex items-center gap-2">
                <select
                  className="lab-select-input flex-1"
                  value={sensorTarget}
                  onChange={(e) => setSensorTarget(e.target.value)}
                >
                  <option value="LIT101">LIT101 (Level Sensor)</option>
                  <option value="LIT301">LIT301 (Level Sensor 3)</option>
                  <option value="FIT201">FIT201 (Flow Sensor)</option>
                  <option value="PIT301">PIT301 (Pressure Sensor)</option>
                </select>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  { label: "-25 mm Offset", val: -25 },
                  { label: "+35 mm Offset", val: 35 },
                  { label: "-50 mm Drift", val: -50 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSensorOffsetVal(p.val)}
                    className={`lab-preset-btn ${sensorOffsetVal === p.val ? "active" : ""}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Control & Trigger */}
              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted font-mono">Offset:</span>
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    step={5}
                    value={sensorOffsetVal}
                    onChange={(e) => setSensorOffsetVal(Number(e.target.value))}
                    className="lab-num-input"
                  />
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void handleInjectAttack(
                      "sensor_offset",
                      sensorTarget,
                      sensorOffsetVal,
                      `Sensor Offset (${sensorTarget} ${sensorOffsetVal})`
                    )
                  }
                  className="lab-inject-btn"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Inject</span>
                </button>
              </div>
            </article>

            {/* CARD 3: Actuator Force Override */}
            <article className="lab-card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="lab-card-icon text-suspect bg-suspect/10 border-suspect/20">
                    <ZapOff size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">Actuator Force Override</h4>
                    <p className="text-[11px] text-muted">Discrete Output</p>
                  </div>
                </div>
                <span className="soc-asset-type soc-asset-act">Actuator</span>
              </div>

              <p className="text-xs text-muted leading-relaxed">
                Forces discrete coil state, locking inflow valves or disabling pumps.
              </p>

              {/* Target Select */}
              <div className="mt-3 flex items-center gap-2">
                <select
                  className="lab-select-input flex-1"
                  value={actuatorTarget}
                  onChange={(e) => setActuatorTarget(e.target.value)}
                >
                  <option value="MV101">MV101 (Motor Inflow Valve)</option>
                  <option value="MV201">MV201 (Transfer Valve)</option>
                  <option value="P101">P101 (Raw Water Pump)</option>
                </select>
              </div>

              {/* State Toggle Buttons */}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActuatorState(1)}
                  className={`lab-toggle-btn flex-1 ${actuatorState === 1 ? "active-open" : ""}`}
                >
                  Force OPEN (1)
                </button>
                <button
                  type="button"
                  onClick={() => setActuatorState(0)}
                  className={`lab-toggle-btn flex-1 ${actuatorState === 0 ? "active-closed" : ""}`}
                >
                  Force CLOSED (0)
                </button>
              </div>

              {/* Control & Trigger */}
              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span className="text-xs text-muted font-mono">
                  {actuatorTarget} → {actuatorState === 1 ? "FORCE ON" : "FORCE OFF"}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void handleInjectAttack(
                      "actuator_force",
                      actuatorTarget,
                      actuatorState,
                      `Force ${actuatorTarget} ${actuatorState === 1 ? "OPEN" : "CLOSED"}`
                    )
                  }
                  className="lab-inject-btn"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Inject</span>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          2. COMMUNICATION PROXY EVIDENCE & INTEGRITY
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Modbus Proxy Verification */}
        <section className="lab-panel-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text">Modbus Protocol Proxy &amp; Delay Evidence</h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              status?.enabled ? "text-normal border-normal/30 bg-normal/10" : "text-muted border-border bg-bg"
            }`}>
              {status?.enabled ? "Proxy Active" : "Direct Reads"}
            </span>
          </div>

          <p className="text-xs text-muted">
            Intercept and delay telemetry packets to evaluate network tampering vs sensor fault.
          </p>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Sensor
              <select
                className="lab-input-field"
                value={proxyAsset}
                onChange={(e) => setProxyAsset(e.target.value)}
              >
                {["LIT101", "LIT301", "FIT201", "PIT301"].map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted">
              Offset Units
              <input
                className="lab-input-field"
                type="number"
                min={-40}
                max={40}
                value={proxyOffset}
                onChange={(e) => setProxyOffset(Number(e.target.value))}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-muted">
              Delay (ms)
              <input
                className="lab-input-field"
                type="number"
                min={0}
                max={1500}
                value={proxyDelay}
                onChange={(e) => setProxyDelay(Number(e.target.value))}
              />
            </label>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-text cursor-pointer">
            <input
              type="checkbox"
              checked={proxyDrop}
              onChange={(e) => setProxyDrop(e.target.checked)}
              className="accent-accent"
            />
            <span>Drop test transactions (Denial of Service)</span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={busy}
              className="lab-primary-btn"
              onClick={() =>
                void action(
                  () => configureLab({ enabled: true, asset_id: proxyAsset, offset: proxyOffset, delay_ms: proxyDelay, drop: proxyDrop }),
                  "Proxy Configuration"
                )
              }
            >
              Apply &amp; Route Proxy
            </button>
            <button
              disabled={busy || !status?.enabled}
              className="lab-secondary-btn"
              onClick={() => void action(() => probeLab(), "Probe Transaction")}
            >
              Read Test Transaction
            </button>
            <button
              disabled={busy || !status?.enabled}
              className="lab-secondary-btn"
              onClick={() => void action(() => configureLab({ enabled: false }), "Stop Proxy")}
            >
              Restore Direct Reads
            </button>
          </div>

          {/* Paired Evidence Box */}
          {paired && (
            <div className="mt-4 rounded-lg border border-border/80 bg-bg/80 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text">{paired.hypothesis}</span>
                <span className="font-mono text-muted text-[11px]">
                  Tx #{paired.transaction_id} · {new Date(paired.observed_at * 1000).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-border p-2 bg-surface">
                  <span className="text-[10px] text-muted uppercase font-mono">Emulator Value</span>
                  <p className="font-mono text-sm font-bold text-text mt-0.5">{paired.emulator_value.toFixed(3)}</p>
                </div>
                <div className="rounded border border-border p-2 bg-surface">
                  <span className="text-[10px] text-muted uppercase font-mono">Forwarded Value</span>
                  <p className="font-mono text-sm font-bold text-accent mt-0.5">
                    {paired.receiver_value !== null ? paired.receiver_value.toFixed(3) : "Dropped (None)"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Controller Integrity Verification */}
        <section className="lab-panel-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text">Emulated Controller Integrity</h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isHashTampered
                  ? "text-origin border-origin/30 bg-origin/10"
                  : "text-normal border-normal/30 bg-normal/10"
              }`}
            >
              {isHashTampered ? "Tampered / Mismatch" : "Manifest Verified"}
            </span>
          </div>

          <p className="text-xs text-muted">
            Validates PLC runtime configuration SHA-256 against factory baseline manifest.
          </p>

          {/* Hash Display */}
          <div className="mt-4 space-y-2 rounded-lg border border-border/80 bg-bg/80 p-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">Observed Hash:</span>
              <span className="text-text font-bold truncate max-w-[200px]" title={status?.integrity.observed_hash}>
                {status?.integrity.observed_hash ?? "Checking…"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Factory Baseline:</span>
              <span className="text-muted truncate max-w-[200px]" title={status?.integrity.factory_hash}>
                {status?.integrity.factory_hash ?? "Unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-1.5">
              <span className="text-muted">Integrity State:</span>
              <span className={isHashTampered ? "text-origin font-bold" : "text-normal"}>
                {isHashTampered ? "Tampered (+20% delta unapproved)" : "Reference Match ✓"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              disabled={busy || !!status?.integrity.reason}
              className="lab-secondary-btn"
              onClick={() => void action(() => changeIntegrity({ action: "approved_update", delta: 10 }), "Approved Update")}
            >
              Test Approved (+10%)
            </button>
            <button
              disabled={busy || !!status?.integrity.reason}
              className="lab-secondary-btn"
              onClick={() => void action(() => changeIntegrity({ action: "unapproved_change", delta: 20 }), "Unapproved Change")}
            >
              Test Unapproved (+20%)
            </button>
            <button
              disabled={busy || !!status?.integrity.reason}
              className="lab-secondary-btn"
              onClick={() => void action(() => changeIntegrity({ action: "restore" }), "Restore Baseline")}
            >
              Restore Factory Config
            </button>
          </div>
        </section>
      </div>

      {/* ── Output / Terminal Console ── */}
      {result && (
        <details className="rounded-xl border border-border bg-surface p-4 text-xs">
          <summary className="cursor-pointer font-medium text-text flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal size={13} className="text-accent" />
              Latest Experiment Response Payload
            </span>
            <span className="text-muted text-[11px]">Click to toggle JSON</span>
          </summary>
          <pre className="mt-3 max-h-60 overflow-auto rounded bg-bg p-3 font-mono text-muted text-[11px] whitespace-pre-wrap">
            {result}
          </pre>
        </details>
      )}
    </div>
  );
}
