"use client";

import Mascot from "./Mascot";

/**
 * Branded recording outro / end card. A clean "thanks + like & subscribe" frame
 * that reads well as the final shot of a YouTube video. Score and the creator
 * tools (YouTube metadata) live below this on the complete screen and are
 * hidden in recording mode so this stays the last clean frame.
 */
export default function OutroCard({ score, total }: { score: number; total: number }) {
  return (
    <div
      className="glass flex w-full flex-col items-center gap-4 rounded-3xl border-4 border-sunny/70 px-6 py-7 text-center"
      style={{ animation: "var(--animate-pop-in)", boxShadow: "0 14px 0 rgba(3,32,74,0.3)" }}
    >
      <Mascot size={150} mood="cheer" className="floaty" />
      <h1 className="display text-5xl text-sunny text-stroke md:text-7xl">Terima Kasih! 🎉</h1>
      <p className="display text-2xl text-foam md:text-4xl">Sudah menonton Baby Mo Quiz</p>
      <p className="display text-3xl text-aqua text-stroke md:text-5xl">
        Skor kamu: <span className="text-sunny">{score}</span>
        <span className="text-foam/80">/{total}</span>
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        <span className="display rounded-full bg-[var(--color-coral)] px-6 py-3 text-2xl text-white md:text-3xl">
          👍 LIKE
        </span>
        <span className="display rounded-full bg-[var(--color-extreme)] px-6 py-3 text-2xl text-white md:text-3xl">
          🔔 SUBSCRIBE
        </span>
      </div>
      <p className="display text-xl text-foam/90 md:text-2xl">Sampai jumpa di video berikutnya! 🐳</p>
    </div>
  );
}
