"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import seaAnimals from "@/data/sea-animals.json";
import { DIFFICULTIES, type Animal, type Category, type Difficulty } from "@/lib/engine/types";

const BLANK: Animal = {
  id: "",
  name: "",
  nameEn: "",
  emoji: "🐟",
  emojiClues: [],
  difficulty: "Mudah",
  funFact: "",
  habitat: "",
  answerChoices: [],
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/**
 * Admin-style content editor for the quiz dataset. Everything lives in local
 * React state; nothing is persisted server-side (static export, no backend).
 * Use Export/Import JSON to save your work and to ship it into /data.
 */
export default function QuizEditor() {
  const initial = seaAnimals as Category;
  const [meta, setMeta] = useState({
    id: initial.id,
    title: initial.title,
    headline: initial.headline,
    emoji: initial.emoji,
    blurb: initial.blurb,
  });
  const [items, setItems] = useState<Animal[]>(initial.items);
  const [draft, setDraft] = useState<Animal>({ ...BLANK });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Difficulty | "Semua">("Semua");
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => (filter === "Semua" ? items : items.filter((a) => a.difficulty === filter)),
    [items, filter],
  );

  const resetDraft = () => {
    setDraft({ ...BLANK });
    setEditingId(null);
  };

  const saveDraft = () => {
    if (!draft.name.trim()) {
      alert("Nama hewan wajib diisi.");
      return;
    }
    const id = draft.id.trim() || slugify(draft.name);
    const clean: Animal = {
      ...draft,
      id,
      nameEn: draft.nameEn?.trim() || undefined,
      emojiClues: (draft.emojiClues ?? []).filter(Boolean),
      answerChoices: (draft.answerChoices ?? []).filter(Boolean),
    };
    setItems((prev) => {
      const idx = prev.findIndex((a) => a.id === (editingId ?? id));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = clean;
        return copy;
      }
      return [...prev, clean];
    });
    resetDraft();
  };

  const editItem = (a: Animal) => {
    setDraft({ ...a, emojiClues: a.emojiClues ?? [], nameEn: a.nameEn ?? "" });
    setEditingId(a.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = (id: string) => {
    if (!confirm("Hapus hewan ini?")) return;
    setItems((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) resetDraft();
  };

  const onImagePick = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const exportJson = () => {
    const out: Category = { ...meta, available: true, items };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meta.id || "quiz"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Category;
        if (!Array.isArray(data.items)) throw new Error("Format tidak valid");
        setMeta({
          id: data.id ?? "quiz",
          title: data.title ?? "",
          headline: data.headline ?? "TEBAK HEWANNYA...",
          emoji: data.emoji ?? "🐟",
          blurb: data.blurb ?? "",
        });
        setItems(data.items);
        resetDraft();
      } catch (e) {
        alert("Gagal mengimpor JSON: " + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-foam">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-4xl text-sunny text-stroke md:text-5xl">✏️ Editor Kuis</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="display rounded-xl bg-white/15 px-4 py-2 text-base hover:bg-white/25">🏠 Beranda</Link>
          <Link href="/play/" className="display rounded-xl bg-white/15 px-4 py-2 text-base hover:bg-white/25">▶️ Main</Link>
          <button onClick={exportJson} className="display rounded-xl bg-[var(--color-easy)] px-4 py-2 text-base text-deep">⬇️ Export JSON</button>
          <button onClick={() => importRef.current?.click()} className="display rounded-xl bg-[var(--color-sea-2)] px-4 py-2 text-base">⬆️ Import JSON</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0] ?? null)} />
        </div>
      </div>

      {/* Category meta */}
      <div className="glass mb-6 grid gap-3 rounded-2xl border-2 border-white/25 p-4 sm:grid-cols-2">
        <L label="ID Kategori"><I value={meta.id} onChange={(v) => setMeta((m) => ({ ...m, id: v }))} /></L>
        <L label="Judul"><I value={meta.title} onChange={(v) => setMeta((m) => ({ ...m, title: v }))} /></L>
        <L label="Headline"><I value={meta.headline} onChange={(v) => setMeta((m) => ({ ...m, headline: v }))} /></L>
        <L label="Emoji"><I value={meta.emoji} onChange={(v) => setMeta((m) => ({ ...m, emoji: v }))} /></L>
      </div>

      {/* Draft form */}
      <div className="glass mb-6 rounded-2xl border-2 border-sunny/50 p-4">
        <h2 className="display mb-3 text-2xl text-sunny">{editingId ? "Edit Hewan" : "Tambah Hewan"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Nama (jawaban benar)"><I value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} /></L>
          <L label="Nama Inggris"><I value={draft.nameEn ?? ""} onChange={(v) => setDraft((d) => ({ ...d, nameEn: v }))} /></L>
          <L label="Emoji utama"><I value={draft.emoji} onChange={(v) => setDraft((d) => ({ ...d, emoji: v }))} /></L>
          <L label="Tingkat">
            <select
              value={draft.difficulty}
              onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value as Difficulty }))}
              className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="text-deep">{d}</option>
              ))}
            </select>
          </L>
          <L label="Habitat (opsional)"><I value={draft.habitat ?? ""} onChange={(v) => setDraft((d) => ({ ...d, habitat: v }))} /></L>
          <L label="Emoji petunjuk (pisah spasi)">
            <I
              value={(draft.emojiClues ?? []).join(" ")}
              onChange={(v) => setDraft((d) => ({ ...d, emojiClues: v.split(/\s+/).filter(Boolean) }))}
            />
          </L>
          <L label="Fakta seru" full>
            <textarea
              value={draft.funFact}
              onChange={(e) => setDraft((d) => ({ ...d, funFact: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam"
            />
          </L>
          <L label="Pilihan salah (pisah koma)" full>
            <I
              value={(draft.answerChoices ?? []).join(", ")}
              onChange={(v) => setDraft((d) => ({ ...d, answerChoices: v.split(",").map((s) => s.trim()).filter(Boolean) }))}
            />
          </L>
          <L label="Gambar (opsional)" full>
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="display rounded-xl bg-white/15 px-4 py-2 text-base">🖼️ Unggah Gambar</button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onImagePick(e.target.files?.[0] ?? null)} />
              {draft.image ? (
                <span className="flex items-center gap-2">
                  <Image src={draft.image} alt="preview" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" unoptimized />
                  <button onClick={() => setDraft((d) => ({ ...d, image: undefined }))} className="text-sm text-coral underline">hapus</button>
                </span>
              ) : (
                <span className="text-4xl">{draft.emoji}</span>
              )}
            </div>
          </L>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={saveDraft} className="display rounded-xl bg-[var(--color-easy)] px-5 py-2 text-lg text-deep">
            {editingId ? "💾 Simpan Perubahan" : "➕ Tambah"}
          </button>
          {editingId && (
            <button onClick={resetDraft} className="display rounded-xl bg-white/15 px-5 py-2 text-lg">Batal</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="display text-xl">Daftar ({items.length}):</span>
        {(["Semua", ...DIFFICULTIES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="display rounded-full px-3 py-1 text-sm"
            style={{ background: filter === f ? "var(--color-sunny)" : "rgba(255,255,255,0.15)", color: filter === f ? "#03204a" : "#eafcff" }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {visible.map((a) => (
          <div key={a.id} className="glass flex items-center gap-3 rounded-2xl border-2 border-white/20 p-3">
            <span className="text-4xl">{a.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="display truncate text-lg">{a.name}</p>
              <p className="truncate text-xs text-foam/70">{a.difficulty} · {a.habitat}</p>
            </div>
            <button onClick={() => editItem(a)} className="rounded-lg bg-white/15 px-3 py-1 text-sm">✏️</button>
            <button onClick={() => deleteItem(a.id)} className="rounded-lg bg-coral/80 px-3 py-1 text-sm">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function L({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-foam/80">{label}</span>
      {children}
    </label>
  );
}

function I({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border-2 border-white/25 bg-deep/40 px-3 py-2 text-foam"
    />
  );
}
