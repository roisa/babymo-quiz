"use client";

import { useEffect, useState } from "react";

interface Bubble {
  left: number;
  size: number;
  duration: number;
  delay: number;
}

/**
 * Animated rising bubbles. Generated on the client after mount so the random
 * layout never triggers a hydration mismatch with the static export.
 */
export default function Bubbles({ count = 18 }: { count?: number }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 8 + Math.random() * 46,
        duration: 7 + Math.random() * 12,
        delay: Math.random() * 10,
      })),
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.18) 60%, rgba(255,255,255,0.05))",
            border: "1px solid rgba(255,255,255,0.35)",
            animation: `rise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
