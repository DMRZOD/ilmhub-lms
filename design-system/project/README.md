# IlmHub Design System

**IlmHub** is a modern online learning platform for professional IT courses in Uzbekistan — an LMS where students browse and enroll in courses (frontend, backend, design, data science, DevOps), instructors create and sell courses, and admins moderate. Coursera/Udemy DNA, adapted for the local market, with a premium monochrome aesthetic comparable to Linear, Vercel, and Notion.

All interface copy is in **Uzbek (Latin alphabet)**.

## Sources & references

This design system was created from a written brief plus two reference screenshots provided by the user:

- `uploads/Example 1.png` — "SkillUp" dashboard reference (light sidebar, monochrome cards, dark icon tiles, progress bars)
- `uploads/Example 2.png` — "F." learning platform reference (vertical black sidebar, mascot illustration, line chart, premium-card)

No codebase, Figma file, or design tokens were shared. Visual rules are derived from the brief + screenshots. Sample course/category names and Uzbek copy come from the brief.

## Product

A single product, three audiences:

- **Students** — browse the catalog, enroll, watch lessons, take quizzes, earn certificates, track progress.
- **Instructors** — create courses, upload lessons, see student analytics, manage revenue.
- **Admins** — moderate course content, review reports, manage the platform.

The UI kit focuses on the **student web experience** (home, catalog, course detail, video lesson, dashboard) since that is the surface the brief is most explicit about.

---

## Content fundamentals

**Language.** Uzbek, Latin alphabet (not Cyrillic). Apostrophes use the curly `'` form: `mening kurslarim`, `bo'lim`, `o'rganing`. Short. Direct.

**Voice.** Friendly-professional. Spoken to the student in second person plural / formal ("siz" forms) for system copy, casual second person ("sen") only inside personal nudges — but default to **formal**. No corporate stiffness, no over-promise.

**Casing.** Sentence case for everything — buttons, nav items, headings, card titles. Never ALL CAPS in product chrome (one exception: tiny eyebrow labels in print/marketing).

**Tone examples.**

- Nav: `Bosh sahifa`, `Kurslar`, `Mening kurslarim`, `Sertifikatlar`, `Sozlamalar`
- Primary actions: `Sotib olish`, `Davom etish`, `Boshlash`, `Yangi kurs yarating`
- States: `Tugatildi`, `Jarayonda`, `Boshlanmagan`
- Empty/help: `Mentor bilan o'rganing`, `Hali kurslar yo'q — boshlang!`
- Marketing one-liners: `Kelajak kasbingizni bugun o'rganing.` (concise, periods at end of full sentences)

**Numbers.** `4.8★`, `245 talaba`, `$85` (USD prices — local currency is sum but the brief uses USD). Decimals with a period, not a comma. Star ratings with a single trailing `★`.

**Emoji.** Not used in product UI. Acceptable in motivational/marketing-only contexts, but the visual system prefers a single Lucide icon over an emoji every time.

**Punctuation.** No exclamation points in buttons. One per page max in headings (`Hello Jack` — no `!`). Em-dashes (`—`) are fine; the brief favors them for breaks.

**Length budgets.**

- Button label: 1–3 words
- Card title: ≤ 6 words
- Section heading: ≤ 8 words
- Body paragraph: 1–3 sentences

**What it should never feel like.** Cluttered, salesy, gamified-with-confetti, full of badges and gradients. Every element earns its place.

---

## Visual foundations

**The vibe.** Premium monochrome. White paper, black ink, gray air. Imagine a hardcover textbook with a calm, intentional layout — but the textbook is a SaaS product.

**Color.** Strict black-and-white base. `--ilm-ink (#0A0A0A)` for primary text, icon tiles, primary buttons, sidebars. `--ilm-paper (#FFFFFF)` for the main canvas. `--ilm-surface (#F5F5F5)` is the everyday card and input background — it carries most of the visual weight. `--ilm-border (#E5E7EB)` for hairline dividers and progress tracks. `--ilm-muted (#9CA3AF)` for secondary text. Semantic colors (`success`, `warning`, `error`, `info`) appear **only** on status pills, the notification dot, and inline state — never as decorative accents, never in primary CTAs.

**Backgrounds.** Always solid. No gradients, no full-bleed photography, no repeating patterns or textures, no grain. The negative space _is_ the background treatment.

**Imagery.** Two acceptable kinds: (1) circular avatars/cover thumbnails (real photos, no border), and (2) hand-drawn black-and-white **line illustrations** — single-weight strokes, no fills except solid black, no color (the friendly waving character in Example 2 is the canonical reference). Decorative photography is avoided.

**Type.** Sora across the entire system. Headings 700–800, body 500. Tight letter-spacing on large headings (`-0.02em`). Sora's geometric, slightly playful character is what keeps the strict monochrome from feeling cold. Sizes lock to the scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64 px.

**Cards.** White or `--ilm-surface` background, **no border**, `--r-2xl (24px)` radius for primary cards, `--r-lg (16px)` for smaller tiles. Padding 24–32px. Elevation is `--shadow-sm` at rest, lifts to `--shadow-md` on hover with `translateY(-2px)`. The lack of borders + the soft shadow is the signature look.

**Corner radii.** Everywhere. The system has essentially **no sharp corners**. Buttons & inputs `12px`. Small tiles & avatars-as-squircle `16px`. Cards `20–24px`. Progress bars + pills are fully rounded (`9999px`). Icon tiles inside cards are `12–16px`.

**Borders.** Almost never. The system relies on background contrast (`paper` vs `surface`) and shadow, not lines. The one exception is the secondary button (1px black border) and `--ilm-border (#E5E7EB)` hairlines inside table rows.

**Shadows.** Soft, low-contrast, near-black with low alpha. Stacked two-layer shadows (`0 6px 16px rgba(10,10,10,.06), 0 2px 4px rgba(10,10,10,.04)`). No colored shadows. No inner shadows. No glows.

**Hover states.** Cards lift `-2px` and step up one shadow level. Ghost buttons darken to `--ilm-surface`. Primary buttons hold their fill but lighten very slightly (`--ilm-ink-soft`). Links underline. Nothing changes color hue on hover.

**Press states.** `transform: scale(0.97)` on buttons and tappable tiles. No color shift. Duration 100ms in, 200ms out.

**Animation.** Restrained and smooth. `--ease-out (cubic-bezier(0.22, 1, 0.36, 1))` is the house curve — UI elements glide and settle, never bounce. Durations 150–320ms. Page transitions are simple fade + 8px translate. No spring physics, no parallax, no scroll-triggered fireworks. The page should feel like a printed page being placed down.

**Transparency & blur.** Used very rarely. The only sanctioned use is overlay scrims (e.g. modal backdrops at `rgba(10,10,10,0.4)` + 12px backdrop blur). Never frosted-glass nav bars, never translucent cards.

**Layout.** Whitespace is the design element. Cards align to a 4px spacing grid. Page outer margin is 32–48px on desktop, 16px on mobile. The product uses a fixed left sidebar (240–280px) with a flexible content area. Inside content areas, prefer two- or three-column grids with `gap: 24px` over dense, multi-divider layouts.

**Iconography vibe.** Lucide line icons exclusively. 1.5–2px stroke, 24×24 default. Black on white surfaces, white when sitting inside a black icon-tile. Never filled, never duotone, never gradient.

**Avatars.** Always circular. No border. Soft gray (`--ilm-border`) fallback with the user's initials in `--fg-2`. Sizes lock to 32 / 48 / 80 px.

**Progress.** 8px tall, fully rounded, `--ilm-border` track, `--ilm-ink` fill. The fill is monochrome — never colored, never gradient — even at 100% (completion is communicated by a separate green check pill, not by changing the bar color).

**Notification dots.** The single sanctioned spot of pure color in the chrome: a small red dot on the bell icon when there are unread notifications. Otherwise the chrome stays monochrome.

**Inputs.** Pill-shaped or `12px`-rounded rectangles, `--ilm-surface` background, no visible border at rest, 1px `--ilm-ink` border on focus (no outer ring). Placeholder is `--ilm-muted`.

**Visual rhythm.** Small icon-tile (rounded black-or-gray square containing a Lucide glyph) → bold title → muted subtitle → optional progress/meta row → optional CTA. This template repeats across course cards, lesson cards, dashboard stat cards. Consistency over novelty.

---

## Iconography

**System: Lucide.** All icons are [Lucide](https://lucide.dev) — minimalist, single-stroke line icons. The brief mandates this exclusively. We use the CDN at runtime rather than copying every SVG into the repo:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<i data-lucide="home"></i>
<script>
  lucide.createIcons();
</script>
```

**Stroke.** 2px default, 24px size, `currentColor`. Don't override stroke-width per-icon unless rendering at >32px (then drop to 1.5px to keep optical weight even).

**Placement.**

- Inline with text: `16–18px`, vertically centered, `--fg-2` color.
- Inside an icon-tile: `20–24px`, color depends on tile (`--fg-inv` on black tile, `--fg-1` on gray tile).
- Standalone tappable: 24px, with a 40–48px hit area.

**Common glyphs.** `home` (Bosh sahifa), `book-open` / `graduation-cap` (Kurslar), `play-circle` (lessons / video), `award` / `medal` (sertifikatlar), `bell` (bildirishnomalar), `search` (qidiruv), `settings` (sozlamalar), `user` (profil), `log-out` (chiqish), `check-circle` (tugatildi), `clock` (davomiyligi), `users` (talabalar), `star` (reyting), `flame` (mashhurlik / hot), `chevron-right` (navigatsiya).

**Custom illustrations.** A small library of hand-drawn black-and-white line illustrations (waving mascot, brain-on-book "premium upsell" graphic, empty-state characters) lives in `assets/illustrations/`. These follow the Example 2 reference style: single-weight stroke, no color, no shading, used at 120–240px in cards and empty states. The system ships with **placeholder slots** — when real illustrations exist, they should be dropped in at the same dimensions.

**Emoji.** Never in product UI. Never as icons. If a user uses emoji in their own content (course title, comment), render it natively — but the system itself supplies no emoji.

**Unicode chars.** Only `★` (rating) and `—` (em dash, prose) are sanctioned. Use Lucide for everything else.

---

## Index

| File / folder           | What it is                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `README.md`             | This file. The narrative source-of-truth.                                                |
| `SKILL.md`              | Cross-compatible Agent Skill descriptor.                                                 |
| `colors_and_type.css`   | Tokens — colors, typography, spacing, radii, shadows, motion.                            |
| `fonts/`                | Sora TTF files (Thin → ExtraBold). Registered via `@font-face` in `colors_and_type.css`. |
| `assets/`               | Logos, illustrations, placeholder imagery.                                               |
| `assets/logo/`          | IlmHub wordmark + monogram.                                                              |
| `assets/illustrations/` | Black-and-white line illustrations (placeholders).                                       |
| `preview/`              | Design-system cards rendered as HTML (the Design System tab).                            |
| `ui_kits/web/`          | The student-facing web UI kit — index.html plus JSX components.                          |

### UI Kits

- **`ui_kits/web/`** — IlmHub student web. Home/catalog landing, course detail, dashboard, video lesson player, browse-by-category. All click-thru, mock data.

### Slides

None. (No slide template was provided in the brief.)

---

## Substitutions & flags

- **Sora** ships locally — TTF files in `fonts/` (Thin → ExtraBold). `colors_and_type.css` registers them via `@font-face`. No external font CDN needed.
- **Lucide** icons are loaded from CDN at runtime.
- **Illustrations** are simple placeholder line drawings created within the system; if you have brand-specific mascot art, drop replacements into `assets/illustrations/` keeping the same filenames.
