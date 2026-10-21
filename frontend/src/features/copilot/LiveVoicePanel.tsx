import { Mic, MicOff, Radio, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { stopSpeech, useVoice } from "../../lib/voice";

type Line = { id: number; speaker: "user" | "assistant"; text: string };
type VoiceEvent =
  | { type: "ready"; model: string; max_seconds: number }
  | { type: "transcript"; speaker: "user" | "assistant"; text: string }
  | { type: "interrupted" | "turn_complete" }
  | { type: "session_end"; reason: "time_limit" }
  | { type: "error"; message: string };

const DEMO_KEY = (import.meta.env.VITE_API_KEY as string | undefined) ?? "";

function pcm16(input: Float32Array, sampleRate: number, phase: { value: number }): ArrayBuffer {
  const ratio = sampleRate / 16000;
  const samples: number[] = [];
  while (phase.value < input.length) {
    const index = Math.floor(phase.value);
    const fraction = phase.value - index;
    const value = (input[index] ?? 0) * (1 - fraction)
      + (input[Math.min(index + 1, input.length - 1)] ?? 0) * fraction;
    samples.push(Math.max(-1, Math.min(1, value)));
    phase.value += ratio;
  }
  phase.value -= input.length;
  const bytes = new ArrayBuffer(samples.length * 2);
  const view = new DataView(bytes);
  samples.forEach((value, index) => view.setInt16(index * 2, value < 0 ? value * 32768 : value * 32767, true));
  return bytes;
}

function playPcm(bytes: ArrayBuffer, context: AudioContext, timeline: { next: number; sources: AudioBufferSourceNode[] }): void {
  if (bytes.byteLength < 2 || bytes.byteLength % 2) return;
  const samples = bytes.byteLength / 2;
  const buffer = context.createBuffer(1, samples, 24000);
  const channel = buffer.getChannelData(0);
  const view = new DataView(bytes);
  for (let index = 0; index < samples; index++) channel[index] = view.getInt16(index * 2, true) / 32768;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.onended = () => { timeline.sources = timeline.sources.filter((item) => item !== source); };
  timeline.next = Math.max(timeline.next, context.currentTime + 0.04);
  source.start(timeline.next);
  timeline.next += buffer.duration;
  timeline.sources.push(source);
}

export function LiveVoicePanel() {
  const voice = useVoice();
  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "ended">("idle");
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Ready when you are.");
  const [canRetry, setCanRetry] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const context = useRef<AudioContext | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const processor = useRef<AudioWorkletNode | null>(null);
  const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
  const timeline = useRef({ next: 0, sources: [] as AudioBufferSourceNode[] });
  const mutedRef = useRef(false);
  const stopped = useRef(false);
  const outputSelectionSupported = typeof AudioContext !== "undefined" && "setSinkId" in AudioContext.prototype;

  useEffect(() => {
    const refresh = () => { void navigator.mediaDevices?.enumerateDevices().then(setDevices).catch(() => setDevices([])); };
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, []);

  const stop = (message: string | null = "Session ended.", retry = false) => {
    stopped.current = true;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "stop" }));
    socket.current?.close(); socket.current = null;
    if (processor.current) processor.current.port.onmessage = null;
    processor.current?.disconnect(); processor.current = null;
    sourceNode.current?.disconnect(); sourceNode.current = null;
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
    timeline.current.sources.forEach((source) => { try { source.stop(); } catch { /* already ended */ } });
    timeline.current = { next: 0, sources: [] };
    void context.current?.close(); context.current = null;
    if (message !== null) { setPhase("ended"); setStatus(message); setCanRetry(retry); }
  };
  const stopRef = useRef(stop);
  stopRef.current = stop;
  useEffect(() => () => stopRef.current(null), []);

  const start = async () => {
    if (phase === "connecting" || phase === "live") return;
    setStatus("Requesting microphone access…"); setPhase("connecting"); setLines([]); setCanRetry(false);
    stopped.current = false;
    mutedRef.current = false; setMuted(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || typeof AudioWorkletNode === "undefined") {
        throw new Error("Live microphone audio needs a modern browser and a secure connection.");
      }
      stopSpeech();
      const audioContext = new AudioContext();
      context.current = audioContext;
      await audioContext.resume();
      if (voice.outputDeviceId && outputSelectionSupported) {
        await (audioContext as AudioContext & { setSinkId: (id: string) => Promise<void> }).setSinkId(voice.outputDeviceId);
      }
      const media = await navigator.mediaDevices.getUserMedia({ audio: {
        deviceId: voice.inputDeviceId ? { exact: voice.inputDeviceId } : undefined,
        echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      } });
      if (stopped.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      media.getAudioTracks().forEach((track) => { track.onended = () => {
        if (!stopped.current) stop("Microphone disconnected. Choose a device and reconnect.", true);
      }; });
      void navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => undefined);
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/voice`);
      socket.current = ws;
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        if (stopped.current) { ws.close(); return; }
        ws.send(JSON.stringify({ type: "start", voice: voice.geminiVoice, ...(DEMO_KEY ? { api_key: DEMO_KEY } : {}) }));
        setStatus("Connecting to Gemini Live…");
      };
      ws.onmessage = (event: MessageEvent) => {
        if (stopped.current) return;
        if (event.data instanceof ArrayBuffer) {
          if (context.current) playPcm(event.data, context.current, timeline.current);
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
              ws.send(pcm16(new Float32Array(audioEvent.data), audioContext.sampleRate, resample));
            };
            source.connect(node); node.connect(audioContext.destination);
            sourceNode.current = source; processor.current = node;
            setPhase("live");
            setStatus(`Live with ${message.model}. Speak naturally; session ends after ${Math.round(message.max_seconds / 60)} minutes.`);
          })().catch(() => stop("Microphone processing could not start. Try another browser.", true));
        } else if (message.type === "transcript") {
          setLines((previous) => [...previous.slice(-11), { id: Date.now() + Math.random(), speaker: message.speaker, text: message.text }]);
        } else if (message.type === "interrupted") {
          timeline.current.sources.forEach((source) => { try { source.stop(); } catch { /* already ended */ } });
          timeline.current = { next: 0, sources: [] };
        } else if (message.type === "session_end") {
          stop("Five-minute session limit reached. Reconnect to continue.", true);
        } else if (message.type === "error") stop(message.message, true);
      };
      ws.onerror = () => { if (!stopped.current) setStatus("Live connection interrupted…"); };
      ws.onclose = () => { if (!stopped.current) stop("Live connection lost. Choose Reconnect to start a new session.", true); };
    } catch (error) {
      const cause = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Microphone access is blocked. Allow it in your browser and reconnect."
        : error instanceof DOMException && error.name === "NotFoundError"
          ? "The selected audio device is unavailable. Choose another device and reconnect."
          : error instanceof Error ? error.message : "Could not start live voice.";
      stop(cause, true);
    }
  };
  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next; setMuted(next);
    if (next && socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "audio_end" }));
    setStatus(next ? "Microphone muted. Gemini can finish its current answer." : "Microphone live. Speak naturally.");
  };

  return <section className="live-voice-panel" aria-label="Live voice chat">
    <div className="flex items-center gap-2"><Radio size={17} className="text-accent" aria-hidden /><strong>Live voice chat</strong><span className={`ml-auto text-xs ${phase === "live" ? "text-normal" : "text-muted"}`}>{phase === "live" ? "Connected" : phase === "connecting" ? "Connecting" : "Off"}</span></div>
    <p className="mt-2 text-xs leading-5 text-muted">Your microphone streams to Gemini through AttackTrace while this session is active. Voice can read current status; it cannot run controls or change incidents.</p>
    <p role="status" aria-atomic="true" className="mt-3 text-xs text-muted">{status}</p>
    <details className="live-voice-devices mt-3">
      <summary>Audio devices</summary>
      <div className="live-voice-device-grid">
        <label>Microphone
          <select value={voice.inputDeviceId} disabled={phase === "connecting" || phase === "live"} onChange={(event) => voice.update({ inputDeviceId: event.target.value })}>
            <option value="">System default</option>
            {devices.filter((device) => device.kind === "audioinput" && device.deviceId !== "default").map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}
          </select>
        </label>
        <label>Speaker
          <select value={voice.outputDeviceId} disabled={!outputSelectionSupported || phase === "connecting" || phase === "live"} onChange={(event) => voice.update({ outputDeviceId: event.target.value })}>
            <option value="">System default</option>
            {devices.filter((device) => device.kind === "audiooutput" && device.deviceId !== "default").map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Speaker ${index + 1}`}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-muted">End the chat to change devices.{!outputSelectionSupported ? " This browser uses your system speaker." : ""}</p>
    </details>
    <div className="mt-3 flex flex-wrap gap-2">
      {phase !== "live" && phase !== "connecting" ? <button type="button" className="live-voice-primary" onClick={() => void start()}><Mic size={16} />{canRetry ? "Reconnect" : "Start live chat"}</button> : <>
        <button type="button" className="live-voice-secondary" onClick={toggleMute} disabled={phase !== "live"}>{muted ? <MicOff size={16} /> : <Mic size={16} />}{muted ? "Unmute" : "Mute"}</button>
        <button type="button" className="live-voice-secondary" onClick={() => stop()}><Square size={14} />End chat</button>
      </>}
      {phase === "live" && <span className="inline-flex items-center gap-1 text-xs text-muted"><Volume2 size={14} />Gemini audio</span>}
    </div>
    {lines.length > 0 && <div role="log" aria-label="Live voice transcript" className="live-voice-transcript">{lines.map((line) => <p key={line.id}><strong>{line.speaker === "user" ? "You" : "Gemini"}:</strong> {line.text}</p>)}</div>}
  </section>;
}
