"use client";

import { useState } from "react";
import { emojiAssetSrc } from "@/lib/emoji";

/**
 * Renders an emoji as a crisp SVG image (Twemoji), falling back to the native
 * text emoji if the asset is missing. Size is controlled by the caller via
 * `style`/`className` (the <img> fills it). Works with the CSS filters used by
 * the answer modes — brightness(0) → silhouette, blur, scale → zoom.
 */
export default function EmojiArt({
  emoji,
  alt = "",
  className = "",
  style,
}: {
  emoji: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={className} style={style} role="img" aria-label={alt || undefined}>
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={emojiAssetSrc(emoji)}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{ objectFit: "contain", userSelect: "none", ...style }}
    />
  );
}
