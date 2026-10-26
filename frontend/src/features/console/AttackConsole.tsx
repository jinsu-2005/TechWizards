import { useAccess } from "../auth/access";
import { CheckCircle2, Crosshair, FastForward, LoaderCircle, Rocket, RotateCcw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { Panel } from "../../components/ui/Panel";
import { getStatus, postAttack, postReset, setSimSpeed } from "../../lib/api";
import { SCENARIOS, SCENARIO_LABEL, magnitudeFor, validTargets } from "../../lib/scenarios";
import type { Scenario } from "../../lib/types";
import { useLive } from "../../store/live";
import { noticeIfLocked, useUi } from "../../store/ui";
import { useAttackRun } from "../../store/attackRun";
import { AttackBriefing } from "./AttackBriefing";
import { HaiReplayPanel } from "./HaiReplayPanel";
import { MagnitudeField } from "./MagnitudeField";
import { NodeScores } from "./NodeScores";

/** The plant integrates slowly: a tank needs roughly a minute of plant time to move far enough
 *  to read off the twin, and the operator then needs time to work the incident. The backend
 *  default of 60 s ended the attack about when its effect became visible. Fast demo mode
 *  delivers these same plant seconds sooner; it does not shorten the test. */
const ATTACK_DURATION_S = 180;

/** Fast demo pacing, mirroring the backend's allowed speeds. Clicking cycles through them
 *  and wraps back to normal, so one control covers every pace. */
const SPEEDS = [1, 6, 12, 16] as const;

function nextSpeed(current: number, offered: readonly number[]): number {
  const options = offered.length > 1 ? offered : SPEEDS;
  const i = options.indexOf(current);
  return options[(i + 1) % options.length] ?? 1;
}

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
  const [launchState, setLaunchState] = useState<"idle" | "launched" | "failed">("idle");
  const [attackId, setAttackId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [note, setNote] = useState<{ text: string; error: boolean } | null>(null);
  const simSpeed = useLive((s) => s.status?.sim_speed ?? 1);
  const speedOptions = useLive((s) => s.status?.sim_speed_options);
  const canPace = useLive((s) => s.status?.mode === "sim");
  const [pacing, setPacing] = useState(false);
  const startRun = useAttackRun((s) => s.start);
  const markReset = useAttackRun((s) => s.markReset);
  const clearRun = useAttackRun((s) => s.clear);

  const targets = useMemo(() => validTargets(scenario, topology?.nodes ?? []), [scenario, topology]);
  const node = targets.find((n) => n.id === target) ?? targets[0];
  const input = useMemo(() => magnitudeFor(scenario, node), [scenario, node]);

  useEffect(() => {
    if (node && node.id !== target) setTarget(node.id);
  }, [node, target]);
  useEffect(() => {
    if (node) useUi.getState().setScenarioContext(scenario, node.id);
  }, [scenario, node]);
  useEffect(() => {
    setMagnitude(input.kind === "none" ? 0 : input.value);
  }, [input]);
  useEffect(() => {
    setLaunchState("idle");
    setAttackId(null);
    setNote(null);
  }, [scenario, node?.id, magnitude]);
  // Leaving SIM ends any demo pacing claim; the briefing belongs to the run that is gone.
  useEffect(() => {
    if (!canPace) clearRun();
  }, [canPace, clearRun]);

  const togglePace = async () => {
    if (!canPace || pacing) return;
    setPacing(true);
    try {
      await setSimSpeed(nextSpeed(simSpeed, speedOptions ?? SPEEDS));
      useLive.getState().setStatus(await getStatus());
    } catch (cause) {
      if (!noticeIfLocked(cause)) {
        setNote({ text: cause instanceof Error ? cause.message : "Demo pacing unavailable", error: true });
      }
    } finally {
      setPacing(false);
    }
  };

  const launch = async () => {
    if (!node || calibrating || busy || resetting) return;
    setBusy(true);
    setLaunchState("idle");
    setNote(null);
    try {
      const result = await postAttack({ scenario, target: node.id, magnitude, duration_s: ATTACK_DURATION_S });
      setAttackId(result.attack_id);
      setLaunchState("launched");
      // The briefing below takes over from here; this note only confirms the request landed.
      setNote(null);
      startRun({
        attackId: result.attack_id,
        scenario,
        target: node.id,
        magnitude,
        launchedAt: Date.now(),
      });
    } catch (e) {
      setLaunchState("failed");
      if (!noticeIfLocked(e)) setNote({ text: e instanceof Error ? e.message : "Failed", error: true });
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    if (busy || resetting) return;
    setResetting(true);
    try {
      await postReset(); clear(); markReset();
      setLaunchState("idle"); setAttackId(null);
      setNote(null);
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
            {busy ? <LoaderCircle size={16} className="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden /> : launchState === "launched" ? <CheckCircle2 size={16} className="shrink-0" aria-hidden /> : <Rocket size={16} className="shrink-0" aria-hidden />}
            {calibrating ? "Calibration in progress" : busy ? "Launching test…" : launchState === "launched" ? "Launch again" : "Launch attack"}
          </button>
          {canPace && (
            <button
              type="button"
              aria-pressed={simSpeed > 1}
              disabled={pacing || calibrating}
              onClick={() => void togglePace()}
              title={
                simSpeed > 1
                  ? `Fast demo at ${simSpeed}x. Click for ${nextSpeed(simSpeed, speedOptions ?? SPEEDS)}x; the same simulated samples simply arrive sooner.`
                  : "Fast demo: the same simulated samples arrive sooner, so effects show in seconds"
              }
              className="demo-pace-toggle"
            >
              <FastForward size={14} aria-hidden />
              <span>{simSpeed > 1 ? `Fast demo · ${simSpeed}x` : "Fast demo"}</span>
              <span className="sr-only">
                {simSpeed > 1
                  ? `Fast demo is on at ${simSpeed} times. The simulation delivers the same samples sooner. Selecting this moves to ${nextSpeed(simSpeed, speedOptions ?? SPEEDS)} times.`
                  : `Fast demo is off. Selecting this moves to ${nextSpeed(simSpeed, speedOptions ?? SPEEDS)} times.`}
              </span>
            </button>
          )}
          <button
            type="button"
            disabled={!canAdmin || busy || resetting || calibrating}
            onClick={() => void reset()}
            className="flex h-9 min-h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-border/80 bg-surface/50 px-3 text-xs text-muted hover:border-border hover:bg-surface hover:text-text transition-all disabled:opacity-40"
          >
            <RotateCcw size={14} aria-hidden />
            {resetting ? "Resetting…" : "Reset"}
          </button>
          {(busy || note) && <div role={note?.error ? "alert" : "status"} aria-live="polite" className={`attack-launch-status rounded-md border px-2.5 py-2 text-xs leading-relaxed ${note?.error ? "border-origin/40 bg-origin/10 text-origin" : "border-accent/30 bg-accent/10 text-text"}`}>
            <span className="flex items-start gap-2">{busy ? <LoaderCircle size={14} className="mt-0.5 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden /> : launchState === "launched" ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-normal" aria-hidden /> : null}<span>{busy ? `Sending ${SCENARIO_LABEL[scenario]} to ${node?.id}…` : note?.text}</span></span>
            {attackId && launchState === "launched" && <span className="mt-1 block break-all font-mono text-[10px] text-muted">Test ID: {attackId}</span>}
          </div>}
          <AttackBriefing />
          {calibrating ? <p className="text-xs leading-relaxed text-muted">Test attacks and scores are unavailable until a LIVE detector is ready. Keep the emulator in normal operation while collecting the baseline.</p> : <NodeScores />}
        </form>
      )}
    </Panel>
  );
}
