#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────────────
// Baby Mo Quiz — automated 4K episode renderer.
//
// Drives a hands-free auto-play session in headless Chromium (via Playwright),
// records it at 3840×2160, and transcodes to a clean MP4 with ffmpeg. Produces
// pixel-perfect, frame-smooth 4K with no screen-recording artifacts — ideal for
// batch-producing YouTube episodes.
//
// Prereqs (on your iMac, not needed in CI):
//   npm install
//   npx playwright install chromium
//   brew install ffmpeg
//
// Usage — start the app first (npm run dev), then:
//   npm run record -- --category sea-animals --difficulty Mudah --mode silhouette \
//                     --duration 12 --count 20 --music 1
//
// Note: Playwright video has NO audio (the quiz SFX/music are generated in the
// browser). Add your voiceover/music in your editor, or use OBS if you need the
// in-app audio captured live. A YouTube metadata sidecar (.txt) is written too.
// ───────────────────────────────────────────────────────────────────────────

import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── tiny CLI parser (--key value / --flag) ───────────────────────────────────
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else {
        out[key] = "1";
      }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const cfg = {
  origin: args.origin ?? "http://localhost:3000",
  base: args.base ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "/babymo-quiz",
  category: args.category ?? "sea-animals",
  difficulty: args.difficulty ?? "Mudah",
  mode: args.mode ?? "multiple-choice",
  duration: parseInt(args.duration ?? "12", 10),
  count: parseInt(args.count ?? "20", 10),
  order: args.order ?? "random",
  music: args.music ?? "1",
  sound: args.sound ?? "1",
  width: parseInt(args.width ?? "3840", 10),
  height: parseInt(args.height ?? "2160", 10),
  fps: parseInt(args.fps ?? "30", 10),
  out: args.out,
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outDir = join(ROOT, "episodes");
const outFile = cfg.out ? join(ROOT, cfg.out) : join(outDir, `${cfg.category}-${cfg.difficulty}-${stamp}.mp4`);
const tmpDir = join(outDir, `.tmp-${stamp}`);

function buildUrl() {
  const base = cfg.base.replace(/\/$/, "");

  // The "Spot the Odd One" mode lives at /spot and uses `level` instead of
  // `mode`/`difficulty`.
  if (cfg.category === "spot") {
    const params = new URLSearchParams({
      auto: "1",
      level: cfg.difficulty,
      duration: String(cfg.duration),
      count: String(cfg.count),
      order: cfg.order,
      music: cfg.music,
      sound: cfg.sound,
    });
    return `${cfg.origin}${base}/spot/?${params.toString()}`;
  }

  const params = new URLSearchParams({
    auto: "1",
    difficulty: cfg.difficulty,
    mode: cfg.mode,
    duration: String(cfg.duration),
    count: String(cfg.count),
    order: cfg.order,
    music: cfg.music,
    sound: cfg.sound,
  });
  return `${cfg.origin}${base}/play/${cfg.category}/?${params.toString()}`;
}

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

function writeMetaSidecar() {
  try {
    if (cfg.category === "spot") {
      const title = `🔍 Temukan Baby Mo yang Beda! ${cfg.count} Tantangan Seru Untuk Anak | Baby Mo Quiz`;
      const lines = [
        title,
        "",
        "🔍 Semua Baby Mo terlihat sama… tapi satu berbeda. Bisa temukan secepat kilat?",
        "",
        `${cfg.count} ronde seru, tingkat: ${cfg.difficulty}. Tonton, cari, dan belajar bersama Baby Mo!`,
        "",
        "🔔 LIKE, SUBSCRIBE, dan nyalakan lonceng untuk video terbaru dari Baby Mo!",
        "",
        "#BabyMoQuiz #TemukanYangBeda #SpotTheDifference #QuizAnak #EdukasiAnak",
      ];
      writeFileSync(outFile.replace(/\.mp4$/, ".txt"), lines.join("\n"));
      return;
    }
    const cat = JSON.parse(readFileSync(join(ROOT, "data", `${cfg.category}.json`), "utf8"));
    const title = `${cat.emoji} ${cat.title}! ${cfg.count} Quiz Seru Untuk Anak | Baby Mo Quiz`;
    const lines = [
      title,
      "",
      `${cat.emoji} ${cat.blurb}`,
      "",
      `Tebak ${cfg.count} hewan dalam video seru ini! Mode: ${cfg.mode}, tingkat: ${cfg.difficulty}.`,
      "Tonton, tebak, dan belajar bersama Baby Mo!",
      "",
      "🔔 LIKE, SUBSCRIBE, dan nyalakan lonceng untuk video terbaru dari Baby Mo!",
      "",
      "#BabyMoQuiz #TebakHewan #QuizAnak #BelajarSambilBermain #EdukasiAnak",
    ];
    writeFileSync(outFile.replace(/\.mp4$/, ".txt"), lines.join("\n"));
  } catch {
    /* sidecar is best-effort */
  }
}

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.error("✖ Playwright not installed. Run: npm install && npx playwright install chromium");
    process.exit(1);
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  const url = buildUrl();
  // Generous ceiling: intro + per-question (timer + ~4s reveal hold + buffer).
  const maxMs = 8000 + cfg.count * (cfg.duration + 7) * 1000 + 15000;

  console.log(`🎬 Recording ${cfg.width}×${cfg.height} @ ${cfg.fps}fps`);
  console.log(`   ${url}`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required", "--force-device-scale-factor=1"],
  });
  const context = await browser.newContext({
    viewport: { width: cfg.width, height: cfg.height },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: cfg.width, height: cfg.height } },
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "load" });
  try {
    await page.waitForSelector('[data-testid="complete"]', { timeout: maxMs });
    // Hold on the outro frame for a beat.
    await page.waitForTimeout(2500);
  } catch {
    console.warn("⚠️  Did not reach the complete screen before timeout — saving what we have.");
  }

  const video = page.video();
  await context.close(); // finalizes the webm
  await browser.close();

  const webm = video ? await video.path() : null;
  if (!webm || !existsSync(webm)) {
    console.error("✖ No video was produced.");
    process.exit(1);
  }

  if (hasFfmpeg()) {
    console.log("🎞️  Transcoding to MP4 (H.264)…");
    const r = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-i", webm,
        "-r", String(cfg.fps),
        "-vf", `scale=${cfg.width}:${cfg.height}:flags=lanczos,format=yuv420p`,
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "20",
        "-movflags", "+faststart",
        outFile,
      ],
      { stdio: "inherit" },
    );
    if (r.status === 0) {
      rmSync(tmpDir, { recursive: true, force: true });
      console.log(`✅ Done: ${outFile}`);
    } else {
      console.warn(`⚠️  ffmpeg failed; raw recording kept at ${webm}`);
    }
  } else {
    console.warn("⚠️  ffmpeg not found (brew install ffmpeg). Raw WebM kept at:");
    console.warn(`   ${webm}`);
  }

  writeMetaSidecar();
  console.log("📝 YouTube metadata written next to the video (.txt).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
