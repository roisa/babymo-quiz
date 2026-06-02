// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — YouTube metadata generator.
//
// Turns a finished quiz session into ready-to-paste title / description /
// hashtag text so a creator can publish without rewriting copy every time.
// ───────────────────────────────────────────────────────────────────────────

import type { Animal, Category, Difficulty } from "@/lib/engine/types";

export interface YouTubeMeta {
  titles: string[];
  description: string;
  hashtags: string[];
}

const DIFF_WORD: Record<Difficulty | "Semua", string> = {
  Mudah: "Mudah",
  Sedang: "Seru",
  Sulit: "Susah",
  Mustahil: "Super Susah",
  Semua: "Seru",
};

export function generateYouTubeMeta(
  category: Category,
  items: Animal[],
  difficulty: Difficulty | "Semua",
): YouTubeMeta {
  const count = items.length;
  const word = DIFF_WORD[difficulty];

  const titles = [
    `${category.emoji} ${category.title} CHALLENGE! Bisa Tebak Semua ${count}? | Baby Mo Quiz`,
    `😱 99% Anak GAGAL Tebak Semua! ${category.emoji} ${category.title} | Baby Mo Quiz`,
    `🧠 Cuma JENIUS yang Bisa Tebak Ini! ${category.title} ${word} | Baby Mo Quiz`,
    `${category.emoji} ${count} ${category.title} — Berapa yang Kamu Tahu? 🤔 | Baby Mo Quiz`,
    `⏱️ Tebak ${category.title} dalam 10 Detik! Berani Coba? | Baby Mo Quiz`,
  ];

  const list = items
    .map((a, i) => `${String(i + 1).padStart(2, "0")}. ${a.emoji} ${a.name}`)
    .join("\n");

  const description = [
    `${category.emoji} Bisa tebak SEMUA ${count} ${category.title.toLowerCase()}? Buktikan kamu jenius! 🧠`,
    "",
    `Tonton sampai habis dan hitung skormu! Cocok untuk anak-anak, balita, dan keluarga. Belajar sambil bermain bersama Baby Mo! 🐳`,
    "",
    "💬 BERAPA SKORMU? Tulis jawabanmu di kolom komentar — kami baca semua! 👇",
    "",
    "🎯 Cara bermain:",
    "1. Lihat gambar atau petunjuknya 👀",
    "2. Tebak sebelum waktu habis ⏱️ (boleh pause!)",
    "3. Jawaban & fakta seru muncul di akhir 🎉",
    "",
    "📋 Daftar di video ini:",
    list,
    "",
    "🔔 SUKA video ini? LIKE 👍, SUBSCRIBE, dan nyalakan lonceng 🔔 — video baru setiap minggu!",
    "🔁 Tonton lagi dan ajak teman & saudaramu ikut tebak!",
    "",
    "👶 Baby Mo Quiz — video edukasi seru untuk anak Indonesia. Belajar sambil bermain!",
    "",
    `#BabyMoQuiz #TebakHewan #QuizAnak`,
  ].join("\n");

  const hashtags = [
    "#BabyMoQuiz",
    "#TebakHewan",
    "#Challenge",
    "#QuizAnak",
    "#TebakGambar",
    "#BelajarSambilBermain",
    "#EdukasiAnak",
    "#VideoAnak",
    "#Balita",
    "#KidsQuiz",
    "#GuessTheAnimal",
    "#QuizTime",
  ];

  return { titles, description, hashtags };
}
