"use client";

import { withBase } from "@/lib/basePath";
import { poseSrc } from "@/lib/spot/puzzles";
import type { SpotRound } from "@/lib/spot/useSpotEngine";

/**
 * The grid of Baby Mo poses. Every cell shows the base pose except the odd one.
 * On reveal the odd cell is spotlighted (scale + green ring + pulse) and the
 * rest dim back. A wrong tap shakes that cell.
 */
export default function SpotGrid({
  round,
  revealed,
  picked,
  wrongPick,
  interactive,
  onPick,
}: {
  round: SpotRound;
  revealed: boolean;
  picked: number | null;
  wrongPick: number | null;
  interactive: boolean;
  onPick: (i: number) => void;
}) {
  const cells = Array.from({ length: round.total }, (_, i) => i);

  return (
    <div
      className="ios-glass mx-auto grid w-full rounded-[2rem] p-2 sm:p-3"
      style={{
        gridTemplateColumns: `repeat(${round.cols}, minmax(0, 1fr))`,
        gap: "clamp(2px, 0.5vw, 10px)",
        maxWidth: "min(94vw, 150vh)",
      }}
      role="grid"
      aria-label={round.puzzle.title}
    >
      {cells.map((i) => {
        const isOdd = i === round.oddIndex;
        const spotlight = revealed && isOdd;
        const dimmed = revealed && !isOdd;
        const isWrong = wrongPick === i;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive || revealed}
            onClick={() => onPick(i)}
            aria-label={isOdd ? "Baby Mo yang berbeda" : "Baby Mo"}
            className="relative aspect-square rounded-2xl p-[6%] transition-all duration-300 focus:outline-none"
            style={{
              background: spotlight
                ? "rgba(52,199,89,0.18)"
                : isWrong
                  ? "rgba(255,55,95,0.16)"
                  : "transparent",
              boxShadow: spotlight ? "0 0 0 4px var(--ios-green), 0 12px 30px rgba(52,199,89,0.35)" : "none",
              transform: spotlight ? "scale(1.18)" : "scale(1)",
              opacity: dimmed ? 0.32 : 1,
              zIndex: spotlight ? 5 : 1,
              animation: isWrong
                ? "shake 0.45s"
                : spotlight
                  ? "spring-in 0.4s, pulse-ring 1.1s 0.4s 2"
                  : undefined,
              cursor: interactive && !revealed ? "pointer" : "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBase(poseSrc(isOdd ? round.puzzle.oddFile : round.puzzle.baseFile))}
              alt="Baby Mo"
              draggable={false}
              className="h-full w-full select-none object-contain"
              style={{ filter: spotlight ? "drop-shadow(0 8px 14px rgba(0,0,0,0.18))" : "none" }}
            />
            {spotlight && (
              <span
                className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ios-green)] text-xl text-white shadow-lg sm:h-11 sm:w-11 sm:text-2xl"
                style={{ animation: "spring-in 0.5s 0.15s both" }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
