"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { withBase } from "@/lib/basePath";
import { sample } from "@/lib/engine/shuffle";

const W = 1280;
const H = 720;

const ACCENTS = [
  { name: "Laut", from: "#12b1d6", to: "#06367a", q: "#ffd23f" },
  { name: "Sunset", from: "#ff8fc7", to: "#ff4d6d", q: "#fff3b0" },
  { name: "Hutan", from: "#7be38a", to: "#1e8c53", q: "#fff3b0" },
  { name: "Ungu", from: "#a78bfa", to: "#6d28d9", q: "#ffd23f" },
  { name: "Jeruk", from: "#ffd23f", to: "#ff8a3d", q: "#ffffff" },
];

const BADGE_PRESETS = ["BISA TEBAK? 🤔", "99% GAGAL! 😱", "CUMA JENIUS! 🧠", "TEBAK SEMUA! 🔥", "SUPER SERU! 🎉"];

// Fixed decorative bubbles (so the canvas is deterministic per render).
const BUBBLES = [
  { x: 0.08, y: 0.18, r: 46 }, { x: 0.9, y: 0.12, r: 60 }, { x: 0.16, y: 0.8, r: 38 },
  { x: 0.85, y: 0.78, r: 52 }, { x: 0.5, y: 0.08, r: 28 }, { x: 0.95, y: 0.45, r: 34 },
  { x: 0.05, y: 0.5, r: 30 },
];

export default function ThumbnailStudio() {
  const available = CATEGORIES.filter((c) => c.available);
  const [catId, setCatId] = useState(available[0]!.id);
  const category = available.find((c) => c.id === catId) ?? available[0]!;
  const [animalId, setAnimalId] = useState(category.items[0]!.id);
  const animal = category.items.find((a) => a.id === animalId) ?? category.items[0]!;

  const [headline, setHeadline] = useState(category.title.toUpperCase() + "!");
  const [badge, setBadge] = useState(BADGE_PRESETS[0]!);
  const [mystery, setMystery] = useState(true);
  const [accentIdx, setAccentIdx] = useState(0);
  const accent = ACCENTS[accentIdx]!;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);

  // When the category changes, reset the animal + headline.
  const onCat = (id: string) => {
    const c = available.find((x) => x.id === id)!;
    setCatId(id);
    setAnimalId(c.items[0]!.id);
    setHeadline(c.title.toUpperCase() + "!");
  };

  // Preload the logo once (same-origin → canvas stays exportable).
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      logoRef.current = img;
      setLogoReady(true);
    };
    img.src = withBase("/assets/logo-192.png");
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    // Background
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, accent.from);
    g.addColorStop(1, accent.to);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (const b of BUBBLES) {
      ctx.beginPath();
      ctx.arc(b.x * W, b.y * H, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center card
    const cardW = 470;
    const cardH = 470;
    const cx = W / 2;
    const cy = H / 2 + 36;
    ctx.save();
    roundRect(ctx, cx - cardW / 2, cy - cardH / 2, cardW, cardH, 56);
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 44;
    ctx.shadowOffsetY = 20;
    ctx.fill();
    ctx.restore();

    // Animal + mystery overlay
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (mystery) {
      ctx.globalAlpha = 0.16;
      ctx.font = "320px serif";
      ctx.fillText(animal.emoji, cx, cy + 14);
      ctx.globalAlpha = 1;
      ctx.font = "900 380px 'Baloo 2', system-ui, sans-serif";
      ctx.lineJoin = "round";
      ctx.lineWidth = 22;
      ctx.strokeStyle = "#ffffff";
      ctx.strokeText("?", cx, cy);
      ctx.fillStyle = accent.q;
      ctx.fillText("?", cx, cy);
    } else {
      ctx.font = "330px serif";
      ctx.fillText(animal.emoji, cx, cy + 14);
    }

    // Headline (top), auto-shrunk to fit
    strokedText(ctx, headline.toUpperCase(), W / 2, 132, fitFont(ctx, headline.toUpperCase(), W - 90, 104), "#ffd23f", "#03204a");

    // Badge (top-right, tilted)
    ctx.save();
    ctx.translate(W - 150, 230);
    ctx.rotate(-0.12);
    const bw = Math.max(220, ctx.measureText(badge).width);
    ctx.font = "900 44px 'Baloo 2', system-ui, sans-serif";
    const tw = ctx.measureText(badge).width + 56;
    roundRect(ctx, -tw / 2, -38, tw, 76, 38);
    ctx.fillStyle = "#ff4d6d";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(badge, 0, 2);
    ctx.restore();
    void bw;

    // Logo + wordmark (bottom-left)
    if (logoRef.current) ctx.drawImage(logoRef.current, 44, H - 150, 112, 112);
    strokedText(ctx, "Baby Mo Quiz", 176, H - 78, "900 52px 'Baloo 2', system-ui, sans-serif", "#ffffff", "#03204a", "left", 176);
  }, [accent, animal.emoji, headline, badge, mystery]);

  // Redraw whenever inputs change (and once fonts are ready for crisp text).
  useEffect(() => {
    draw();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) draw();
    });
    return () => {
      cancelled = true;
    };
  }, [draw, logoReady]);

  const download = () => {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${category.id}-${animal.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const randomize = () => {
    const a = sample(category.items, 1)[0]!;
    setAnimalId(a.id);
    setBadge(sample(BADGE_PRESETS, 1)[0]!);
    setAccentIdx(Math.floor(Math.random() * ACCENTS.length));
  };

  const items = useMemo(() => category.items, [category]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-foam">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl text-sunny text-stroke md:text-5xl">🖼️ Thumbnail Studio</h1>
        <Link href="/" className="display rounded-xl bg-white/15 px-4 py-2 text-base hover:bg-white/25">🏠 Beranda</Link>
      </div>
      <p className="mb-4 text-foam/80">Buat thumbnail YouTube 1280×720 yang menarik klik. Atur, lalu unduh PNG.</p>

      {/* Preview */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="mb-5 w-full rounded-2xl border-2 border-white/30 shadow-xl"
      />

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategori">
          <select value={catId} onChange={(e) => onCat(e.target.value)} className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam">
            {available.map((c) => <option key={c.id} value={c.id} className="text-deep">{c.title}</option>)}
          </select>
        </Field>
        <Field label="Subjek">
          <div className="flex gap-2">
            <select value={animalId} onChange={(e) => setAnimalId(e.target.value)} className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam">
              {items.map((a) => <option key={a.id} value={a.id} className="text-deep">{a.emoji} {a.name}</option>)}
            </select>
            <button onClick={randomize} className="display rounded-xl bg-white/15 px-3 py-2 text-sm">🎲 Acak</button>
          </div>
        </Field>
        <Field label="Judul Besar">
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam" />
        </Field>
        <Field label="Badge">
          <input value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam" />
          <div className="mt-2 flex flex-wrap gap-1">
            {BADGE_PRESETS.map((b) => (
              <button key={b} onClick={() => setBadge(b)} className="rounded-full bg-white/15 px-2 py-1 text-xs">{b}</button>
            ))}
          </div>
        </Field>
        <Field label="Gaya">
          <div className="flex gap-2">
            <Toggle active={mystery} onClick={() => setMystery(true)}>❓ Misteri</Toggle>
            <Toggle active={!mystery} onClick={() => setMystery(false)}>👀 Tampil</Toggle>
          </div>
        </Field>
        <Field label="Warna">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a, i) => (
              <button
                key={a.name}
                onClick={() => setAccentIdx(i)}
                className="h-9 w-9 rounded-full border-2"
                style={{ background: `linear-gradient(135deg, ${a.from}, ${a.to})`, borderColor: accentIdx === i ? "#fff" : "transparent" }}
                title={a.name}
              />
            ))}
          </div>
        </Field>
      </div>

      <button
        onClick={download}
        className="display mt-6 w-full rounded-3xl border-4 border-[#1b7a44] bg-[var(--color-easy)] px-6 py-4 text-2xl text-deep transition-transform active:scale-95"
        style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
      >
        ⬇️ Unduh Thumbnail PNG (1280×720)
      </button>
    </div>
  );
}

// ── canvas helpers ─────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxW: number, startPx: number): string {
  let px = startPx;
  for (; px > 40; px -= 4) {
    ctx.font = `900 ${px}px 'Baloo 2', system-ui, sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
  }
  return `900 ${px}px 'Baloo 2', system-ui, sans-serif`;
}

function strokedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fill: string,
  stroke: string,
  align: CanvasTextAlign = "center",
  alignX?: number,
) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.lineWidth = 14;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, alignX ?? x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, alignX ?? x, y);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-foam/80">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="display rounded-xl border-2 px-4 py-2 text-base"
      style={{ background: active ? "var(--color-sunny)" : "rgba(255,255,255,0.12)", color: active ? "#03204a" : "#eafcff", borderColor: active ? "#e0a800" : "rgba(255,255,255,0.25)" }}
    >
      {children}
    </button>
  );
}
