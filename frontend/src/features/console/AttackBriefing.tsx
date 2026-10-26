import { ArrowDown, ArrowUp, CircleCheck, Minus, Radio, RotateCcw, Siren, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildBriefing, narrationFor, type AttackPhase } from "../../lib/briefing";
import { speak, stopSpeech, isLiveConversationActive, useVoice } from "../../lib/voice";
import { nodeMap, useLive } from "../../store/live";
import { useAttackRun } from "../../store/attackRun";
import { useUi } from "../../store/ui";

const PHASE_ICON: Record<AttackPhase, typeof Radio> = {
  idle: Minus,
  accepted: CircleCheck,
  active: Radio,
  detected: Siren,
  ended: CircleCheck,
  reset: RotateCcw,
};

/** Each phase gets its own colour so the state is readable without reading the words. */
const PHASE_TONE: Record<AttackPhase, string> = {
  idle: "briefing-idle",
  accepted: "briefing-accepted",
  active: "briefing-active",
  detected: "briefing-detected",
  ended: "briefing-ended",
  reset: "briefing-reset",
};

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, hold: Minus, none: null } as const;

/** Shortest gap between two spoken lines, so phases that land together do not talk over
 *  each other and a demo does not spend a hosted speech quota on lines nobody hears. */
const NARRATION_GAP_MS = 4000;

/**
 * Plain-language account of the running test, next to the console that launched it.
 *
 * It re-reads telemetry every sample, so the evidence line stays honest, and it only says
 * "detected" once the store has seen the detector raise an incident.
 */
export function AttackBriefing() {
  const run = useAttackRun((s) => s.run);
  const phase = useAttackRun((s) => s.phase);
  const phaseSeq = useAttackRun((s) => s.phaseSeq);
  const detectedOrigin = useAttackRun((s) => s.detectedOrigin);
  const latest = useLive((s) => s.latest);
  const topology = useLive((s) => s.topology);
  const narrate = useUi((s) => s.narrateAttacks);
  const toggleNarrate = useUi((s) => s.toggleNarrateAttacks);
  const [spoken, setSpoken] = useState<string | null>(null);
  const lastSeq = useRef(-1);
  const lastSpokenAt = useRef(0);

  const topo = useMemo(() => nodeMap(topology), [topology]);
  const brief = useMemo(() => {
    if (!run) return null;
    return buildBriefing({
      scenario: run.scenario,
      target: run.target,
      magnitude: run.magnitude,
      phase,
      mode: latest?.mode ?? "sim",
      message: latest,
      topo: topo.get(run.target),
      detectedOrigin,
    });
  }, [run, phase, latest, topo, detectedOrigin]);

  // One spoken line per phase change, never mid-phase and never over a live conversation.
  useEffect(() => {
    if (!brief || !narrate || phaseSeq === lastSeq.current) return;
    lastSeq.current = phaseSeq;
    if (isLiveConversationActive() || document.visibilityState !== "visible") return;
    // Accepted and active can land within a second of each other in fast demo mode. Speaking
    // both would talk over itself and, on a hosted Gemini quota, burn a request for a line
    // nobody hears. The newest phase always wins.
    const sinceLast = Date.now() - lastSpokenAt.current;
    const wait = Math.max(0, NARRATION_GAP_MS - sinceLast);
    const line = narrationFor(brief);
    setSpoken(line);
    const timer = window.setTimeout(() => {
      lastSpokenAt.current = Date.now();
      // Gemini speech is the default voice; if it is unconfigured or rate limited, fall back
      // to the browser's own synthesiser rather than dropping the narration silently.
      void speak(line).catch(() =>
        speak(line, { ...useVoice.getState(), speechProvider: "browser" }).catch(() =>
          setSpoken(null),
        ),
      );
    }, wait);
    return () => window.clearTimeout(timer);
  }, [brief, narrate, phaseSeq]);

  useEffect(() => {
    if (!narrate) {
      stopSpeech();
      setSpoken(null);
    }
  }, [narrate]);

  if (!run || !brief || phase === "idle") return null;
  const PhaseIcon = PHASE_ICON[phase];
  const Direction = DIRECTION_ICON[brief.direction];

  return (
    <section
      aria-label="What this test is doing"
      className={`attack-briefing ${PHASE_TONE[phase]}`}
    >
      <header className="attack-briefing-head">
        <span className="attack-briefing-phase">
          <PhaseIcon size={13} aria-hidden />
          {brief.state}
        </span>
        {Direction && (
          <span className="attack-briefing-direction" title={`${brief.directionLabel} on ${run.target}`}>
            <Direction size={12} aria-hidden />
            <span className="sr-only">{brief.directionLabel} on</span>
            {run.target}
          </span>
        )}
        <button
          type="button"
          aria-pressed={narrate}
          onClick={toggleNarrate}
          title={narrate ? "Stop speaking these updates" : "Speak these updates aloud"}
          className="attack-briefing-speak"
        >
          {narrate ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />}
          <span className="sr-only">{narrate ? "Turn narration off" : "Turn narration on"}</span>
        </button>
      </header>
      <p role="status" aria-live="polite" className="attack-briefing-text">
        {brief.what} {brief.next}
      </p>
      {brief.evidence && <p className="attack-briefing-evidence">{brief.evidence}</p>}
      {narrate && spoken && (
        <p className="attack-briefing-spoken" aria-hidden>
          <Volume2 size={11} aria-hidden /> Narrating
        </p>
      )}
    </section>
  );
}
