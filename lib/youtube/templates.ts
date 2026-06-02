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
    `${category.emoji} ${category.title}! ${count} Quiz ${word} Untuk Anak | Baby Mo Quiz`,
    `${category.emoji} ${count} ${category.title} Seru | Belajar Sambil Bermain | Baby Mo Quiz`,
    `Bisa Tebak Semua? ${category.emoji} ${category.title} ${word} | Baby Mo Quiz`,
    `${category.emoji} ${category.headline} ${category.title} untuk Anak & Balita | Baby Mo Quiz`,
  ];

  const list = items
    .map((a, i) => `${String(i + 1).padStart(2, "0")}. ${a.emoji} ${a.name}`)
    .join("\n");

  const description = [
    `${category.emoji} Selamat datang di Baby Mo Quiz!`,
    "",
    `Ayo ikuti ${count} tebakan seru dalam video ini! Cocok untuk anak-anak dan balita. Tonton, tebak, dan belajar bersama Baby Mo! 🐳`,
    "",
    "🎯 Cara bermain:",
    "1. Lihat gambar atau petunjuknya",
    "2. Tebak nama hewannya sebelum waktu habis",
    "3. Jawaban dan fakta seru muncul di akhir!",
    "",
    "📋 Daftar hewan di video ini:",
    list,
    "",
    "👶 Tentang Baby Mo Quiz:",
    "Baby Mo Quiz membuat video edukasi yang menyenangkan untuk anak-anak Indonesia. Belajar sambil bermain!",
    "",
    "🔔 Jangan lupa LIKE, SUBSCRIBE, dan nyalakan lonceng 🔔 supaya tidak ketinggalan video terbaru dari Baby Mo!",
    "",
    "#BabyMoQuiz #TebakHewan #HewanLaut",
  ].join("\n");

  const hashtags = [
    "#BabyMoQuiz",
    "#TebakHewan",
    "#TebakHewanLaut",
    "#HewanLaut",
    "#QuizAnak",
    "#BelajarSambilBermain",
    "#EdukasiAnak",
    "#VideoAnak",
    "#Balita",
    "#SeaAnimals",
    "#KidsQuiz",
    "#GuessTheAnimal",
  ];

  return { titles, description, hashtags };
}
