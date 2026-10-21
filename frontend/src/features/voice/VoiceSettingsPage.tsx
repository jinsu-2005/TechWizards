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
  return <main id="main-workspace" tabIndex={-1} className="content-page bg-bg"><div className="page-container flex flex-col gap-3 sm:gap-3.5">
    <WorkspaceHeader current="/settings" />
    <div className="page-heading">
      <div className="page-heading-main">
        <h1>AI &amp; voice settings</h1>
        <span className="hidden sm:inline text-border">·</span>
        <p className="page-heading-context">
          <span>Choose how AI Pilot listens and speaks · Incident narration is off until enabled</span>
        </p>
      </div>
    </div>
    <div className="voice-settings-grid">
      <section className={card}><div className="flex items-center gap-2"><Mic className="text-accent" size={20} /><h2 className="text-lg font-semibold">Listening</h2></div>
        <p className="mt-2 text-sm text-muted">Use the microphone button in AI Pilot to start a single turn. You can review the transcript before sending it.</p>
        <label className="mt-5 block text-sm font-medium">Transcription provider<select className={field} value={settings.transcriptionProvider} onChange={(event) => settings.update({ transcriptionProvider: event.target.value as "browser" | "gemini" })}><option value="gemini" disabled={!capabilities?.gemini_available}>Gemini · {capabilities?.transcription_model ?? "server key required"}</option><option value="browser">Browser recognition{browserRecognitionAvailable() ? "" : " · unavailable here"}</option></select></label>
        <p className="mt-3 text-xs leading-5 text-muted">Gemini transcription sends the recorded clip through this server to Google. Browser recognition may use your browser vendor's speech service. The microphone starts only when you tap a microphone or Live Voice control.</p>
      </section>
      <section className={card}><div className="flex items-center gap-2"><Volume2 className="text-accent" size={20} /><h2 className="text-lg font-semibold">Speaking</h2></div>
        <p className="mt-2 text-sm text-muted">Speech is AI-generated or synthesized. Check the visible transcript and incident evidence before acting.</p>
        <label className="mt-5 block text-sm font-medium">Speech provider<select className={field} value={settings.speechProvider} onChange={(event) => settings.update({ speechProvider: event.target.value as "browser" | "gemini" })}><option value="gemini" disabled={!capabilities?.gemini_available}>Gemini · AI voice{capabilities?.gemini_available ? "" : " · server key required"}</option><option value="browser">Browser voice</option></select></label>
        {settings.speechProvider === "browser" ? <label className="mt-4 block text-sm font-medium">Voice<select className={field} value={settings.voiceURI} onChange={(event) => settings.update({ voiceURI: event.target.value })}><option value="">System default</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}</select></label> : <><label className="mt-4 block text-sm font-medium">Gemini speech model<select className={field} value={settings.geminiSpeechModel} onChange={(event) => settings.update({ geminiSpeechModel: event.target.value })}>{(capabilities?.speech_models.length ? capabilities.speech_models : [settings.geminiSpeechModel]).map((model) => <option key={model} value={model}>{model}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Voice<select className={field} value={settings.geminiVoice} onChange={(event) => settings.update({ geminiVoice: event.target.value })}>{(capabilities?.voices.length ? capabilities.voices : [settings.geminiVoice]).map((voice) => <option key={voice} value={voice}>{voice}</option>)}</select></label></>}
        <label className="mt-4 block text-sm font-medium">Speed · {settings.rate.toFixed(1)}×<input className="mt-2 w-full accent-accent" type="range" min="0.7" max="1.5" step="0.1" value={settings.rate} onChange={(event) => settings.update({ rate: Number(event.target.value) })} disabled={settings.speechProvider === "gemini"} /></label>
        <div className="mt-4 flex flex-wrap gap-2"><button className="min-h-11 rounded-lg border border-border px-4 text-sm" onClick={() => void speak("This is a short AttackTrace voice preview.").catch((cause: unknown) => setError(String(cause)))}>Preview voice</button><button className="min-h-11 rounded-lg border border-border px-4 text-sm" onClick={stopSpeech}>Stop speaking</button></div>
        <p className="mt-3 text-xs leading-5 text-muted">Gemini speech sends the short answer or incident briefing to Google through this server. Browser voices use the speech engine provided by your device or browser.</p>
      </section>
      <section className={`${card} voice-settings-wide`}><div className="flex items-center gap-2"><ShieldCheck className="text-accent" size={20} /><h2 className="text-lg font-semibold">When to speak</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="voice-switch"><span><strong>Read AI Pilot replies aloud</strong><small>Speak a short summary after each answer.</small></span><input type="checkbox" checked={settings.replySpeech} onChange={(event) => settings.update({ replySpeech: event.target.checked })} /></label><label className="voice-switch"><span><strong>Proactive voice briefings</strong><small>Brief detection and containment announcements; no continuous chatter or background listening.</small></span><input type="checkbox" checked={settings.incidentBriefings} onChange={(event) => settings.update({ incidentBriefings: event.target.checked })} /></label></div>
        <p className="mt-4 text-xs leading-5 text-muted">Use the Live voice tab in AI Pilot for a continuous, two-way Gemini conversation. The server supplies current process status through a read-only lookup. A session ends after five minutes; mute or end it at any time. Voice cannot perform isolation or other plant controls. HAI and LIVE remain read-only.</p>
      </section>
      <section className={`${card} voice-settings-wide`}><h2 className="text-lg font-semibold">AI model status</h2>
        <p className="mt-2 text-sm text-muted">Each feature uses a compatible model. If a model reaches its quota, AI Pilot may use another available model.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{(["text", "live", "transcription", "tts"] as const).map((kind) => {
          const item = capabilities?.models?.[kind];
          return <div key={kind} className="rounded-lg border border-border p-3 text-xs"><strong className="capitalize text-sm">{kind === "tts" ? "Speech" : kind}</strong><p className="mt-1 break-all">{item?.active ?? item?.preferred ?? "Unavailable"}</p><p className="mt-1 text-muted">{item?.active && item.active !== item.preferred ? "Fallback active" : item?.available.length ? "Available" : "Unavailable or cooling down"}</p></div>;
        })}</div>
      </section>
    </div>{error && <p role="alert" className="text-sm text-suspect">{error}</p>}
  </div></main>;
}
