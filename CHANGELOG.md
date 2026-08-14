# Changelog

Semver; the patch number increments on every rebuild. The version shows in the site
footer and drives the "new version available" prompt.

## 0.1.11 — 2026-08-14

Stat-line dividers reworked so they survive wrapping.

- Columns are now intrinsic (`repeat(auto-fit, minmax(min(7rem, 100%), 1fr))`) instead of
  a fixed count at a viewport breakpoint. The same component sits in project cards, which
  are far narrower than the page at the same viewport width; a fixed three columns
  squeezed the mono labels until they broke mid-word ("ENCOUNT / ERS").
- Dividers are clipped box-shadows per cell. A per-cell border suppressed on
  `:first-child` left a stray rule on the first cell of a wrapped row; painting the grid
  background through 1px gaps fixed that but rendered empty tracks as gray blocks.
- Labels wrap at spaces only (`overflow-wrap: normal`).

## 0.1.9 — 2026-08-14

- Removed the unused `--stat-count` custom property.

## 0.1.8 — 2026-08-14

Service worker rewritten by hand; offline fallback fixed.

- Replaced `generateSW` with `injectManifest` over a hand-written `src/sw.js`. The
  locale-aware offline fallback needs `setCatchHandler`; an extra `fetch` listener
  appended to a generated worker calls `respondWith()` after Workbox's router already
  has, which fails the navigation outright with `ERR_FAILED`.
- `src/sw.js` is bundled with esbuild before manifest injection — `injectManifest` only
  substitutes the file list, so the worker previously shipped with unresolvable bare
  imports and never registered at all. The build now fails if that recurs.
- Navigations are `NetworkFirst`. Precache-first meant a reload after a deploy still
  rendered the old HTML, so an update landed one navigation late.
- The offline fallback redirects to `/{locale}/offline/` rather than serving its markup
  under the requested URL, because React Router hydrates against the address bar and
  re-rendered the route's own 404.

## 0.1.7 — 2026-08-14

- **`version.json` excluded from the precache.** Workbox's precache route runs ahead of
  runtime routes, so the one file whose job is detecting a stale build was itself being
  served from the stale cache. Caught by the E2E redeploy test.

## 0.1.6 — 2026-08-14

Responsive fixes found by the test suite.

- Grid tracks use `minmax(0, 1fr)`; plain `1fr` has `min-width: auto`, so a `nowrap` stat
  figure inflated its track and pushed the page 63px wider than the viewport at 834px.
- Card grids respond to the content container, not the viewport. The blue rail takes 13rem
  out of the page, so viewport width no longer described the space available.
- Language links widened to 44px to meet the touch-target minimum.
- Image preload hints stripped at build time — their `crossorigin` never matched the
  `<img>` request, producing a console warning per image and a duplicate download, for
  covers the cards deliberately lazy-load anyway.

## 0.1.5 — 2026-08-14

- **CSP now carries SHA-256 hashes for the inline bootstrap scripts.** A bare
  `script-src 'self'` blocked `vite-react-ssg`'s hydration data, so the app fetched its
  data manifest at the wrong URL and every interactive control was dead while the page
  still looked correct.
- The Worker's 404 fallback only serves a page for real navigations. Returning HTML with
  a 200 for a missing `.json` produced `Unexpected token '<'` errors that pointed at the
  data layer instead of the missing file.

## 0.1.4 — 2026-08-14

Contact API, PWA, and the quality floor.

- `POST /api/contact` — Zod validation, KV-backed rate limiting by hashed IP (5/hour),
  honeypot field, delivery through Resend's HTTP API. Returns 503 while unconfigured so
  the client can hide the form and show the email address instead.
- Contact form progressively enhances: it appears only once `/api/health` confirms the
  Worker can send. The email address is in the prerendered HTML regardless.
- PWA: manifest, icon set (192/512/maskable/apple-touch), and a translated offline page
  per locale.
- `sitemap.xml`, `robots.txt`, and `_headers` (CSP, HSTS, nosniff, referrer policy, and
  the cache rules: immutable hashed assets, never-cached HTML).

## 0.1.3 — 2026-08-14

- Contact details wired: email, LinkedIn, Tableau Public.
- Resume page rebuilt from the owner's PDF — profile, skills, education, certifications,
  experience — with projects pulled from the content layer so the two cannot drift.
  English PDF download is live.
- **Featured cards lead with the research question, not the finding.** The findings are
  too substantial to compress onto a card; the full sentence still opens each detail page.

## 0.1.2 — 2026-08-14

- Cover images read their real dimensions at build time. One hardcoded 1200×800 was wrong
  for three of the four supplied files, which range from 1.35:1 to 2.26:1.
- Card covers use `object-fit: contain` — cropping to 16:9 cut the axes off the wide
  readmissions figure.
- Alt text rewritten in all three locales to describe the images actually supplied.

## 0.1.1 — 2026-08-14

- **Palette revised at the owner's request: white ground, blue side rail**, replacing
  §7's cool-gray base. The nav becomes a fixed vertical rail on desktop and a blue bottom
  bar on phone.
- All four project covers in place; the EER diagram was rendered from PDF and auto-trimmed
  to the diagram's bounding box.
- Hospital project retitled "What predicts a 30-day hospital readmission for diabetes" in
  all three locales.

## 0.1.0 — 2026-08-12

First build. Prerendered EN/FR/ES across 28 pages, localized routes and slugs, hreflang
alternates, Accept-Language redirect in the Worker, design tokens and typography, content
pipeline, and all four projects written in three languages.
