# Alexandre Saliba — Portfolio

A trilingual (EN/FR/ES) data-analyst portfolio. Prerendered to static HTML, served from
Cloudflare Workers, installable as a PWA.

**Live:** not deployed yet — see [Deploying](#deploying).

---

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer. Everything else installs itself.

```bash
npm install          # once
npm run dev          # http://localhost:5173
```

`npm run dev` is the fast loop for editing pages. It does **not** run the Cloudflare
Worker, so `/api/*` and the "/" language redirect won't work there. To exercise those:

```bash
npm run build
npx wrangler dev     # http://localhost:8787 — the real Workers runtime
```

### The commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Full production build (prerender → SEO files → service worker) |
| `npm run typecheck` | TypeScript, both the browser code and the Worker |
| `npm run test:e2e` | The whole Playwright suite (53 tests) |
| `npm run deploy` | Build and publish to Cloudflare |

---

## Adding a project

No code changes. Create one folder and four files.

**1.** Make a folder under `src/content/projects/` named with the project's id, e.g.
`src/content/projects/my-new-project/`.

**2.** Add `meta.yaml` — the facts that don't change between languages:

```yaml
id: my-new-project          # must match the folder name
timeframe: 2026
stats:                      # two to four figures for the stat line
  - key: responses          # must exist under "stats" in the locale files
    value: 3025             # a raw number — formatting is automatic per language
tools: [Python, pandas]
domain: analytics           # healthcare | gaming | data-engineering | analytics
cover: /covers/my-chart.png # see "Adding a cover image" below
links:
  repo: https://github.com/...
  report: https://...       # optional; shown first when present
featured: true              # show on the home page
order: 5                    # position in the list
```

**3.** Add `en.md`, `fr.md` and `es.md` — one per language, same shape:

```markdown
---
slug: my-new-project        # this language's URL, e.g. /en/projects/my-new-project/
title: The question this project answers
role: Solo project
headline: "One sentence stating what you found."
coverAlt: "What the cover image shows"
---

## Problem
## Data
## Approach
## Findings
## So what
```

Those five headings are fixed and always appear in that order.

**4.** Run `npm run build`. **If a language file is missing, the build stops and tells
you which one.** That is deliberate — a half-translated page is worse than an untranslated
one.

### Adding a cover image

Drop the file in `src/content/covers/` and point `cover:` at `/covers/<filename>`. PNG and
JPEG both work. Its dimensions are read automatically, so images of any shape are fine.

A project with no cover still builds — it shows a labelled placeholder so the gap is
obvious rather than silent.

---

## Adding a language

**1.** Add the code to `LOCALES` in `src/i18n/locales.ts`, and give it a column in
`PATH_SEGMENTS` (its words for "projects", "about", "resume") and in `LOCALE_LABEL`.

**2.** Copy `src/locales/en/common.json` to `src/locales/<code>/common.json` and translate
the values. Leave the keys alone.

**3.** Register it in `src/i18n/config.ts` (import the JSON, add it to `RESOURCES`).

**4.** Add a `<code>.md` to every folder under `src/content/projects/`, and a column to
`ABOUT_PARAGRAPHS`, `POSITIONING` and `GRID_LEAD_IN` in `src/content/about.ts`, plus
`RESUME` in `src/content/resume.ts`.

**5.** Run `npm run build`. It will list anything still missing.

Nothing is machine-translated at runtime — every string comes from a file a person wrote.

---

## Editing your own details

- **Email, LinkedIn, GitHub, Tableau** — `src/content/site.ts`
- **The About page text** — `src/content/about.ts`
- **Resume contents** — `src/content/resume.ts`
- **Resume PDFs** — put them in `public/resume/` and point `RESUME_PDF` at them
- **Colours, type, spacing** — `src/styles/tokens.css`

---

## Deploying

Deploys are driven by the version number in `package.json`. **Bump it before every
deploy** — the site shows it in the footer, and visitors' browsers use it to notice a new
build and offer a reload.

```bash
npm version patch    # 0.1.11 → 0.1.12
npm run deploy
```

### First-time setup

1. **Connect the repo** — in the Cloudflare dashboard: Workers & Pages → your Worker →
   Settings → Builds → Connect to Git. This needs a one-off GitHub authorisation that
   can't be scripted.
2. **Add the contact-form secrets** (optional; without them the form stays hidden and the
   page shows your email address instead):
   ```bash
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put CONTACT_TO      # where messages go
   npx wrangler secret put CONTACT_FROM    # a verified Resend sender
   ```
   Secrets never belong in `wrangler.jsonc` or in the repo.
3. **Custom domain** — add it in the Worker's Settings → Domains & Routes, then update
   `SITE_ORIGIN` in `src/layouts/LocaleLayout.tsx` and `scripts/gen-seo.mjs`.

---

## How it's built

- **React 18 + TypeScript + Vite**, prerendered by `vite-react-ssg` — every page exists as
  real HTML, so search engines and link previews see actual content rather than an empty
  page waiting for JavaScript.
- **Hono on Cloudflare Workers** for `/api/*` and the language redirect. Static files serve
  straight from Cloudflare's edge without waking the Worker.
- **Plain CSS** with custom properties and CSS Modules. No Tailwind, no CSS-in-JS, no
  component library.
- **Workbox** service worker, built after prerendering so every page in every language is
  cached for offline use.

`CLAUDE.md` has the conventions and the rules that must not be broken.
