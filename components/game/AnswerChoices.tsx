"use client";

import type { Animal } from "@/lib/engine/types";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Multiple-choice answer grid (Mode A). Selecting marks correct/incorrect; once
 * revealed, the right answer always lights up green for the camera.
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
    <div className="grid w-full grid-cols-2 gap-3 md:gap-4">
      {choices.map((choice, i) => {
        const isCorrect = choice === animal.name;
        const isChosen = choice === selected;
        const show = revealed || selected;

        let bg = "rgba(255,255,255,0.14)";
        let border = "rgba(255,255,255,0.3)";
        let color = "#eafcff";
        if (show && isCorrect) {
          bg = "var(--color-easy)";
          border = "#1b7a44";
          color = "#03204a";
        } else if (isChosen && !isCorrect) {
          bg = "var(--color-extreme)";
          border = "#a01030";
          color = "#fff";
        }

        return (
          <button
            key={choice}
            type="button"
            disabled={Boolean(selected) || revealed}
            onClick={() => onSelect(choice)}
            className="display flex items-center gap-3 rounded-2xl border-4 px-4 py-3 text-left text-xl transition-transform active:scale-95 disabled:cursor-default md:text-3xl"
            style={{ background: bg, borderColor: border, color, boxShadow: "0 6px 0 rgba(3,32,74,0.3)" }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-deep/30 text-lg md:h-11 md:w-11 md:text-2xl"
              style={{ color }}
            >
              {LETTERS[i]}
            </span>
            <span className="flex-1">{choice}</span>
            {show && isCorrect && <span className="text-2xl md:text-3xl">✅</span>}
            {isChosen && !isCorrect && <span className="text-2xl md:text-3xl">❌</span>}
          </button>
        );
      })}
    </div>
  );
}
