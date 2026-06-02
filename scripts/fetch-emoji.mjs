#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Download the Twemoji SVGs used by every dataset into public/emoji/.
//
// Reads data/*.json, collects every emoji (and emojiClues), computes the
// Twemoji filename for each, and fetches the SVG from jsDelivr. Bundling them
// (rather than hot-linking a CDN) keeps the app crisp at 4K, fully offline for
// local recording, and self-contained on GitHub Pages.
//
//   node scripts/fetch-emoji.mjs
//
// Twemoji graphics are licensed CC-BY 4.0 (https://github.com/jdecked/twemoji).
// ───────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const OUT_DIR = join(ROOT, "public", "emoji");

// Try several well-known SVG emoji sources in order; first 200 wins. This makes
// the script resilient to any single CDN being down or blocked.
const SOURCES = [
  (cp) => `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${cp}.svg`,
  (cp) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${cp}.svg`,
  (cp) => `https://unpkg.com/@twemoji/svg@15.1.0/${cp}.svg`,
  (cp) => `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji/svg/emoji_u${cp.replace(/-/g, "_")}.svg`,
];

async function fetchSvg(cp) {
  let lastErr;
  for (const url of SOURCES.map((s) => s(cp))) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("no source");
}

const ZWJ = 0x200d;
const VS16 = 0xfe0f;

function toCodepoint(emoji) {
  const hasZwj = [...emoji].some((ch) => ch.codePointAt(0) === ZWJ);
  const chars = hasZwj ? emoji : [...emoji].filter((ch) => ch.codePointAt(0) !== VS16).join("");
  return [...chars].map((ch) => ch.codePointAt(0).toString(16)).join("-");
}

function collectEmoji() {
  const set = new Set();
  for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
    const cat = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    if (cat.emoji) set.add(cat.emoji);
    for (const item of cat.items ?? []) {
      if (item.emoji) set.add(item.emoji);
      for (const e of item.emojiClues ?? []) set.add(e);
    }
  }
  return set;
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const emojis = collectEmoji();
  const codepoints = new Set([...emojis].map(toCodepoint));
  console.log(`Found ${emojis.size} unique emoji → ${codepoints.size} codepoints.`);

  let ok = 0;
  const missing = [];
  for (const cp of codepoints) {
    const dest = join(OUT_DIR, `${cp}.svg`);
    if (existsSync(dest)) {
      ok++;
      continue;
    }
    try {
      const svg = await fetchSvg(cp);
      writeFileSync(dest, svg);
      ok++;
    } catch (err) {
      missing.push(cp);
      console.warn(`  ⚠️  ${cp}: ${err.message} (will fall back to text emoji)`);
    }
  }

  console.log(`✅ ${ok}/${codepoints.size} SVGs ready in public/emoji/`);
  if (missing.length) console.log(`   Missing (text-emoji fallback): ${missing.join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
