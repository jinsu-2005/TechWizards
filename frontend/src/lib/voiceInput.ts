import { transcribeAudio } from "./voiceApi";

type RecognitionResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionLike = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((event: RecognitionResult) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type RecognitionConstructor = new () => RecognitionLike;

export function browserRecognitionAvailable(): boolean {
  const target = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return Boolean(target.SpeechRecognition || target.webkitSpeechRecognition);
}

export function isUnsupportedScript(text: string): boolean {
  // Non-Tamil Indic and foreign scripts (Devanagari, Telugu, Kannada, Malayalam, Arabic, Cyrillic, CJK)
  return /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF]/.test(text);
}

export function startBrowserRecognition(onText: (text: string) => void, onError: (message: string) => void, onEnd: () => void): () => void {
  const target = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  const Constructor = target.SpeechRecognition || target.webkitSpeechRecognition;
  if (!Constructor) throw new Error("Speech recognition is unavailable in this browser. Set up server transcription in Settings.");
  const recognition = new Constructor();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const raw = event.results[0]?.[0]?.transcript?.trim() ?? "";
    if (isUnsupportedScript(raw)) {
      onError("Please speak in English or Tamil.");
      return;
    }
    onText(raw);
  };
  recognition.onerror = (event) => onError(`Microphone recognition failed: ${event.error}`);
  recognition.onend = onEnd;
  recognition.start();
  return () => recognition.stop();
}

export async function startServerRecording(onText: (text: string) => void, onError: (message: string) => void, onEnd: () => void): Promise<() => void> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Audio recording is unavailable in this browser.");
  const mime = ["audio/webm", "audio/mp4", "audio/ogg"].find((candidate) => MediaRecorder.isTypeSupported(candidate));
  if (!mime) throw new Error("This browser has no supported recording format.");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  let cancelled = false;
  const timeout = window.setTimeout(() => recorder.state === "recording" && recorder.stop(), 15000);
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    window.clearTimeout(timeout); stream.getTracks().forEach((track) => track.stop()); onEnd();
    if (!cancelled && chunks.length) void transcribeAudio(new Blob(chunks, { type: mime })).then(onText).catch((error: unknown) => onError(String(error)));
  };
  recorder.start();
  return () => { if (recorder.state === "recording") recorder.stop(); else { cancelled = true; stream.getTracks().forEach((track) => track.stop()); } };
}
