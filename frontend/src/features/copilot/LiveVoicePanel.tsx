import { Mic, MicOff, Radio, Square, Volume2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { setLiveConversationActive, stopSpeech, useVoice } from "../../lib/voice";
import pilotIcon from "../../assets/ai-pilot-emblem.png";
import { pcm16, playPcm } from "../../lib/pcmAudio";

type Line = { id: number; speaker: "user" | "assistant"; text: string; language?: string };
type VoiceEvent =
  | { type: "ready"; model: string; max_seconds: number }
  | { type: "transcript"; speaker: "user" | "assistant"; text: string; language?: string }
  | { type: "interrupted" | "turn_complete" }
  | { type: "session_end"; reason: "time_limit" }
  | { type: "error"; message: string };

export type VoiceState = "listening" | "thinking" | "speaking" | "muted" | "disconnected" | "connecting" | "reconnecting";

function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i;
  const isTouchMac = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua);
  return mobileRegex.test(ua) || isTouchMac;
}

function groupTranscript(lines: Line[]): Line[] {
  return lines.reduce<Line[]>((turns, line) => {
    const last = turns[turns.length - 1];
    if (last?.speaker === line.speaker) {
      last.text = `${last.text} ${line.text}`.trim();
    } else {
      turns.push({ ...line });
    }
    return turns;
  }, []);
}

const DEMO_KEY = (import.meta.env.VITE_API_KEY as string | undefined) ?? "";

export function LiveVoicePanel({ onSessionChange, onUserTranscript, active = false }: { onSessionChange?: (active: boolean) => void; onUserTranscript?: (text: string) => void; active?: boolean } = {}) {
  const voice = useVoice();
  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Ready when you are.");
  const [canRetry, setCanRetry] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [waveLevels, setWaveLevels] = useState<number[]>([4, 4, 4, 4, 4, 4, 4]);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const followTranscript = useRef(true);

  const socket = useRef<WebSocket | null>(null);
  const context = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const processor = useRef<AudioWorkletNode | null>(null);
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
  const micAnalyser = useRef<AnalyserNode | null>(null);
  const outputAnalyser = useRef<AnalyserNode | null>(null);
  const timeline = useRef({ next: 0, sources: [] as AudioBufferSourceNode[] });
  const mutedRef = useRef(false);
  const stopped = useRef(false);
  const animFrame = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const isMobileRef = useRef(false);
  const isPlaybackActiveRef = useRef(false);
  const playbackCooldownUntilRef = useRef(0);
  const playbackWatchdogDeadlineRef = useRef(0);
  const outputSelectionSupported = typeof AudioContext !== "undefined" && "setSinkId" in AudioContext.prototype;

  // Notify parent of session state changes
  useEffect(() => {
    onSessionChange?.(phase === "live" || phase === "connecting");
    setLiveConversationActive(phase === "live" || phase === "connecting");
  }, [phase, onSessionChange]);
  useEffect(() => {
    if (phase !== "live" || sessionStartedAt === null) return;
    const update = () => setElapsed(Math.floor((Date.now() - sessionStartedAt) / 1000));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [phase, sessionStartedAt]);
  useEffect(() => {
    if (followTranscript.current) {
      transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
    }
  }, [lines]);

  useEffect(() => {
    const refresh = () => { void navigator.mediaDevices?.enumerateDevices().then(setDevices).catch(() => setDevices([])); };
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, []);

  // Compute active visual voice state
  let voiceState: VoiceState = "disconnected";
  if (phase === "connecting") {
    voiceState = canRetry ? "reconnecting" : "connecting";
  } else if (phase === "live") {
    if (muted) voiceState = "muted";
    else if (isSpeaking) voiceState = "speaking";
    else if (isThinking) voiceState = "thinking";
    else voiceState = "listening";
  } else if (phase === "ended" && canRetry) {
    voiceState = "disconnected";
  }

  // Animation frame loop for waveform levels
  useEffect(() => {
    const updateWave = () => {
      if (voiceState === "listening" && micAnalyser.current) {
        const data = new Uint8Array(32);
        micAnalyser.current.getByteFrequencyData(data);
        const bars: number[] = [];
        for (let i = 0; i < 7; i++) {
          const val = data[i * 4] ?? 0;
          bars.push(Math.max(4, Math.min(28, Math.round((val / 255) * 28))));
        }
        setWaveLevels(bars);
      } else if (voiceState === "speaking" && outputAnalyser.current) {
        const data = new Uint8Array(32);
        outputAnalyser.current.getByteFrequencyData(data);
        const bars: number[] = [];
        for (let i = 0; i < 7; i++) {
          const val = data[i * 4] ?? 0;
          bars.push(Math.max(4, Math.min(28, Math.round((val / 255) * 28))));
        }
        setWaveLevels(bars);
      } else {
        setWaveLevels([3, 3, 3, 3, 3, 3, 3]);
      }
      animFrame.current = requestAnimationFrame(updateWave);
    };

    animFrame.current = requestAnimationFrame(updateWave);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [voiceState]);

  const stop = (message: string | null = "Session ended.", retry = false) => {
    stopped.current = true;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "stop" }));
    socket.current?.close(); socket.current = null;
    if (processor.current) processor.current.port.onmessage = null;
    processor.current?.disconnect(); processor.current = null;
    sourceNode.current?.disconnect(); sourceNode.current = null;
    micAnalyser.current?.disconnect(); micAnalyser.current = null;
    outputAnalyser.current?.disconnect(); outputAnalyser.current = null;
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
    timeline.current.sources.forEach((source) => { try { source.stop(); } catch { /* ended */ } });
    timeline.current = { next: 0, sources: [] };
    stopSpeech();
    void context.current?.close(); context.current = null;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    isPlaybackActiveRef.current = false;
    playbackCooldownUntilRef.current = 0;
    playbackWatchdogDeadlineRef.current = 0;
    setIsThinking(false);
    if (message !== null) { setPhase("ended"); setStatus(message); setCanRetry(retry); }
    setSessionStartedAt(null);
  };
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => () => { stopRef.current(null); setLiveConversationActive(false); }, []);

  const start = async (preserve = false, selectedVoice?: string) => {
    if ((phase === "connecting" || phase === "live") && !preserve) return;
    const previous = preserve ? groupTranscript(lines).slice(-6).map(({ speaker, text }) => ({ speaker, text })) : [];
    if (preserve) stop(null);
    setStatus("Requesting microphone access…"); setPhase("connecting");
    if (!preserve) { setLines([]); followTranscript.current = true; }
    setCanRetry(false);
    stopped.current = false;
    mutedRef.current = false; setMuted(false);
    setIsSpeaking(false); isSpeakingRef.current = false; setIsThinking(false);
    const isMobile = isMobileDevice();
    isMobileRef.current = isMobile;
    isPlaybackActiveRef.current = false;
    playbackCooldownUntilRef.current = 0;
    playbackWatchdogDeadlineRef.current = 0;
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || typeof AudioWorkletNode === "undefined") {
        throw new Error("Live microphone audio needs a modern browser and a secure connection.");
      }
      stopSpeech();
      const audioContext = new AudioContext();
      context.current = audioContext;
      await audioContext.resume();

      // Output analyser for speaker monitoring
      const outNode = audioContext.createAnalyser();
      outNode.fftSize = 64;
      outNode.connect(audioContext.destination);
      outputAnalyser.current = outNode;

      if (voice.outputDeviceId && outputSelectionSupported) {
        await (audioContext as AudioContext & { setSinkId: (id: string) => Promise<void> }).setSinkId(voice.outputDeviceId);
      }
      // Desktop audio constraints are strictly preserved.
      // Mobile audio constraints enable echo cancellation, noise suppression, AGC, and single-channel capture.
      const audioConstraints: MediaTrackConstraints = isMobile
        ? {
            deviceId: voice.inputDeviceId ? { exact: voice.inputDeviceId } : undefined,
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            channelCount: { ideal: 1 },
            sampleRate: { ideal: 16000 },
          }
        : {
            deviceId: voice.inputDeviceId ? { exact: voice.inputDeviceId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          };
      const media = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      if (stopped.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const audioTrack = media.getAudioTracks()[0];
      if (audioTrack && isMobile) {
        try {
          const trackSettings = audioTrack.getSettings ? audioTrack.getSettings() : {};
          console.info("[LiveVoice Mobile] Audio track settings:", trackSettings);
        } catch { /* ignore */ }
      }
      media.getAudioTracks().forEach((track) => { track.onended = () => {
        if (!stopped.current) stop("Microphone disconnected. Choose a device and reconnect.", true);
      }; });
      void navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => undefined);

      // Mic analyser
      const micAnalysis = audioContext.createAnalyser();
      micAnalysis.fftSize = 64;
      micAnalyser.current = micAnalysis;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host.endsWith(".vercel.app") ? "techwizards.onrender.com" : window.location.host;
      const ws = new WebSocket(`${protocol}//${host}/ws/voice`);
      socket.current = ws;
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        if (stopped.current) { ws.close(); return; }
        ws.send(JSON.stringify({
          type: "start",
          voice: selectedVoice ?? voice.geminiVoice,
          history: previous,
          platform: isMobile ? "mobile" : "desktop",
          ...(DEMO_KEY ? { api_key: DEMO_KEY } : {}),
        }));
        setStatus("Connecting to Gemini Live…");
      };
      ws.onmessage = (event: MessageEvent) => {
        if (stopped.current || socket.current !== ws) return;
        if (event.data instanceof ArrayBuffer) {
          setIsThinking(false);
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          if (isMobileRef.current) {
            isPlaybackActiveRef.current = true;
            playbackCooldownUntilRef.current = 0;
            const durationMs = (event.data.byteLength / 2 / 24000) * 1000;
            playbackWatchdogDeadlineRef.current = Math.max(
              playbackWatchdogDeadlineRef.current,
              Date.now() + durationMs + 800
            );
          }
          if (context.current && outputAnalyser.current) {
            playPcm(event.data, context.current, timeline.current, outputAnalyser.current, () => {
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              if (isMobileRef.current) {
                isPlaybackActiveRef.current = false;
                // 250ms echo tail grace period to absorb phone casing and room acoustics
                playbackCooldownUntilRef.current = Date.now() + 250;
              }
            });
          }
          return;
        }
        let message: VoiceEvent;
        try { message = JSON.parse(String(event.data)) as VoiceEvent; } catch { return; }
        if (message.type === "ready") {
          void (async () => {
            await audioContext.audioWorklet.addModule(`${import.meta.env.BASE_URL}voice-capture-processor.js`);
            if (stopped.current) return;
            const source = audioContext.createMediaStreamSource(media);
            const node = new AudioWorkletNode(audioContext, "voice-capture-processor");
            const resample = { value: 0 };
            node.port.onmessage = (audioEvent: MessageEvent<ArrayBuffer>) => {
              if (mutedRef.current || ws.readyState !== WebSocket.OPEN || ws.bufferedAmount > 256000) return;
              // Mobile-specific gating fallback to eliminate speaker-to-mic feedback loop
              if (isMobileRef.current) {
                const now = Date.now();
                // Safety watchdog: ensure playback state cannot get permanently stuck
                if (isPlaybackActiveRef.current && now > playbackWatchdogDeadlineRef.current && timeline.current.sources.length === 0) {
                  isPlaybackActiveRef.current = false;
                  playbackCooldownUntilRef.current = 0;
                  setIsSpeaking(false);
                  isSpeakingRef.current = false;
                }
                if (isPlaybackActiveRef.current || now < playbackCooldownUntilRef.current) {
                  return;
                }
              }
              ws.send(pcm16(new Float32Array(audioEvent.data), audioContext.sampleRate, resample));
            };
            source.connect(node);
            source.connect(micAnalysis);
            node.connect(audioContext.destination);
            sourceNode.current = source; processor.current = node;
            setPhase("live");
            setSessionStartedAt(Date.now());
            setElapsed(0);
            setStatus(`Live with ${message.model}. Speak naturally; session ends after ${Math.round(message.max_seconds / 60)} minutes.`);
          })().catch(() => stop("Microphone processing could not start. Try another browser.", true));
        } else if (message.type === "transcript") {
          setLines((previous) => [
            ...previous.slice(-47),
            { id: Date.now() + Math.random(), speaker: message.speaker, text: message.text, language: message.language },
          ]);
          if (message.speaker === "user") {
            onUserTranscript?.(message.text);
            setIsThinking(true);
          } else {
            setIsThinking(false);
          }
        } else if (message.type === "interrupted") {
          timeline.current.sources.forEach((source) => { try { source.stop(); } catch { /* ended */ } });
          timeline.current = { next: 0, sources: [] };
          stopSpeech();
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          if (isMobileRef.current) {
            isPlaybackActiveRef.current = false;
            playbackCooldownUntilRef.current = 0;
          }
          setIsThinking(false);
        } else if (message.type === "turn_complete") {
          setIsThinking(false);
          if (isMobileRef.current && timeline.current.sources.length === 0) {
            isPlaybackActiveRef.current = false;
          }
        } else if (message.type === "session_end") {
          stop("Five-minute session limit reached. Reconnect to continue.", true);
        } else if (message.type === "error") {
          stop(message.message, true);
        }
      };
      ws.onerror = () => { if (!stopped.current && socket.current === ws) setStatus("Live connection interrupted…"); };
      ws.onclose = () => { if (!stopped.current && socket.current === ws) stop("Live connection lost. Choose Reconnect to start a new session.", true); };
    } catch (error) {
      const cause = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Microphone access is blocked. Allow it in your browser and reconnect."
        : error instanceof DOMException && error.name === "NotFoundError"
          ? "The selected audio device is unavailable. Choose another device and reconnect."
          : error instanceof Error ? error.message : "Could not start live voice.";
      stop(cause, true);
    }
  };

  const wasActive = useRef(false);
  const startRef = useRef(start);
  startRef.current = start;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const hasTranscriptRef = useRef(lines.length > 0);
  hasTranscriptRef.current = lines.length > 0;
  useEffect(() => {
    if (active && !wasActive.current && phaseRef.current !== "live" && phaseRef.current !== "connecting") {
      void startRef.current(hasTranscriptRef.current);
    }
    if (!active && wasActive.current && (phaseRef.current === "live" || phaseRef.current === "connecting")) stopRef.current();
    wasActive.current = active;
  }, [active]);

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next; setMuted(next);
    if (isMobileRef.current) {
      isPlaybackActiveRef.current = false;
      playbackCooldownUntilRef.current = 0;
    }
    if (next && socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "audio_end" }));
    setStatus(next ? "Microphone muted. Gemini can finish its current answer." : "Microphone live. Speak naturally.");
  };

  return (
    <section className="live-voice-panel flex flex-col flex-1 min-h-0" aria-label="Live voice chat" data-state={voiceState}>
      {/* ── Status header & State indicator ── */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Radio size={16} className="text-accent shrink-0" aria-hidden />
          <span className="font-semibold text-sm text-text">Live Voice</span>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-2">
          {phase === "live" && <span className="aip-session-time" aria-label={`Session duration ${Math.floor(elapsed / 60)} minutes ${elapsed % 60} seconds`}>{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span>}
          {voiceState === "listening" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-normal/15 border border-normal/30 px-2.5 py-0.5 text-xs font-semibold text-normal">
              <span className="h-2 w-2 rounded-full bg-normal animate-pulse" aria-hidden />
              Listening
            </span>
          )}
          {voiceState === "thinking" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent">
              <span className="flex gap-1" aria-hidden>
                <span className="aip-dot" style={{ width: 4, height: 4, animationDelay: "0ms" }} />
                <span className="aip-dot" style={{ width: 4, height: 4, animationDelay: "150ms" }} />
                <span className="aip-dot" style={{ width: 4, height: 4, animationDelay: "300ms" }} />
              </span>
              Thinking
            </span>
          )}
          {voiceState === "speaking" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-2.5 py-0.5 text-xs font-semibold text-accent">
              <Volume2 size={12} className="animate-bounce" aria-hidden />
              Speaking
            </span>
          )}
          {voiceState === "muted" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-suspect/15 border border-suspect/30 px-2.5 py-0.5 text-xs font-semibold text-suspect">
              <MicOff size={11} aria-hidden />
              Muted
            </span>
          )}
          {(voiceState === "connecting" || voiceState === "reconnecting") && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
              <Loader2 size={12} className="animate-spin" aria-hidden />
              {voiceState === "reconnecting" ? "Reconnecting…" : "Connecting…"}
            </span>
          )}
          {voiceState === "disconnected" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-muted/60" aria-hidden />
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* A stateful signal lens: movement is reserved for actual microphone/output activity. */}
      <div className="aip-voice-stage" aria-label={`Voice state: ${voiceState}`}>
        <div className="aip-voice-grid" aria-hidden="true" />
        <div className="aip-voice-orbit" aria-hidden="true">
          <span className="aip-voice-ring aip-voice-ring-one" />
          <span className="aip-voice-ring aip-voice-ring-two" />
          <span className="aip-voice-ring aip-voice-ring-three" />
          <span className="aip-voice-core">
            {voiceState === "muted" ? <MicOff size={25} /> : voiceState === "disconnected" ? <img src={pilotIcon} alt="" className="aip-emblem" /> : (
              <span className="aip-voice-bars">
                {waveLevels.map((level, index) => (
                  <span key={index} style={{ height: `${voiceState === "speaking" || voiceState === "listening" ? Math.max(7, level * 1.35) : 8}px` }} />
                ))}
              </span>
            )}
          </span>
        </div>
        <div className="aip-voice-stage-copy">
          <span className="aip-voice-eyebrow">LIVE AUDIO SESSION</span>
          <strong>{voiceState === "speaking" ? "AI Pilot is speaking" : voiceState === "listening" ? "Listening to you" : voiceState === "thinking" ? "Connecting the evidence" : voiceState === "muted" ? "Microphone muted" : voiceState === "disconnected" ? canRetry ? "Connection unavailable" : "Ready when you are" : "Establishing your session"}</strong>
          <p role="status" aria-atomic="true">{status}</p>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phase !== "live" && phase !== "connecting" ? (
          <button
            type="button"
            className="live-voice-primary min-h-11 flex-1"
            onClick={() => void start(canRetry && lines.length > 0)}
          >
            <Mic size={16} />
            {canRetry ? "Reconnect" : "Start live chat"}
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`live-voice-secondary min-h-11 flex-1 ${muted ? "border-suspect/60 text-suspect bg-suspect/10" : ""}`}
              onClick={toggleMute}
              disabled={phase !== "live"}
            >
              {muted ? <MicOff size={16} /> : <Mic size={16} />}
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              className="live-voice-secondary min-h-11 flex-1 hover:border-suspect hover:text-suspect"
              onClick={() => stop()}
            >
              <Square size={14} />
              End chat
            </button>
          </>
        )}
      </div>

      <div className="aip-voice-suggestions" aria-label="Suggested voice questions">
        <span>Try asking</span>
        <p>“Summarize anomalies”</p>
        <p>“Explain the selected asset”</p>
        <p>“What evidence is missing?”</p>
      </div>
      <p className="aip-voice-disclosure">While connected, microphone audio and the conversation transcript are sent to Google through this server.</p>

      {/* ── Device selection ── */}
      <details className="live-voice-devices mt-3 rounded-lg border border-border/60 bg-surface/30 p-2.5">
        <summary className="text-xs font-semibold text-text cursor-pointer select-none">
          Audio devices
        </summary>
        <div className="live-voice-device-grid mt-2">
          <label>
            AI Pilot voice
            <select
              value={voice.geminiVoice}
              onChange={(event) => {
                const chosen = event.target.value;
                voice.update({ geminiVoice: chosen });
                if (phase === "live") void start(true, chosen);
              }}
              disabled={phase === "connecting"}
            >
              <option value="Kore">Kore</option>
              <option value="Puck">Puck</option>
            </select>
          </label>
          <label>
            Microphone
            <select
              value={voice.inputDeviceId}
              disabled={phase === "connecting" || phase === "live"}
              onChange={(event) => voice.update({ inputDeviceId: event.target.value })}
            >
              <option value="">System default</option>
              {devices
                .filter((d) => d.kind === "audioinput" && d.deviceId !== "default")
                .map((d, idx) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Speaker
            <select
              value={voice.outputDeviceId}
              disabled={!outputSelectionSupported || phase === "connecting" || phase === "live"}
              onChange={(event) => voice.update({ outputDeviceId: event.target.value })}
            >
              <option value="">System default</option>
              {devices
                .filter((d) => d.kind === "audiooutput" && d.deviceId !== "default")
                .map((d, idx) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Speaker ${idx + 1}`}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          Changing AI Pilot's voice reconnects and keeps the visible transcript. End the session to switch audio devices.{!outputSelectionSupported ? " This browser uses the system default speaker." : ""}
        </p>
      </details>

      {/* ── Live transcript log ── */}
      <div className="mt-3 flex flex-1 flex-col min-h-0 border-t border-border/60 pt-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Live transcript</span>
        <div
          ref={transcriptRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            followTranscript.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
          }}
          role="log"
          aria-label="Live voice transcript"
          className="live-voice-transcript mt-1.5 flex-1 min-h-[6rem] max-h-48 overflow-y-auto space-y-2 rounded-lg border border-border/50 bg-bg/50 p-2 text-xs"
        >
          {lines.length === 0 ? (
            <p className="text-[11px] text-muted/70 italic text-center py-4">
              Spoken dialogue appears here in real time.
            </p>
          ) : (
            groupTranscript(lines).map((line) => (
              <p key={line.id} className={`aip-transcript-turn leading-5 ${line.speaker === "user" ? "aip-transcript-user" : "aip-transcript-pilot"}`}>
                <strong className={line.speaker === "user" ? "text-muted" : "text-accent"}>
                  {line.speaker === "user" ? "You" : "AI Pilot"}:
                </strong>{" "}
                <span className="text-text">{line.text}</span>
              </p>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
