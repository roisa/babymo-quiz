"use client";

import { useEffect, useState } from "react";
import type { Category, Difficulty } from "@/lib/engine/types";
import { playSfx } from "@/lib/audio/sfx";
import OceanBackground from "./OceanBackground";
import Mascot from "./Mascot";

/**
 * Branded recording intro / title card. Shows the channel + game title and a
 * 3-2-1 countdown, then auto-advances into the game. Skippable by click or any
 * key so the creator stays in control while recording.
 */
export default function IntroCard({
  category,
  difficulty,
  soundOn,
  onDone,
}: {
  category: Category;
  difficulty: Difficulty | "Semua";
  soundOn: boolean;
  onDone: () => void;
}) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          // Defer to next tick so we don't setState during another component's render.
          setTimeout(onDone, 700);
          return 0;
        }
        playSfx("tick", soundOn);
        return c - 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [onDone, soundOn]);

  // Skip on click / any key.
  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [onDone]);

  return (
    <div
      className="relative flex h-[100dvh] w-full cursor-pointer items-center justify-center overflow-hidden"
      onClick={onDone}
      role="button"
      aria-label="Lewati intro"
    >
      <OceanBackground />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center" style={{ animation: "var(--animate-pop-in)" }}>
        <Mascot size={170} mood="cheer" className="floaty" />
        <p className="display text-3xl text-aqua text-stroke md:text-5xl">Baby Mo Quiz</p>
        <h1 className="display text-6xl text-sunny text-stroke md:text-8xl">{category.headline}</h1>
        <p className="display text-2xl text-foam md:text-4xl">
          {category.emoji} {category.title} · {difficulty}
        </p>
        <div
          key={count}
          className="display mt-2 flex h-32 w-32 items-center justify-center rounded-full border-8 border-white/40 bg-white/15 text-7xl text-sunny text-stroke md:h-44 md:w-44 md:text-9xl"
          style={{ animation: "var(--animate-pop-in)" }}
        >
          {count > 0 ? count : "🎬"}
        </div>
        <p className="text-base text-foam/70 md:text-lg">Bersiap... (klik untuk lewati)</p>
      </div>
    </div>
  );
}
