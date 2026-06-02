"use client";

import { withBase } from "@/lib/basePath";
import { poseForAnswer, winPoseSrc } from "@/lib/poses";
import type { Animal } from "@/lib/engine/types";

/**
 * Multiple-choice answer grid (Mode A). Each option gets its own cheerful Baby
 * Mo pose to make the board feel alive. Selecting marks correct/incorrect; once
 * revealed, the right answer lights up green and Baby Mo cheers.
 */
export default function AnswerChoices({
  animal,
  choices,
  selected,
  revealed,
  onSelect,
}: {
  animal: Animal;
  choices: string[];
  selected: string | null;
  revealed: boolean;
  onSelect: (choice: string) => void;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 md:gap-5">
      {choices.map((choice, i) => {
        const isCorrect = choice === animal.name;
        const isChosen = choice === selected;
        const show = revealed || selected;
        const win = show && isCorrect;

        let bg = "rgba(255,255,255,0.16)";
        let border = "rgba(255,255,255,0.35)";
        let color = "#eafcff";
        if (win) {
          bg = "var(--color-easy)";
          border = "#1b7a44";
          color = "#03204a";
        } else if (isChosen && !isCorrect) {
          bg = "var(--color-extreme)";
          border = "#a01030";
          color = "#fff";
        }

        // A cheerful pose per option; the winner switches to a celebration pose.
        const pose = win ? winPoseSrc : poseForAnswer(animal.id, i);

        return (
          <button
            key={choice}
            type="button"
            disabled={Boolean(selected) || revealed}
            onClick={() => onSelect(choice)}
            className="group flex items-center gap-2 rounded-[1.75rem] border-4 px-3 py-2.5 text-left transition-transform active:scale-95 disabled:cursor-default md:gap-4 md:px-5 md:py-4"
            style={{ background: bg, borderColor: border, color, boxShadow: "0 8px 0 rgba(3,32,74,0.3)" }}
          >
            {/* Live Baby Mo pose */}
            <span
              className="relative flex h-14 w-14 shrink-0 items-center justify-center md:h-20 md:w-20"
              style={{ animation: win ? "pop-in 0.4s" : `floaty ${4 + (i % 3)}s ease-in-out infinite` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withBase(pose)}
                alt=""
                draggable={false}
                className="h-full w-full select-none object-contain drop-shadow"
                style={{ transform: win ? "scale(1.12)" : undefined }}
              />
            </span>

            <span className="display flex-1 text-2xl leading-tight md:text-4xl">{choice}</span>

            {win && <span className="text-3xl md:text-5xl">🎉</span>}
            {isChosen && !isCorrect && <span className="text-3xl md:text-5xl">❌</span>}
          </button>
        );
      })}
    </div>
  );
}
