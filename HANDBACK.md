# Handback notes

Build **0.1.12**, live at https://portfolio.georgealex22435.workers.dev since 2026-08-26.
What's unresolved, what was cut, and what I changed from the spec — required by handover
§11.

---

## Still needs you

| Item | Where it shows | What happens now |
| --- | --- | --- |
| **Capstone AUC and precision/recall** | Approach section, hospital-readmissions, all 3 locales | Sentence is scaffolded around the gap; no number was invented. An HTML comment marks the spot in each `.md`. |
| **French and Spanish resume PDFs** | `/fr/cv/`, `/es/cv/` | Download button shows a pending state. English is live and serves your real file. Name them `alexandre-saliba-resume-{fr,es}.pdf` in `public/resume/` and fill `RESUME_PDF` in `src/content/site.ts`. |
| **Resend account** | Contact form | Form stays hidden; your email shows as plain selectable text, which is §2's specified fallback. Add `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` via `wrangler secret put` and the form appears by itself. |
| **Custom domain** | Canonical URLs, hreflang, sitemap, OG tags | Everything points at `portfolio.georgealex22435.workers.dev`. Change `SITE_ORIGIN` in `src/layouts/LocaleLayout.tsx` and `scripts/gen-seo.mjs`. |
| **Cloudflare → GitHub auto-deploy** | — | Still not connected. The site is deployed and live, but pushing to GitHub does **not** update it — deploys are `npm run deploy`. Connecting needs a one-off OAuth authorisation in the Cloudflare dashboard that cannot be scripted. |
| **A photo for the About page** | `/en/about/` | No photo renders. §8 asks for one and forbids stock imagery, so a placeholder person would be worse than none. |

## Needs your review, not your input

- **All French and Spanish copy.** I wrote every word of it — UI strings, the four project
  writeups, the About paragraphs, and the resume. §5 permits the owner to write *or
  review* all three, so this is the review branch, and it is the largest thing on your
  desk. Statistics use locale decimal separators (`0,466` in French), which is correct
  typography but worth a native eye.
- **One label restructured.** `pipeline_seconds` could not survive as a bare suffix —
  "31 second pipeline" has no French or Spanish equivalent with the number outside the
  phrase. It reads "secondes de pipeline" / "segundos de pipeline", the restructure
  Appendix C anticipated.
- **Alt text rewritten** in all three locales. The handover described a
  readmission-rate-by-age chart and a regression coefficient plot; the files you sent are
  boxplots with a correlation heatmap, and a satisfaction-by-stress bar chart. The old
  text would have misdescribed them to a screen reader.
- **Your readmissions figure carries a baked-in caption** reading "had longer stays and
  received more medications on average". The writeup's finding is that the two are
  *near-identical* and barely correlated with readmission. Both are defensible — the
  coefficients are positive but tiny — but a recruiter sees the caption and the finding
  together, and the caption reads stronger. Consider re-exporting without it.

## Cut

- **§9's live data widget** (Dota 2 / Steam stats). §9 says "Build last. Cut without
  hesitation if anything else is unfinished." Items remain unfinished, so it was cut. The
  service worker already has its `StaleWhileRevalidate` route registered, so adding it
  later is a Worker endpoint and a component.

## Deviations from the spec

Each is deliberate; the reason matters more than the change.

- **`run_worker_first: ["/"]`, not `false`.** §2 says leave it at the default. That
  silently breaks §5: a prerendered `index.html` exists at `/`, so the asset wins and the
  Accept-Language redirect never runs. Scoped to the single route that needs it; every
  other path still serves from the edge untouched.
- **Nested prerender output** (`fr/index.html`, not `fr.html`). With flat output
  Cloudflare 307-redirects `/fr/` → `/fr`, breaking §5's trailing-slash URLs and costing
  every visitor a redirect.
- **Card layout responds to its container, not the viewport.** §4's column counts assume a
  full-width page. Your blue rail takes 13rem out of it, so at 768px the viewport says
  "two columns" while only ~496px remains and the grid ran off-screen.
- **Card covers use `object-fit: contain`.** Your figures range from 1.35:1 to 2.26:1;
  cropping to a 16:9 thumbnail cut the axes off the readmissions figure.
- **Palette and question-led cards** — both your calls, recorded here for completeness.

## Not verified

- **Lighthouse scores are unmeasured.** §10 asks for ≥95 across four categories. I have
  not run Lighthouse, so I am not claiming a number. What I did measure: total JS is
  **118KB gzipped against §10's 120KB budget** — passing, but with only 2KB of headroom,
  so watch it when adding dependencies.
- **Images are PNG/JPEG, not WebP.** §10 asks for WebP. Converting needs an image pipeline
  I did not add. Dimensions, lazy-loading and translated alt text are all in place, so
  this is the one unmet item in that section.
- **Chromium only.** The suite does not run Firefox or WebKit, so iOS Safari behaviour —
  which §3 flags as having its own service-worker and storage quirks — is untested on a
  real device.

## What the tests cover

53 Playwright tests, all passing locally. Beyond the obvious:

- Every route serves localized content **in the raw HTML** (§2's acceptance test)
- The profitability projection appears on no page in any locale
- Both Limitations paragraphs survive
- "Three branches, four projects." is present in all three languages
- A rebuild reaches an already-loaded browser after a plain reload — §3's redeploy
  criterion, tested by actually rebuilding the site mid-test
- A visited route renders with the network cut; an uncached one falls back to the offline
  page **in the right language**
- No horizontal scroll at any of §4's eight widths, plus landscape phone
- No console errors or warnings on 15 routes across all three locales

Four defects reached the browser looking fine and passing every assertion — a nav item
count, colliding text, unequal card heights, and labels breaking mid-word. All were caught
by looking at screenshots. Keep doing that.
