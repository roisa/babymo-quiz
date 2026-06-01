"use client";

import Bubbles from "./Bubbles";

/**
 * Full-bleed underwater scene: gradient water, sun rays, swaying seaweed and
 * cute creatures tucked into the edges. Purely decorative.
 */
export default function OceanBackground({ decorations = true }: { decorations?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* light rays */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(110deg, transparent 0 60px, rgba(255,255,255,0.06) 60px 90px)",
        }}
      />
      {/* sandy sea floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[14%]"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(255,231,168,0.35) 60%, rgba(255,231,168,0.55))",
          borderTopLeftRadius: "50% 60%",
          borderTopRightRadius: "50% 60%",
        }}
      />

      <Bubbles />

      {decorations && (
        <>
          {/* corner sea creatures */}
          <div className="absolute left-3 top-4 text-5xl md:text-6xl" style={{ animation: "var(--animate-floaty)" }}>🐚</div>
          <div className="absolute right-4 top-6 text-5xl md:text-7xl" style={{ animation: "floaty 5s ease-in-out infinite" }}>🐠</div>
          <div className="absolute left-6 bottom-6 text-5xl md:text-7xl" style={{ animation: "floaty 6s ease-in-out infinite" }}>🦀</div>
          <div className="absolute right-6 bottom-8 text-5xl md:text-6xl" style={{ animation: "floaty 4.5s ease-in-out infinite" }}>🐡</div>
          <div className="absolute left-1/3 bottom-2 text-4xl md:text-5xl" style={{ animation: "floaty 5.5s ease-in-out infinite" }}>🌿</div>
          <div className="absolute right-1/3 bottom-1 text-5xl md:text-6xl" style={{ animation: "var(--animate-sway)", transformOrigin: "bottom center" }}>🪸</div>
          <div className="absolute left-2 top-1/2 text-4xl md:text-5xl" style={{ animation: "var(--animate-sway)", transformOrigin: "bottom center" }}>🌿</div>
        </>
      )}
    </div>
  );
}
