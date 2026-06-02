// ───────────────────────────────────────────────────────────────────────────
// Emoji → SVG asset mapping.
//
// Apple Color Emoji are bitmap glyphs (~160px), so blowing one up to fill a 4K
// card looks soft. Twemoji ships an *SVG* version of every emoji, which stays
// razor-sharp at any size. We pre-download the ones our datasets use into
// /public/emoji (see scripts/fetch-emoji.mjs) and render them as <img>.
//
// `toTwemojiCodepoint` mirrors Twemoji's own filename rule: strip the U+FE0F
// variation selector unless the sequence is a ZWJ sequence.
// ───────────────────────────────────────────────────────────────────────────

import { withBase } from "./basePath";

const ZWJ = 0x200d;
const VARIATION_SELECTOR = 0xfe0f;

export function toTwemojiCodepoint(emoji: string): string {
  const hasZwj = [...emoji].some((ch) => ch.codePointAt(0) === ZWJ);
  const chars = hasZwj ? emoji : stripVariationSelectors(emoji);
  const points: string[] = [];
  for (const ch of chars) {
    const cp = ch.codePointAt(0);
    if (cp != null) points.push(cp.toString(16));
  }
  return points.join("-");
}

function stripVariationSelectors(emoji: string): string {
  return [...emoji].filter((ch) => ch.codePointAt(0) !== VARIATION_SELECTOR).join("");
}

/** Public path to the SVG asset for an emoji (base-path aware). */
export function emojiAssetSrc(emoji: string): string {
  return withBase(`/emoji/${toTwemojiCodepoint(emoji)}.svg`);
}
