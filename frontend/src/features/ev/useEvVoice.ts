import { useCallback, useEffect, useRef, useState } from "react";
import { pcm16, playPcm } from "../../lib/pcmAudio";
import { setLiveConversationActive, stopSpeech, useVoice } from "../../lib/voice";
import { evSessionId, useEv } from "./store";

export type EvVoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "muted";
export interface VoiceLine { speaker: "user" | "assistant"; text: string }

type ServerEvent =
  | { type: "ready"; model: string; max_seconds: number }
  | { type: "transcript"; speaker: "user" | "assistant"; text: string }
  | { type: "interrupted" | "turn_complete" }
  | { type: "session_end"; reason: string }
  | { type: "error"; message: string };

const DEMO_KEY = (import.meta.env.VITE_API_KEY as string | undefined) ?? "";

/** Live voice for the EV pilot. Same socket as the water-plant pilot, EV mode (read-only EV tools). */
export function useEvVoice(selected: string, onEnd?: (lines: VoiceLine[]) => void) {
  const settings = useVoice();
  const [state, setState] = useState<EvVoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const media = useRef<MediaStream | null>(null);
  const node = useRef<AudioWorkletNode | null>(null);
  const timeline = useRef({ next: 0, sources: [] as AudioBufferSourceNode[] });
  const muted = useRef(false);
  const stopped = useRef(true);
  const linesRef = useRef<VoiceLine[]>([]);
  const turnDone = useRef(true);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  const stop = useCallback((message: string | null = null) => {
    const had = !stopped.current;
    stopped.current = true;
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "stop" }));
    ws.current?.close(); ws.current = null;
    if (node.current) node.current.port.onmessage = null;
    node.current?.disconnect(); node.current = null;
    media.current?.getTracks().forEach((t) => t.stop()); media.current = null;
    timeline.current.sources.forEach((s) => { try { s.stop(); } catch { /* ended */ } });
    timeline.current = { next: 0, sources: [] };
    void ctx.current?.close(); ctx.current = null;
    stopSpeech(); setLiveConversationActive(false);
    muted.current = false;
    setState("idle");
    if (message) setError(message);
    if (had && linesRef.current.length) endRef.current?.(linesRef.current);
  }, []);

  useEffect(() => () => stop(), [stop]);
  // Keep the pilot's read_ev_status focused on the component the user is inspecting.
  useEffect(() => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "select", id: selected }));
  }, [selected]);

  const start = useCallback(async () => {
    if (!stopped.current) return;
    stopped.current = false; setError(null); setLines([]); linesRef.current = []; setState("connecting");
    setLiveConversationActive(true); stopSpeech();
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || typeof AudioWorkletNode === "undefined") throw new Error("Voice needs a modern browser on a secure origin.");
      const audio = new AudioContext(); ctx.current = audio; await audio.resume();
      const out = audio.createAnalyser(); out.fftSize = 64; out.connect(audio.destination);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: settings.inputDeviceId ? { exact: settings.inputDeviceId } : undefined, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (stopped.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      media.current = stream;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host.endsWith(".vercel.app") ? "techwizards.onrender.com" : window.location.host;
      const socket = new WebSocket(`${protocol}//${host}/ws/voice`);
      ws.current = socket; socket.binaryType = "arraybuffer";
      socket.onopen = () => socket.send(JSON.stringify({ type: "start", mode: "ev", ev_session: evSessionId(), selected, voice: settings.geminiVoice, history: [], ...(DEMO_KEY ? { api_key: DEMO_KEY } : {}) }));
      socket.onmessage = (event: MessageEvent) => {
        if (stopped.current || ws.current !== socket) return;
        if (event.data instanceof ArrayBuffer) {
          setState(muted.current ? "muted" : "speaking");
          playPcm(event.data, audio, timeline.current, out, () => setState(muted.current ? "muted" : "listening"));
          return;
        }
        let msg: ServerEvent;
        try { msg = JSON.parse(String(event.data)) as ServerEvent; } catch { return; }
        if (msg.type === "ready") {
          void (async () => {
            await audio.audioWorklet.addModule(`${import.meta.env.BASE_URL}voice-capture-processor.js`);
            if (stopped.current) return;
            const source = audio.createMediaStreamSource(stream);
            const worklet = new AudioWorkletNode(audio, "voice-capture-processor");
            const phase = { value: 0 };
            worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
              if (muted.current || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > 256000) return;
              socket.send(pcm16(new Float32Array(e.data), audio.sampleRate, phase));
            };
            source.connect(worklet); worklet.connect(audio.destination); node.current = worklet;
            setState("listening");
          })().catch(() => stop("Microphone processing could not start."));
        } else if (msg.type === "transcript") {
          // Chunks carry their own spacing; a finished pilot turn starts a new line.
          const last = linesRef.current[linesRef.current.length - 1];
          const continues = last?.speaker === msg.speaker && !(msg.speaker === "assistant" && turnDone.current);
          if (last && continues) last.text = `${last.text}${msg.text}`.replace(/\s+/g, " ");
          else linesRef.current = [...linesRef.current, { speaker: msg.speaker, text: msg.text.trim() }].slice(-12);
          if (msg.speaker === "assistant") turnDone.current = false;
          setLines([...linesRef.current].map((l) => ({ ...l })));
          const line = linesRef.current[linesRef.current.length - 1];
          if (msg.speaker === "assistant" && line) useEv.getState().showCaption(line.text.trim(), 8000, true);
          if (msg.speaker === "user") setState("thinking");
        } else if (msg.type === "turn_complete") {
          turnDone.current = true;
          const line = linesRef.current[linesRef.current.length - 1];
          if (line?.speaker === "assistant") useEv.getState().showCaption(line.text.trim(), 3500, true);
        } else if (msg.type === "interrupted") {
          timeline.current.sources.forEach((s) => { try { s.stop(); } catch { /* ended */ } });
          timeline.current = { next: 0, sources: [] };
          setState(muted.current ? "muted" : "listening");
        } else if (msg.type === "session_end") stop("Session limit reached.");
        else if (msg.type === "error") stop(msg.message);
      };
      socket.onclose = () => { if (!stopped.current && ws.current === socket) stop("Voice connection lost."); };
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      stop(name === "NotAllowedError" ? "Microphone access is blocked." : name === "NotFoundError" ? "No microphone found." : e instanceof Error ? e.message : "Voice unavailable.");
    }
  }, [selected, settings.geminiVoice, settings.inputDeviceId, stop]);

  const toggleMute = useCallback(() => {
    muted.current = !muted.current;
    setState(muted.current ? "muted" : "listening");
    if (muted.current && ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "audio_end" }));
  }, []);

  // Ask the live pilot to announce a new detection; the server builds the words from evidence.
  const announce = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify({ type: "incident" }));
  }, []);

  return { state, error, lines, start, stop: () => stop(), toggleMute, announce, live: state !== "idle" };
}
