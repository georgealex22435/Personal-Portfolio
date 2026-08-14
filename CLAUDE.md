# CLAUDE.md

Conventions for this repo. The handover document ("Portfolio Site — Handover Document",
v3) is the spec of record; section numbers below refer to it.

## Stack

- React 18 + **TypeScript everywhere** — no plain `.jsx`, ever
- Vite 6, prerendered by `vite-react-ssg` (`dirStyle: 'nested'`)
- React Router with a locale segment
- Plain CSS: custom properties in `src/styles/tokens.css` + co-located CSS Modules.
  **No Tailwind, no CSS-in-JS, no component library.**
- Hono on Cloudflare Workers; Zod for validation; no database, no auth, no sessions
- Workbox service worker, hand-written source at `src/sw.js`

## Hard rules

### Content is never hardcoded into components (§6)

Adding a project means adding files under `src/content/`, not editing a component. The
same applies to the About copy, the resume, and site links — they live in
`src/content/*.ts`, not in JSX.

### The build fails loudly on missing translations (§5)

`assertLocaleParity()` and `assertContentComplete()` run during prerendering and throw.
Do not soften them into warnings. A silent English fallback mid-French page is worse than
no French at all.

### Never machine-translate at runtime

Every string comes from a locale file. Localized slugs live in frontmatter. `Intl` handles
numbers and dates — `101,766` in English is `101 766` in French and `101.766` in Spanish,
and getting that wrong reads as sloppy to a native speaker.

### No string concatenation for sentences

Use ICU interpolation and plurals. `"Showing " + n + " projects"` does not survive French
or Spanish plural rules.

### Editorial decisions that are not up for revision

- The IMDb repo's **"15–20% profitability increase" projection must never appear anywhere
  on the site.** It is a projection, not a result, and it undercuts everything around it.
  There is an E2E test guarding this.
- The **Limitations** paragraphs on the IMDb and Employee-Satisfaction projects stay.
- **"Three branches, four projects."** above the project grid stays, in all three
  languages. It ties the grid to the claim the About section makes.
- Appendix A/B copy is the owner's. Do not rewrite, embellish, or "improve" it.

### Design (§7)

The stat line is the **only** signature element. Do not add a second one.

Forbidden: particle backgrounds, animated gradients, terminal/typewriter effects,
glassmorphism, dark-mode-with-neon-accent, "01 / 02 / 03" section markers, testimonial
carousels, skill bars ("React 85%"), flag icons as language labels (use EN / FR / ES
text), and loading spinners on prerendered pages.

Animation budget for the entire site: the stat-line count-up (500ms, 60ms stagger).
Hover states are instant colour changes. Respect `prefers-reduced-motion`.

Palette was revised by the owner on 2026-08-14: **white ground, blue side rail**. The
tokens in `tokens.css` are the source of truth; do not reintroduce §7's original cool-gray
`--surface`.

### Never invent a value for a `[FILL]`

Scaffold the field, render a visible marker, and list it in the handback notes.

## Build order matters

```
gen:version + gen:covers  →  vite-react-ssg  →  gen-seo.mjs  →  gen-sw.mjs
```

- **gen-seo before gen-sw** — gen-seo rewrites the HTML (it strips image preloads), so the
  service worker must hash the final files or the precache integrity checks fail.
- **gen-sw after prerendering** — a PWA plugin running inside the client build globs the
  output before any HTML exists, and silently precaches zero pages.
- **`version.json` must never be precached.** Workbox's precache route runs ahead of
  runtime routes, so the file whose job is detecting a stale build would be served from
  the stale cache.

## Traps this codebase has already hit

Each of these cost real debugging time. They are guarded now; do not undo the guards.

- **Vite's `define` does not reach the Worker.** wrangler bundles it with esbuild and
  never reads `vite.config.ts`. Both sides import `src/generated/version.ts` instead.
- **`workbox-build`'s `injectManifest` does not bundle.** `src/sw.js` is bundled with
  esbuild first; `gen-sw.mjs` throws if the output still contains bare imports, because a
  service worker that fails to register does so silently.
- **CSP must carry the inline-script hashes.** `vite-react-ssg` emits two inline bootstrap
  scripts per page. A bare `script-src 'self'` blocks them and hydration dies quietly —
  every interactive control stops working while the page still looks fine.
- **`run_worker_first: ["/"]`, not `false`.** A prerendered `index.html` exists at `/`, so
  with `false` the asset wins and the Accept-Language redirect never runs.
- **Grid tracks need `minmax(0, 1fr)`.** Plain `1fr` has `min-width: auto`, so a `nowrap`
  stat figure inflates its track and the grid overflows the viewport.
- **Layout responds to the container, not the viewport.** The rail takes 13rem out of the
  page, so viewport width stopped describing the space content actually has. `.container`
  is a query container named `content`.
- **`wrangler dev` survives `TaskStop`** and caches its asset manifest at startup. If
  files move between builds, kill the process tree and `rm -rf .wrangler` before
  restarting, or you will be testing a stale server.

## Testing

`npm run test:e2e` — 53 tests, all must pass before shipping.

Two servers: `wrangler dev` (8787) for anything needing the real Workers runtime, and a
plain static server (4180) for the cache-busting spec, because wrangler cannot see a
rebuild that happens mid-test.

**Screenshots are evidence; assertions alone are not.** Several real defects here passed
every assertion and were only caught by looking at the rendered page — a nav item count,
colliding text, unequal card heights, labels breaking mid-word. When changing layout,
capture and actually look.

## Versioning

Semver, patch bump on **every** rebuild. `package.json` is the single source of truth;
`scripts/gen-version.mjs` propagates it to `src/generated/version.ts` and
`public/version.json`. The footer badge and the update prompt both read it.
