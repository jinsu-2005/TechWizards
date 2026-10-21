import { csrfHeaders } from "./csrf";

const KEY = (import.meta.env.VITE_API_KEY as string | undefined) ?? "";
const headers = () => ({ ...csrfHeaders(), ...(KEY ? { "x-api-key": KEY } : {}) });
async function check(response: Response): Promise<Response> {
  if (response.ok) return response;
  let detail = `Voice service returned ${response.status}`;
  try { const body = await response.json() as { detail?: string }; detail = body.detail ?? detail; } catch { /* use status */ }
  throw new Error(detail);
}
export interface VoiceModelStatus { preferred: string; active: string | null; available: string[]; cooldown: Record<string, { reason: string; retry_in_s: number }> }
export interface VoiceCapabilities { gemini_available: boolean; transcription_model: string | null; speech_models: string[]; voices: string[]; models?: Record<"text" | "live" | "transcription" | "tts", VoiceModelStatus> }
export async function getVoiceCapabilities(): Promise<VoiceCapabilities> {
  const response = await check(await fetch("/api/voice/capabilities"));
  return response.json() as Promise<VoiceCapabilities>;
}
export async function transcribeAudio(audio: Blob): Promise<string> {
  const response = await check(await fetch("/api/voice/transcribe", {
    method: "POST", headers: { ...headers(), "content-type": audio.type.split(";")[0] ?? audio.type }, body: audio,
  }));
  return (await response.json() as { text: string }).text;
}
export async function synthesizeSpeech(text: string, voice: string, model: string): Promise<Blob> {
  const response = await check(await fetch("/api/voice/speak", {
    method: "POST", headers: { ...headers(), "content-type": "application/json" }, body: JSON.stringify({ text, voice, model }),
  }));
  return response.blob();
}
