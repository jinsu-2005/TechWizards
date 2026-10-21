// AudioWorklet keeps microphone capture off the UI thread. The main thread
// resamples these small batches to Gemini's 16 kHz PCM format.
class VoiceCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.batch = new Float32Array(2048);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (output) output.fill(0);
    if (!input) return true;
    for (let index = 0; index < input.length; index += 1) {
      this.batch[this.offset] = input[index];
      this.offset += 1;
      if (this.offset === this.batch.length) {
        this.port.postMessage(this.batch.buffer, [this.batch.buffer]);
        this.batch = new Float32Array(2048);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor("voice-capture-processor", VoiceCaptureProcessor);
