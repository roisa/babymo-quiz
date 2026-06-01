"use client";

/**
 * Baby Mo mascot — a cheerful placeholder baby whale drawn inline as SVG so it
 * ships with zero image assets. Swap for branded artwork later by replacing
 * this component (the rest of the app references <Mascot /> only).
 */
export default function Mascot({
  size = 120,
  className = "",
  mood = "happy",
}: {
  size?: number;
  className?: string;
  mood?: "happy" | "wow" | "cheer";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Maskot Baby Mo"
    >
      <defs>
        <radialGradient id="bm-body" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#7be7ff" />
          <stop offset="100%" stopColor="#12b1d6" />
        </radialGradient>
      </defs>
      {/* tail */}
      <path d="M14 60 C2 48 2 72 14 64 C8 70 8 54 14 58 Z" fill="#0a7ea4" />
      {/* body */}
      <ellipse cx="64" cy="62" rx="44" ry="36" fill="url(#bm-body)" stroke="#03204a" strokeWidth="3" />
      {/* belly */}
      <ellipse cx="66" cy="74" rx="30" ry="20" fill="#eafcff" opacity="0.9" />
      {/* spout */}
      <g stroke="#eafcff" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M70 26 q-4 -10 2 -18" />
        <path d="M78 26 q2 -10 8 -16" />
      </g>
      {/* eyes */}
      <circle cx="54" cy="56" r="7" fill="#fff" stroke="#03204a" strokeWidth="2" />
      <circle cx="78" cy="56" r="7" fill="#fff" stroke="#03204a" strokeWidth="2" />
      <circle cx={mood === "wow" ? 54 : 55} cy={mood === "wow" ? 56 : 58} r="3.4" fill="#03204a" />
      <circle cx={mood === "wow" ? 78 : 79} cy={mood === "wow" ? 56 : 58} r="3.4" fill="#03204a" />
      {/* blush */}
      <ellipse cx="46" cy="68" rx="6" ry="4" fill="#ff8fc7" opacity="0.8" />
      <ellipse cx="86" cy="68" rx="6" ry="4" fill="#ff8fc7" opacity="0.8" />
      {/* mouth */}
      {mood === "happy" && <path d="M58 74 q8 8 16 0" stroke="#03204a" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mood === "wow" && <ellipse cx="66" cy="76" rx="6" ry="8" fill="#03204a" />}
      {mood === "cheer" && <path d="M56 72 q10 12 20 0 q-10 4 -20 0" fill="#ff6f61" stroke="#03204a" strokeWidth="2" />}
    </svg>
  );
}
