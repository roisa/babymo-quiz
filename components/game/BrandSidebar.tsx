"use client";

import Mascot from "./Mascot";

/**
 * Right-hand vertical "Baby Mo Quiz" branding column. The vertical wordmark and
 * mascot give every recorded frame a consistent channel identity.
 */
export default function BrandSidebar({ score, total, index }: { score: number; total: number; index: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-between py-2">
      <div className="flex flex-col items-center gap-2">
        <Mascot size={84} mood="cheer" className="drop-shadow-lg" />
        <div
          className="display text-3xl leading-none text-stroke md:text-4xl"
          style={{ writingMode: "vertical-rl", textOrientation: "upright", letterSpacing: "2px" }}
        >
          <span className="text-sunny">BABY MO</span>
          <span className="text-aqua"> QUIZ</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="glass flex flex-col items-center rounded-2xl px-3 py-2">
          <span className="display text-xs text-foam/70">SKOR</span>
          <span className="display text-3xl text-sunny text-stroke md:text-4xl">{score}</span>
        </div>
        <div className="glass flex flex-col items-center rounded-2xl px-3 py-2">
          <span className="display text-xs text-foam/70">SOAL</span>
          <span className="display text-2xl text-foam md:text-3xl">
            {Math.min(index + 1, total)}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
