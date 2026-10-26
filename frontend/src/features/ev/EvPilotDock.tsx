import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mic, MicOff, Send, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";
import { navigate } from "../../lib/navigation";
import type { Frame } from "./model";
import { useEv } from "./store";
import { useEvVoice } from "./useEvVoice";

const IDLE_PROMPTS = ["Summarize vehicle health", "Inspect the selected component", "Explain detection limitations"];
const INCIDENT_PROMPTS = ["Compare the origin candidates", "Inspect the selected component", "What should I check next?"];
const ORB_LABEL = { idle: "Tap to talk", connecting: "Connecting…", listening: "Listening", thinking: "Thinking", speaking: "Speaking", muted: "Muted" } as const;

export function EvPilotDock({ frame, incidentId, narrate, onNarrate }: { frame: Frame; incidentId: string | null; narrate: boolean; onNarrate: (on: boolean) => void }) {
  const ev = useEv();
  const [input, setInput] = useState("");
  const voice = useEvVoice(ev.selected, (lines) => ev.addMessages(lines.map((l) => ({ role: l.speaker, text: l.text }))));
  const incident = frame.analysis.candidates.length > 0;
  // During a live call the pilot itself speaks up when a new incident appears.
  const announced = useRef(incidentId);
  const { live, announce } = voice;
  useEffect(() => {
    if (incidentId && incidentId !== announced.current && live) announce();
    announced.current = incidentId;
  }, [incidentId, live, announce]);
  const prompts = incident ? INCIDENT_PROMPTS : IDLE_PROMPTS;
  const ask = (q: string) => { if (q.trim()) { void ev.ask(q); setInput(""); } };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };
  const lastQuestion = [...ev.messages].reverse().find((m) => m.role === "user")?.text;
  const caption = voice.lines[voice.lines.length - 1];
  return <aside className="evs-drawer evs-drawer-right evs-pilot" aria-label="EV AI Pilot" data-voice={voice.state}>
    <header>
      <h2><Sparkles size={16} aria-hidden /> AI Pilot</h2>
      <span className="evs-header-actions">
        <button className="evs-x" aria-pressed={narrate} aria-label="Spoken alerts" title={narrate ? "Spoken alerts on" : "Spoken alerts off"} onClick={() => onNarrate(!narrate)}>{narrate ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}</button>
        <button className="evs-x" aria-label="Close" onClick={() => navigate("/ev")}><X size={16} aria-hidden /></button>
      </span>
    </header>
    <div className="evs-orb-wrap">
      <button className="evs-orb" aria-label={voice.live ? "End voice session" : "Start voice session"} onClick={() => { if (voice.live) voice.stop(); else void voice.start(); }}>
        <i /><i /><i /><span>{voice.live ? <Square size={18} aria-hidden /> : <Mic size={22} aria-hidden />}</span>
      </button>
      <p className="evs-orb-label" role="status">{voice.error ?? ORB_LABEL[voice.state]}</p>
      {voice.live && <button className="evs-mute" onClick={voice.toggleMute} aria-pressed={voice.state === "muted"}>{voice.state === "muted" ? <MicOff size={14} aria-hidden /> : <Mic size={14} aria-hidden />}{voice.state === "muted" ? "Unmute" : "Mute"}</button>}
      {caption && <p className="evs-caption">{caption.text}</p>}
    </div>
    <div className="evs-prompts">{prompts.map((q) => <button key={q} disabled={ev.pilotBusy || !ev.connected} onClick={() => ask(q)}>{q}</button>)}</div>
    <div className="evs-messages" role="log" aria-label="EV pilot conversation" aria-live="polite">
      {ev.messages.slice(-6).map((m, i) => <div key={i} className={`evs-msg${m.role === "user" ? " is-user" : ""}`}>
        <p>{m.text}</p>
        {m.model && <small className={m.fallback ? "is-fallback" : ""}>{m.fallback ? "Evidence summary" : `Model: ${m.model}`}</small>}
      </div>)}
      {ev.pilotBusy && <p role="status" className="evs-thinking">Reading the evidence…</p>}
      {ev.pilotError && <div role="alert" className="evs-msg-error"><span>{ev.pilotError}</span><button disabled={!lastQuestion || ev.pilotBusy} onClick={() => { if (lastQuestion) void ev.ask(lastQuestion); }}>Retry</button></div>}
    </div>
    <form className="evs-ask" onSubmit={submit}>
      <label className="sr-only" htmlFor="ev-question">Ask EV AI Pilot</label>
      <input id="ev-question" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this vehicle" maxLength={2000} />
      <button aria-label="Send" disabled={!input.trim() || ev.pilotBusy || !ev.connected} type="submit"><Send size={15} aria-hidden /></button>
    </form>
  </aside>;
}
