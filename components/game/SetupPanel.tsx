"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ANSWER_MODES,
  DIFFICULTIES,
  type AnswerMode,
  type Category,
  type Difficulty,
  type QuizSettings,
} from "@/lib/engine/types";
import Mascot from "./Mascot";
import BabyMoLogo from "@/components/BabyMoLogo";

const TIMER_PRESETS = [10, 15, 20];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="display rounded-2xl border-4 px-4 py-2 text-lg transition-transform active:scale-95 md:text-xl"
      style={{
        background: active ? "var(--color-sunny)" : "rgba(255,255,255,0.12)",
        borderColor: active ? "#e0a800" : "rgba(255,255,255,0.25)",
        color: active ? "#03204a" : "#eafcff",
      }}
    >
      {children}
    </button>
  );
}

export default function SetupPanel({
  category,
  settings,
  autoPlay,
  onChange,
  onAutoPlayChange,
  onStart,
}: {
  category: Category;
  settings: QuizSettings;
  autoPlay: boolean;
  onChange: (patch: Partial<QuizSettings>) => void;
  onAutoPlayChange: (v: boolean) => void;
  onStart: (recording: boolean) => void;
}) {
  const [customTimer, setCustomTimer] = useState<string>("");

  const pool =
    settings.difficulty === "Semua"
      ? category.items
      : category.items.filter((a) => a.difficulty === settings.difficulty);
  const maxCount = pool.length;

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 md:p-6">
      <BabyMoLogo size={56} className="mx-auto" />
      <div className="flex items-center justify-center gap-4">
        <Mascot size={96} mood="happy" className="floaty" />
        <div className="text-center">
          <h1 className="display text-5xl text-sunny text-stroke md:text-7xl">{category.headline}</h1>
          <p className="display mt-1 text-2xl text-aqua md:text-3xl">{category.title} · Baby Mo Quiz</p>
        </div>
      </div>

      <div className="glass flex flex-col gap-5 rounded-3xl border-2 border-white/30 p-5 md:p-6">
        {/* Difficulty */}
        <Field label="🎯 Tingkat Kesulitan">
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <Chip key={d} active={settings.difficulty === d} onClick={() => onChange({ difficulty: d })}>
                {d}
              </Chip>
            ))}
            <Chip active={settings.difficulty === "Semua"} onClick={() => onChange({ difficulty: "Semua" })}>
              🌊 Semua
            </Chip>
          </div>
          <p className="mt-1 text-sm text-foam/70">{maxCount} hewan tersedia</p>
        </Field>

        {/* Answer mode */}
        <Field label="🃏 Mode Tebakan">
          <div className="flex flex-wrap gap-2">
            {ANSWER_MODES.map((m) => (
              <Chip
                key={m.id}
                active={settings.answerMode === m.id}
                onClick={() => onChange({ answerMode: m.id as AnswerMode })}
              >
                {m.label}
              </Chip>
            ))}
          </div>
        </Field>

        {/* Timer */}
        <Field label="⏱️ Waktu per Soal">
          <div className="flex flex-wrap items-center gap-2">
            {TIMER_PRESETS.map((t) => (
              <Chip
                key={t}
                active={settings.durationSec === t && customTimer === ""}
                onClick={() => {
                  setCustomTimer("");
                  onChange({ durationSec: t });
                }}
              >
                {t}s
              </Chip>
            ))}
            <input
              type="number"
              min={3}
              max={120}
              value={customTimer}
              placeholder="Custom"
              onChange={(e) => {
                setCustomTimer(e.target.value);
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v) && v >= 3) onChange({ durationSec: v });
              }}
              className="display w-28 rounded-2xl border-4 border-white/25 bg-white/12 px-3 py-2 text-lg text-foam placeholder:text-foam/50"
            />
          </div>
        </Field>

        {/* Order + count */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="🔀 Urutan Soal">
            <div className="flex gap-2">
              <Chip active={settings.order === "random"} onClick={() => onChange({ order: "random" })}>
                🎲 Acak
              </Chip>
              <Chip active={settings.order === "sequential"} onClick={() => onChange({ order: "sequential" })}>
                📋 Urut
              </Chip>
            </div>
          </Field>
          <Field label={`🔢 Jumlah Soal: ${Math.min(settings.questionCount, maxCount)}`}>
            <input
              type="range"
              min={1}
              max={Math.max(1, maxCount)}
              value={Math.min(settings.questionCount, maxCount)}
              onChange={(e) => onChange({ questionCount: parseInt(e.target.value, 10) })}
              className="w-full accent-[var(--color-coral)]"
            />
          </Field>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-2">
          <Chip active={settings.soundOn} onClick={() => onChange({ soundOn: !settings.soundOn })}>
            {settings.soundOn ? "🔊 Suara ON" : "🔇 Suara OFF"}
          </Chip>
          <Chip active={settings.musicOn} onClick={() => onChange({ musicOn: !settings.musicOn })}>
            {settings.musicOn ? "🎵 Musik ON" : "🎶 Musik OFF"}
          </Chip>
          <Chip active={autoPlay} onClick={() => onAutoPlayChange(!autoPlay)}>
            {autoPlay ? "🤖 Auto-Play ON" : "🎬 Auto-Play OFF"}
          </Chip>
        </div>
      </div>

      {/* Start buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onStart(false)}
          disabled={maxCount === 0}
          className="display flex-1 rounded-3xl border-4 border-[#1b7a44] bg-[var(--color-easy)] px-6 py-4 text-2xl text-deep transition-transform active:scale-95 disabled:opacity-50 md:text-3xl"
          style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
        >
          ▶️ Mulai Main
        </button>
        <button
          type="button"
          onClick={() => onStart(true)}
          disabled={maxCount === 0}
          className="display flex-1 rounded-3xl border-4 border-[#c23d31] bg-[var(--color-coral)] px-6 py-4 text-xl text-white transition-transform active:scale-95 disabled:opacity-50 md:text-2xl"
          style={{ boxShadow: "0 8px 0 rgba(3,32,74,0.35)" }}
        >
          🎥 Mulai Sesi Rekaman YouTube
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-foam/80">
        <Link href="/quiz-editor/" className="display rounded-xl bg-white/12 px-4 py-2 text-base transition-transform active:scale-95 hover:bg-white/20">
          ✏️ Editor Kuis
        </Link>
        <Link href="/" className="display rounded-xl bg-white/12 px-4 py-2 text-base transition-transform active:scale-95 hover:bg-white/20">
          🏠 Beranda
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="display mb-2 text-xl text-foam md:text-2xl">{label}</h3>
      {children}
    </div>
  );
}
