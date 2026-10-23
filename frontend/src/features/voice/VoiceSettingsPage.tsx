import { useEffect, useState } from "react";
import {
  Mic, Volume2, ShieldCheck, Key, Eye, EyeOff, Check,
  AlertTriangle, RefreshCw, Sparkles, VolumeX, Radio, Globe,
  Cpu, Server, Sliders
} from "lucide-react";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";
import { useVoice, speak, stopSpeech } from "../../lib/voice";
import { browserRecognitionAvailable } from "../../lib/voiceInput";
import { getVoiceCapabilities, type VoiceCapabilities } from "../../lib/voiceApi";
import { getStatus } from "../../lib/api";

export function VoiceSettingsPage() {
  const settings = useVoice();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [capabilities, setCapabilities] = useState<VoiceCapabilities | null>(null);
  const [testingKey, setTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [showKey, setShowKey] = useState(false);
  const [speakingPreview, setSpeakingPreview] = useState(false);
  const [clientKey, setClientKey] = useState(() => {
    return localStorage.getItem("attacktrace.api_key") ?? (import.meta.env.VITE_API_KEY as string | undefined) ?? "";
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refreshVoices = () => {
      setVoices(window.speechSynthesis?.getVoices() ?? []);
    };
    refreshVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", refreshVoices);
    void getVoiceCapabilities().then(setCapabilities).catch(() => setCapabilities(null));
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", refreshVoices);
  }, []);

  const handleSaveClientKey = () => {
    if (clientKey.trim()) {
      localStorage.setItem("attacktrace.api_key", clientKey.trim());
    } else {
      localStorage.removeItem("attacktrace.api_key");
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTestClientKey = async () => {
    setTestingKey(true);
    setKeyStatus("idle");
    try {
      await getStatus();
      setKeyStatus("valid");
    } catch {
      setKeyStatus("invalid");
    } finally {
      setTestingKey(false);
    }
  };

  const handlePreviewVoice = async () => {
    setError(null);
    setSpeakingPreview(true);
    try {
      await speak("AttackTrace AI Pilot online. Telemetry stream and process integrity verified.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Voice preview failed");
    } finally {
      setSpeakingPreview(false);
    }
  };

  const hasBrowserSpeech = browserRecognitionAvailable();
  const hasGemini = !!capabilities?.gemini_available;

  return (
    <main id="main-workspace" tabIndex={-1} className="content-page bg-bg">
      <div className="page-container flex flex-col gap-4">
        <WorkspaceHeader current="/settings" />

        {/* Page Hero */}
        <div className="soc-hero">
          <div className="soc-hero-left">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="soc-mode-chip">SYSTEM SETTINGS</span>
              <span className={`soc-conn-chip ${hasGemini ? "soc-conn-live" : "soc-conn-stale"}`}>
                <Radio size={11} />
                {hasGemini ? "Gemini AI Connected" : "Local / Offline Mode"}
              </span>
            </div>
            <h1 className="soc-hero-title">Voice &amp; AI Provider Configuration</h1>
            <p className="soc-hero-sub">
              Configure speech-to-text transcription models, neural synthesis voices, AI pilot automation, and API security keys.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="lab-error-toast">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-xs text-muted hover:text-text">
              Dismiss
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            1. VOICE TRANSCRIPTION PROVIDER (GEMINI LIVE VS BROWSER SPEECH)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="settings-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="settings-icon-wrap text-accent bg-accent/10 border-accent/20">
                <Mic size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">Speech-to-Text Transcription Provider</h2>
                <p className="text-xs text-muted">Select how voice instructions from the AI Pilot microphone are converted to text.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-muted uppercase">STT Engine</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {/* OPTION 1: Gemini Live / Gemini AI */}
            <div
              onClick={() => {
                if (hasGemini) settings.update({ transcriptionProvider: "gemini" });
              }}
              className={`provider-card ${settings.transcriptionProvider === "gemini" ? "active" : ""} ${!hasGemini ? "disabled" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <span className="text-sm font-bold text-text">Gemini Live &amp; AI</span>
                </div>
                <span className="soc-badge-open text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Recommended
                </span>
              </div>

              <p className="mt-2 text-xs text-muted leading-relaxed">
                Multimodal speech transcription via Gemini Live audio streaming. Understands ICS/SCADA terminology, sensor tags (e.g. "LIT101"), and industrial jargon accurately.
              </p>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Model: {capabilities?.transcription_model ?? "gemini-3.8-flash"}</span>
                <span className={hasGemini ? "text-normal font-semibold" : "text-suspect"}>
                  {hasGemini ? "Ready ✓" : "Server key required"}
                </span>
              </div>
            </div>

            {/* OPTION 2: Browser Speech Recognition */}
            <div
              onClick={() => settings.update({ transcriptionProvider: "browser" })}
              className={`provider-card ${settings.transcriptionProvider === "browser" ? "active" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-muted" />
                  <span className="text-sm font-bold text-text">Browser Speech Recognition</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono text-muted border border-border">
                  Web API
                </span>
              </div>

              <p className="mt-2 text-xs text-muted leading-relaxed">
                Uses the browser's built-in Web Speech API. Completely offline capable on supported browsers (Chrome, Edge, Safari), with zero external API token consumption.
              </p>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted">Local Device Engine</span>
                <span className={hasBrowserSpeech ? "text-normal font-semibold" : "text-suspect"}>
                  {hasBrowserSpeech ? "Available ✓" : "Unsupported here"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            2. SPEECH SYNTHESIS (VOICE OUTPUT)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="settings-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="settings-icon-wrap text-normal bg-normal/10 border-normal/20">
                <Volume2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">Text-to-Speech (TTS) Voice Synthesis</h2>
                <p className="text-xs text-muted">Choose neural AI voices or native device voices for AI Pilot incident briefings.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-muted uppercase">TTS Engine</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Provider Selector */}
            <label className="flex flex-col gap-1.5 text-xs text-muted font-medium">
              Speech Synthesis Provider
              <select
                className="settings-field"
                value={settings.speechProvider}
                onChange={(e) => settings.update({ speechProvider: e.target.value as "browser" | "gemini" })}
              >
                <option value="gemini" disabled={!hasGemini}>
                  Gemini Neural AI Voice {hasGemini ? "· Recommended" : "(Key Required)"}
                </option>
                <option value="browser">Browser Native Voice Engine</option>
              </select>
            </label>

            {/* Voice Model / Name Selector */}
            {settings.speechProvider === "gemini" ? (
              <label className="flex flex-col gap-1.5 text-xs text-muted font-medium">
                Gemini Voice Persona
                <select
                  className="settings-field"
                  value={settings.geminiVoice}
                  onChange={(e) => settings.update({ geminiVoice: e.target.value })}
                >
                  {(capabilities?.voices.length ? capabilities.voices : ["Kore", "Puck", "Charon", "Fenrir", "Aoede"]).map((v) => (
                    <option key={v} value={v}>
                      {v} (Neural Voice)
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="flex flex-col gap-1.5 text-xs text-muted font-medium">
                System Voice
                <select
                  className="settings-field"
                  value={settings.voiceURI}
                  onChange={(e) => settings.update({ voiceURI: e.target.value })}
                >
                  <option value="">System Default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Speed slider and Preview Buttons */}
          <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                <Sliders size={13} />
                Playback Speed:
              </span>
              <input
                type="range"
                min={0.7}
                max={1.5}
                step={0.1}
                value={settings.rate}
                onChange={(e) => settings.update({ rate: Number(e.target.value) })}
                disabled={settings.speechProvider === "gemini"}
                className="w-28 accent-accent"
              />
              <span className="text-xs font-mono font-semibold text-text">{settings.rate.toFixed(1)}×</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={speakingPreview}
                onClick={() => void handlePreviewVoice()}
                className="settings-btn-primary"
              >
                <Volume2 size={13} className={speakingPreview ? "animate-pulse" : ""} />
                <span>{speakingPreview ? "Playing Sample…" : "Preview Voice"}</span>
              </button>
              <button
                type="button"
                onClick={stopSpeech}
                className="settings-btn-secondary"
                title="Stop current speech playback"
              >
                <VolumeX size={13} />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. AUTOMATION & BRIEFINGS
            ══════════════════════════════════════════════════════════════════ */}
        <section className="settings-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="settings-icon-wrap text-suspect bg-suspect/10 border-suspect/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Proactive Audio Briefings &amp; Automation</h2>
              <p className="text-xs text-muted">Control when the AI Pilot speaks automatically during plant operations.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <label className="settings-switch-card">
              <div className="flex-1">
                <strong className="text-sm font-semibold text-text block">Read AI Pilot Responses Aloud</strong>
                <p className="text-xs text-muted mt-0.5">
                  Automatically speaks a concise 1–2 sentence summary following each chat query answer.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.replySpeech}
                onChange={(e) => settings.update({ replySpeech: e.target.checked })}
                className="accent-accent h-4 w-4 shrink-0"
              />
            </label>

            <label className="settings-switch-card">
              <div className="flex-1">
                <strong className="text-sm font-semibold text-text block">Proactive Incident Voice Briefings</strong>
                <p className="text-xs text-muted mt-0.5">
                  Announces new incident detections and verified containment milestones. No continuous chatter.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.incidentBriefings}
                onChange={(e) => settings.update({ incidentBriefings: e.target.checked })}
                className="accent-accent h-4 w-4 shrink-0"
              />
            </label>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. API KEY & ENDPOINT SECURITY INPUTS
            ══════════════════════════════════════════════════════════════════ */}
        <section className="settings-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="settings-icon-wrap text-accent bg-accent/10 border-accent/20">
                <Key size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">API Keys &amp; Security Authentication</h2>
                <p className="text-xs text-muted">Manage client authorization keys for plant write controls and server-side model access.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-muted uppercase">Access Control</span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {/* Client Write Key Input */}
            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                AttackTrace Client API Key (<code className="text-accent font-mono">x-api-key</code>)
              </label>
              <p className="text-xs text-muted mb-2">
                Passed in request headers to authorize attack scenario injection, proxy reconfiguration, and incident containment.
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="Enter write authorization API key (e.g. demo-key-2026)..."
                    value={clientKey}
                    onChange={(e) => setClientKey(e.target.value)}
                    className="settings-field font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    title={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveClientKey}
                  className="settings-btn-primary shrink-0"
                >
                  {saveSuccess ? <Check size={13} className="text-normal" /> : null}
                  <span>{saveSuccess ? "Saved ✓" : "Save Key"}</span>
                </button>
                <button
                  type="button"
                  disabled={testingKey}
                  onClick={() => void handleTestClientKey()}
                  className="settings-btn-secondary shrink-0"
                >
                  <RefreshCw size={12} className={testingKey ? "animate-spin" : ""} />
                  <span>Test Key</span>
                </button>
              </div>

              {keyStatus === "valid" && (
                <p className="mt-2 text-xs text-normal flex items-center gap-1.5 font-medium">
                  <Check size={13} /> Key accepted by local server. Write actions authorized.
                </p>
              )}
              {keyStatus === "invalid" && (
                <p className="mt-2 text-xs text-suspect flex items-center gap-1.5 font-medium">
                  <AlertTriangle size={13} /> Connection test failed. Verify server is running and key matches backend configuration.
                </p>
              )}
            </div>

            {/* Backend Gemini Key Status Box */}
            <div className="mt-2 rounded-lg border border-border/80 bg-bg/80 p-3.5 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Server size={13} className="text-accent" />
                  Backend Gemini API Key (<code className="font-mono text-accent">GEMINI_API_KEY</code>)
                </span>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Configured on the backend server in <code className="font-mono text-text">.env</code>. Used by the Python server for LLM chat, causal hypothesis ranking, and neural voice synthesis.
                </p>
              </div>
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border shrink-0 ${
                hasGemini
                  ? "text-normal border-normal/30 bg-normal/10"
                  : "text-suspect border-suspect/30 bg-suspect/10"
              }`}>
                {hasGemini ? "Server Key Active ✓" : "Key Missing in .env"}
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. AI MODEL CAPABILITIES STATUS
            ══════════════════════════════════════════════════════════════════ */}
        <section className="settings-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="settings-icon-wrap text-accent bg-accent/10 border-accent/20">
                <Cpu size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text">AI Model Service &amp; Quota Status</h2>
                <p className="text-xs text-muted">Active models and automatic fallback health across AI Pilot features.</p>
              </div>
            </div>
            <span className="text-xs font-mono text-muted uppercase">Health Matrix</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["text", "live", "transcription", "tts"] as const).map((kind) => {
              const item = capabilities?.models?.[kind];
              const isAvailable = !!item?.available.length;
              const isFallback = item?.active && item.active !== item.preferred;
              const label = kind === "tts" ? "Speech Synthesis" : kind === "live" ? "Live Voice Stream" : kind === "transcription" ? "Audio Transcription" : "Text Reasoning";

              return (
                <div key={kind} className="rounded-xl border border-border bg-bg/70 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text capitalize">{label}</span>
                    <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-normal" : "bg-suspect"}`} />
                  </div>
                  <p className="mt-2 font-mono text-xs font-semibold text-accent truncate" title={item?.active ?? item?.preferred ?? "None"}>
                    {item?.active ?? item?.preferred ?? "gemini-3.8-flash"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    {isFallback ? "Fallback model active" : isAvailable ? "Healthy · Quota available" : "Offline / quota limit"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
