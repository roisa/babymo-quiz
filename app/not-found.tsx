import Link from "next/link";
import OceanBackground from "@/components/game/OceanBackground";
import Mascot from "@/components/game/Mascot";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden">
      <OceanBackground />
      <main className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <Mascot size={150} mood="wow" className="floaty" />
        <h1 className="display text-7xl text-sunny text-stroke md:text-9xl">404</h1>
        <p className="display text-3xl text-foam text-stroke md:text-5xl">Wah, tersesat di laut! 🌊</p>
        <p className="max-w-md text-lg text-foam/85 md:text-xl">
          Halaman yang kamu cari berenang entah ke mana. Ayo kembali ke permukaan
          bersama Baby Mo!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="display rounded-3xl border-4 border-[#1b7a44] bg-[var(--color-easy)] px-8 py-4 text-2xl text-deep transition-transform active:scale-95"
            style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
          >
            🏠 Kembali ke Beranda
          </Link>
          <Link
            href="/play/"
            className="display rounded-3xl border-4 border-white/30 bg-white/15 px-8 py-4 text-xl text-foam transition-transform active:scale-95"
          >
            ▶️ Main Kuis
          </Link>
        </div>
      </main>
    </div>
  );
}
