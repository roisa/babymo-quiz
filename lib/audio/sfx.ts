// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — sound effects.
//
// Fully synthesized with the Web Audio API so the app ships with ZERO audio
// files (nothing to host, nothing to break on GitHub Pages). Each cue is a
// short, bright, kid-friendly blip designed to sit nicely under a voiceover.
// ───────────────────────────────────────────────────────────────────────────

export type SfxName = "tick" | "correct" | "wrong" | "reveal" | "complete" | "whoosh";

type Tone = {
  freq: number;
  start: number; // seconds, relative to play time
  dur: number;
  type?: OscillatorType;
  gain?: number;
  /** Optional linear ramp target for a little "swoop". */
  toFreq?: number;
};

const RECIPES: Record<SfxName, Tone[]> = {
  // Soft clock tick for the final seconds.
  tick: [{ freq: 880, start: 0, dur: 0.05, type: "square", gain: 0.12 }],
  // Happy ascending arpeggio.
  correct: [
    { freq: 523, start: 0, dur: 0.12, gain: 0.18 },
    { freq: 659, start: 0.1, dur: 0.12, gain: 0.18 },
    { freq: 784, start: 0.2, dur: 0.18, gain: 0.2 },
  ],
  // Gentle "oops" — descending, never harsh for kids.
  wrong: [
    { freq: 311, start: 0, dur: 0.18, type: "sawtooth", gain: 0.14, toFreq: 233 },
  ],
  // Sparkly reveal shimmer.
  reveal: [
    { freq: 659, start: 0, dur: 0.1, gain: 0.16 },
    { freq: 988, start: 0.08, dur: 0.1, gain: 0.16 },
    { freq: 1319, start: 0.16, dur: 0.22, gain: 0.18 },
  ],
  // Triumphant little fanfare for level complete.
  complete: [
    { freq: 523, start: 0, dur: 0.14, gain: 0.2 },
    { freq: 659, start: 0.13, dur: 0.14, gain: 0.2 },
    { freq: 784, start: 0.26, dur: 0.14, gain: 0.2 },
    { freq: 1047, start: 0.39, dur: 0.32, gain: 0.22 },
  ],
  // Transition swoosh between questions.
  whoosh: [{ freq: 200, start: 0, dur: 0.22, type: "sine", gain: 0.14, toFreq: 900 }],
};

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers suspend audio until a user gesture; resume on demand.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Must be called from a user gesture (e.g. the "Start" click) to unlock audio. */
export function unlockAudio(): void {
  getCtx();
}

export function playSfx(name: SfxName, enabled = true): void {
  if (!enabled) return;
  const audio = getCtx();
  if (!audio) return;

  const master = audio.createGain();
  master.gain.value = 0.9;
  master.connect(audio.destination);

  const now = audio.currentTime;
  for (const tone of RECIPES[name]) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = tone.type ?? "triangle";
    osc.frequency.setValueAtTime(tone.freq, now + tone.start);
    if (tone.toFreq) {
      osc.frequency.linearRampToValueAtTime(tone.toFreq, now + tone.start + tone.dur);
    }
    // Quick attack, smooth exponential release — no clicks.
    const peak = tone.gain ?? 0.18;
    g.gain.setValueAtTime(0.0001, now + tone.start);
    g.gain.exponentialRampToValueAtTime(peak, now + tone.start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(now + tone.start);
    osc.stop(now + tone.start + tone.dur + 0.02);
  }
}
