# 🐠 Baby Mo Quiz

A production-ready, web-based **quiz game + YouTube video creator** for kids,
inspired by modern children's quiz channels. Built for the **Baby Mo** brand.

Run it locally on your iMac, go full-screen 16:9, hit record in OBS or
QuickTime, and produce long-form "Guess The Sea Animal" videos for YouTube.

> No backend. All data is JSON. Deploys as a static site to GitHub Pages.

---

## ✨ Features

- **Flagship mode:** _Guess The Sea Animal_ (Tebak Hewan Laut) — 50+ animals.
- **Second mode:** _Guess The Farm Animal_ (Tebak Hewan Ternak) — 30 animals.
- **Reusable quiz engine** that is category-agnostic (Sea & Farm Animals today;
  Dinosaurs, Flags, Space, … drop-in tomorrow).
- **Background music:** optional gentle looping tune (synthesized, no files).
- **Difficulty tiers:** Mudah · Sedang · Sulit · Mustahil.
- **7 answer modes:** Multiple choice · Image · Silhouette · Blur · Zoom ·
  Emoji clues · Fun-fact clues.
- **Timer:** 10 / 15 / 20s or custom, with a smooth color-shifting countdown
  bar (green → yellow → orange → red).
- **Sound effects:** tick, correct, wrong, reveal, level-complete — fully
  synthesized (zero audio files).
- **Reveal animation:** confetti + animal name + fun fact + success sound.
- **Voiceover mode:** pause/resume with **Space**, prev/next questions, replay
  sound — perfect for recording narration.
- **Auto-play mode:** Question → Countdown → Reveal → Fun Fact → Next, fully
  hands-free.
- **Video Creator mode:** one button — _Mulai Sesi Rekaman YouTube_ — goes
  full-screen, hides controls, and runs the whole loop automatically.
- **Content editor** at `/quiz-editor`: add/edit animals, upload images,
  Export/Import JSON.
- **YouTube optimization:** auto-generated title ideas, description template,
  and hashtags.
- **Accessibility:** huge high-contrast text, kid-friendly colors, readable
  from across the room (TV-friendly). Mobile friendly, desktop-optimized.

## ⌨️ Keyboard shortcuts (creator mode)

| Key | Action |
| --- | --- |
| `Space` | Pause / resume timer |
| `←` / `→` | Previous / next question |
| `R` or `Enter` | Reveal answer |
| `S` | Replay reveal sound |
| `A` | Toggle auto-play |
| `M` | Toggle background music |
| `F` | Toggle full-screen |
| `H` | Hide controls (recording mode) |
| `Esc` | Show controls again |

## 🧱 Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · static export
(`output: "export"`) · deployable to GitHub Pages · no backend.

## 📁 Project structure

```
app/
  layout.tsx            Root layout + fonts
  page.tsx              Home / category grid
  play/page.tsx         The game (Guess The Sea Animal)
  quiz-editor/page.tsx  Content editor
components/
  game/                 QuizGame, AnimalCard, CountdownBar, Confetti, …
  editor/QuizEditor.tsx
lib/
  engine/               types · useQuizEngine · shuffle  (the reusable brain)
  audio/sfx.ts          Web-Audio sound effects
  categories/index.ts   Category registry (future game types)
  youtube/templates.ts  YouTube metadata generator
  basePath.ts
data/
  sea-animals.json      50+ sea animals dataset
.github/workflows/deploy.yml   Build → gh-pages
```

## 🗃️ Data model

```ts
interface Animal {
  id: string;
  name: string;          // correct answer (Indonesian)
  nameEn?: string;       // English name (SEO / reference)
  image?: string;        // optional real image; falls back to emoji
  emoji: string;         // zero-asset visual
  emojiClues?: string[]; // for emoji-clue mode
  difficulty: "Mudah" | "Sedang" | "Sulit" | "Mustahil";
  funFact: string;
  habitat: string;
  answerChoices: string[]; // wrong options; correct name added automatically
}
```

## 🚀 Getting started

```bash
npm install
npm run emoji      # download crisp SVG emoji art into public/emoji (once)
npm run dev        # http://localhost:3000
```

`npm run emoji` is optional — without it the app renders native text emoji.
It's also run automatically before `build` so deploys include the SVGs.

Build the static site:

```bash
npm run build      # outputs to ./out (runs `emoji` first)
```

## 🖼️ Crisp visuals at 4K

The UI is vector end-to-end — CSS layout, SVG mascot/decorations, and vector
fonts — so it stays sharp at any resolution. Animal subjects render as **SVG
emoji** (Twemoji) via `npm run emoji`, which stay crisp even blown up to fill a
4K card (native bitmap emoji would look soft). Add real high-res photos through
the editor (`image` field) for true-photo episodes.

## 🎬 Recording a video

### Option A — screen capture (OBS recommended)

1. `npm run dev`, open `/play`.
2. Choose difficulty, answer mode and timer.
3. Click **🎥 Mulai Sesi Rekaman YouTube** (full-screen + auto-play + clean UI).
4. Capture with OBS at **1920×1080 or 3840×2160 (4K)**, 16:9. On macOS, capture
   desktop audio (e.g. BlackHole) so the synthesized SFX/music are recorded.
5. Copy the generated title/description/hashtags from the finish screen.

You can also launch a fully-configured session from a URL (handy for OBS):

```
/play/sea-animals/?auto=1&difficulty=Mudah&mode=silhouette&duration=12&count=20&music=1
```

### Option B — automated 4K render (Playwright + ffmpeg)

Render a hands-free episode straight to a pixel-perfect 4K MP4 — no screen
recording, no dropped frames:

```bash
npx playwright install chromium   # once
brew install ffmpeg               # once (macOS)

npm run dev                       # in one terminal
npm run record -- --category sea-animals --difficulty Mudah \
                  --mode silhouette --duration 12 --count 20 --music 1
```

Output lands in `episodes/` alongside a `.txt` of YouTube metadata. Flags:
`--category --difficulty --mode --duration --count --order --music --sound
--width --height --fps --out`.

> The automated render produces **video only** (Playwright can't capture the
> browser-generated audio). Add voiceover/music in your editor, or use Option A
> (OBS) when you want the in-app audio captured live.

## ☁️ Deploy to GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static export and force-pushes it to the `gh-pages` branch. In repo
**Settings → Pages**, choose _Deploy from a branch → gh-pages → / (root)_.
The site is served from `https://<user>.github.io/babymo-quiz/`.

For a custom domain at the apex, build with `NEXT_PUBLIC_BASE_PATH=""`.

## 🧩 Adding a new game type

1. Create `data/<category>.json` shaped like `sea-animals.json`.
2. Register it in `lib/categories/index.ts`.
3. Run `npm run emoji` to fetch any new emoji SVGs.
4. Done — the engine, UI, editor and YouTube generator all work unchanged.

## 🙏 Credits

Animal artwork uses [Twemoji](https://github.com/jdecked/twemoji) SVG emoji,
licensed CC-BY 4.0. Downloaded locally by `npm run emoji`.

## 🗺️ Roadmap

- **MVP (this build):** Sea Animals, all answer modes, timer, sounds, reveal,
  voiceover + auto-play + recording mode, editor, YouTube helper, GH Pages.
- **Phase 2:** per-category routes, real animal photos, intro/outro screens,
  background music, leaderboard, multi-language, more datasets (Farm,
  Dinosaurs, Flags, Space…).
