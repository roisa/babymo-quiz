// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — core data model
//
// The engine is category-agnostic: "Sea Animals" is just the first registered
// category. Farm Animals, Dinosaurs, Flags, etc. all reuse the SAME types and
// the SAME engine — they only ship a different dataset + theme.
// ───────────────────────────────────────────────────────────────────────────

/** The four kid-facing difficulty tiers (Indonesian labels). */
export type Difficulty = "Mudah" | "Sedang" | "Sulit" | "Mustahil";

export const DIFFICULTIES: Difficulty[] = ["Mudah", "Sedang", "Sulit", "Mustahil"];

/** How the answer is hidden / presented to the player. */
export type AnswerMode =
  | "multiple-choice" // Mode A — pick from choices
  | "image" // Mode B — guess from the plain image
  | "silhouette" // Mode C — black silhouette
  | "blur" // Mode D — heavy blur, sharpens on reveal
  | "zoom" // Mode E — zoomed-in crop
  | "emoji" // Mode F — emoji clues only, image hidden until reveal
  | "fun-fact"; // Mode G — fun-fact text clues only

export const ANSWER_MODES: { id: AnswerMode; label: string; hint: string }[] = [
  { id: "multiple-choice", label: "Pilihan Ganda", hint: "Mode A · pick the answer" },
  { id: "image", label: "Tebak Gambar", hint: "Mode B · guess from image" },
  { id: "silhouette", label: "Siluet", hint: "Mode C · silhouette challenge" },
  { id: "blur", label: "Blur", hint: "Mode D · blur challenge" },
  { id: "zoom", label: "Zoom", hint: "Mode E · zoom challenge" },
  { id: "emoji", label: "Emoji", hint: "Mode F · emoji clues" },
  { id: "fun-fact", label: "Fakta Seru", hint: "Mode G · fun-fact clues" },
];

/**
 * A single quiz subject. Named `Animal` for the flagship Sea Animals mode but
 * it models any guessable subject (a flag, a fruit, a planet…).
 */
export interface Animal {
  id: string;
  /** The correct answer, e.g. "Lumba-lumba". */
  name: string;
  /** English name, handy for YouTube SEO + creator reference. */
  nameEn?: string;
  /** Optional real image (relative to /public). Falls back to `emoji`. */
  image?: string;
  /** Big emoji used as the zero-asset visual + emoji-clue mode. */
  emoji: string;
  /** Extra emoji clues for Mode F. */
  emojiClues?: string[];
  difficulty: Difficulty;
  /** Kid-friendly fun fact, revealed at the end. */
  funFact: string;
  /** Where it lives, e.g. "Terumbu karang". Optional (not all categories use it). */
  habitat?: string;
  /** Wrong options for multiple-choice. The correct name is added automatically. */
  answerChoices: string[];
}

/** A themed pack of subjects = one game type. */
export interface Category {
  id: string;
  /** Brandable display name, e.g. "Tebak Hewan Laut". */
  title: string;
  /** The "TEBAK HEWANNYA..." style headline shown at the top of the game. */
  headline: string;
  emoji: string;
  /** Short marketing blurb for the home grid. */
  blurb: string;
  /** Whether the dataset is shipped yet (future categories show "Segera"). */
  available: boolean;
  items: Animal[];
}

// ─── Engine runtime config & state ──────────────────────────────────────────

export type QuestionOrder = "sequential" | "random";

export interface QuizSettings {
  difficulty: Difficulty | "Semua";
  order: QuestionOrder;
  answerMode: AnswerMode;
  /** Seconds per question. `custom` lets the user type any value. */
  durationSec: number;
  /** Number of questions in the session (clamped to the available pool). */
  questionCount: number;
  soundOn: boolean;
  /** Looping background music during play. */
  musicOn: boolean;
}

export const DEFAULT_SETTINGS: QuizSettings = {
  difficulty: "Mudah",
  order: "random",
  answerMode: "multiple-choice",
  durationSec: 15,
  questionCount: 10,
  soundOn: true,
  musicOn: false,
};

/** Lifecycle phases of a single question. */
export type Phase = "idle" | "question" | "reveal" | "complete";
