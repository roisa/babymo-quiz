"use client";

import { useState } from "react";

/**
 * "Share your result" buttons for the finish screen. Primary action opens
 * WhatsApp (wa.me) with a prefilled score + a link back to the game; a second
 * button uses the native share sheet (mobile) or copies the text (desktop).
 * Lives in the hide-on-record area — it's a creator/player tool, not part of
 * the recorded frame.
 */
export default function ShareResult({
  score,
  total,
  gameLabel,
  tone = "dark",
  className = "",
}: {
  score: number;
  total: number;
  gameLabel: string;
  /** "dark" = on the underwater theme, "light" = on the iOS theme. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const secondary =
    tone === "light"
      ? "border-black/10 bg-white/70 text-[#0b1020]"
      : "border-white/30 bg-white/15 text-white";

  const buildText = () => {
    // Clean link to this game (no query string), resolved at click time.
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "";
    return `🎉 Aku dapat skor ${score}/${total} di "${gameLabel}" — Baby Mo Quiz! 🐠\nBisa kamu kalahkan? Ayo main di sini 👉 ${url}`;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(buildText());
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    const text = buildText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Baby Mo Quiz", text });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={shareWhatsApp}
        className="display flex items-center gap-2 rounded-3xl px-6 py-3 text-xl text-white shadow-lg transition-transform active:scale-95"
        style={{ background: "#25D366" }}
      >
        <WhatsAppIcon /> Bagikan Skor ke WhatsApp
      </button>
      <button
        type="button"
        onClick={shareNative}
        className={`display rounded-3xl border-4 px-5 py-3 text-lg transition-transform active:scale-95 ${secondary}`}
      >
        {copied ? "✅ Tersalin" : "🔗 Bagikan / Salin"}
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.98-1.4.25-.68.25-1.27.17-1.39-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.34 4.95L2 22l5.3-1.39c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.9-4.45 9.9-9.9C21.94 6.45 17.5 2 12.04 2z" />
    </svg>
  );
}
