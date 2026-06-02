// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — "Temukan yang Beda" (Spot the Odd Baby Mo).
//
// A grid is filled with copies of one Baby Mo pose; exactly one cell shows a
// different pose. Find it before the timer runs out. Ported from the babymo.id
// game and adapted into a YouTube-ready quiz mode (autoplay + interactive).
// Uses the real Baby Mo pose art in /public/baby-mo-poses (crisp at 4K).
// ───────────────────────────────────────────────────────────────────────────

export type SpotLevelKey = "Mudah" | "Sedang" | "Sulit" | "Mustahil";

export interface SpotLevel {
  key: SpotLevelKey;
  cols: number;
  rows: number;
}

// Wide-ish grids that frame nicely in 16:9 and stay readable on a TV.
export const SPOT_LEVELS: SpotLevel[] = [
  { key: "Mudah", cols: 4, rows: 3 },
  { key: "Sedang", cols: 6, rows: 4 },
  { key: "Sulit", cols: 8, rows: 5 },
  { key: "Mustahil", cols: 10, rows: 6 },
];

export interface SpotPuzzle {
  slug: string;
  emoji: string;
  /** The pose that fills the grid (file in /public/baby-mo-poses). */
  baseFile: string;
  /** The single odd pose to find. */
  oddFile: string;
  title: string;
  blurb: string;
  intro: string;
  funFact: string;
}

const DIR = "/baby-mo-poses";
export const poseSrc = (file: string) => `${DIR}/${file}`;

export const SPOT_PUZZLES: SpotPuzzle[] = [
  {
    slug: "baby-mo-berlari",
    emoji: "🏃",
    baseFile: "baby-mo-run.png",
    oddFile: "baby-mo-idea.png",
    title: "Baby Mo Berlari",
    blurb: "Semua Baby Mo sedang berlari — temukan satu yang berhenti dapat ide!",
    intro:
      "Baby Mo paling suka berlari di taman. Tapi di antara semua yang berlari, ada satu Baby Mo yang berhenti karena punya ide cemerlang. Bisakah kamu menemukannya secepat kilat?",
    funFact: "Berlari membantu anak melatih keseimbangan dan koordinasi tubuh.",
  },
  {
    slug: "baby-mo-gembira",
    emoji: "🎉",
    baseFile: "baby-mo-yeyy.png",
    oddFile: "baby-mo-wow.png",
    title: "Baby Mo Gembira",
    blurb: "Lautan Baby Mo melompat gembira — mana yang sedang takjub?",
    intro:
      "Hore! Semua Baby Mo melompat kegirangan. Namun ada satu yang berhenti sejenak karena takjub melihat sesuatu. Ayo temukan Baby Mo yang berbeda itu!",
    funFact: "Tertawa dan melompat melepaskan hormon bahagia pada anak.",
  },
  {
    slug: "baby-mo-semangat",
    emoji: "✊",
    baseFile: "baby-mo-yes.png",
    oddFile: "baby-mo-alright.png",
    title: "Baby Mo Semangat",
    blurb: "Semua mengepalkan tangan 'Yes!' — temukan yang berpose beda.",
    intro:
      "Yes! Baby Mo penuh semangat. Tapi satu Baby Mo memilih gaya yang berbeda. Pusatkan perhatianmu dan temukan dia!",
    funFact: "Memberi semangat pada anak menumbuhkan rasa percaya diri.",
  },
  {
    slug: "baby-mo-oke",
    emoji: "👌",
    baseFile: "baby-mo-ok.png",
    oddFile: "baby-mo-idea.png",
    title: "Baby Mo Oke",
    blurb: "Semuanya bilang 'oke' — kecuali satu yang punya ide.",
    intro:
      "Baby Mo memberi tanda oke dengan ceria. Di antara semuanya, satu Baby Mo justru mengangkat jari karena punya ide. Temukan yang beda!",
    funFact: "Isyarat tangan membantu bayi berkomunikasi sebelum bisa bicara.",
  },
  {
    slug: "baby-mo-ide",
    emoji: "💡",
    baseFile: "baby-mo-idea.png",
    oddFile: "baby-mo-ok.png",
    title: "Baby Mo Punya Ide",
    blurb: "Semua Baby Mo dapat ide — temukan satu yang bilang oke.",
    intro:
      "Lampu ide menyala! Semua Baby Mo mengangkat jari penuh semangat. Tapi satu Baby Mo malah memberi tanda oke. Bisa temukan?",
    funFact: "Anak yang sering diajak berpikir tumbuh lebih kreatif.",
  },
  {
    slug: "baby-mo-takjub",
    emoji: "😮",
    baseFile: "baby-mo-wow.png",
    oddFile: "baby-mo-yeyy.png",
    title: "Baby Mo Takjub",
    blurb: "Wow! Semua takjub — mana yang melompat gembira?",
    intro:
      "Wow! Baby Mo terpana melihat sesuatu yang menakjubkan. Namun satu Baby Mo justru melompat kegirangan. Temukan dia di antara keramaian!",
    funFact: "Rasa kagum mendorong anak untuk terus bertanya dan belajar.",
  },
  {
    slug: "baby-mo-berpikir",
    emoji: "🤔",
    baseFile: "baby-mo-pose-20.png",
    oddFile: "baby-mo-wow.png",
    title: "Baby Mo Berpikir",
    blurb: "Semua sedang berpikir — temukan satu yang tiba-tiba takjub.",
    intro:
      "Hmm… Baby Mo sedang berpikir keras. Tapi satu Baby Mo sudah menemukan jawabannya dan takjub! Temukan Baby Mo yang berbeda itu.",
    funFact: "Memberi anak waktu berpikir melatih kesabaran dan fokus.",
  },
  {
    slug: "baby-mo-terima-kasih",
    emoji: "🙏",
    baseFile: "baby-mo-thank-you.png",
    oddFile: "baby-mo-ok.png",
    title: "Baby Mo Berterima Kasih",
    blurb: "Semua berterima kasih — mana yang memberi tanda oke?",
    intro:
      "Terima kasih! Baby Mo penuh rasa syukur. Di antara semuanya, satu Baby Mo memberi tanda oke. Ayo temukan yang berbeda!",
    funFact: "Mengajarkan rasa syukur membuat anak lebih bahagia.",
  },
  {
    slug: "baby-mo-malu",
    emoji: "🙈",
    baseFile: "baby-mo-pose-09.png",
    oddFile: "baby-mo-pose-06.png",
    title: "Baby Mo Malu",
    blurb: "Semua tersipu malu — temukan satu yang melambai ceria.",
    intro:
      "Hihi… Baby Mo tersipu malu sambil menutup pipinya. Tapi satu Baby Mo justru melambai dengan ceria. Bisakah kamu menemukannya?",
    funFact: "Rasa malu adalah bagian normal dari perkembangan emosi anak.",
  },
  {
    slug: "baby-mo-ceria",
    emoji: "🙌",
    baseFile: "baby-mo-pose-31.png",
    oddFile: "baby-mo-pose-37.png",
    title: "Baby Mo Ceria",
    blurb: "Semua tersenyum ceria — mana yang sedang sedih?",
    intro:
      "Baby Mo tersenyum ceria sepanjang hari. Namun satu Baby Mo sedang murung dan sedih. Temukan Baby Mo yang berbeda itu, lalu beri dia pelukan!",
    funFact: "Mengenali teman yang sedih mengajarkan anak berempati.",
  },
  {
    slug: "baby-mo-mengedip",
    emoji: "😉",
    baseFile: "baby-mo-pose-05.png",
    oddFile: "baby-mo-pose-10.png",
    title: "Baby Mo Mengedip",
    blurb: "Tantangan jeli! Dua pose mengedip yang sangat mirip.",
    intro:
      "Baby Mo mengedipkan mata dengan gaya. Tantangan ini sulit karena pose yang beda sangat mirip — perhatikan tangannya baik-baik!",
    funFact: "Permainan mencari perbedaan melatih ketelitian visual anak.",
  },
  {
    slug: "baby-mo-keren",
    emoji: "🤙",
    baseFile: "baby-mo-alright.png",
    oddFile: "baby-mo-yes.png",
    title: "Baby Mo Keren",
    blurb: "Semua bergaya keren — temukan satu yang berseru 'Yes!'",
    intro:
      "Baby Mo bergaya keren dan santai. Tapi satu Baby Mo terlalu bersemangat dan berseru 'Yes!'. Ayo cari yang berbeda!",
    funFact: "Meniru gaya adalah cara alami anak belajar berekspresi.",
  },
];

export function getSpotLevel(key: string): SpotLevel {
  return SPOT_LEVELS.find((l) => l.key === key) ?? SPOT_LEVELS[0]!;
}
