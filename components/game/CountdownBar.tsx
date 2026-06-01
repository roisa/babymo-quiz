"use client";

/**
 * Bottom countdown bar. Width tracks time remaining; colour walks from green →
 * yellow → orange → red as the clock runs down. The big number doubles as a
 * readable-from-the-couch timer for recordings.
 */
export default function CountdownBar({
  remaining,
  duration,
  paused,
}: {
  remaining: number;
  duration: number;
  paused: boolean;
}) {
  const frac = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;

  // Colour by remaining fraction.
  const color =
    frac > 0.6 ? "var(--color-easy)" : frac > 0.35 ? "var(--color-medium)" : frac > 0.15 ? "var(--color-hard)" : "var(--color-extreme)";

  const secs = Math.ceil(remaining);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="display text-2xl text-foam/90 md:text-3xl">⏱️ Waktu</span>
        <span
          className="display text-3xl tabular-nums md:text-5xl text-stroke"
          style={{ color, transform: secs <= 5 && !paused ? "scale(1.08)" : "scale(1)", transition: "transform .15s" }}
        >
          {paused ? "⏸" : secs}
        </span>
      </div>
      <div
        className="relative h-7 w-full overflow-hidden rounded-full border-2 border-white/40 bg-deep/40 md:h-9"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={remaining}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${frac * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color})`,
            boxShadow: `0 0 18px ${color}`,
            // No CSS transition: the engine updates this every animation frame,
            // so the motion is already smooth and a transition would lag.
          }}
        />
        {/* shimmer highlight */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent 50%)" }}
        />
      </div>
    </div>
  );
}
