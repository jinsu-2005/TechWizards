/**
 * Web Audio API industrial alarm synthesizer. Zero-dependency, pure browser audio.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Two-tone industrial emergency siren (800Hz / 600Hz).
 */
export function playIncidentAlarm(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    // Tone oscillation
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(800, now + 0.15);
    osc.frequency.setValueAtTime(600, now + 0.16);
    osc.frequency.setValueAtTime(600, now + 0.35);
    osc.frequency.setValueAtTime(800, now + 0.36);
    osc.frequency.setValueAtTime(800, now + 0.55);
    osc.frequency.setValueAtTime(600, now + 0.56);
    osc.frequency.setValueAtTime(600, now + 0.75);

    // Filter to soften harshness
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, now);

    // Gain envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
    gain.gain.setValueAtTime(0.08, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.86);
  } catch {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}

/**
 * Harmonious ascending major chord chime on successful containment (C5 -> E5 -> G5 -> C6).
 */
export function playContainmentChime(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const start = now + idx * 0.08;
      const duration = 0.6;

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.09, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  } catch {
    // Ignore autoplay restriction
  }
}
