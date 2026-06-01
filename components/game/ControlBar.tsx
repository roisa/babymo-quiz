"use client";

import type { Phase } from "@/lib/engine/types";

interface Props {
  phase: Phase;
  paused: boolean;
  autoPlay: boolean;
  soundOn: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReveal: () => void;
  onReplaySound: () => void;
  onToggleAuto: () => void;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onHideControls: () => void;
  onExit: () => void;
}

function Btn({
  children,
  onClick,
  label,
  accent = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="display flex min-w-[3rem] flex-col items-center gap-0.5 rounded-2xl border-2 px-3 py-2 text-2xl transition-transform active:scale-90 disabled:opacity-40"
      style={{
        background: accent ? "var(--color-coral)" : "rgba(255,255,255,0.14)",
        borderColor: accent ? "#c23d31" : "rgba(255,255,255,0.3)",
        color: "#fff",
      }}
    >
      <span>{children}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </button>
  );
}

/**
 * Voiceover / Video-Creator control strip. Hidden in recording mode via the
 * `hide-on-record` class so the final frame is clean. Every action has a
 * keyboard shortcut (see the legend) for hands-on-keyboard recording.
 */
export default function ControlBar(props: Props) {
  const {
    phase,
    paused,
    autoPlay,
    soundOn,
    onTogglePause,
    onPrev,
    onNext,
    onReveal,
    onReplaySound,
    onToggleAuto,
    onToggleSound,
    onToggleFullscreen,
    onHideControls,
    onExit,
  } = props;

  return (
    <div className="hide-on-record pointer-events-auto flex flex-col items-center gap-2">
      <div className="glass flex flex-wrap items-center justify-center gap-2 rounded-3xl px-3 py-2">
        <Btn label="Prev (←)" onClick={onPrev}>⏮️</Btn>
        <Btn label={paused ? "Lanjut (Spasi)" : "Jeda (Spasi)"} onClick={onTogglePause} accent>
          {paused ? "▶️" : "⏸️"}
        </Btn>
        <Btn label="Jawab (R)" onClick={onReveal} disabled={phase !== "question"}>👁️</Btn>
        <Btn label="Next (→)" onClick={onNext}>⏭️</Btn>
        <Btn label="Suara Ulang (S)" onClick={onReplaySound}>🔁</Btn>
        <span className="mx-1 h-8 w-px bg-white/25" />
        <Btn label={autoPlay ? "Auto ON" : "Auto (A)"} onClick={onToggleAuto} accent={autoPlay}>
          {autoPlay ? "🤖" : "🎬"}
        </Btn>
        <Btn label={soundOn ? "Bunyi ON" : "Bunyi OFF"} onClick={onToggleSound}>{soundOn ? "🔊" : "🔇"}</Btn>
        <Btn label="Layar Penuh (F)" onClick={onToggleFullscreen}>⛶</Btn>
        <Btn label="Sembunyikan (H)" onClick={onHideControls}>🙈</Btn>
        <Btn label="Keluar" onClick={onExit}>✖️</Btn>
      </div>
      <p className="hide-on-record text-center text-xs text-foam/70 md:text-sm">
        Pintasan: <b>Spasi</b> jeda · <b>←/→</b> soal · <b>R</b> jawab · <b>S</b> suara · <b>A</b> auto · <b>F</b> layar penuh · <b>H</b> sembunyi
      </p>
    </div>
  );
}
