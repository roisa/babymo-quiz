// ───────────────────────────────────────────────────────────────────────────
// On-screen "go viral" engagement layer.
//
// Kids' quiz channels grow on three signals: comments, watch-time, and
// click-through. These prompts/badges are designed to nudge the first two —
// shown burned into the recorded frame (not hidden in recording mode).
// ───────────────────────────────────────────────────────────────────────────

import type { Difficulty } from "@/lib/engine/types";

/** Rotating call-to-action shown during each question. */
const CTAS = [
  "Tebak di dalam hati! 🤔",
  "Tulis jawabanmu di komentar! 👇",
  "Pause kalau perlu! ⏸️",
  "Bisa tebak sebelum waktu habis? ⏱️",
  "Ajak teman & saudaramu ikut! 👯",
  "Tonton sampai habis ya! 🎬",
  "Sudah tahu jawabannya? Teriakkan! 📣",
];

export function ctaForIndex(i: number): string {
  return CTAS[i % CTAS.length]!;
}

/** A hype "comment-bait" badge for harder questions and the final one. */
export function hypeBadge(
  difficulty: Difficulty | "Semua",
  index: number,
  total: number,
): string | null {
  if (total > 1 && index === total - 1) return "SOAL BONUS ⭐";
  if (difficulty === "Mustahil") return "Cuma 1% bisa! 🧠";
  if (difficulty === "Sulit") return "Ini SUSAH! 🔥";
  return null;
}
