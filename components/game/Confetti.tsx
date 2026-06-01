"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ffd23f", "#ff6f61", "#7be38a", "#2fe6e0", "#ff8fc7", "#12b1d6"];

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
}

/** Lightweight CSS confetti burst. Renders for `count` pieces when `active`. */
export default function Confetti({ active, count = 80 }: { active: boolean; count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    setPieces(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        size: 8 + Math.random() * 10,
        rotate: Math.random() * 360,
      })),
    );
  }, [active, count]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      <style>{`@keyframes confetti-fall {
        0% { transform: translateY(-12vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(112vh) rotate(720deg); opacity: 0.9; }
      }`}</style>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.5}px`,
            background: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
