"use client";

// ───────────────────────────────────────────────────────────────────────────
// useQuizEngine — the reusable, category-agnostic quiz brain.
//
// Drives the whole game loop: builds the question pool from settings, runs a
// smooth requestAnimationFrame countdown (so the progress bar is buttery),
// handles pause/resume/prev/next/reveal, score, and the auto-play sequence
// used for hands-free YouTube recording.
// ───────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Animal, Category, Phase, QuizSettings } from "./types";
import { sample, shuffle } from "./shuffle";
import type { SfxName } from "@/lib/audio/sfx";

/** Seconds the answer stays on screen during auto-play before advancing. */
export const REVEAL_HOLD_SEC = 4;

export interface QuizEngine {
  pool: Animal[];
  current: Animal | undefined;
  choices: string[];
  index: number;
  total: number;
  phase: Phase;
  remaining: number; // seconds left in the current question
  progress: number; // 0 → 1 elapsed fraction
  paused: boolean;
  score: number;
  selected: string | null;
  // actions
  start: () => void;
  restart: () => void;
  togglePause: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  reveal: () => void;
  selectAnswer: (choice: string) => void;
}

function buildChoices(animal: Animal): string[] {
  // Always include the correct answer, pull up to 3 random distractors, then
  // shuffle so the correct answer lands in a random position every question.
  const distractors = sample(
    animal.answerChoices.filter((c) => c !== animal.name),
    3,
  );
  return shuffle([animal.name, ...distractors]);
}

export function useQuizEngine(
  category: Category,
  settings: QuizSettings,
  opts: { autoPlay: boolean; onSfx?: (name: SfxName) => void },
): QuizEngine {
  const { autoPlay, onSfx } = opts;

  const [pool, setPool] = useState<Animal[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(settings.durationSec);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // rAF bookkeeping kept in refs so the loop never causes stale closures.
  const rafRef = useRef<number | null>(null);
  const deadlineRef = useRef<number>(0); // performance.now() when timer hits 0
  const pausedRef = useRef(false);
  const lastTickSecRef = useRef<number>(-1);
  const revealAtRef = useRef<number>(0); // for auto-play reveal hold
  const indexRef = useRef(0); // navigation source of truth (avoids nested setState)

  const current = pool[index];
  const total = pool.length;

  const choices = useMemo(
    () => (current ? buildChoices(current) : []),
    // Rebuild only when the subject changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current?.id],
  );

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  // Build the pool from the current settings.
  const buildPool = useCallback((): Animal[] => {
    let items =
      settings.difficulty === "Semua"
        ? category.items
        : category.items.filter((a) => a.difficulty === settings.difficulty);
    items = settings.order === "random" ? shuffle(items) : [...items];
    return sample(items, settings.questionCount).slice(0, settings.questionCount);
  }, [category, settings.difficulty, settings.order, settings.questionCount]);

  const goToQuestion = useCallback(
    (i: number) => {
      indexRef.current = i;
      setIndex(i);
      setSelected(null);
      setPhase("question");
      setRemaining(settings.durationSec);
      deadlineRef.current = performance.now() + settings.durationSec * 1000;
      lastTickSecRef.current = -1;
      onSfx?.("whoosh");
    },
    [settings.durationSec, onSfx],
  );

  const start = useCallback(() => {
    const next = buildPool();
    setPool(next);
    setScore(0);
    if (next.length === 0) {
      setPhase("complete");
      return;
    }
    indexRef.current = 0;
    setIndex(0);
    setSelected(null);
    setPhase("question");
    setRemaining(settings.durationSec);
    deadlineRef.current = performance.now() + settings.durationSec * 1000;
    lastTickSecRef.current = -1;
    pausedRef.current = false;
    setPaused(false);
    onSfx?.("whoosh");
  }, [buildPool, settings.durationSec, onSfx]);

  const restart = useCallback(() => {
    stopLoop();
    setPhase("idle");
    indexRef.current = 0;
    setIndex(0);
    setScore(0);
  }, [stopLoop]);

  const reveal = useCallback(() => {
    setPhase((p) => {
      if (p !== "question") return p;
      onSfx?.("reveal");
      revealAtRef.current = performance.now();
      return "reveal";
    });
  }, [onSfx]);

  const next = useCallback(() => {
    const ni = indexRef.current + 1;
    if (ni >= total) {
      setPhase("complete");
      onSfx?.("complete");
    } else {
      goToQuestion(ni);
    }
  }, [total, goToQuestion, onSfx]);

  const prev = useCallback(() => {
    goToQuestion(Math.max(0, indexRef.current - 1));
  }, [goToQuestion]);

  const pause = useCallback(() => {
    if (pausedRef.current || phase !== "question") return;
    pausedRef.current = true;
    setPaused(true);
  }, [phase]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    // Re-anchor the deadline so no time is lost while paused.
    deadlineRef.current = performance.now() + remaining * 1000;
  }, [remaining]);

  const togglePause = useCallback(() => {
    if (pausedRef.current) resume();
    else pause();
  }, [pause, resume]);

  const selectAnswer = useCallback(
    (choice: string) => {
      if (phase !== "question" || selected) return;
      setSelected(choice);
      if (current && choice === current.name) {
        setScore((s) => s + 1);
        onSfx?.("correct");
      } else {
        onSfx?.("wrong");
      }
    },
    [phase, selected, current, onSfx],
  );

  // The single animation loop — runs only while a question is on screen.
  useEffect(() => {
    if (phase !== "question" && phase !== "reveal") {
      stopLoop();
      return;
    }

    const tick = () => {
      const now = performance.now();

      if (phase === "question") {
        if (pausedRef.current) {
          // Hold the deadline out in front of "now" while paused.
          deadlineRef.current = now + remaining * 1000;
        } else {
          const remMs = Math.max(0, deadlineRef.current - now);
          const remSec = remMs / 1000;
          setRemaining(remSec);

          // Countdown tick on each whole second in the final stretch.
          const whole = Math.ceil(remSec);
          if (whole <= 5 && whole >= 1 && whole !== lastTickSecRef.current) {
            lastTickSecRef.current = whole;
            onSfx?.("tick");
          }

          if (remMs <= 0) {
            reveal();
            return; // effect re-runs for the reveal phase
          }
        }
      } else if (phase === "reveal" && autoPlay) {
        // Auto-play: hold the answer, then advance.
        if (now - revealAtRef.current >= REVEAL_HOLD_SEC * 1000) {
          next();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return stopLoop;
    // `remaining` intentionally omitted: the loop reads/writes it via the
    // deadline ref, and including it would restart the loop every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, autoPlay, reveal, next, onSfx, stopLoop]);

  // Keep `remaining` in sync if the duration setting changes pre-game.
  useEffect(() => {
    if (phase === "idle") setRemaining(settings.durationSec);
  }, [settings.durationSec, phase]);

  const progress =
    settings.durationSec > 0
      ? Math.min(1, Math.max(0, 1 - remaining / settings.durationSec))
      : 0;

  return {
    pool,
    current,
    choices,
    index,
    total,
    phase,
    remaining,
    progress,
    paused,
    score,
    selected,
    start,
    restart,
    togglePause,
    pause,
    resume,
    next,
    prev,
    reveal,
    selectAnswer,
  };
}
