import { Crosshair, Database, Rocket, RotateCcw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { postAttack, postReset } from "../../lib/api";
import { SCENARIOS, SCENARIO_LABEL, magnitudeFor, validTargets } from "../../lib/scenarios";
import type { Scenario } from "../../lib/types";
import { useLive } from "../../store/live";
import { noticeIfLocked } from "../../store/ui";
import { MagnitudeField } from "./MagnitudeField";
import { NodeScores } from "./NodeScores";

const field = "h-8 rounded border border-border bg-bg px-2 font-mono text-xs text-text";

export function AttackConsole() {
  const conn = useLive((s) => s.conn);
  const topology = useLive((s) => s.topology);
  const clear = useLive((s) => s.clear);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const [scenario, setScenario] = useState<Scenario>("sensor_offset");
  const [target, setTarget] = useState("LIT101");
  const [magnitude, setMagnitude] = useState(0);
  const [busy, setBusy] = useState(false);
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
    if (!node) return;
    setBusy(true);
    try {
      const r = await postAttack({ scenario, target: node.id, magnitude });
      setNote({ text: r.attack_id, error: false });
    } catch (e) {
      if (!noticeIfLocked(e)) setNote({ text: e instanceof Error ? e.message : "Failed", error: true });
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    await postReset().catch((e: unknown) => noticeIfLocked(e));
    clear();
    setNote(null);
  };

  const ready = conn === "live" && topology !== null;
  if (ready && hai) {
    return (
      <Panel title="Replay" icon={Database}>
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <EmptyState icon={Database} text="HAI dataset" />
          </div>
          <button
            type="button"
            onClick={() => void reset()}
            className="m-2 flex h-8 items-center justify-center gap-1 rounded border border-border text-xs text-muted transition-colors duration-150 hover:text-text"
          >
            <RotateCcw size={14} aria-hidden />
            Restart
          </button>
        </div>
      </Panel>
    );
  }
  return (
    <Panel title="Attack console" icon={Crosshair}>
      {!ready ? (
        <EmptyState icon={WifiOff} text="No signal" />
      ) : (
        <form
          className="flex flex-col gap-3 p-2"
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
            disabled={busy || !node}
            className="flex h-8 items-center justify-center gap-1 rounded bg-accent text-xs font-medium text-bg transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            <Rocket size={14} aria-hidden />
            Launch
          </button>
          <button
            type="button"
            onClick={() => void reset()}
            className="flex h-8 items-center justify-center gap-1 rounded border border-border text-xs text-muted transition-colors duration-150 hover:text-text"
          >
            <RotateCcw size={14} aria-hidden />
            Reset
          </button>
          {note && (
            <span
              role="status"
              className={`font-mono text-xs ${note.error ? "text-origin" : "text-normal"}`}
            >
              {note.text}
            </span>
          )}
          <NodeScores />
        </form>
      )}
    </Panel>
  );
}
