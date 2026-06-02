"use client";

// ───────────────────────────────────────────────────────────────────────────
// useSpotEngine — drives the "Temukan yang Beda" game loop.
//
// Mirrors the quiz engine: builds rounds from settings, runs a smooth rAF
// countdown, supports pause/resume/prev/next/reveal, scoring, and the auto-play
// sequence used for hands-free YouTube recording. Interactive play taps a cell;
// auto-play reveals the odd one automatically.
// ───────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { getSpotLevel, SPOT_PUZZLES, type SpotPuzzle } from "./puzzles";
import { shuffle } from "@/lib/engine/shuffle";
import type { SfxName } from "@/lib/audio/sfx";

export const REVEAL_HOLD_SEC = 4;

export type SpotPhase = "idle" | "question" | "reveal" | "complete";

export interface SpotSettings {
  levelKey: string;
  order: "sequential" | "random";
  durationSec: number;
  roundCount: number;
  soundOn: boolean;
  musicOn: boolean;
}

export const DEFAULT_SPOT_SETTINGS: SpotSettings = {
  levelKey: "Mudah",
  order: "random",
  durationSec: 15,
  roundCount: 8,
  soundOn: true,
  musicOn: false,
};

export interface SpotRound {
  puzzle: SpotPuzzle;
  oddIndex: number;
  total: number;
  cols: number;
  rows: number;
}

export interface SpotEngine {
  rounds: SpotRound[];
  current: SpotRound | undefined;
  index: number;
  total: number;
  phase: SpotPhase;
  remaining: number;
  progress: number;
  paused: boolean;
  score: number;
  picked: number | null;
  wrongPick: number | null;
  found: boolean; // odd one was tapped correctly (vs timed-out reveal)
  start: () => void;
  restart: () => void;
  togglePause: () => void;
  next: () => void;
  prev: () => void;
  reveal: () => void;
  pick: (i: number) => void;
}

export function useSpotEngine(
  settings: SpotSettings,
  opts: { autoPlay: boolean; onSfx?: (name: SfxName) => void },
): SpotEngine {
  const { autoPlay, onSfx } = opts;

  const [rounds, setRounds] = useState<SpotRound[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<SpotPhase>("idle");
  const [remaining, setRemaining] = useState(settings.durationSec);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [found, setFound] = useState(false);

  const rafRef = useRef<number | null>(null);
  const deadlineRef = useRef(0);
  const pausedRef = useRef(false);
  const lastTickRef = useRef(-1);
  const revealAtRef = useRef(0);

  const current = rounds[index];
  const total = rounds.length;

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const buildRounds = useCallback((): SpotRound[] => {
    const level = getSpotLevel(settings.levelKey);
    const cells = level.cols * level.rows;
    const pool = settings.order === "random" ? shuffle(SPOT_PUZZLES) : [...SPOT_PUZZLES];
    const chosen: SpotPuzzle[] = [];
    for (let i = 0; i < settings.roundCount; i++) {
      chosen.push(pool[i % pool.length]!); // wrap if more rounds than puzzles
    }
    return chosen.map((puzzle) => ({
      puzzle,
      oddIndex: Math.floor(Math.random() * cells),
      total: cells,
      cols: level.cols,
      rows: level.rows,
    }));
  }, [settings.levelKey, settings.order, settings.roundCount]);

  const enterQuestion = useCallback(
    (i: number) => {
      setIndex(i);
      setPicked(null);
      setWrongPick(null);
      setFound(false);
      setPhase("question");
      setRemaining(settings.durationSec);
      deadlineRef.current = performance.now() + settings.durationSec * 1000;
      lastTickRef.current = -1;
      onSfx?.("whoosh");
    },
    [settings.durationSec, onSfx],
  );

  const start = useCallback(() => {
    const next = buildRounds();
    setRounds(next);
    setScore(0);
    if (next.length === 0) {
      setPhase("complete");
      return;
    }
    pausedRef.current = false;
    setPaused(false);
    enterQuestion(0);
  }, [buildRounds, enterQuestion]);

  const restart = useCallback(() => {
    stopLoop();
    setPhase("idle");
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
    setIndex((i) => {
      const ni = i + 1;
      if (ni >= total) {
        setPhase("complete");
        onSfx?.("complete");
        return i;
      }
      enterQuestion(ni);
      return i;
    });
  }, [total, enterQuestion, onSfx]);

  const prev = useCallback(() => {
    setIndex((i) => {
      enterQuestion(Math.max(0, i - 1));
      return i;
    });
  }, [enterQuestion]);

  const togglePause = useCallback(() => {
    if (phase !== "question") return;
    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      deadlineRef.current = performance.now() + remaining * 1000;
    } else {
      pausedRef.current = true;
      setPaused(true);
    }
  }, [phase, remaining]);

  const pick = useCallback(
    (i: number) => {
      if (phase !== "question" || picked != null) return;
      if (current && i === current.oddIndex) {
        setPicked(i);
        setFound(true);
        setScore((s) => s + 1);
        onSfx?.("correct");
        revealAtRef.current = performance.now();
        setPhase("reveal");
      } else {
        setWrongPick(i);
        onSfx?.("wrong");
        window.setTimeout(() => setWrongPick((w) => (w === i ? null : w)), 450);
      }
    },
    [phase, picked, current, onSfx],
  );

  // The animation loop (runs while a round or its reveal is on screen).
  useEffect(() => {
    if (phase !== "question" && phase !== "reveal") {
      stopLoop();
      return;
    }
    const tick = () => {
      const now = performance.now();
      if (phase === "question") {
        if (pausedRef.current) {
          deadlineRef.current = now + remaining * 1000;
        } else {
          const remMs = Math.max(0, deadlineRef.current - now);
          setRemaining(remMs / 1000);
          const whole = Math.ceil(remMs / 1000);
          if (whole <= 5 && whole >= 1 && whole !== lastTickRef.current) {
            lastTickRef.current = whole;
            onSfx?.("tick");
          }
          if (remMs <= 0) {
            reveal();
            return;
          }
        }
      } else if (phase === "reveal" && autoPlay) {
        if (now - revealAtRef.current >= REVEAL_HOLD_SEC * 1000) {
          next();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return stopLoop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, autoPlay, reveal, next, onSfx, stopLoop]);

  useEffect(() => {
    if (phase === "idle") setRemaining(settings.durationSec);
  }, [settings.durationSec, phase]);

  const progress =
    settings.durationSec > 0 ? Math.min(1, Math.max(0, 1 - remaining / settings.durationSec)) : 0;

  return {
    rounds,
    current,
    index,
    total,
    phase,
    remaining,
    progress,
    paused,
    score,
    picked,
    wrongPick,
    found,
    start,
    restart,
    togglePause,
    next,
    prev,
    reveal,
    pick,
  };
}
