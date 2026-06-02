"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import OceanBackground from "@/components/game/OceanBackground";
import Mascot from "@/components/game/Mascot";
import BabyMoLogo from "@/components/BabyMoLogo";

// Baby Mo pose games (use the real character art).
const MO_GAMES = [
  { href: "/spot/", emoji: "🔍", title: "Temukan yang Beda", blurb: "Cari Baby Mo yang berbeda di antara keramaian." },
  { href: "/cari/", emoji: "🔎", title: "Mana Baby Mo?", blurb: "Temukan Baby Mo yang melakukan gaya tertentu." },
  { href: "/play/mo-expressions/", emoji: "😄", title: "Tebak Ekspresi", blurb: "Tebak ekspresi & gaya lucu Baby Mo." },
  { href: "/play/mo-expressions/?mode=silhouette", emoji: "🌑", title: "Bayangan Mo", blurb: "Tebak pose Baby Mo dari bayangannya." },
];

export default function HomePage() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <OceanBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 text-center">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3">
          <BabyMoLogo size={96} showText={false} />
          <Mascot size={150} mood="cheer" className="floaty" />
          <h1 className="display text-6xl text-sunny text-stroke md:text-8xl">Baby Mo Quiz</h1>
          <p className="display text-2xl text-aqua md:text-4xl">TEBAK HEWANNYA... 🐠</p>
          <p className="max-w-xl text-lg text-foam/90 md:text-xl">
            Pembuat video kuis seru untuk anak. Pilih mode, rekam dengan OBS atau QuickTime,
            dan buat video YouTube edukatif bersama Baby Mo!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/play/"
            className="display rounded-3xl border-4 border-[#1b7a44] bg-[var(--color-easy)] px-8 py-4 text-2xl text-deep transition-transform active:scale-95 md:text-3xl"
            style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
          >
            ▶️ Main Sekarang
          </Link>
          <Link
            href="/quiz-editor/"
            className="display rounded-3xl border-4 border-white/30 bg-white/15 px-8 py-4 text-xl text-foam transition-transform active:scale-95 md:text-2xl"
          >
            ✏️ Editor Kuis
          </Link>
        </div>

        {/* Featured: Baby Mo pose games */}
        <section className="w-full">
          <h2 className="display mb-4 text-3xl text-foam text-stroke md:text-4xl">Game Baby Mo</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {MO_GAMES.map((g, i) => (
              <Link key={g.href} href={g.href} className="block transition-transform hover:-translate-y-1 active:scale-95">
                <div
                  className="glass flex h-full flex-col items-center gap-2 rounded-3xl border-2 border-white/30 p-4 text-center transition-colors hover:border-sunny/70"
                  style={{ animation: "var(--animate-pop-in)", animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}
                >
                  <span className="text-6xl" style={{ animation: "floaty 4s ease-in-out infinite" }}>{g.emoji}</span>
                  <span className="display text-lg text-sunny md:text-2xl">{g.title}</span>
                  <span className="text-xs text-foam/75 md:text-sm">{g.blurb}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Category grid */}
        <section className="w-full">
          <h2 className="display mb-4 text-3xl text-foam text-stroke md:text-4xl">Pilih Permainan</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== "mo-expressions").map((c) => {
              const card = (
                <div
                  className="glass flex h-full flex-col items-center gap-2 rounded-3xl border-2 border-white/30 p-4 transition-transform"
                  style={{ opacity: c.available ? 1 : 0.55 }}
                >
                  <span className="text-6xl" style={{ animation: c.available ? "floaty 4s ease-in-out infinite" : undefined }}>
                    {c.emoji}
                  </span>
                  <span className="display text-xl text-foam md:text-2xl">{c.title}</span>
                  <span className="text-xs text-foam/70 md:text-sm">{c.blurb}</span>
                  {!c.available && (
                    <span className="display mt-1 rounded-full bg-white/20 px-3 py-0.5 text-xs text-foam">Segera 🔒</span>
                  )}
                </div>
              );
              return c.available ? (
                <Link key={c.id} href={`/play/${c.id}/`} className="block transition-transform hover:-translate-y-1 active:scale-95">
                  {card}
                </Link>
              ) : (
                <div key={c.id}>{card}</div>
              );
            })}
          </div>
        </section>

        <footer className="mt-4 text-sm text-foam/60">
          🐳 Baby Mo Quiz · dibuat untuk kreator video anak · jalankan lokal & rekam layar penuh 16:9
        </footer>
      </main>
    </div>
  );
}
