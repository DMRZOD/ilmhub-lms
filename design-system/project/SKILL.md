---
name: ilmhub-design
description: Use this skill to generate well-branded interfaces and assets for IlmHub — an online learning platform for professional IT courses (Uzbek-language LMS, Coursera/Udemy analog) — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Vibe.** Premium monochrome — white paper, black ink, gray air. Think Linear / Vercel / Notion.
- **Language.** All product copy in **Uzbek, Latin alphabet** (`Bosh sahifa`, `Kurslar`, `Sotib olish`).
- **Colors.** Strict black/white/gray base; semantic accents (green/yellow/red/blue) **only on status**.
- **Type.** Sora (local TTFs in `fonts/`, weights 100–800). Headings 700–800, body 500.
- **Icons.** Lucide line icons exclusively (CDN at runtime).
- **Shape.** No sharp corners (12–24px radii), no harsh borders, soft two-layer shadows, generous whitespace.
- **Logo.** `assets/logo/ilmhub-mark.svg` (square monogram), `ilmhub-wordmark.svg` (with chevron accent), `ilmhub-wordmark-inverse.svg` (for dark surfaces).

## Files in this skill

- `README.md` — design system narrative (content tone, visual rules, iconography).
- `colors_and_type.css` — single source of truth for tokens. Import this in any new HTML.
- `fonts/Sora-*.ttf` — local Sora family.
- `assets/logo/*.svg` — IlmHub mark + wordmark in light and inverse.
- `preview/*.html` — small per-token cards (color, type, spacing, components).
- `ui_kits/web/` — full click-through web prototype + JSX component primitives (`Button`, `Pill`, `Avatar`, `Card`, `Field`, `Progress`, `Tile`, `Icon`).

## Building an artifact

1. Drop `colors_and_type.css` next to the new HTML; import it once. All tokens (`--ilm-ink`, `--ilm-surface`, `--ilm-border`, `--r-2xl`, `--shadow-sm`, `--font-sans`, type scale) become available.
2. Pull components from `ui_kits/web/` (`components.jsx`, `Chrome.jsx`, screen files) — they are self-contained Babel-transpiled React. Or replicate the styles directly using `.btn`, `.card`, `.field`, `.pill`, `.rail` from `ui_kits/web/styles.css`.
3. Copy `assets/logo/ilmhub-mark.svg` for any branded surface.
4. Load Lucide from CDN: `<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>` then `<i data-lucide="home"></i>` + `lucide.createIcons()`.
5. Write copy in Uzbek (Latin). Keep it short. Sentence case. No emoji.
