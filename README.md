# Shohjahon Abdusamadov — Portfolio

Personal portfolio of **Shohjahon Abdusamadov**, Frontend Developer (Vue.js) from Tashkent.

Vite · Vue 3 (`<script setup>`) · TypeScript · Pinia · vue-i18n (UZ / EN / RU) · Vue Router · SCSS design tokens · GSAP · @vueuse/core

## Features

- **4 themes** — Light, Dark, Aurora (signature, animated aurora glow) and System (follows the OS live).
  Saved to `localStorage`, applied through `data-theme` on `<html>` before the first paint (no flash).
- **3 languages** — Uzbek (default), English, Russian. Auto-detected on the first visit, saved afterwards;
  `<html lang>`, title and meta/OG tags follow the active language.
- **Accessible** — semantic landmarks, skip link, keyboard-operable menus (WAI-ARIA menu button),
  visible focus, `inert` page behind the mobile menu, WCAG AA contrast in every theme,
  `prefers-reduced-motion` respected everywhere.
- **Fast** — self-hosted variable fonts with preloads, precompiled i18n messages (no runtime compiler),
  progressive section rendering, lazily loaded GSAP, code-split 404 page.
- **Confidential projects** — admin panels show only a title, a generic confidentiality note,
  tech tags and an "Internal system" badge with generated (CSS/SVG) cover art.

Local Lighthouse results for the production build (`npm run build && npm run preview`):

| | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 97 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

## Project structure

```
├─ index.html                 # SEO/OG tags, JSON-LD, no-flash theme script
├─ public/                    # favicon set, OG image, web manifest
├─ scripts/generate-icons.mjs # regenerates favicons + og-image.png from SVG
└─ src/
   ├─ assets/                 # icon set, textures, images (your photo goes here)
   ├─ components/             # BaseButton, SectionTitle, ProjectCard, ThemeSwitcher, LangSwitcher,
   │  │                       # TimelineItem, StatusBadge, DropdownMenu, ProjectCover, …
   │  └─ layout/              # AppNavbar, MobileMenu, AppFooter
   ├─ composables/            # section navigation, scroll reveal, magnetic buttons, contact form, …
   ├─ data/                   # ← editable content (projects, experience, skills, contacts, profile)
   ├─ locales/                # ← all text: uz.json, en.json, ru.json
   ├─ plugins/i18n.ts
   ├─ router/
   ├─ sections/               # Hero, About, Skills, Projects, Experience, Contact
   ├─ stores/                 # useThemeStore, useLocaleStore (Pinia)
   ├─ styles/                 # tokens (themes), base, utilities, effects, mixins
   ├─ types/
   └─ views/                  # HomeView, NotFoundView
```

## Editing content

You never need to touch components to update the content:

| What | Where |
| --- | --- |
| Any text (bio, titles, project descriptions, experience…) | `src/locales/uz.json`, `en.json`, `ru.json` |
| Projects (links, tags, cover colors) | `src/data/projects.ts` + `projects.items.<id>` in the locale files |
| Experience timeline | `src/data/experience.ts` + `experience.items.<id>` in the locale files |
| Skills | `src/data/skills.ts` |
| Email / Telegram / Instagram / GitHub | `src/data/contacts.ts` |
| Photo, "open to offers", copyright year | `src/data/profile.ts` (instructions for the photo are inside) |
| Colors of each theme | `src/styles/tokens.scss` |

> In locale files, write a literal `@` as `{'@'}` (vue-i18n syntax) and avoid the `|` character.

## Setup

Requires Node.js **20.19+** (22 LTS recommended).

```bash
npm install          # install dependencies
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build at http://localhost:4173
```

Other scripts:

```bash
npm run lint           # ESLint (auto-fix)
npm run format         # Prettier
npm run type-check     # vue-tsc only
npm run generate:icons # rebuild favicon set + og-image.png (after changing the monogram)
```

## Deployment

Set your real domain first — it's used for the canonical URL, Open Graph image, `robots.txt` and `sitemap.xml`:

```bash
# .env
VITE_SITE_URL=https://your-domain.com
```

### Vercel

1. Push the project to GitHub/GitLab.
2. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the repository.
3. Framework preset: **Vite** (build `npm run build`, output `dist` — already set in `vercel.json`).
4. Under **Environment Variables** add `VITE_SITE_URL` = your production URL.
5. **Deploy**. `vercel.json` already contains the SPA fallback and long-term caching for `/assets`.

CLI alternative: `npm i -g vercel && vercel --prod`.

### Netlify

1. Push the project to GitHub/GitLab.
2. On [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`, Node 22).
4. **Site configuration → Environment variables** → add `VITE_SITE_URL`.
5. **Deploy**. The SPA fallback and caching headers are configured in `netlify.toml`.

CLI alternative: `npm i -g netlify-cli && netlify deploy --build --prod`.
