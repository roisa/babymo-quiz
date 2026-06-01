// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — background music.
//
// A gentle, looping, kid-friendly tune synthesized with the Web Audio API, so
// it ships with zero audio files. Uses a lookahead scheduler (the standard
// Web Audio pattern) so the loop stays rock-steady regardless of frame rate,
// and sits at a low volume so it never fights a voiceover.
// ───────────────────────────────────────────────────────────────────────────

import { getAudioContext } from "./sfx";

// A bright, bouncy C-major pentatonic motif (frequencies in Hz). `null` = rest.
const MELODY: (number | null)[] = [
  523, 587, 659, 784, 659, 587, 523, null,
  587, 659, 784, 880, 784, 659, 587, null,
  659, 784, 880, 1047, 880, 784, 659, null,
  784, 659, 587, 523, 587, 659, 523, null,
];

// Soft bass notes under every 4 melody steps (root of the little chord walk).
const BASS: number[] = [131, 147, 165, 131];

const STEP_SEC = 0.26; // duration of one melody step
const LOOKAHEAD_MS = 90; // scheduler wake interval
const SCHEDULE_AHEAD = 0.25; // seconds of audio to schedule in advance

class BackgroundMusic {
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  private playing = false;

  get isPlaying(): boolean {
    return this.playing;
  }

  start(volume = 0.05): void {
    const ctx = getAudioContext();
    if (!ctx || this.playing) return;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    // Fade in so it doesn't pop.
    this.master.gain.setValueAtTime(0, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);

    this.step = 0;
    this.nextTime = ctx.currentTime + 0.1;
    this.playing = true;
    this.timer = setInterval(() => this.schedule(), LOOKAHEAD_MS);
  }

  stop(): void {
    const ctx = getAudioContext();
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    if (this.master && ctx) {
      const m = this.master;
      // Fade out, then disconnect.
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => m.disconnect(), 500);
    }
    this.master = null;
  }

  /** Schedule any notes that fall within the lookahead window. */
  private schedule(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.master) return;

    while (this.nextTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const note = MELODY[this.step % MELODY.length];
      if (note) this.playNote(ctx, note, this.nextTime, STEP_SEC * 0.9, "triangle", 0.5);

      // Bass on every 4th step.
      if (this.step % 4 === 0) {
        const bass = BASS[Math.floor(this.step / 4) % BASS.length]!;
        this.playNote(ctx, bass, this.nextTime, STEP_SEC * 3.6, "sine", 0.6);
      }

      this.nextTime += STEP_SEC;
      this.step++;
    }
  }

  private playNote(
    ctx: AudioContext,
    freq: number,
    at: number,
    dur: number,
    type: OscillatorType,
    gain: number,
  ): void {
    if (!this.master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }
}

// Module-level singleton.
const music = new BackgroundMusic();

export function startMusic(volume?: number): void {
  music.start(volume);
}
export function stopMusic(): void {
  music.stop();
}
export function isMusicPlaying(): boolean {
  return music.isPlaying;
}
