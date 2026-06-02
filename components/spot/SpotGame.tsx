"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_SPOT_SETTINGS,
  useSpotEngine,
  type SpotSettings,
} from "@/lib/spot/useSpotEngine";
import { SPOT_LEVELS } from "@/lib/spot/puzzles";
import { playSfx, unlockAudio, type SfxName } from "@/lib/audio/sfx";
import { startMusic, stopMusic } from "@/lib/audio/music";
import Confetti from "@/components/game/Confetti";
import SpotGrid from "./SpotGrid";

const TIMER_PRESETS = [10, 15, 20];

export default function SpotGame() {
  const [settings, setSettings] = useState<SpotSettings>(DEFAULT_SPOT_SETTINGS);
  const [autoPlay, setAutoPlay] = useState(false);
  const [recording, setRecording] = useState(false);
  const [intro, setIntro] = useState(false);
  const [introN, setIntroN] = useState(3);

  const onSfx = useCallback((n: SfxName) => playSfx(n, settings.soundOn), [settings.soundOn]);
  const engine = useSpotEngine(settings, { autoPlay, onSfx });
  const { phase } = engine;

  const patch = useCallback((p: Partial<SpotSettings>) => setSettings((s) => ({ ...s, ...p })), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const handleStart = useCallback(
    (asRecording: boolean) => {
      unlockAudio();
      if (asRecording) {
        setAutoPlay(true);
        setRecording(true);
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      }
      setIntroN(3);
      setIntro(true);
    },
    [],
  );

  const exitToSetup = useCallback(() => {
    setRecording(false);
    setIntro(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    engine.restart();
  }, [engine]);

  // Intro countdown → start the engine.
  useEffect(() => {
    if (!intro) return;
    if (introN <= 0) {
      const id = setTimeout(() => {
        setIntro(false);
        engine.start();
      }, 500);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      playSfx("tick", settings.soundOn);
      setIntroN((n) => n - 1);
    }, 850);
    return () => clearTimeout(id);
  }, [intro, introN, engine, settings.soundOn]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (phase === "idle" && !intro) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      switch (e.key) {
        case " ": e.preventDefault(); engine.togglePause(); break;
        case "ArrowLeft": engine.prev(); break;
        case "ArrowRight": engine.next(); break;
        case "r": case "R": case "Enter": engine.reveal(); break;
        case "s": case "S": playSfx("reveal", settings.soundOn); break;
        case "a": case "A": setAutoPlay((v) => !v); break;
        case "m": case "M": patch({ musicOn: !settings.musicOn }); break;
        case "f": case "F": toggleFullscreen(); break;
        case "h": case "H": setRecording((v) => !v); break;
        case "Escape": setRecording(false); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, intro, engine, settings.soundOn, settings.musicOn, patch, toggleFullscreen]);

  // Recording-mode body class.
  useEffect(() => {
    document.body.classList.toggle("recording-mode", recording);
    return () => document.body.classList.remove("recording-mode");
  }, [recording]);

  // Background music lifecycle.
  useEffect(() => {
    const active = settings.musicOn && (intro || phase === "question" || phase === "reveal");
    if (active) startMusic();
    else stopMusic();
  }, [settings.musicOn, intro, phase]);
  useEffect(() => () => stopMusic(), []);

  // URL auto-start (renderer / OBS): ?auto=1&level=Mudah&duration=12&count=10&music=1
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const q = new URLSearchParams(window.location.search);
    if ([...q.keys()].length === 0) return;
    const p: Partial<SpotSettings> = {};
    const lvl = q.get("level") ?? q.get("difficulty");
    if (lvl) p.levelKey = lvl;
    const dur = parseInt(q.get("duration") ?? "", 10);
    if (!Number.isNaN(dur)) p.durationSec = Math.max(3, dur);
    const cnt = parseInt(q.get("count") ?? "", 10);
    if (!Number.isNaN(cnt)) p.roundCount = Math.max(1, cnt);
    const order = q.get("order");
    if (order === "sequential" || order === "random") p.order = order;
    if (q.get("music") != null) p.musicOn = q.get("music") === "1";
    if (q.get("sound") != null) p.soundOn = q.get("sound") !== "0";
    if (Object.keys(p).length) setSettings((s) => ({ ...s, ...p }));
    if (q.get("auto") === "1") handleStart(true);
    else if (q.get("start") === "1") handleStart(false);
  }, [handleStart]);

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (intro) {
    return (
      <div className="ios relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-5 text-center" style={{ animation: "spring-in 0.5s" }}>
          <p className="text-2xl font-semibold text-[var(--ios-ink-soft)] md:text-3xl">Temukan yang Beda</p>
          <h1 className="display text-5xl text-[var(--ios-ink)] md:text-7xl">🔍 Siap?</h1>
          <div
            key={introN}
            className="ios-glass flex h-36 w-36 items-center justify-center rounded-full text-7xl font-extrabold text-[var(--ios-blue)] md:h-48 md:w-48 md:text-9xl"
            style={{ animation: "spring-in 0.4s" }}
          >
            {introN > 0 ? introN : "🎬"}
          </div>
          <p className="text-[var(--ios-ink-soft)]">Bersiap menemukan Baby Mo yang berbeda…</p>
        </div>
      </div>
    );
  }

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="ios relative min-h-[100dvh] w-full overflow-hidden px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <header className="text-center">
            <p className="text-xl font-semibold text-[var(--ios-ink-soft)] md:text-2xl">Baby Mo Quiz</p>
            <h1 className="display text-5xl text-[var(--ios-ink)] md:text-7xl">Temukan yang Beda 🔍</h1>
            <p className="mt-2 text-lg text-[var(--ios-ink-soft)] md:text-xl">
              Semua Baby Mo terlihat sama… tapi satu berbeda. Temukan secepat kilat!
            </p>
          </header>

          <div className="ios-glass flex flex-col gap-5 rounded-[2rem] p-5 md:p-7">
            <Field label="🎯 Tingkat Kesulitan">
              <div className="flex flex-wrap gap-2">
                {SPOT_LEVELS.map((l) => (
                  <Pill key={l.key} active={settings.levelKey === l.key} onClick={() => patch({ levelKey: l.key })}>
                    {l.key} · {l.cols}×{l.rows}
                  </Pill>
                ))}
              </div>
            </Field>

            <Field label="⏱️ Waktu per Soal">
              <div className="flex flex-wrap items-center gap-2">
                {TIMER_PRESETS.map((t) => (
                  <Pill key={t} active={settings.durationSec === t} onClick={() => patch({ durationSec: t })}>
                    {t}s
                  </Pill>
                ))}
                <input
                  type="number"
                  min={3}
                  max={120}
                  placeholder="Custom"
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v >= 3) patch({ durationSec: v });
                  }}
                  className="w-28 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[var(--ios-ink)]"
                />
              </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="🔀 Urutan">
                <div className="flex gap-2">
                  <Pill active={settings.order === "random"} onClick={() => patch({ order: "random" })}>🎲 Acak</Pill>
                  <Pill active={settings.order === "sequential"} onClick={() => patch({ order: "sequential" })}>📋 Urut</Pill>
                </div>
              </Field>
              <Field label={`🔢 Jumlah Soal: ${settings.roundCount}`}>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={settings.roundCount}
                  onChange={(e) => patch({ roundCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-[var(--ios-blue)]"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill active={settings.soundOn} onClick={() => patch({ soundOn: !settings.soundOn })}>
                {settings.soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}
              </Pill>
              <Pill active={settings.musicOn} onClick={() => patch({ musicOn: !settings.musicOn })}>
                {settings.musicOn ? "🎵 Musik ON" : "🎶 Musik OFF"}
              </Pill>
              <Pill active={autoPlay} onClick={() => setAutoPlay((v) => !v)}>
                {autoPlay ? "🤖 Auto-Play ON" : "🎬 Auto-Play OFF"}
              </Pill>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleStart(false)}
              className="flex-1 rounded-[1.6rem] bg-[var(--ios-blue)] px-6 py-4 text-2xl font-bold text-white shadow-lg transition-transform active:scale-95"
            >
              ▶️ Main Sekarang
            </button>
            <button
              onClick={() => handleStart(true)}
              className="flex-1 rounded-[1.6rem] bg-[var(--ios-pink)] px-6 py-4 text-xl font-bold text-white shadow-lg transition-transform active:scale-95"
            >
              🎥 Mulai Rekaman YouTube
            </button>
          </div>

          <div className="flex justify-center gap-3">
            <Link href="/" className="rounded-full bg-white/70 px-5 py-2 font-semibold text-[var(--ios-ink)] shadow-sm">🏠 Beranda</Link>
            <Link href="/play/" className="rounded-full bg-white/70 px-5 py-2 font-semibold text-[var(--ios-ink)] shadow-sm">🐠 Tebak Hewan</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE ────────────────────────────────────────────────────────────────
  if (phase === "complete") {
    const pct = engine.total > 0 ? Math.round((engine.score / engine.total) * 100) : 0;
    const title = `🔍 Temukan Baby Mo yang Beda! ${engine.total} Tantangan Seru | Baby Mo Quiz`;
    return (
      <div className="ios relative min-h-[100dvh] w-full overflow-hidden" data-testid="complete">
        <Confetti active count={120} />
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-5 px-5 py-10 text-center">
          <div className="text-7xl" style={{ animation: "spring-in 0.5s" }}>🎉</div>
          <h1 className="display text-5xl text-[var(--ios-ink)] md:text-7xl">Selesai!</h1>
          <div className="ios-glass rounded-[2rem] px-10 py-6">
            <p className="text-xl font-semibold text-[var(--ios-ink-soft)]">Skormu</p>
            <p className="display text-7xl text-[var(--ios-blue)] md:text-8xl">
              {engine.score}
              <span className="text-4xl text-[var(--ios-ink-soft)]">/{engine.total}</span>
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--ios-green)]">{pct}% benar</p>
          </div>

          <div className="hide-on-record ios-glass w-full rounded-[1.6rem] p-4 text-left">
            <p className="mb-1 font-bold text-[var(--ios-ink)]">📺 Judul YouTube</p>
            <p className="text-sm text-[var(--ios-ink-soft)]">{title}</p>
            <button
              onClick={() => navigator.clipboard?.writeText(title).catch(() => {})}
              className="mt-2 rounded-full bg-[var(--ios-blue)] px-4 py-1.5 text-sm font-semibold text-white"
            >
              📋 Salin
            </button>
          </div>

          <div className="hide-on-record flex flex-wrap justify-center gap-3">
            <button onClick={() => handleStart(recording)} className="rounded-[1.4rem] bg-[var(--ios-green)] px-6 py-3 text-xl font-bold text-white shadow-lg active:scale-95">🔁 Main Lagi</button>
            <button onClick={exitToSetup} className="rounded-[1.4rem] bg-white/80 px-6 py-3 text-lg font-bold text-[var(--ios-ink)] shadow active:scale-95">⚙️ Pengaturan</button>
            <Link href="/" className="rounded-[1.4rem] bg-white/80 px-6 py-3 text-lg font-bold text-[var(--ios-ink)] shadow active:scale-95">🏠 Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  const round = engine.current!;
  const revealed = phase === "reveal";
  const secs = Math.ceil(engine.remaining);
  const frac = settings.durationSec > 0 ? Math.max(0, engine.remaining / settings.durationSec) : 0;
  const barColor = frac > 0.6 ? "var(--ios-green)" : frac > 0.3 ? "var(--ios-amber)" : "var(--ios-pink)";

  return (
    <div className="ios relative flex h-[100dvh] w-full flex-col overflow-hidden">
      <Confetti active={revealed} />

      {/* TOP — prompt + level + timer */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pt-3 md:px-6">
        <div className="min-w-0">
          <h1 className="display truncate text-2xl text-[var(--ios-ink)] sm:text-3xl md:text-4xl">
            {round.puzzle.emoji} {round.puzzle.title}
          </h1>
          <p className="text-sm font-semibold text-[var(--ios-ink-soft)] md:text-base">
            Temukan Baby Mo yang berbeda! 🔍
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="ios-glass rounded-full px-3 py-1 text-sm font-bold text-[var(--ios-ink)] md:text-base">
            {settings.levelKey}
          </span>
          <span
            className="ios-glass flex items-center gap-1 rounded-full px-3 py-1 text-lg font-extrabold tabular-nums md:text-2xl"
            style={{ color: barColor, transform: secs <= 5 && !engine.paused ? "scale(1.08)" : "scale(1)" }}
          >
            ⏱️ {engine.paused ? "⏸" : secs}
          </span>
          <span className="ios-glass rounded-full px-3 py-1 text-sm font-bold text-[var(--ios-blue)] md:text-base">
            {Math.min(engine.index + 1, engine.total)}/{engine.total}
          </span>
        </div>
      </header>

      {/* CENTER — grid */}
      <main className="flex min-h-0 flex-1 items-center justify-center px-3 py-2 md:px-8 md:py-3">
        <SpotGrid
          round={round}
          revealed={revealed}
          picked={engine.picked}
          wrongPick={engine.wrongPick}
          interactive={!autoPlay}
          onPick={engine.pick}
        />
      </main>

      {/* REVEAL banner */}
      {revealed && (
        <div className="px-4 pb-1 md:px-6">
          <div
            className="ios-glass mx-auto flex max-w-3xl items-center gap-3 rounded-[1.4rem] px-4 py-3"
            style={{ animation: "spring-in 0.4s" }}
          >
            <span className="text-3xl md:text-4xl">{engine.found ? "🎯" : "👀"}</span>
            <div className="min-w-0">
              <p className="display text-xl text-[var(--ios-green)] md:text-2xl">
                {engine.found ? "Ketemu! Hebat! 🎉" : "Itu dia Baby Mo yang beda!"}
              </p>
              <p className="text-sm text-[var(--ios-ink-soft)] md:text-base">💡 {round.puzzle.funFact}</p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM — progress bar (extra bottom padding clears the floating controls) */}
      <footer className="shrink-0 px-4 pb-16 md:px-8 md:pb-20">
        <div className="mx-auto h-4 max-w-4xl overflow-hidden rounded-full bg-black/10 md:h-6">
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${frac * 100}%`, background: barColor, boxShadow: `0 0 14px ${barColor}` }}
          />
        </div>
      </footer>

      {/* CONTROLS */}
      <div className="hide-on-record absolute inset-x-0 bottom-3 z-40 flex justify-center px-2">
        <div className="ios-glass flex flex-wrap items-center justify-center gap-1.5 rounded-full px-2 py-1.5">
          <Ctrl label="Prev (←)" onClick={engine.prev}>⏮️</Ctrl>
          <Ctrl label="Jeda (Spasi)" onClick={engine.togglePause} accent>{engine.paused ? "▶️" : "⏸️"}</Ctrl>
          <Ctrl label="Jawab (R)" onClick={engine.reveal} disabled={phase !== "question"}>👁️</Ctrl>
          <Ctrl label="Next (→)" onClick={engine.next}>⏭️</Ctrl>
          <Ctrl label="Auto (A)" onClick={() => setAutoPlay((v) => !v)} accent={autoPlay}>{autoPlay ? "🤖" : "🎬"}</Ctrl>
          <Ctrl label="Musik (M)" onClick={() => patch({ musicOn: !settings.musicOn })} accent={settings.musicOn}>{settings.musicOn ? "🎵" : "🎶"}</Ctrl>
          <Ctrl label="Suara" onClick={() => patch({ soundOn: !settings.soundOn })}>{settings.soundOn ? "🔊" : "🔇"}</Ctrl>
          <Ctrl label="Layar Penuh (F)" onClick={toggleFullscreen}>⛶</Ctrl>
          <Ctrl label="Sembunyikan (H)" onClick={() => setRecording(true)}>🙈</Ctrl>
          <Ctrl label="Keluar" onClick={exitToSetup}>✖️</Ctrl>
        </div>
      </div>

      {recording && (
        <button
          onClick={() => setRecording(false)}
          className="absolute right-2 top-2 z-50 rounded-full bg-black/20 px-3 py-1 text-xs text-black/50"
        >
          Esc
        </button>
      )}
    </div>
  );
}

// ── small UI helpers ──────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-lg font-bold text-[var(--ios-ink)] md:text-xl">{label}</h3>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-base font-semibold shadow-sm transition-transform active:scale-95 md:text-lg"
      style={{
        background: active ? "var(--ios-blue)" : "rgba(255,255,255,0.7)",
        color: active ? "#fff" : "var(--ios-ink)",
      }}
    >
      {children}
    </button>
  );
}

function Ctrl({
  children,
  onClick,
  label,
  accent = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition-transform active:scale-90 disabled:opacity-40"
      style={{ background: accent ? "var(--ios-blue)" : "rgba(255,255,255,0.65)" }}
    >
      {children}
    </button>
  );
}
