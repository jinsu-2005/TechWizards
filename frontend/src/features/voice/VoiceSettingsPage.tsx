import { useEffect, useState } from "react";
import { Mic, Volume2, ShieldCheck } from "lucide-react";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { useVoice, speak, stopSpeech } from "../../lib/voice";
import { browserRecognitionAvailable } from "../../lib/voiceInput";
import { getVoiceCapabilities, type VoiceCapabilities } from "../../lib/voiceApi";

export function VoiceSettingsPage() {
  const settings = useVoice();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [capabilities, setCapabilities] = useState<VoiceCapabilities | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => setVoices(window.speechSynthesis?.getVoices() ?? []);
    refresh(); window.speechSynthesis?.addEventListener("voiceschanged", refresh);
    void getVoiceCapabilities().then(setCapabilities).catch(() => setCapabilities(null));
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", refresh);
  }, []);
  const card = "rounded-xl border border-border bg-surface p-4 sm:p-6";
  const field = "mt-2 w-full min-h-11 rounded-lg border border-border bg-bg px-3 text-sm text-text";
  return <main id="main-workspace" tabIndex={-1} className="content-page bg-bg"><div className="page-container flex flex-col gap-5">
    <WorkspaceHeader current="/settings" />
    <div className="page-heading"><div><h1>AI & voice settings</h1><p>Choose how Copilot listens and speaks. Incident narration is short and off until you enable it.</p></div></div>
    <div className="voice-settings-grid">
      <section className={card}><div className="flex items-center gap-2"><Mic className="text-accent" size={20} /><h2 className="text-lg font-semibold">Listening</h2></div>
        <p className="mt-2 text-sm text-muted">Use the microphone button in Copilot to start a single turn. You can review the transcript before sending it.</p>
        <label className="mt-5 block text-sm font-medium">Transcription provider<select className={field} value={settings.transcriptionProvider} onChange={(event) => settings.update({ transcriptionProvider: event.target.value as "browser" | "openai" })}><option value="browser">Browser recognition{browserRecognitionAvailable() ? "" : " · unavailable here"}</option><option value="openai" disabled={!capabilities?.openai_available}>OpenAI · {capabilities?.transcription_model ?? "server key required"}</option></select></label>
        <p className="mt-3 text-xs leading-5 text-muted">Browser recognition may use your browser vendor's speech service. OpenAI transcription sends the recorded clip to the configured server and OpenAI. The microphone never starts automatically.</p>
      </section>
      <section className={card}><div className="flex items-center gap-2"><Volume2 className="text-accent" size={20} /><h2 className="text-lg font-semibold">Speaking</h2></div>
        <p className="mt-2 text-sm text-muted">Speech is AI-generated or synthesized. Check the visible transcript and incident evidence before acting.</p>
        <label className="mt-5 block text-sm font-medium">Speech provider<select className={field} value={settings.speechProvider} onChange={(event) => settings.update({ speechProvider: event.target.value as "browser" | "openai" })}><option value="browser">Browser voice</option><option value="openai" disabled={!capabilities?.openai_available}>OpenAI · {capabilities?.speech_model ?? "server key required"}</option></select></label>
        {settings.speechProvider === "browser" ? <label className="mt-4 block text-sm font-medium">Voice<select className={field} value={settings.voiceURI} onChange={(event) => settings.update({ voiceURI: event.target.value })}><option value="">System default</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label> : <label className="mt-4 block text-sm font-medium">Voice<select className={field} value={settings.openaiVoice} onChange={(event) => settings.update({ openaiVoice: event.target.value })}>{(capabilities?.voices ?? ["coral"]).map((voice) => <option key={voice} value={voice}>{voice}</option>)}</select></label>}
        <label className="mt-4 block text-sm font-medium">Speed · {settings.rate.toFixed(1)}×<input className="mt-2 w-full accent-accent" type="range" min="0.7" max="1.5" step="0.1" value={settings.rate} onChange={(event) => settings.update({ rate: Number(event.target.value) })} disabled={settings.speechProvider === "openai"} /></label>
        <div className="mt-4 flex flex-wrap gap-2"><button className="min-h-11 rounded-lg border border-border px-4 text-sm" onClick={() => void speak("This is a short AttackTrace voice preview.").catch((cause: unknown) => setError(String(cause)))}>Preview voice</button><button className="min-h-11 rounded-lg border border-border px-4 text-sm" onClick={stopSpeech}>Stop speaking</button></div>
      </section>
      <section className={`${card} voice-settings-wide`}><div className="flex items-center gap-2"><ShieldCheck className="text-accent" size={20} /><h2 className="text-lg font-semibold">When to speak</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="voice-switch"><span><strong>Read Copilot replies aloud</strong><small>Speak a short summary after each answer.</small></span><input type="checkbox" checked={settings.replySpeech} onChange={(event) => settings.update({ replySpeech: event.target.checked })} /></label><label className="voice-switch"><span><strong>Narrate incident changes</strong><small>Brief detection and containment announcements; no continuous chatter.</small></span><input type="checkbox" checked={settings.incidentBriefings} onChange={(event) => settings.update({ incidentBriefings: event.target.checked })} /></label></div>
        <p className="mt-4 text-xs leading-5 text-muted">Voice commands can open pages and focus assets. Other requests go to the evidence-grounded Copilot. Simulation isolation still requires the on-screen action; HAI and LIVE remain read-only.</p>
      </section>
    </div>{error && <p role="alert" className="text-sm text-suspect">{error}</p>}
  </div></main>;
}
