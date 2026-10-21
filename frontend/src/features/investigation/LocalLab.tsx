import { useEffect, useState } from "react";
import { getLab, configureLab, probeLab, changeIntegrity } from "../../lib/api";

interface LabStatus {
  enabled: boolean; asset_id: string; offset: number; delay_ms: number; drop: boolean; routed: boolean;
  latest: { emulator_value: number; receiver_value: number | null; hypothesis: string; transaction_id: number; observed_at: number; asset_id: string } | null;
  integrity: { available?: boolean; reason?: string; instance_id?: string; observed_hash?: string; factory_hash?: string; config?: Record<string, unknown>; error?: string };
}

export function LocalLab() {
  const [status, setStatus] = useState<LabStatus | null>(null);
  const [asset, setAsset] = useState("LIT101");
  const [offset, setOffset] = useState(10);
  const [delay, setDelay] = useState(0);
  const [drop, setDrop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    const refresh = () => getLab<LabStatus>().then((s) => { if (alive) setStatus(s); }, () => { if (alive) setError("Cannot reach local lab service."); });
    void refresh(); const timer = setInterval(() => void refresh(), 5000);
    return () => { alive = false; clearInterval(timer); };
  }, []);
  const action = async (run: () => Promise<unknown>) => {
    setBusy(true); setError(null); setResult(null);
    try { const response = await run(); setResult(JSON.stringify(response, null, 2)); setStatus(await getLab<LabStatus>()); }
    catch (e) { setError(e instanceof Error ? e.message : "Local experiment failed"); }
    finally { setBusy(false); }
  };
  const field = "rounded border border-border bg-bg px-3 py-2 text-sm";
  const button = "rounded border border-border px-3 py-2 text-sm hover:border-accent disabled:opacity-40";
  const paired = status?.latest;
  return <>
    <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">Local emulator experiments only. These changes affect Modbus monitoring; SIM and HAI replay stay unchanged.</p>
    {error && <p role="alert" className="rounded border border-suspect/40 p-3 text-sm text-suspect">{error}</p>}
    <div className="lab-grid">
      <section className="min-w-0 rounded-xl border border-border bg-surface p-4"><h2 className="text-lg font-semibold">Communication evidence</h2><p className="mt-1 text-sm text-muted">Compare emulator and forwarded readings from the same Modbus transaction. Delay or missing data alone leaves the origin unresolved.</p>
        <div className="lab-fields"><label className="flex flex-col gap-1 text-xs text-muted">Sensor<select className={field} value={asset} onChange={(e) => setAsset(e.target.value)}>{["LIT101", "LIT301", "FIT201", "PIT301"].map((a) => <option key={a}>{a}</option>)}</select></label><label className="flex flex-col gap-1 text-xs text-muted">Offset in sensor units<input className={field} type="number" min={-40} max={40} value={offset} onChange={(e) => setOffset(Number(e.target.value))} /></label><label className="flex flex-col gap-1 text-xs text-muted">Reply delay (ms)<input className={field} type="number" min={0} max={1500} value={delay} onChange={(e) => setDelay(Number(e.target.value))} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={drop} onChange={(e) => setDrop(e.target.checked)} />Drop replies</label></div>
        <div className="lab-actions"><button disabled={busy} className="rounded bg-accent px-3 py-2 text-sm text-on-accent disabled:opacity-40" onClick={() => void action(() => configureLab({ enabled: true, asset_id: asset, offset, delay_ms: delay, drop }))}>Apply & route local LIVE</button><button disabled={busy || !status?.enabled} className={button} onClick={() => void action(() => probeLab())}>Read test transaction</button><button disabled={busy || !status?.enabled} className={button} onClick={() => void action(() => configureLab({ enabled: false }))}>Stop & restore direct reads</button></div>
        <p className="mt-3 text-xs text-muted">Proxy: {status?.enabled ? "running" : "stopped"} · LIVE reader: {status?.routed ? "through test proxy" : "direct / not configured"}. Active test values: {status?.asset_id ?? "—"}, offset {status?.offset ?? 0}, delay {status?.delay_ms ?? 0}ms.</p>
        {paired && <div className="mt-4 rounded-lg border border-border bg-bg p-3"><p className="text-sm font-semibold">{paired.hypothesis}</p><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-muted">Emulator reply</dt><dd className="font-mono">{paired.emulator_value.toFixed(3)}</dd></div><div><dt className="text-xs text-muted">Forwarded reply</dt><dd className="font-mono">{paired.receiver_value?.toFixed(3) ?? "Not received"}</dd></div></dl><p className="mt-2 text-xs text-muted">{paired.asset_id} · transaction {paired.transaction_id} · {new Date(paired.observed_at * 1000).toLocaleTimeString()}. This locates alteration within the controlled proxy, not an arbitrary real network.</p></div>}
      </section>
      <section className="min-w-0 rounded-xl border border-border bg-surface p-4"><h2 className="text-lg font-semibold">Emulated controller integrity</h2><p className="mt-1 text-sm text-muted">A local configuration manifest changes the emulator's PLC1 setpoint. Hash changes are observations; approval is recorded separately in the journal. This does not measure real firmware.</p>
        {status?.integrity.reason ? <p className="mt-3 text-sm text-suspect">{status.integrity.reason}</p> : <><p className="mt-4 rounded-lg border border-border bg-bg p-3 text-sm">{status?.integrity.observed_hash ? status.integrity.observed_hash === status.integrity.factory_hash ? "Observed configuration matches the factory reference." : "Configuration differs from the factory reference. Review the recorded change." : "Checking emulator configuration…"}</p><details className="mt-4"><summary className="cursor-pointer text-sm font-medium text-muted">Configuration and integrity references</summary><dl className="mt-4 space-y-3 text-xs"><div><dt className="text-muted">Emulator instance</dt><dd className="break-all font-mono">{status?.integrity.instance_id ?? "Checking…"}</dd></div><div><dt className="text-muted">Observed manifest hash</dt><dd className="break-all font-mono">{status?.integrity.observed_hash ?? "Unavailable"}</dd></div><div><dt className="text-muted">Factory manifest hash</dt><dd className="break-all font-mono">{status?.integrity.factory_hash ?? "Unavailable"}</dd></div></dl><pre className="mt-3 overflow-auto rounded bg-bg p-3 text-xs">{JSON.stringify(status?.integrity.config, null, 2)}</pre></details></>}
        <p className="mt-3 text-xs text-muted">Approved test: +10 percentage-point setpoint delta. Unapproved test: +20. Restore when finished.</p><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy || !!status?.integrity.reason} className={button} onClick={() => void action(() => changeIntegrity({ action: "approved_update", delta: 10 }))}>Test approved update</button><button disabled={busy || !!status?.integrity.reason} className={button} onClick={() => void action(() => changeIntegrity({ action: "unapproved_change", delta: 20 }))}>Test unapproved change</button><button disabled={busy || !!status?.integrity.reason} className={button} onClick={() => void action(() => changeIntegrity({ action: "restore" }))}>Restore factory config</button></div>
        {status?.integrity.error && <p className="mt-3 text-sm text-suspect">Manifest error: {status.integrity.error}</p>}
      </section>
    </div>
    {result && <details className="min-w-0 rounded-xl border border-border bg-surface p-4"><summary className="cursor-pointer text-sm">Latest experiment result</summary><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all text-xs text-muted">{result}</pre></details>}
    <p className="text-xs text-muted">Inspect LIVE investigations and asset evidence for persisted protocol and integrity records. Records collected without an active incident remain source-level evidence; timing alone does not establish causation.</p>
  </>;
}
