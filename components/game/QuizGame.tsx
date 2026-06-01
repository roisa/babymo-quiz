"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_SETTINGS,
  type Category,
  type Difficulty,
  type QuizSettings,
} from "@/lib/engine/types";
import { useQuizEngine } from "@/lib/engine/useQuizEngine";
import { playSfx, unlockAudio, type SfxName } from "@/lib/audio/sfx";
import OceanBackground from "./OceanBackground";
import Confetti from "./Confetti";
import DifficultyPanel from "./DifficultyPanel";
import BrandSidebar from "./BrandSidebar";
import AnimalCard from "./AnimalCard";
import AnswerChoices from "./AnswerChoices";
import RevealOverlay from "./RevealOverlay";
import CountdownBar from "./CountdownBar";
import ControlBar from "./ControlBar";
import SetupPanel from "./SetupPanel";
import YouTubePanel from "./YouTubePanel";
import Mascot from "./Mascot";

export default function QuizGame({ category }: { category: Category }) {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [autoPlay, setAutoPlay] = useState(false);
  const [recording, setRecording] = useState(false); // "hide controls" mode
  const stageRef = useRef<HTMLDivElement>(null);

  const onSfx = useCallback(
    (name: SfxName) => playSfx(name, settings.soundOn),
    [settings.soundOn],
  );

  const engine = useQuizEngine(category, settings, { autoPlay, onSfx });
  const { phase } = engine;

  const patchSettings = useCallback(
    (patch: Partial<QuizSettings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const handleStart = useCallback(
    (asRecording: boolean) => {
      unlockAudio(); // user gesture — unlock Web Audio for SFX
      if (asRecording) {
        setAutoPlay(true);
        setRecording(true);
        enterFullscreen();
      }
      engine.start();
    },
    [engine, enterFullscreen],
  );

  const exitToSetup = useCallback(() => {
    setRecording(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    engine.restart();
  }, [engine]);

  // ── Keyboard shortcuts (active during play) ──────────────────────────────
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          engine.togglePause();
          break;
        case "ArrowLeft":
          engine.prev();
          break;
        case "ArrowRight":
          engine.next();
          break;
        case "r":
        case "R":
        case "Enter":
          engine.reveal();
          break;
        case "s":
        case "S":
          playSfx("reveal", settings.soundOn);
          break;
        case "a":
        case "A":
          setAutoPlay((v) => !v);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "h":
        case "H":
          setRecording((v) => !v);
          break;
        case "Escape":
          setRecording(false);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, engine, settings.soundOn, toggleFullscreen]);

  // Apply the recording-mode body class (hides cursor + controls).
  useEffect(() => {
    document.body.classList.toggle("recording-mode", recording);
    return () => document.body.classList.remove("recording-mode");
  }, [recording]);

  // ── SETUP ────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <OceanBackground />
        <SetupPanel
          category={category}
          settings={settings}
          autoPlay={autoPlay}
          onChange={patchSettings}
          onAutoPlayChange={setAutoPlay}
          onStart={handleStart}
        />
      </div>
    );
  }

  // ── COMPLETE ──────────────────────────────────────────────────────────────
  if (phase === "complete") {
    const pct = engine.total > 0 ? Math.round((engine.score / engine.total) * 100) : 0;
    return (
      <div className="relative min-h-[100dvh] w-full overflow-hidden">
        <OceanBackground />
        <Confetti active count={120} />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-5 text-center">
          <Mascot size={140} mood="cheer" />
          <h1 className="display text-5xl text-sunny text-stroke md:text-7xl">Selesai! 🎉</h1>
          <div className="glass rounded-3xl border-2 border-white/30 px-8 py-5">
            <p className="display text-2xl text-foam md:text-3xl">Skormu</p>
            <p className="display text-6xl text-sunny text-stroke md:text-8xl">
              {engine.score}
              <span className="text-3xl text-foam/80 md:text-5xl">/{engine.total}</span>
            </p>
            <p className="display mt-1 text-xl text-aqua md:text-2xl">{pct}% benar</p>
          </div>

          <YouTubePanel category={category} items={engine.pool} difficulty={settings.difficulty} />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleStart(recording)}
              className="display rounded-3xl border-4 border-[#1b7a44] bg-[var(--color-easy)] px-6 py-3 text-2xl text-deep transition-transform active:scale-95"
              style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
            >
              🔁 Main Lagi
            </button>
            <button
              type="button"
              onClick={exitToSetup}
              className="display rounded-3xl border-4 border-white/30 bg-white/15 px-6 py-3 text-xl text-foam transition-transform active:scale-95"
            >
              ⚙️ Ubah Pengaturan
            </button>
            <Link
              href="/"
              className="display rounded-3xl border-4 border-white/30 bg-white/15 px-6 py-3 text-xl text-foam transition-transform active:scale-95"
            >
              🏠 Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────
  const revealed = phase === "reveal";
  const current = engine.current!;
  const showChoices = settings.answerMode === "multiple-choice";

  return (
    <div ref={stageRef} className="relative h-[100dvh] w-full overflow-hidden">
      <OceanBackground />
      <Confetti active={revealed} />

      <div className="relative z-10 flex h-full flex-col gap-2 p-3 md:p-5">
        {/* TOP — headline */}
        <header className="flex shrink-0 items-center justify-center gap-3 text-center">
          <h1 className="display text-3xl text-sunny text-stroke sm:text-5xl md:text-6xl">
            {category.headline}
          </h1>
          <span
            className="display rounded-full px-3 py-1 text-sm md:text-base"
            style={{ background: difficultyColor(settings.difficulty), color: "#03204a" }}
          >
            {settings.difficulty}
          </span>
        </header>

        {/* MIDDLE — left panel / center / right brand */}
        <div className="flex min-h-0 flex-1 gap-3 md:gap-5">
          <aside className="hide-on-record hidden w-[16%] min-w-[130px] shrink-0 sm:block">
            <DifficultyPanel value={settings.difficulty} onChange={() => {}} disabled />
          </aside>

          <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <AnimalCard animal={current} mode={settings.answerMode} revealed={revealed} />
            </div>
            {showChoices && (
              <div className="w-full max-w-3xl shrink-0">
                <AnswerChoices
                  animal={current}
                  choices={engine.choices}
                  selected={engine.selected}
                  revealed={revealed}
                  onSelect={engine.selectAnswer}
                />
              </div>
            )}
            {revealed && (
              <div className="w-full max-w-3xl shrink-0">
                <RevealOverlay animal={current} />
              </div>
            )}
          </main>

          <aside className="hidden w-[11%] min-w-[96px] shrink-0 sm:block">
            <BrandSidebar score={engine.score} total={engine.total} index={engine.index} />
          </aside>
        </div>

        {/* BOTTOM — countdown */}
        <footer className="shrink-0">
          <CountdownBar remaining={engine.remaining} duration={settings.durationSec} paused={engine.paused} />
        </footer>
      </div>

      {/* Floating creator controls (hidden while recording) */}
      <div className="absolute inset-x-0 bottom-2 z-40 flex justify-center px-2">
        <ControlBar
          phase={phase}
          paused={engine.paused}
          autoPlay={autoPlay}
          soundOn={settings.soundOn}
          onTogglePause={engine.togglePause}
          onPrev={engine.prev}
          onNext={engine.next}
          onReveal={engine.reveal}
          onReplaySound={() => playSfx("reveal", settings.soundOn)}
          onToggleAuto={() => setAutoPlay((v) => !v)}
          onToggleSound={() => patchSettings({ soundOn: !settings.soundOn })}
          onToggleFullscreen={toggleFullscreen}
          onHideControls={() => setRecording(true)}
          onExit={exitToSetup}
        />
      </div>

      {/* In recording mode, a tiny hint to bring controls back. */}
      {recording && (
        <button
          type="button"
          onClick={() => setRecording(false)}
          className="absolute right-2 top-2 z-50 rounded-full bg-black/30 px-3 py-1 text-xs text-white/60"
          aria-label="Tampilkan kontrol (Esc)"
        >
          Esc
        </button>
      )}
    </div>
  );
}

function difficultyColor(d: Difficulty | "Semua"): string {
  switch (d) {
    case "Mudah":
      return "var(--color-easy)";
    case "Sedang":
      return "var(--color-medium)";
    case "Sulit":
      return "var(--color-hard)";
    case "Mustahil":
      return "var(--color-extreme)";
    default:
      return "var(--color-aqua)";
  }
}
