"use client";

import { DIFFICULTIES, type Difficulty } from "@/lib/engine/types";

const META: Record<Difficulty, { color: string; emoji: string }> = {
  Mudah: { color: "var(--color-easy)", emoji: "🟢" },
  Sedang: { color: "var(--color-medium)", emoji: "🟡" },
  Sulit: { color: "var(--color-hard)", emoji: "🟠" },
  Mustahil: { color: "var(--color-extreme)", emoji: "🔴" },
};

/**
 * Left-hand difficulty selector. Highlights the active tier; the current
 * difficulty is also shown live during play so a recording always reads clearly.
 */
export default function DifficultyPanel({
  value,
  onChange,
  disabled = false,
}: {
  value: Difficulty | "Semua";
  onChange: (d: Difficulty | "Semua") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="display text-2xl text-foam/90 text-stroke md:text-3xl">Tingkat</h2>
      {DIFFICULTIES.map((d) => {
        const active = value === d;
        return (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onChange(d)}
            className="display flex items-center gap-3 rounded-2xl border-4 px-4 py-3 text-left text-2xl transition-transform active:scale-95 disabled:opacity-50 md:text-3xl"
            style={{
              borderColor: active ? META[d].color : "rgba(255,255,255,0.25)",
              background: active ? META[d].color : "rgba(255,255,255,0.12)",
              color: active ? "#03204a" : "#eafcff",
              boxShadow: active ? `0 8px 0 rgba(0,0,0,0.18), 0 0 22px ${META[d].color}` : "0 6px 0 rgba(0,0,0,0.15)",
            }}
          >
            <span className="text-2xl md:text-3xl">{META[d].emoji}</span>
            {d}
          </button>
        );
      })}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("Semua")}
        className="display mt-1 rounded-2xl border-4 px-4 py-2 text-xl transition-transform active:scale-95 disabled:opacity-50 md:text-2xl"
        style={{
          borderColor: value === "Semua" ? "var(--color-aqua)" : "rgba(255,255,255,0.25)",
          background: value === "Semua" ? "var(--color-aqua)" : "rgba(255,255,255,0.12)",
          color: value === "Semua" ? "#03204a" : "#eafcff",
        }}
      >
        🌊 Semua
      </button>
    </div>
  );
}
