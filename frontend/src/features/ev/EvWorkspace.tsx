import { useEffect, useRef, useState } from "react";
import { ChevronRight, Pause, Play, RotateCcw, WifiOff } from "lucide-react";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { navigate } from "../../lib/navigation";
import { isLiveConversationActive, speak, useVoice } from "../../lib/voice";
import { useEv } from "./store";
import { EvTwin } from "./EvTwin";
import { EvAttackDrawer } from "./EvAttackDrawer";
import { EvData } from "./EvData";
import { EvDock } from "./EvDock";
import { EvPilotDock } from "./EvPilotDock";
import { EvSettings } from "./EvSettings";
import { EvSubtitle } from "./EvSubtitle";

const STEPS = ["Observe", "Inject", "Detect", "Trace", "Recover"];
type Panel = "lab" | "pilot" | "data" | "settings" | null;
const panelOf = (view: string | null): Panel => view === "lab" ? "lab" : view === "pilot" ? "pilot" : view === "settings" ? "settings" : view === "data" || view === "components" || view === "telemetry" ? "data" : null;
const hrefOf = (panel: Panel) => panel ? `/ev?view=${panel}` : "/ev";

/** Spoken alert. A live pilot call announces for itself; Gemini TTS falls back to the browser voice. */
function say(line: string): void {
  if (isLiveConversationActive()) return;
  // Subtitle stays up roughly as long as the line takes to speak.
  useEv.getState().showCaption(line, Math.max(4000, line.split(" ").length * 420 + 1500));
  void speak(line).catch(() => speak(line, { ...useVoice.getState(), speechProvider: "browser" }).catch(() => undefined));
}

export function EvWorkspace() {
  const ev = useEv();
  const panel = panelOf(new URLSearchParams(window.location.search).get("view"));
  const [narrate, setNarrate] = useState(() => { try { return sessionStorage.getItem("attacktrace.ev.narrate") !== "off"; } catch { return true; } });
  const setNarration = (on: boolean) => { setNarrate(on); try { sessionStorage.setItem("attacktrace.ev.narrate", on ? "on" : "off"); } catch { /* memory only */ } };
  const narrated = useRef<string | null | undefined>(undefined);
  const recovered = useRef<string | null>(null);

  useEffect(() => {
    void useEv.getState().poll();
    const timer = window.setInterval(() => { if (!document.hidden) void useEv.getState().poll(); }, 1000);
    const refresh = () => { if (!document.hidden) void useEv.getState().poll(); };
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable))) return;
      const k = e.key.toLowerCase();
      const next: Panel | undefined = k === "a" ? "lab" : k === "p" ? "pilot" : k === "/" ? "data" : undefined;
      if (next) { e.preventDefault(); navigate(hrefOf(panel === next ? null : next)); }
      else if (k === "escape" && panel) navigate("/ev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  const snapshot = ev.snapshot;
  const retained = ev.replayTime === null ? null : snapshot?.history.find((h) => h.time_s === ev.replayTime);
  const frame = ev.replayTime === null ? snapshot : (retained ?? snapshot);
  const incidentId = snapshot?.incident?.id ?? null;
  const leadId = snapshot?.incident?.analysis.candidates[0]?.id;

  // Spoken alert when a new incident is detected (skipped on first load and when a live voice session runs).
  useEffect(() => {
    if (!snapshot) return;
    if (narrated.current === undefined) { narrated.current = incidentId; return; }
    if (incidentId && incidentId !== narrated.current) {
      narrated.current = incidentId;
      const name = snapshot.components.find((c) => c.id === leadId)?.name ?? leadId ?? "unknown";
      const line = `Anomaly detected. Leading hypothesis: ${name}. Not confirmed yet.`;
      ev.addMessages([{ role: "assistant", text: line }]);
      if (narrate) say(line);
    }
    if (incidentId && snapshot.incident?.status === "recovered" && recovered.current !== incidentId) {
      recovered.current = incidentId;
      const line = "Recovered. All signals are back within reference.";
      ev.addMessages([{ role: "assistant", text: line }]);
      if (narrate) say(line);
    }
    if (!incidentId) narrated.current = null;
  }, [incidentId, leadId, narrate, snapshot, ev]);

  const stage = !snapshot ? -1
    : snapshot.incident?.status === "recovered" ? 4
    : snapshot.incident?.status === "investigating" ? 3
    : snapshot.incident ? 2
    : snapshot.attack_active ? 1 : 0;
  const status = !ev.connected ? "Disconnected" : snapshot?.running ? "Simulator running" : "Simulator paused";

  return <div className="ev-workspace evs">
    <WorkspaceHeader current={hrefOf(panel)} />
    <main id="main-workspace" tabIndex={-1} className="evs-main">
      <div className="evs-bar">
        <div className="evs-title"><h1>Vehicle intelligence</h1><span className="evs-status"><i className={ev.connected && snapshot?.running ? "" : "is-warn"} /><span>{status}</span>{snapshot && <b>T+{snapshot.time_s.toFixed(0)}s</b>}</span></div>
        <ol className="evs-steps" aria-label="Investigation stages">{STEPS.map((s, i) => <li key={s} className={i === stage ? "is-current" : i < stage ? "is-done" : ""}>{s}{i < STEPS.length - 1 && <ChevronRight size={12} aria-hidden />}</li>)}</ol>
        <div className="evs-controls">
          <button disabled={!snapshot || ev.busy || !ev.connected} onClick={() => { void ev.control(snapshot?.running ? "pause" : "resume"); }}>{snapshot?.running ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}{snapshot?.running ? "Pause" : "Resume"}</button>
          <button aria-label="Reset EV simulation" title="Reset EV simulation" disabled={!snapshot || ev.busy} onClick={() => { void ev.control("reset"); }}><RotateCcw size={14} aria-hidden /></button>
        </div>
      </div>
      {ev.error && <div role="alert" className="evs-error"><WifiOff size={16} aria-hidden /><span>{ev.connected ? "EV command failed" : "EV backend unreachable"}: {ev.error}</span><button disabled={ev.busy} onClick={() => { void ev.poll(); }}>Retry</button></div>}
      {!snapshot && !ev.error && <div className="evs-loading" role="status" aria-busy="true">Connecting to the vehicle simulator…</div>}
      {snapshot && frame && <section className="evs-stage" aria-label="Vehicle twin">
        <div className="evs-viewport">
          <EvTwin snapshot={snapshot} frame={frame} />
          <EvSubtitle />
          {panel === "lab" && <EvAttackDrawer snapshot={snapshot} />}
          {panel === "data" && <EvData snapshot={snapshot} frame={frame} />}
          {panel === "pilot" && <EvPilotDock frame={frame} incidentId={incidentId} narrate={narrate} onNarrate={setNarration} />}
          {panel === "settings" && <EvSettings narrate={narrate} onNarrate={setNarration} />}
        </div>
        <EvDock snapshot={snapshot} frame={frame} />
      </section>}
      <footer className="evs-foot">Educational sandbox · simulated vehicle · <kbd>A</kbd> attack <kbd>P</kbd> pilot <kbd>/</kbd> data</footer>
    </main>
  </div>;
}
