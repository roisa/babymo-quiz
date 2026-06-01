"use client";

import Image from "next/image";
import { withBase } from "@/lib/basePath";
import type { Animal, AnswerMode } from "@/lib/engine/types";

/**
 * The big central display card. Renders the subject with the visual treatment
 * for the active answer mode, then snaps clear on reveal. Animals render as a
 * huge emoji by default (zero assets); a real `image` is used when provided.
 */
export default function AnimalCard({
  animal,
  mode,
  revealed,
}: {
  animal: Animal;
  mode: AnswerMode;
  revealed: boolean;
}) {
  // The visual filter/transform applied to the subject before reveal.
  let filter = "none";
  let transform = "none";
  let hideSubject = false;

  if (!revealed) {
    switch (mode) {
      case "silhouette":
        filter = "brightness(0) saturate(0)";
        break;
      case "blur":
        filter = "blur(22px)";
        break;
      case "zoom":
        transform = "scale(2.6)";
        break;
      case "emoji":
      case "fun-fact":
        hideSubject = true;
        break;
    }
  }

  const hasImage = Boolean(animal.image);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="glass relative flex aspect-square w-full max-w-[min(60vh,560px)] items-center justify-center overflow-hidden rounded-3xl border-4 border-white/40"
        style={{ boxShadow: "0 20px 0 rgba(3,32,74,0.35), inset 0 0 60px rgba(255,255,255,0.12)" }}
      >
        {/* the subject */}
        {!hideSubject && (
          <div
            className="flex items-center justify-center"
            style={{ filter, transform, transition: "filter .5s ease, transform .5s ease", willChange: "filter, transform" }}
          >
            {hasImage ? (
              <Image
                src={withBase(animal.image!)}
                alt={revealed ? animal.name : "Tebak hewannya"}
                width={420}
                height={420}
                className="h-auto w-[clamp(220px,42vh,420px)] object-contain"
              />
            ) : (
              <span className="select-none leading-none" style={{ fontSize: "clamp(120px, 32vh, 320px)" }}>
                {animal.emoji}
              </span>
            )}
          </div>
        )}

        {/* clue-only modes show their hints in place of the subject */}
        {hideSubject && mode === "emoji" && (
          <div className="flex flex-wrap items-center justify-center gap-4 px-6">
            {(animal.emojiClues ?? [animal.emoji]).map((e, i) => (
              <span
                key={i}
                className="select-none"
                style={{ fontSize: "clamp(64px,16vh,150px)", animation: `floaty ${4 + i}s ease-in-out infinite` }}
              >
                {e}
              </span>
            ))}
          </div>
        )}
        {hideSubject && mode === "fun-fact" && (
          <div className="px-8 text-center">
            <div className="mb-3 text-6xl">💡</div>
            <p className="display text-2xl leading-snug text-foam md:text-4xl">{animal.funFact}</p>
          </div>
        )}

        {/* big question mark badge while hidden */}
        {!revealed && (
          <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-sunny text-4xl text-deep shadow-lg md:h-16 md:w-16">
            ❓
          </div>
        )}
      </div>
    </div>
  );
}
