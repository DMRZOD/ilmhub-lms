# IlmHub Web UI Kit

Click-through prototype of the IlmHub student web product, in five connected screens. Hash-routed in a single page. Mock data only.

## Screens

| Route | What it is |
| --- | --- |
| `#home` *(default)* | Dashboard — welcome card, in-progress courses, weekly learning chart, premium upsell. |
| `#browse` | Catalog — category chips, sort, course-card grid. |
| `#course:<id>` | Course detail — hero, sticky buy card, instructor, expandable curriculum. |
| `#lesson:<id>` | Lesson player — video, lesson list sidebar, tabs, resources. |
| `#certs` | Sertifikatlar — credentials, share + download. |
| `#signin` | Login — split layout, Google/GitHub + email, mascot panel. |

## Files

- `index.html` — entry; hash router; wires every screen.
- `styles.css` — imports the design system `colors_and_type.css` and adds the UI-kit layout/utility classes (`.btn`, `.card`, `.field`, `.rail`, `.topbar`, etc.).
- `data.js` — `window.ILMHUB_DATA` mock — user, courses, categories, curriculum, upcoming, weekly hours.
- `components.jsx` — primitives: `Icon`, `Button`, `IconButton`, `Pill`, `Avatar`, `Tile`, `Field`, `Progress`, `Card`, `Mascot`, `useScreen()`.
- `Chrome.jsx` — `Sidebar` (dark vertical rail) + `TopBar` (search, bell, profile).
- `Home.jsx`, `Browse.jsx`, `CourseDetail.jsx`, `LessonPlayer.jsx`, `Certificates.jsx`, `SignIn.jsx` — screens.

## Conventions

- All chrome/copy in **Uzbek (Latin)**.
- Icons from **Lucide** (UMD via CDN). Pass kebab-case `name` to `<Icon name="graduation-cap" size={20} />`.
- No Tailwind. Utility classes are hand-rolled in `styles.css` so the kit stays portable.
- Component scope: each `.jsx` file attaches its exports to `window` so other Babel scripts can use them.

## Things the kit deliberately *doesn't* do

- No real auth, video, or networking — clicks update state only.
- No mobile responsive breakpoints — fixed 1440px design width, scales via parent.
- No Tailwind, no TS — the brief's Next/TS/Tailwind targets apply to the real app; the kit is a faithful visual recreation in plain React + Babel.
