/** PCM helpers for Gemini Live voice: 16 kHz mic capture out, 24 kHz playback in. */
export function pcm16(input: Float32Array, sampleRate: number, phase: { value: number }): ArrayBuffer {
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

export function playPcm(
  bytes: ArrayBuffer,
  context: AudioContext,
  timeline: { next: number; sources: AudioBufferSourceNode[] },
  outputNode: AudioNode,
  onEnded: () => void,
): void {
  if (bytes.byteLength < 2 || bytes.byteLength % 2) return;
  const samples = bytes.byteLength / 2;
  const buffer = context.createBuffer(1, samples, 24000);
  const channel = buffer.getChannelData(0);
  const view = new DataView(bytes);
  for (let index = 0; index < samples; index++) channel[index] = view.getInt16(index * 2, true) / 32768;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(outputNode);
  source.onended = () => {
    timeline.sources = timeline.sources.filter((item) => item !== source);
    if (timeline.sources.length === 0) onEnded();
  };
  timeline.next = Math.max(timeline.next, context.currentTime + 0.04);
  source.start(timeline.next);
  timeline.next += buffer.duration;
  timeline.sources.push(source);
}

