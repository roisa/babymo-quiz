"use client";

import { useState } from "react";
import type { Animal, Category, Difficulty } from "@/lib/engine/types";
import { generateYouTubeMeta } from "@/lib/youtube/templates";

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
      className="display rounded-xl border-2 border-white/30 bg-white/15 px-3 py-1 text-sm text-foam transition-transform active:scale-95 md:text-base"
    >
      {done ? "✅ Tersalin" : `📋 ${label}`}
    </button>
  );
}

/**
 * YouTube optimization helper: generates ready-to-paste title ideas, a full
 * description and a hashtag set from the session that was just played.
 */
export default function YouTubePanel({
  category,
  items,
  difficulty,
}: {
  category: Category;
  items: Animal[];
  difficulty: Difficulty | "Semua";
}) {
  const meta = generateYouTubeMeta(category, items, difficulty);

  return (
    <div className="glass flex flex-col gap-4 rounded-3xl border-2 border-white/30 p-4 text-left md:p-6">
      <h3 className="display text-2xl text-sunny md:text-3xl">📺 Bantuan Upload YouTube</h3>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="display text-lg text-aqua md:text-xl">Ide Judul</h4>
        </div>
        <ul className="flex flex-col gap-2">
          {meta.titles.map((t, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-xl bg-deep/30 px-3 py-2">
              <span className="text-sm text-foam md:text-base">{t}</span>
              <CopyBtn text={t} label="Salin" />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="display text-lg text-aqua md:text-xl">Deskripsi</h4>
          <CopyBtn text={meta.description} label="Salin Deskripsi" />
        </div>
        <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xl bg-deep/30 p-3 text-xs text-foam/90 md:text-sm">
          {meta.description}
        </pre>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="display text-lg text-aqua md:text-xl">Hashtag</h4>
          <CopyBtn text={meta.hashtags.join(" ")} label="Salin Hashtag" />
        </div>
        <p className="rounded-xl bg-deep/30 p-3 text-sm text-aqua md:text-base">{meta.hashtags.join(" ")}</p>
      </section>
    </div>
  );
}
