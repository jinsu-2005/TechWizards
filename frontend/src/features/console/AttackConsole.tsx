import { useAccess } from "../auth/access";
import { Crosshair, Rocket, RotateCcw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { postAttack, postReset } from "../../lib/api";
import { SCENARIOS, SCENARIO_LABEL, magnitudeFor, validTargets } from "../../lib/scenarios";
import type { Scenario } from "../../lib/types";
import { useLive } from "../../store/live";
import { noticeIfLocked } from "../../store/ui";
import { HaiReplayPanel } from "./HaiReplayPanel";
import { MagnitudeField } from "./MagnitudeField";
import { NodeScores } from "./NodeScores";

const field = "h-9 rounded-md border border-border bg-bg px-2.5 font-mono text-xs text-text shadow-inner focus:border-accent focus:outline-none transition-colors";

export function AttackConsole() {
  const { canAdmin } = useAccess();
  const conn = useLive((s) => s.conn);
  const topology = useLive((s) => s.topology);
  const clear = useLive((s) => s.clear);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const calibrating = useLive((s) => s.latest?.mode === "live" && (s.status?.source?.calibration != null || s.status?.source?.state === "calibrating"));
  const [scenario, setScenario] = useState<Scenario>("sensor_offset");
  const [target, setTarget] = useState("LIT101");
  const [magnitude, setMagnitude] = useState(0);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);

  const targets = useMemo(() => validTargets(scenario, topology?.nodes ?? []), [scenario, topology]);
  const node = targets.find((n) => n.id === target) ?? targets[0];
  const input = useMemo(() => magnitudeFor(scenario, node), [scenario, node]);

  useEffect(() => {
    if (node && node.id !== target) setTarget(node.id);
  }, [node, target]);
  useEffect(() => {
    setMagnitude(input.kind === "none" ? 0 : input.value);
  }, [input]);

  const launch = async () => {
    if (!node || calibrating || busy || resetting) return;
    setBusy(true);
    try {
      await postAttack({ scenario, target: node.id, magnitude });
      setNote({ text: "Scenario launched. Watch the process and incident panel for the response.", error: false });
    } catch (e) {
      if (!noticeIfLocked(e)) setNote({ text: e instanceof Error ? e.message : "Failed", error: true });
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (busy || resetting) return;
    setResetting(true);
    try {
      await postReset(); clear();
      setNote({ text: "Scenario reset. Saved investigation records are retained.", error: false });
    } catch (cause) {
      if (!noticeIfLocked(cause)) setNote({ text: cause instanceof Error ? cause.message : "Reset failed. Your readings have been retained.", error: true });
    } finally { setResetting(false); }
  };

  const ready = conn === "live" && topology !== null;
  if (ready && hai) return <HaiReplayPanel />;
  return (
    <Panel title="Attack console" icon={Crosshair}>
      {!ready ? (
        <EmptyState icon={WifiOff} text="No signal" />
      ) : (
        <form
          className="flex h-full flex-col gap-3 overflow-y-auto p-3 [&>*]:shrink-0"
          onSubmit={(e) => {
            e.preventDefault();
            void launch();
          }}
        >
          <label className="flex flex-col gap-1 text-xs text-muted">
            Scenario
            <select className={field} value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)}>
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  {SCENARIO_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Target
            <select className={field} value={node?.id ?? ""} onChange={(e) => setTarget(e.target.value)}>
              {targets.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id}
                </option>
              ))}
            </select>
          </label>
          <MagnitudeField input={input} value={magnitude} onChange={setMagnitude} className={field} />
          <button
            type="submit"
            disabled={!canAdmin || busy || resetting || !node || calibrating}
            className="flex h-10 min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold leading-none text-on-accent shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Rocket size={16} className="shrink-0" aria-hidden />
            {calibrating ? "Calibration in progress" : busy ? "Launching…" : "Launch"}
          </button>
          <button
            type="button"
            disabled={!canAdmin || busy || resetting || calibrating}
            onClick={() => void reset()}
            className="flex h-9 min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-surface/50 px-3 text-xs text-muted hover:border-border hover:bg-surface hover:text-text transition-all disabled:opacity-40"
          >
            <RotateCcw size={14} aria-hidden />
            {resetting ? "Resetting…" : "Reset"}
          </button>
          {note && (
            <span
              role="status"
              className={`text-xs leading-relaxed ${note.error ? "text-origin" : "text-normal"}`}
            >
              {note.text}
            </span>
          )}
          {calibrating ? <p className="text-xs leading-relaxed text-muted">Test attacks and scores are unavailable until a LIVE detector is ready. Keep the emulator in normal operation while collecting the baseline.</p> : <NodeScores />}
        </form>
      )}
    </Panel>
  );
}
