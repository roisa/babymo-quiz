"use client";

import type { Animal } from "@/lib/engine/types";
import Mascot from "./Mascot";

/**
 * The answer reveal banner that drops in under the card: animal name, habitat
 * and the fun fact, with the mascot cheering. Confetti is rendered separately
 * (page-level) so it can cover the whole frame.
 */
export default function RevealOverlay({ animal }: { animal: Animal }) {
  return (
    <div
      className="glass flex w-full items-center gap-4 rounded-3xl border-4 border-sunny/70 px-5 py-4"
      style={{ animation: "var(--animate-pop-in)", boxShadow: "0 12px 0 rgba(3,32,74,0.3)" }}
    >
      <Mascot size={88} mood="wow" className="hidden shrink-0 sm:block" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="display text-4xl text-sunny text-stroke md:text-6xl">{animal.name}</h3>
          {animal.nameEn && <span className="display text-xl text-aqua md:text-2xl">({animal.nameEn})</span>}
        </div>
        <p className="mt-1 text-lg text-foam/90 md:text-2xl">
          {animal.habitat && (
            <>
              🏝️ <span className="font-semibold">{animal.habitat}</span>
            </>
          )}
        </p>
        <p className="mt-1 text-base leading-snug text-foam md:text-xl">💡 {animal.funFact}</p>
      </div>
    </div>
  );
}
