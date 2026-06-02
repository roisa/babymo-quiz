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
import { startMusic, stopMusic } from "@/lib/audio/music";
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
import IntroCard from "./IntroCard";
import OutroCard from "./OutroCard";
import BabyMoLogo from "@/components/BabyMoLogo";

export default function QuizGame({ category }: { category: Category }) {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [autoPlay, setAutoPlay] = useState(false);
  const [recording, setRecording] = useState(false); // "hide controls" mode
  const [intro, setIntro] = useState(false); // showing the title / countdown card
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
      // Roll the branded intro / countdown card; it starts the engine on done.
      setIntro(true);
    },
    [enterFullscreen],
  );

  const finishIntro = useCallback(() => {
    setIntro(false);
    engine.start();
  }, [engine]);

  const exitToSetup = useCallback(() => {
    setRecording(false);
    setIntro(false);
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
        case "m":
        case "M":
          patchSettings({ musicOn: !settings.musicOn });
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
  }, [phase, engine, settings.soundOn, settings.musicOn, patchSettings, toggleFullscreen]);

  // Apply the recording-mode body class (hides cursor + controls).
  useEffect(() => {
    document.body.classList.toggle("recording-mode", recording);
    return () => document.body.classList.remove("recording-mode");
  }, [recording]);

  // Background music follows the play lifecycle + the toggle. startMusic() is
  // idempotent, so re-running across phase changes never restarts the loop.
  useEffect(() => {
    const active = settings.musicOn && (intro || phase === "question" || phase === "reveal");
    if (active) startMusic();
    else stopMusic();
  }, [settings.musicOn, intro, phase]);
  useEffect(() => () => stopMusic(), []); // stop on unmount

  // URL-param auto-start: lets the render script and OBS launch a fully
  // configured session hands-free, e.g.
  //   /play/sea-animals/?auto=1&difficulty=Mudah&mode=silhouette&duration=12&count=20&music=1
  // `auto=1` runs a recording session (auto-play + hidden controls); `start=1`
  // just starts in manual mode. The engine starts after the intro, so the
  // settings patch below is always applied before the first question.
  const bootRef = useRef(false);
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const q = new URLSearchParams(window.location.search);
    if ([...q.keys()].length === 0) return;

    const patch: Partial<QuizSettings> = {};
    const diff = q.get("difficulty");
    if (diff) patch.difficulty = diff as QuizSettings["difficulty"];
    const mode = q.get("mode");
    if (mode) patch.answerMode = mode as QuizSettings["answerMode"];
    const dur = parseInt(q.get("duration") ?? "", 10);
    if (!Number.isNaN(dur)) patch.durationSec = Math.max(3, dur);
    const cnt = parseInt(q.get("count") ?? "", 10);
    if (!Number.isNaN(cnt)) patch.questionCount = Math.max(1, cnt);
    const order = q.get("order");
    if (order === "sequential" || order === "random") patch.order = order;
    if (q.get("music") != null) patch.musicOn = q.get("music") === "1";
    if (q.get("sound") != null) patch.soundOn = q.get("sound") !== "0";
    if (Object.keys(patch).length) setSettings((s) => ({ ...s, ...patch }));

    if (q.get("auto") === "1") handleStart(true);
    else if (q.get("start") === "1") handleStart(false);
  }, [handleStart]);

  // ── INTRO / TITLE CARD ────────────────────────────────────────────────────
  if (intro) {
    return (
      <IntroCard
        category={category}
        difficulty={settings.difficulty}
        soundOn={settings.soundOn}
        onDone={finishIntro}
      />
    );
  }

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
      <div className="relative min-h-[100dvh] w-full overflow-hidden" data-testid="complete">
        <OceanBackground />
        <Confetti active count={120} />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 p-5 text-center">
          {/* Clean branded end card — stays as the final frame while recording. */}
          <OutroCard score={engine.score} total={engine.total} />

          {/* Creator tools — hidden in recording mode so the outro stays clean. */}
          <div className="hide-on-record flex w-full flex-col items-center gap-5">
            <p className="display text-xl text-aqua md:text-2xl">{pct}% benar</p>

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
        {/* TOP — headline (logo badge anchored left for branding) */}
        <header className="relative flex shrink-0 items-center justify-center gap-3 text-center">
          <BabyMoLogo size={44} showText={false} className="absolute left-0 top-0" />
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
            <div
              key={`card-${current.id}`}
              className="flex min-h-0 w-full flex-1 items-center justify-center"
              style={{ animation: "var(--animate-pop-in)" }}
            >
              <AnimalCard animal={current} mode={settings.answerMode} revealed={revealed} />
            </div>
            {showChoices && (
              <div key={`ans-${current.id}`} className="w-full max-w-3xl shrink-0">
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

        {/* BOTTOM — countdown (bottom padding clears the floating controls) */}
        <footer className="shrink-0 pb-14 md:pb-16">
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
          musicOn={settings.musicOn}
          onTogglePause={engine.togglePause}
          onPrev={engine.prev}
          onNext={engine.next}
          onReveal={engine.reveal}
          onReplaySound={() => playSfx("reveal", settings.soundOn)}
          onToggleAuto={() => setAutoPlay((v) => !v)}
          onToggleSound={() => patchSettings({ soundOn: !settings.soundOn })}
          onToggleMusic={() => patchSettings({ musicOn: !settings.musicOn })}
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
