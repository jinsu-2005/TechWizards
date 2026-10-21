import { create } from "zustand";
import type { Incident, LiveMessage } from "./types";

export type VoiceSettings = {
  replySpeech: boolean;
  incidentBriefings: boolean;
  rate: number;
  voiceURI: string;
  speechProvider: "browser" | "openai";
  transcriptionProvider: "browser" | "openai";
  openaiVoice: string;
};

const defaults: VoiceSettings = {
  replySpeech: false,
  incidentBriefings: false,
  rate: 1,
  voiceURI: "",
  speechProvider: "browser",
  transcriptionProvider: "browser",
  openaiVoice: "coral",
};

function savedSettings(): VoiceSettings {
  try {
    const saved = JSON.parse(localStorage.getItem("attacktrace.voice.v1") ?? "{}");
    return { ...defaults, ...saved };
  } catch { return defaults; }
}

export const useVoice = create<VoiceSettings & { update: (change: Partial<VoiceSettings>) => void }>((set) => ({
  ...savedSettings(),
  update: (change) => set((old) => {
    const next = { ...old, ...change };
    localStorage.setItem("attacktrace.voice.v1", JSON.stringify({
      replySpeech: next.replySpeech, incidentBriefings: next.incidentBriefings,
      rate: next.rate, voiceURI: next.voiceURI, speechProvider: next.speechProvider,
      transcriptionProvider: next.transcriptionProvider, openaiVoice: next.openaiVoice,
    }));
    return next;
  }),
}));

export function conciseSpeech(markdown: string): string {
  return markdown.replace(/\[[^\]]+\]\([^)]*\)/g, "link")
    .replace(/[#*`_>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 360);
}

let currentAudio: HTMLAudioElement | null = null;
export function stopSpeech(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
  currentAudio?.pause();
  if (currentAudio) URL.revokeObjectURL(currentAudio.src);
  currentAudio = null;
}

export async function speak(text: string, options = useVoice.getState()): Promise<void> {
  const short = conciseSpeech(text);
  if (!short) return;
  stopSpeech();
  if (options.speechProvider === "openai") {
    const { synthesizeSpeech } = await import("./voiceApi");
    const blob = await synthesizeSpeech(short, options.openaiVoice);
    const audio = new Audio(URL.createObjectURL(blob));
    currentAudio = audio;
    audio.onended = () => { URL.revokeObjectURL(audio.src); if (currentAudio === audio) currentAudio = null; };
    await audio.play();
    return;
  }
  if (!("speechSynthesis" in window)) throw new Error("Speech output is unavailable in this browser.");
  const utterance = new SpeechSynthesisUtterance(short);
  const voice = window.speechSynthesis.getVoices().find((item) => item.voiceURI === options.voiceURI);
  if (voice) utterance.voice = voice;
  utterance.rate = Math.min(1.5, Math.max(0.7, options.rate));
  window.speechSynthesis.speak(utterance);
}

export function incidentBrief(incident: Incident, mode: LiveMessage["mode"]): string {
  const leading = incident.origin[0];
  const source = mode === "sim" ? "simulation" : mode === "hai" ? "HAI replay" : "connected monitoring";
  if (incident.status === "contained") return `Simulation incident contained. Review the recorded evidence before closing the case.`;
  if (incident.status === "closed") return `Incident closed in ${source}.`;
  if (incident.ambiguous || !leading) return `An anomaly was detected in ${source}. Its origin is uncertain. Open investigations to compare the evidence.`;
  return `An anomaly was detected in ${source}. ${leading.id} is the leading origin hypothesis, not a confirmed source. Review the evidence.`;
}

export type VoiceCommand = { kind: "navigate"; path: string; label: string } | { kind: "selectAsset"; asset: string } | { kind: "ask"; text: string };
const destinations: [RegExp, string, string][] = [
  [/\b(monitoring|dashboard|home|process graph|digital twin)\b/i, "/", "Monitoring"],
  [/\b(alerts?)\b/i, "/alerts", "Alerts"],
  [/\b(assets?)\b/i, "/assets", "Assets"],
  [/\b(investigations?|cases?|incidents?)\b/i, "/investigations", "Investigations"],
  [/\b(sources?)\b/i, "/sources", "Sources"],
  [/\b(metrics?)\b/i, "/metrics", "Metrics"],
  [/\b(local lab|lab)\b/i, "/lab", "Local lab"],
  [/\b(settings?|voice settings?)\b/i, "/settings", "Settings"],
];
export function parseVoiceCommand(text: string, assetIds: string[]): VoiceCommand {
  const normalized = text.trim();
  const navigation = /^(?:go to|open|show|navigate to)\s+(.+)$/i.exec(normalized);
  if (navigation) {
    const target = navigation[1];
    const asset = assetIds.find((id) => id.toLowerCase() === target.toLowerCase() || new RegExp(`\\b${id}\\b`, "i").test(target));
    if (asset) return { kind: "selectAsset", asset };
    const destination = destinations.find(([pattern]) => pattern.test(target));
    if (destination) return { kind: "navigate", path: destination[1], label: destination[2] };
  }
  return { kind: "ask", text: normalized };
}
