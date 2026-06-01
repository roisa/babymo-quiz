// ───────────────────────────────────────────────────────────────────────────
// Category registry — the seam that makes future game types trivial.
//
// To add "Farm Animals", "Dinosaurs", "Flags", etc.: drop a JSON file in
// /data shaped like sea-animals.json and register it here. The engine, UI,
// editor and YouTube generator all work unchanged.
// ───────────────────────────────────────────────────────────────────────────

import seaAnimals from "@/data/sea-animals.json";
import farmAnimals from "@/data/farm-animals.json";
import type { Category } from "@/lib/engine/types";

const SEA_ANIMALS = seaAnimals as Category;
const FARM_ANIMALS = farmAnimals as Category;

/** Placeholder cards for game types the architecture already supports. */
const UPCOMING: Pick<Category, "id" | "title" | "emoji" | "blurb">[] = [
  { id: "dinosaurs", title: "Dinosaurus", emoji: "🦕", blurb: "Raksasa purba yang seru ditebak!" },
  { id: "birds", title: "Burung", emoji: "🦜", blurb: "Burung warna-warni dari seluruh dunia." },
  { id: "insects", title: "Serangga", emoji: "🐝", blurb: "Si kecil yang menakjubkan." },
  { id: "fruits", title: "Buah-buahan", emoji: "🍓", blurb: "Tebak buah favoritmu!" },
  { id: "vegetables", title: "Sayuran", emoji: "🥕", blurb: "Sehat dan seru ditebak." },
  { id: "vehicles", title: "Kendaraan", emoji: "🚗", blurb: "Darat, laut, dan udara." },
  { id: "countries", title: "Negara", emoji: "🗺️", blurb: "Jelajahi dunia." },
  { id: "flags", title: "Bendera", emoji: "🚩", blurb: "Tebak bendera negara." },
  { id: "space", title: "Luar Angkasa", emoji: "🪐", blurb: "Planet, bintang, dan roket." },
];

export const CATEGORIES: Category[] = [
  SEA_ANIMALS,
  FARM_ANIMALS,
  ...UPCOMING.map((u) => ({
    ...u,
    headline: "SEGERA HADIR...",
    available: false,
    items: [],
  })),
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export const DEFAULT_CATEGORY = SEA_ANIMALS;
